# Tech Digest

> Hacker News のトップ記事を毎朝 Claude AI が日本語でまとめ、GitHub Pages へ自動公開するシステム。

**[→ 今日のダイジェストを読む](https://hayatotoyoda.github.io/tech-digest/)**

---

## スクリーンショット

```
┌─────────────────────────────────────────────────────┐
│  Tech Digest          2026-03-29 の厳選 9 本         │
├─────────────────────────────────────────────────────┤
│  #1  [Security]  TechCrunch                         │
│  Iran-linked hackers breach FBI director's email    │
│  ─────────────────────────────────────────────────  │
│  FBIディレクターの個人メールがイラン系ハッカーに侵    │
│  害された。標的型スピアフィッシングにより…           │
│                                                     │
│  重要な理由: 政府高官への標的型攻撃の深刻化を示す    │
│  対象読者:  セキュリティ担当者・政策立案者           │
└─────────────────────────────────────────────────────┘
```

---

## 特徴

| 機能 | 内容 |
|---|---|
| **自動収集** | Hacker News API からトップ 50 件を毎朝取得 |
| **日本語要約** | Claude Haiku が各記事を 3〜5 文で要約 |
| **カテゴリ分類** | AI / Web / Security / OSS / Platform の 5 カテゴリ |
| **アーカイブ** | 過去のダイジェストを日付別に保存・公開 |
| **フルオートメーション** | GitHub Actions が毎朝 07:00 JST に自動実行 |
| **ゼロ運用コスト** | GitHub Pages でホスティング、サーバー不要 |

---

## 仕組み

```
GitHub Actions (毎朝 07:00 JST)
        │
        ▼
  Hacker News API
  (トップ 50 件取得)
        │
        ▼
  記事本文フェッチ
  (タイムアウト 10 秒・SSRF ブロック付き)
        │
        ▼
  Claude Haiku API
  (重要度判定・日本語ダイジェスト生成)
        │
        ├─── data/digests/YYYY-MM-DD.json → git commit
        │
        └─── dist/ (HTML) → GitHub Pages デプロイ
```

---

## セットアップ（自分のリポジトリで動かす）

### 1. リポジトリを Fork

```bash
gh repo fork HayatoToyoda/tech-digest --clone
cd tech-digest
```

### 2. シークレットを追加

リポジトリの **Settings → Secrets → Actions** に追加:

| シークレット名 | 値 |
|---|---|
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com/) で取得した API キー |

### 3. GitHub Pages を有効化

**Settings → Pages → Source** を `GitHub Actions` に設定。

### 4. 初回テスト実行

**Actions → Daily Tech Digest → Run workflow** で手動実行。

---

## ローカル開発

```bash
npm install

# ダイジェスト生成（ANTHROPIC_API_KEY 必要）
ANTHROPIC_API_KEY=sk-ant-... npm run build

# テスト実行
npm test

# 型チェック
npx tsc --noEmit
```

生成されたページは `dist/index.html` をブラウザで開いて確認できます。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| ランタイム | Node.js 22, TypeScript (tsx で直接実行) |
| AI | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |
| データソース | Hacker News Firebase API |
| テスト | Vitest (46 テスト) |
| CI/CD | GitHub Actions (SHA 固定) |
| ホスティング | GitHub Pages |

---

## セキュリティ対策

- **Prompt Injection 対策** — 指示は `system` パラメータで分離。記事データは `user` ロールのみ
- **SSRF ブロック** — プライベートIP（10.x / 172.16-31.x / 192.168.x / 169.254.x）・非 http(s) URL を拒否
- **XSS 対策** — 全出力に `escapeHtml`・`safeHref` 適用
- **タイムアウト** — 全外部フェッチに 10 秒タイムアウト + AbortController
- **最小権限** — build ジョブと deploy ジョブを分離し、権限スコープを最小化
- **依存関係監査** — CI で `npm audit --audit-level=high` を毎回実行

---

## ライセンス

MIT
