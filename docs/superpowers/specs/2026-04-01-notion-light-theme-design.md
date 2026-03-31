# Notion風ライトテーマ リデザイン設計書

**日付:** 2026-04-01
**対象:** tech-digest UI

---

## 概要

現在のUIをより洗練されたNotion風ドキュメントスタイルへ刷新する。具体的にはカードのボーダーを撤廃してブロック風の区切り線スタイルに変更し、Inter フォントを導入し、メタ情報をNotionプロパティ風のレイアウトに整える。

---

## デザイン方針

| 項目 | 方針 |
|------|------|
| スタイル | Notionドキュメントページ風 |
| カード | ボーダーなし・背景なし、記事間は区切り線（`border-bottom`） |
| フォント | Inter（Google Fonts）+ システムフォントフォールバック |
| 背景 | クリーム（`#f7f6f3`）を維持 |
| メタ情報 | Notionプロパティ風 flex レイアウト |

---

## カラーパレット

```css
:root {
  --bg: #f7f6f3;       /* クリーム背景（変更なし） */
  --surface: #ffffff;  /* 現在未使用になる */
  --text: #37352f;     /* ダークブラウン（Notion標準色） */
  --text-2: #6b6b67;   /* サブテキスト */
  --muted: #9b9a97;    /* ミュートテキスト */
  --border: #e9e8e6;   /* 区切り線 */
  --hover: #eeece9;    /* ホバー背景（クリームより濃い） */
}
```

---

## 変更箇所

### `src/render/style.ts`（唯一の変更ファイル）

#### 1. フォント読み込み（CSS先頭に追加）
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

#### 2. `body` のフォント更新
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', 'Hiragino Sans', sans-serif;
```

#### 3. `.card` — ボーダーレスブロックスタイルへ変更
```css
.card {
  /* 削除: background, border, border-radius */
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}
.card:last-child { border-bottom: none; }
.card:hover {
  background: var(--hover);
  /* 削除: box-shadow */
}
```

#### 4. `.meta` — Notionプロパティ風レイアウトへ変更
```css
.meta {
  border-top: none;
  padding-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.meta div {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}
.meta strong {
  color: var(--muted);
  font-weight: 500;
  font-size: 0.78rem;
  min-width: 6em;
  flex-shrink: 0;
}
```

---

## 変更しないもの

- `templates.ts` — HTML構造は変更なし
- `index-page.ts` — ページ構造は変更なし
- `archive-page.ts` — 同上
- カラーパレットの変数名・値（`--bg`, `--text` 等）

---

## 検証方法

1. `npm run dev`（または `npx tsx src/main.ts`）で `dist/index.html` を再生成
2. Playwright でスクリーンショット撮影: `npx playwright screenshot --full-page http://localhost:8000 /tmp/after.png`
3. Read ツールで画像を確認し、Notion風のビジュアルになっているか検証
4. モバイル表示も確認: `npx playwright screenshot --viewport-size=375,812 http://localhost:8000 /tmp/after-mobile.png`
