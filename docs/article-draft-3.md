# GitHub Actions から Slack / Discord にリッチ通知を送る — Webhook と Bot SDK、どちらを選ぶか

## はじめに

朝、自分が作ったツールの出力を確認しようと思いつつ、ブラウザを開かないまま午前中が終わる。

作ったものを毎日使うには、「見に行く」ではなく「届いてくる」仕組みが必要だ。

エンジニアが一日に何度も開くのは Slack と Discord だ。そこに届いていれば、能動的に URL を叩かなくても自然と目に入る。

この記事では、GitHub Actions から Slack と Discord に自動通知を送る仕組みを実装した過程を書く。

**完成物**: https://hayatotoyoda.github.io/tech-digest/
**リポジトリ**: https://github.com/HayatoToyoda/tech-digest

実装した通知のイメージ:

```
【Slack】
┌─────────────────────────────────┐
│ 📰 Tech Digest 2026-03-31       │
│ 本日のトップ 8 件 | アーカイブを見る │
├─────────────────────────────────┤
│ #1 [AI] OpenAI announces...     │
│ GPT-5 が正式発表。推論能力が...   │
│                                  │
│ #2 [Security] Critical bug...   │
│ ...                              │
│ _他 3 件はアーカイブから_         │
└─────────────────────────────────┘

【Discord】
📰 Tech Digest 2026-03-31 — 本日のトップ 8 件
https://hayatotoyoda.github.io/tech-digest/
┌──────────────────────────────┐
│ #1 [AI] OpenAI announces...  │  ← カード形式の Embed
│ GPT-5 が正式発表。推論能力が... │
└──────────────────────────────┘
```

---

## Bot SDK を採用しなかった理由

実装前に「Slack Bot SDK」「Discord Bot SDK」「`@vercel/chat`」といった選択肢を調べた。

結論から言う。**一方向のプッシュ通知なら Webhook で十分だ。**

Bot SDK が解決する問題は「ユーザーからのメッセージに応答する」インタラクティブなシナリオだ。`/コマンド` への応答、リアクションの検知、スレッドへの返信——こういった双方向の対話を実現するためにある。

毎朝1回メッセージを投げるだけの用途に Bot SDK を持ち込むと:

- OAuth アプリ登録・Bot トークン管理が必要になる
- 依存パッケージが増える
- コードが複雑になる

一方、Incoming Webhook は:

- チャンネルに Webhook URL を発行するだけ
- HTTP POST 1発で動く
- 依存パッケージ追加ゼロ（Node.js の `fetch` だけで動く）

**ツール選定は目的から逆算する。** 「送るだけ」ならシンプルな手段を選ぶのが正解だった。

---

## 共通: Webhook 送信クライアント

Slack も Discord も HTTP POST で動くため、送信クライアントは共通化できる。

```typescript
// src/notify/webhook.ts
async function post(url: string, payload: object): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Webhook failed: ${res.status} ${await res.text()}`);
  }
}

export async function sendSlack(digest: DailyDigest): Promise<void> {
  await post(process.env.SLACK_WEBHOOK_URL!, buildSlackPayload(digest));
}

export async function sendDiscord(digest: DailyDigest): Promise<void> {
  await post(process.env.DISCORD_WEBHOOK_URL!, buildDiscordPayload(digest));
}
```

`!res.ok` でエラーを検知し、ステータスコードとレスポンスボディをエラーメッセージに含める。Webhook 失敗時のデバッグに役立つ。

---

## Slack: Block Kit でリッチ通知

Slack の Webhook は [Block Kit](https://api.slack.com/block-kit) という JSON フォーマットでリッチなメッセージを組み立てられる。

Block Kit の基本構造は `blocks` 配列だ。各要素が「ブロック」として縦に積み重なる。

```typescript
// src/notify/format.ts
export function buildSlackPayload(digest: DailyDigest): object {
  const blocks: object[] = [
    // ヘッダーブロック（太字の大きなテキスト）
    {
      type: 'header',
      text: { type: 'plain_text', text: `📰 Tech Digest ${digest.date}`, emoji: true },
    },
    // サマリーセクション（mrkdwn でリンクを埋め込める）
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `本日のトップ ${digest.items.length} 件 | <${ARCHIVE_URL}|アーカイブを見る>`,
      },
    },
    { type: 'divider' },
  ];

  // 上位5件を個別ブロックに展開
  for (const item of digest.items.slice(0, PREVIEW_COUNT)) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        // <URL|テキスト> 形式でリンク付き太字
        text: `*#${item.rank} [${item.category}] <${item.url}|${item.title}>*\n${item.summary}`,
      },
    });
  }

  // 6件目以降はアーカイブへの誘導でまとめる
  if (digest.items.length > PREVIEW_COUNT) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `_他 ${digest.items.length - PREVIEW_COUNT} 件は <${ARCHIVE_URL}|アーカイブ> から_`,
      },
    });
  }

  return { blocks };
}
```

### Block Kit で押さえるべき2点

**1. `plain_text` と `mrkdwn` の使い分け**

`header` ブロックは `plain_text` しか受け付けない。リンクや太字を使いたい箇所は `section` ブロックの `mrkdwn` テキストで書く。

**2. Slack のリンク記法は `<URL|テキスト>`**

Markdown の `[テキスト](URL)` ではない。`mrkdwn` テキスト内では `<https://example.com|クリックはこちら>` と書く。

---

## Discord: Embeds でカード形式

Discord の Webhook は `embeds` 配列を使うと各記事をカード形式で表示できる。

```typescript
export function buildDiscordPayload(digest: DailyDigest): object {
  const preview = digest.items.slice(0, PREVIEW_COUNT);
  const remaining = digest.items.length - preview.length;

  // content はカードの上に表示されるプレーンテキスト
  const content =
    remaining > 0
      ? `📰 **Tech Digest ${digest.date}** — 本日のトップ ${digest.items.length} 件（上位 ${PREVIEW_COUNT} 件を表示）\n${ARCHIVE_URL}`
      : `📰 **Tech Digest ${digest.date}** — 本日のトップ ${digest.items.length} 件\n${ARCHIVE_URL}`;

  // embeds 配列の各要素が1枚のカード
  const embeds = preview.map(item => ({
    title: `#${item.rank} [${item.category}] ${item.title}`,
    url: item.url,        // title がリンクになる
    description: item.summary,
    color: 0x5865f2,      // Discord blurple（左端のカラーバー）
  }));

  return { content, embeds };
}
```

### Slack との構造の違い

| | Slack | Discord |
|---|---|---|
| リッチコンテンツ | `blocks` 配列 | `embeds` 配列 |
| タイトルのリンク | `mrkdwn` で `<url\|text>` | `title` + `url` フィールド |
| テキスト記法 | mrkdwn（独自） | Markdown |
| ブランドカラー | なし | `color`（16進数整数） |

Discord の `embeds` は `title` に `url` を別フィールドで指定する点が直感的だ。`color` は `0x5865f2` のように整数で指定する。文字列 `"#5865f2"` では動かない。

---

## Promise.allSettled で並列・耐障害送信

Slack と Discord の送信は独立しているので並列実行できる。さらに、片方が失敗してももう片方は送信できるようにしたい。

`Promise.all` と `Promise.allSettled` の違いがここで効いてくる。

```typescript
// ❌ Promise.all: どれか1つが失敗した瞬間に全体が中断する
const results = await Promise.all([sendSlack(digest), sendDiscord(digest)]);
// → Slack が失敗したら Discord にも送られない
```

```typescript
// ✅ Promise.allSettled: すべての Promise が完了するまで待ち、結果を配列で返す
const results = await Promise.allSettled([sendSlack(digest), sendDiscord(digest)]);
// → Slack が失敗しても Discord は送信される
```

さらに、「設定されている通知先だけ送る」ための動的タスク配列パターンを組み合わせた。

```typescript
// src/notify/send.ts
const tasks: Array<{ name: string; fn: () => Promise<void> }> = [];

// 環境変数が設定されている通知先だけタスクに追加
if (process.env.SLACK_WEBHOOK_URL)
  tasks.push({ name: 'Slack',   fn: () => sendSlack(digest) });
if (process.env.DISCORD_WEBHOOK_URL)
  tasks.push({ name: 'Discord', fn: () => sendDiscord(digest) });

if (tasks.length === 0) {
  console.error('SLACK_WEBHOOK_URL または DISCORD_WEBHOOK_URL を設定してください');
  process.exit(1);
}

// 並列実行・全結果を収集
const results = await Promise.allSettled(tasks.map(t => t.fn()));

let hasError = false;
for (const [i, result] of results.entries()) {
  if (result.status === 'fulfilled') {
    console.log(`✅ ${tasks[i].name}: sent`);
  } else {
    console.error(`❌ ${tasks[i].name}: ${result.reason}`);
    hasError = true;
  }
}

if (hasError) process.exit(1);
```

このパターンの利点:

- Slack だけ設定 → Discord の送信はスキップ（エラーにならない）
- Discord が失敗 → Slack は成功として記録される
- 将来の通知先追加は `tasks.push(...)` 1行で済む

---

## GitHub Actions: `continue-on-error` の使いどころ

通知の失敗は、メインのダイジェスト生成・GitHub Pages デプロイに影響させたくない。

```yaml
# .github/workflows/daily-digest.yml
- name: Send webhook notifications
  run: npx tsx src/notify/send.ts
  continue-on-error: true   # ← 通知失敗でもワークフロー全体を止めない
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
    DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

`continue-on-error: true` はステップが失敗してもワークフローを続行させるフラグだ。

GitHub Actions のステップには「失敗したら止める」「失敗しても続ける」の2種類がある。機能の重要度に応じてどちらを使うかを意識的に選ぶことで、CI/CD の耐障害性を設計できる。

| ステップ | continue-on-error | 理由 |
|---|---|---|
| ダイジェスト生成 | false（デフォルト）| 失敗したら Pages も更新しない |
| メール送信 | true | 通知失敗でデプロイを止めない |
| Webhook 通知 | true | 同上 |
| git commit & push | false（デフォルト）| データ保存は確実に行う |

---

## まとめ

Slack / Discord への通知実装を通じて得た判断基準:

**1. 「送るだけ」に Bot SDK は不要**
Incoming Webhook は HTTP POST だけで動く。Bot SDK はインタラクティブな対話が必要になってから導入すればいい。依存は目的に応じて最小にする。

**2. `Promise.allSettled` は「独立した処理の並列実行」に使う**
`Promise.all` は「全部成功が必要なとき」、`Promise.allSettled` は「独立した処理をすべて試みて結果を集めるとき」に使う。

**3. CI/CD ではステップごとに耐障害性を設計する**
すべてのステップを同等に扱わない。失敗しても続行すべきステップと、失敗したら止めるべきステップを区別する。

### 今後やりたいこと
- 通知先チャンネルのカテゴリフィルタ（AI 記事だけ特定チャンネルへ）
- Slack のインタラクティブボタンで「もっと見る」を実装
- LINE Notify・Teams など他プラットフォームへの拡張

---

プッシュ型の情報配信を整えてから、自分でも毎朝通知を確認するようになった。情報が届いてくる仕組みを作ると、使う頻度が変わる。

GitHub リポジトリ: https://github.com/HayatoToyoda/tech-digest
公開ページ: https://hayatotoyoda.github.io/tech-digest/

---

*この記事で紹介したコードはすべて上記リポジトリで公開しています。*
