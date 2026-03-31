# 朝のメールボックスに AI ダイジェストを届ける — Gmail API + Slack/Discord 通知を GitHub Actions に組み込んだ話

## はじめに

前回の記事で、毎朝 07:00 JST に Hacker News のトップ記事を Claude AI が日本語要約して GitHub Pages に公開するシステムを作った。

**完成物**: https://hayatotoyoda.github.io/tech-digest/

できあがったものを使い始めて、すぐに気になる点が出てきた。

> 「URL を知ってる人が URL を開かないと読めない」

Pages に公開した時点でどこか安心してしまい、実際には毎朝開かないという自分の怠惰に気づいた。情報はプッシュされてこそ価値がある。

そこで今回は **Gmail API でメール配信**、**Slack/Discord Webhook で通知**を追加した。朝のメールボックスを開いたら、その日のダイジェストが届いている状態にする。

**追加した仕組み:**

```
GitHub Actions (07:00 JST)
        │
        ▼
  ダイジェスト生成・JSON 保存・HTML 公開（既存）
        │
        ├─── Gmail API → 自分のメールボックスに HTML メール
        │
        └─── Slack / Discord Webhook → チャンネルに通知
```

---

## Gmail API の選択と OAuth2 の仕組み

メール送信の手段として真っ先に思いつくのは SendGrid や AWS SES のような外部サービスだが、自分宛に送るだけなら**自分の Gmail アカウントをそのまま使える**。Gmail API（googleapis）を使えば外部サービスへの依存なし・無料で済む。

問題は認証だ。

Gmail API は **OAuth2** で動く。「ユーザーがブラウザで許可する」フローが前提なので、GitHub Actions のような無人実行環境では一工夫が必要になる。

解決策は**リフレッシュトークン**だ。

```
【一度だけ手動で実施】
ローカルPC → ブラウザで Google 認証 → アクセストークン + リフレッシュトークン取得
                                               ↓
                                    GitHub Secrets に保存
【毎日の自動実行】
GitHub Actions → リフレッシュトークンでアクセストークンを自動更新 → Gmail API 呼び出し
```

アクセストークンは 1 時間で失効するが、リフレッシュトークンは（取り消さない限り）永続する。`googleapis` ライブラリが自動でトークンの更新まで面倒を見てくれるので、実装側はリフレッシュトークンを渡すだけでいい。

```typescript
// src/mail/gmail.ts
const auth = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
);
auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
// ↑ これだけ。トークン更新は googleapis が自動でやってくれる

const gmail = google.gmail({ version: 'v1', auth });
```

---

## リフレッシュトークン取得スクリプト

一度だけ必要な OAuth2 認証フローを、ローカルで完結させるスクリプトを作った。

```typescript
// scripts/get-gmail-token.ts の核心部分
const REDIRECT_URI = `http://localhost:3000/callback`;
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// ブラウザで開く URL を生成
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',     // リフレッシュトークンを発行させる
  scope: ['https://www.googleapis.com/auth/gmail.send'],
  prompt: 'consent',          // 必ず同意画面を出してリフレッシュトークンを確実に取得
});

// localhost:3000 でコールバックを待ち受ける
const server = http.createServer(async (req, res) => {
  const code = new URL(req.url!, 'http://localhost:3000').searchParams.get('code');
  const { tokens } = await oauth2Client.getToken(code!);
  console.log('リフレッシュトークン:', tokens.refresh_token);
  server.close();
});
server.listen(3000);
```

`prompt: 'consent'` が重要なポイントだ。これを省くと、過去に一度認証したアカウントでは同意画面がスキップされてリフレッシュトークンが返ってこないことがある。

### ハマったこと①: `npx tsx` は `.env` を読まない

```bash
npx tsx scripts/get-gmail-token.ts
# → GMAIL_CLIENT_ID と GMAIL_CLIENT_SECRET を環境変数に設定してください
```

`.env` に書いたのに読めていない。

`npx tsx` は Node.js の `--env-file` フラグを通らないため `.env` を自動ロードしない。`node --env-file=.env --import tsx/esm scripts/...` のように書けば読めるが、毎回これを打つのは煩わしい。

スクリプト自体に軽量な `.env` パーサーを埋め込んで解決した。

```typescript
// スクリプト冒頭に追加
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const raw = trimmed.slice(idx + 1).trim();
    const value = raw.replace(/^(['"])(.*)\1$/, '$2'); // 引用符を除去
    if (key && !(key in process.env)) process.env[key] = value;
  }
}
```

`!(key in process.env)` で既存の環境変数を上書きしないようにした。インラインで渡した値が `.env` より優先される。

### ハマったこと②: `invalid_client` — クライアントシークレットが一致しない

```
GaxiosError: invalid_client
  error_description: 'The provided client secret is invalid.'
```

コピペのミスだった。Google Cloud Console の「クライアント シークレット」フィールドはブラウザ上でマスクされており、表示してからドラッグ選択すると余分なスペースが入りやすい。

**確実な方法**: 画面の「コピー」ボタンを使うか、「JSON をダウンロード」して `client_secret` フィールドをそのまま使う。

### ハマったこと③: `access_denied` — テストユーザー未登録

```
Error 403: access_denied
This app is currently being tested, and can only be accessed by developer-approved testers.
```

OAuth 同意画面が「テスト」状態のとき、自分のアカウントが明示的にテストユーザーとして登録されていないとアクセスを拒否される。

修正: Google Cloud Console → APIとサービス → OAuth同意画面 → テストユーザー → 「+ ADD USERS」で自分のアドレスを追加。

---

## メール本文: インライン CSS の壁

HTML メールには独自の制約がある。Gmail をはじめ多くのメールクライアントは `<style>` タグを除去するため、**全スタイルをインライン CSS** で書かなければならない。

```typescript
// src/mail/email-template.ts
function buildCard(item: DigestItem): string {
  return `
    <div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:16px;">
      <div style="font-size:12px;color:#666;margin-bottom:8px;">
        #${item.rank} &middot; <strong>${item.category}</strong> &middot; ${item.source}
      </div>
      <h2 style="margin:0 0 8px;font-size:18px;line-height:1.3;">
        <a href="${item.url}" style="color:#1a73e8;text-decoration:none;">${item.title}</a>
      </h2>
      <p style="margin:0 0 10px;color:#333;line-height:1.6;">${item.summary}</p>
      <div style="font-size:13px;color:#555;line-height:1.6;">
        <strong>重要な理由:</strong> ${item.importance}<br>
        <strong>対象読者:</strong> ${item.targetReaders}
      </div>
    </div>`;
}
```

## RFC 2822 と base64url エンコード

Gmail API の `messages.send` はメールの生データを **base64url エンコード**した文字列で受け取る。

```typescript
const raw = Buffer.from(
  [
    `To: ${recipients.join(', ')}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',   // ← ヘッダーと本文の区切りに空行が必要
    html,
  ].join('\r\n'),  // RFC 2822 は CRLF 区切り
).toString('base64url');  // base64 ではなく base64url

await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
```

`Subject` ヘッダーに日本語を含む場合は **RFC 2047 エンコード**（`=?UTF-8?B?...?=` 形式）が必要だ。これを省くと文字化けする。

また `base64` と `base64url` は別物で、`base64url` は `+` → `-`、`/` → `_` に置換してURLセーフにしたもの。Gmail API は `base64url` を要求する。Node.js の `Buffer.toString('base64url')` で一発変換できる。

---

## Slack / Discord: Webhook で十分だった

Slack や Discord への通知には最初から「Bot SDK を使うべきか？」という疑問があった。

結論: **一方向のプッシュ通知なら Webhook で十分**。

Bot SDK（[`@vercel/chat`](https://github.com/vercel/chat) 等）はユーザーからのメッセージに応答するインタラクティブな Bot 向けだ。毎朝1回メッセージを投げるだけなら明らかにオーバースペック。依存が増えてコードが複雑になるだけで得るものがない。

Slack Incoming Webhook と Discord Webhook は HTTP POST 一発で動く。

```typescript
// src/notify/webhook.ts
async function post(url: string, payload: object): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Webhook failed: ${res.status} ${await res.text()}`);
}
```

### Slack: Block Kit でリッチな通知

Slack の Webhook は [Block Kit](https://api.slack.com/block-kit) という JSON 形式でリッチなメッセージを送れる。

```typescript
// src/notify/format.ts
export function buildSlackPayload(digest: DailyDigest): object {
  const blocks: object[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `📰 Tech Digest ${digest.date}`, emoji: true },
    },
    { type: 'divider' },
  ];

  for (const item of digest.items.slice(0, 5)) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*#${item.rank} [${item.category}] <${item.url}|${item.title}>*\n${item.summary}`,
      },
    });
  }
  // 6件目以降はアーカイブへのリンクでまとめる
  if (digest.items.length > 5) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `_他 ${digest.items.length - 5} 件はアーカイブから_` },
    });
  }
  return { blocks };
}
```

### Discord: Embeds でカード形式に

Discord は `embeds` 配列を使うと各記事をカード形式で表示できる。

```typescript
export function buildDiscordPayload(digest: DailyDigest): object {
  const embeds = digest.items.slice(0, 5).map(item => ({
    title: `#${item.rank} [${item.category}] ${item.title}`,
    url: item.url,
    description: item.summary,
    color: 0x5865f2, // Discord blurple
  }));
  return { content: `📰 **Tech Digest ${digest.date}**\n${ARCHIVE_URL}`, embeds };
}
```

---

## `Promise.allSettled` で並列・耐障害送信

Slack と Discord の通知は独立しているので並列実行する。どちらか一方が失敗しても他方は送信できるようにしたい。

```typescript
// src/notify/send.ts
const tasks: Array<{ name: string; fn: () => Promise<void> }> = [];
if (process.env.SLACK_WEBHOOK_URL)   tasks.push({ name: 'Slack',   fn: () => sendSlack(digest) });
if (process.env.DISCORD_WEBHOOK_URL) tasks.push({ name: 'Discord', fn: () => sendDiscord(digest) });

const results = await Promise.allSettled(tasks.map(t => t.fn()));

for (const [i, result] of results.entries()) {
  if (result.status === 'fulfilled') console.log(`✅ ${tasks[i].name}: sent`);
  else                               console.error(`❌ ${tasks[i].name}: ${result.reason}`);
}
```

`Promise.all` だとどちらか一方が失敗した瞬間に全体が中断される。`Promise.allSettled` は全 Promise の完了を待ち、結果（fulfilled / rejected）を配列で返す。独立した送信処理に向いている。

---

## GitHub Actions: `continue-on-error` の使いどころ

通知の失敗はメインのダイジェスト生成・デプロイに影響させたくない。

```yaml
- name: Send email digest
  run: npx tsx src/mail/send.ts
  continue-on-error: true   # ← メール失敗でもワークフロー全体を止めない
  env:
    GMAIL_CLIENT_ID: ${{ secrets.GMAIL_CLIENT_ID }}
    ...

- name: Send webhook notifications
  run: npx tsx src/notify/send.ts
  continue-on-error: true   # ← 通知失敗も同様
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
    DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

`continue-on-error: true` はステップが失敗してもワークフローを続行させるフラグだ。通知は「あれば嬉しい」機能であって、失敗しても Pages のデプロイは止めたくない。

GitHub Actions ではステップの依存関係を細かく制御することで、重要度に応じた耐障害性を設計できる。

---

## バグ修正: UTC と JST の日付ズレ

この機能追加と並行して、既存のバグも修正した。

GitHub Actions の cron は UTC で動く。`'0 22 * * *'`（UTC 22:00）は JST 翌朝 07:00 だ。

問題: `new Date().toISOString().slice(0, 10)` は UTC の日付を返す。

UTC 22:00 = JST 翌日 07:00 なので、たとえば JST 3月31日 07:00 に実行すると `2026-03-30` というファイル名で保存される。1日ずれる。

```typescript
// ❌ Before: UTC 日付
const TODAY = new Date().toISOString().slice(0, 10);

// ✅ After: JST 日付を確実に取得
export function jstToday(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find(p => p.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
```

`Intl.DateTimeFormat` の `timeZone: 'Asia/Tokyo'` で JST に変換できる。

`format()` メソッドを使わず `formatToParts()` を使うのがポイントだ。`format()` はロケールによってセパレータが `/` や `-` に変わる可能性があるが、`formatToParts()` で `year`・`month`・`day` を個別に取り出して自分で結合すれば YYYY-MM-DD が保証される。

---

## まとめ

追加した構成:

```
src/
├── mail/
│   ├── email-template.ts   # インライン CSS 付き HTML メール生成
│   ├── gmail.ts            # Gmail API クライアント（OAuth2）
│   └── send.ts             # メール送信エントリーポイント
├── notify/
│   ├── format.ts           # Slack (Block Kit) / Discord (Embeds) ペイロード生成
│   ├── webhook.ts          # Webhook 送信クライアント
│   └── send.ts             # 通知送信エントリーポイント
├── utils/
│   └── date.ts             # JST 日付ユーティリティ
└── ...（既存）

scripts/
└── get-gmail-token.ts      # OAuth2 リフレッシュトークン取得（一時スクリプト）
```

今回の実装で学んだこと:

**1. 一方向通知に Bot SDK は不要**
Slack/Discord 通知なら Webhook POST で十分。依存は最小に保つ。

**2. 無人実行では認証の永続化を設計する**
OAuth2 のリフレッシュトークンはそのための仕組みだ。一度だけ人間が認証して、あとは機械が自動更新する。

**3. HTML メールはウェブとは別物**
`<style>` タグが使えない。RFC 2047 でのヘッダーエンコード、`base64url` での本文エンコードなど、ウェブ開発の常識が通じない部分がある。

**4. UTC/JST のズレは必ず踏む**
`new Date().toISOString()` は UTC だ。JST で動くシステムを UTC の CI 上で動かすとき、日付の扱いは常に明示的に `timeZone` を指定する。

---

GitHub Actions が毎朝送ってくれるようになったので、自分でも毎日読むようになった。作ったものが生活に溶け込むのは、やはり気持ちいい。

GitHub リポジトリ: https://github.com/HayatoToyoda/tech-digest
公開ページ: https://hayatotoyoda.github.io/tech-digest/

---

*この記事で紹介したコードはすべて上記リポジトリで公開しています。*
