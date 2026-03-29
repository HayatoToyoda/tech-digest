# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** P1〜P3 のセキュリティ問題 10 件を修正し、Prompt Injection・SSRF・XSS・Path Traversal・サプライチェーンリスクを軽減する。

**Architecture:** テンプレート層での URL スキーム検証・escapeHtml 強化、Claude API の system/user 分離、外部 URL フェッチ前の SSRF ブロック、レンダリング層での date バリデーション、GitHub Actions のハードニング（SHA 固定・ジョブ分割・npm audit）。

**Tech Stack:** TypeScript, Node.js 22, Vitest, Anthropic SDK, GitHub Actions

---

## ファイルマップ

| ファイル | 変更内容 |
|---|---|
| `src/render/templates.ts` | `escapeHtml` に `'` 追加、`safeHref` 関数追加、`articleCard` で使用 |
| `src/render/archive-page.ts` | `d.date` に `escapeHtml` + バリデーション、`d.date` をファイルパス前チェック |
| `src/render/index-page.ts` | `digest.date` に `escapeHtml` 適用 |
| `src/extract/content.ts` | `isSafeUrl` でプロトコル・プライベートIP ブロック |
| `src/claude/digest.ts` | 指示を `system` パラメータへ移動 |
| `src/main.ts` | `d.date` をファイルパス使用前にバリデーション |
| `.github/workflows/daily-digest.yml` | Actions SHA 固定、ジョブ分割、`npm audit` 追加 |
| `src/__tests__/templates.test.ts` | 新テスト追加 |
| `src/__tests__/content.test.ts` | SSRF ブロックのテスト追加 |

---

## Task 1: `escapeHtml` を強化し `safeHref` を追加（FIND-09, FIND-10）

**Files:**
- Modify: `src/render/templates.ts`
- Modify: `src/__tests__/templates.test.ts`

- [ ] **Step 1: 失敗テストを書く**

`src/__tests__/templates.test.ts` の `describe('escapeHtml', ...)` ブロックに追記:

```typescript
  it("' をエスケープする", () => {
    expect(escapeHtml("it's")).toBe('it&#x27;s');
  });
```

`src/__tests__/templates.test.ts` に新 describe ブロックを追加（`articleCard` の後）:

```typescript
import { escapeHtml, articleCard, categoryColor, safeHref } from '../render/templates.js';
// ↑ safeHref を import に追加

describe('safeHref', () => {
  it('https:// URL をそのまま返す', () => {
    expect(safeHref('https://example.com')).toBe('https://example.com');
  });

  it('http:// URL をそのまま返す', () => {
    expect(safeHref('http://example.com')).toBe('http://example.com');
  });

  it('javascript: URL を # に変換する', () => {
    expect(safeHref('javascript:alert(1)')).toBe('#');
  });

  it('data: URL を # に変換する', () => {
    expect(safeHref('data:text/html,<script>alert(1)</script>')).toBe('#');
  });

  it('空文字を # に変換する', () => {
    expect(safeHref('')).toBe('#');
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
cd /Users/yoda/forProgramming/tech-digest
npm test -- src/__tests__/templates.test.ts
```

期待: `safeHref is not a function` エラーで失敗、`escapeHtml "'" テスト`も失敗

- [ ] **Step 3: `templates.ts` を修正**

```typescript
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function safeHref(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
  } catch {
    // 無効なURL
  }
  return '#';
}
```

`articleCard` 内の `href` を変更:

```typescript
  <h2><a href="${safeHref(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h2>
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npm test -- src/__tests__/templates.test.ts
```

期待: 全テスト PASS

- [ ] **Step 5: コミット**

```bash
git add src/render/templates.ts src/__tests__/templates.test.ts
git commit -m "security: add safeHref and fix escapeHtml single-quote (FIND-09, FIND-10)"
```

---

## Task 2: Claude プロンプトを system/user 分離（FIND-01）

**Files:**
- Modify: `src/claude/digest.ts`
- Modify: `src/__tests__/digest.test.ts`

- [ ] **Step 1: 失敗テストを書く**

`src/__tests__/digest.test.ts` に追記:

```typescript
  it('system パラメータで呼ばれる', async () => {
    await generateDigest('2026-03-29', candidates);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('JSON'),
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user' }),
        ]),
      })
    );
  });
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- src/__tests__/digest.test.ts
```

期待: `system パラメータで呼ばれる` が失敗

- [ ] **Step 3: `digest.ts` を修正**

```typescript
const SYSTEM_PROMPT = `あなたはテックニュースのキュレーターです。
提供された記事候補から最も重要な5〜10本を選び、日本語ダイジェストを作成してください。

選定基準:
- 実務影響が大きい
- 主要企業/主要OSS/主要プラットフォームの更新
- セキュリティ/障害/規約変更
- AI/開発者ツールの大きな変化
- 単なるバズや雑談は除外

回答は以下のJSON形式のみで返してください（前後のテキスト不要）:
{
  "items": [
    {
      "rank": 1,
      "title": "記事タイトル（原文のまま）",
      "url": "https://...",
      "source": "ソース名",
      "category": "AI|Web|Security|OSS|Platform のいずれか",
      "summary": "日本語で3〜5文のダイジェスト",
      "importance": "なぜ重要か（日本語、1〜2文）",
      "targetReaders": "読むべき人（日本語、1文）"
    }
  ]
}`;

export async function generateDigest(
  date: string,
  candidates: ArticleCandidate[]
): Promise<DailyDigest> {
  const candidateText = candidates
    .map(
      (c, i) =>
        `[${i + 1}] Source: ${c.source}\nTitle: ${c.title}\nURL: ${c.url}\n` +
        (c.bodyText ? `Body: ${c.bodyText}` : '(本文取得なし)')
    )
    .join('\n\n---\n\n');

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `候補記事:\n\n${candidateText}`,
    }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Claude response contained no JSON block');

  const parsed = JSON.parse(match[0]) as { items: DailyDigest['items'] };
  return {
    date,
    generatedAt: new Date().toISOString(),
    items: parsed.items,
  };
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npm test -- src/__tests__/digest.test.ts
```

期待: 全テスト PASS

- [ ] **Step 5: コミット**

```bash
git add src/claude/digest.ts src/__tests__/digest.test.ts
git commit -m "security: separate system/user prompt to mitigate prompt injection (FIND-01)"
```

---

## Task 3: SSRF ブロック — プライベートIP・非httpsをフィルタ（FIND-02）

**Files:**
- Modify: `src/extract/content.ts`
- Modify: `src/__tests__/content.test.ts`

- [ ] **Step 1: 失敗テストを書く**

`src/__tests__/content.test.ts` の describe ブロック末尾に追記:

```typescript
  it('javascript: URL の記事は bodyText が undefined を返す', async () => {
    const jsArticle = { ...baseArticle, url: 'javascript:alert(1)' };
    const result = await extractContent(jsArticle);
    expect(result.bodyText).toBeUndefined();
    expect(vi.mocked(extract)).not.toHaveBeenCalledWith('javascript:alert(1)', expect.anything(), expect.anything());
  });

  it('プライベートIP URL の記事は bodyText が undefined を返す', async () => {
    const privateArticle = { ...baseArticle, url: 'http://169.254.169.254/latest/meta-data/' };
    const result = await extractContent(privateArticle);
    expect(result.bodyText).toBeUndefined();
    expect(vi.mocked(extract)).not.toHaveBeenCalledWith('http://169.254.169.254/latest/meta-data/', expect.anything(), expect.anything());
  });
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- src/__tests__/content.test.ts
```

期待: 2テストが失敗（`extract` が呼ばれてしまう）

- [ ] **Step 3: `content.ts` に URL バリデーションを追加**

```typescript
import { extract } from '@extractus/article-extractor';
import type { RawArticle, ArticleCandidate } from '../types.js';

const MAX_BODY_CHARS = 3000;
const FETCH_TIMEOUT_MS = 10_000;

const PRIVATE_IP_RE = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.|::1$|localhost$)/i;

export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (PRIVATE_IP_RE.test(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function extractContent(article: RawArticle): Promise<ArticleCandidate> {
  if (!isSafeUrl(article.url)) {
    return { ...article, preScore: 0 };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const result = await extract(article.url, undefined, { signal: controller.signal });
    const bodyText = result?.content
      ? result.content
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, MAX_BODY_CHARS)
      : undefined;
    return { ...article, bodyText, preScore: 0 };
  } catch {
    return { ...article, preScore: 0 };
  } finally {
    clearTimeout(timer);
  }
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npm test -- src/__tests__/content.test.ts
```

期待: 全テスト PASS

- [ ] **Step 5: コミット**

```bash
git add src/extract/content.ts src/__tests__/content.test.ts
git commit -m "security: block SSRF via private IP and non-http(s) URL filter (FIND-02)"
```

---

## Task 4: `date` フィールドの XSS・Path Traversal バリデーション（FIND-03/04/05）

**Files:**
- Modify: `src/render/templates.ts` (ヘルパー関数追加)
- Modify: `src/render/archive-page.ts`
- Modify: `src/render/index-page.ts`
- Modify: `src/main.ts`
- Modify: `src/__tests__/archive-page.test.ts`（テスト追加）

- [ ] **Step 1: 失敗テストを確認のため既存テストを読む**

```bash
cat src/__tests__/archive-page.test.ts
```

- [ ] **Step 2: 失敗テストを書く**

`src/__tests__/archive-page.test.ts` に追記（既存 describe の末尾）:

```typescript
  it('date に XSS 文字が含まれても無害化される', () => {
    const maliciousDigest = {
      ...sampleDigest,
      date: '"><script>alert(1)</script>',
    };
    const html = buildArchiveIndex([maliciousDigest]);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('date が YYYY-MM-DD 形式でない場合はアーカイブリンクを除外する', () => {
    const badDigest = { ...sampleDigest, date: '../evil' };
    const html = buildArchiveIndex([badDigest]);
    expect(html).not.toContain('../evil');
  });
```

- [ ] **Step 3: テストが失敗することを確認**

```bash
npm test -- src/__tests__/archive-page.test.ts
```

期待: 2テストが失敗

- [ ] **Step 4: `templates.ts` に `isValidDate` ヘルパーを追加**

```typescript
export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}
```

- [ ] **Step 5: `archive-page.ts` を修正**

```typescript
import type { DailyDigest } from '../types.js';
import { articleCard, escapeHtml, isValidDate } from './templates.js';
import { CSS } from './style.js';

export function buildArchivePage(digest: DailyDigest): string {
  const cards = digest.items.map((item) => articleCard(item)).join('\n    ');
  const safeDate = escapeHtml(digest.date);
  const safeCount = String(digest.items.length);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tech Digest — ${safeDate}</title>
  <style>${CSS}</style>
</head>
<body>
  <header>
    <h1>Tech Digest</h1>
    <p>${safeDate} の厳選 ${safeCount} 本</p>
    <nav>
      <a href="../index.html">← 今日のダイジェスト</a>
      <a href="index.html">アーカイブ一覧</a>
    </nav>
  </header>
  <main>
    ${cards}
  </main>
  <footer>
    <p>Generated by Claude Haiku 4.5</p>
  </footer>
</body>
</html>`;
}

export function buildArchiveIndex(digests: DailyDigest[]): string {
  const links = digests
    .filter((d) => isValidDate(d.date))
    .map(
      (d) =>
        `<a class="archive-link" href="${escapeHtml(d.date)}.html">${escapeHtml(d.date)}<span class="count">${String(d.items.length)} 本</span></a>`
    )
    .join('\n    ');

  const safeCount = String(digests.length);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tech Digest — アーカイブ</title>
  <style>${CSS}</style>
</head>
<body>
  <header>
    <h1>Tech Digest アーカイブ</h1>
    <p>過去 ${safeCount} 日分</p>
    <nav><a href="../index.html">← 今日のダイジェスト</a></nav>
  </header>
  <main>
    ${links}
  </main>
  <footer>
    <p>Generated by Claude Haiku 4.5</p>
  </footer>
</body>
</html>`;
}
```

- [ ] **Step 6: `index-page.ts` を修正**

```typescript
import type { DailyDigest } from '../types.js';
import { articleCard, escapeHtml } from './templates.js';
import { CSS } from './style.js';

export function buildIndexPage(digest: DailyDigest): string {
  const cards = digest.items.map((item) => articleCard(item)).join('\n    ');
  const safeDate = escapeHtml(digest.date);
  const safeCount = String(digest.items.length);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tech Digest — ${safeDate}</title>
  <style>${CSS}</style>
</head>
<body>
  <header>
    <h1>Tech Digest</h1>
    <p>${safeDate} の厳選 ${safeCount} 本</p>
    <nav>
      <a href="archive/index.html">過去のアーカイブ →</a>
    </nav>
  </header>
  <main>
    ${cards}
  </main>
  <footer>
    <p>Generated by Claude Haiku 4.5</p>
  </footer>
</body>
</html>`;
}
```

- [ ] **Step 7: `main.ts` の `writeFile` 前に date バリデーションを追加**

`main.ts` の `for (const d of allDigests)` ループを修正:

```typescript
  for (const d of allDigests) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) {
      console.warn(`Skipping invalid date: ${d.date}`);
      continue;
    }
    await writeFile(`dist/archive/${d.date}.html`, buildArchivePage(d), 'utf-8');
  }
```

- [ ] **Step 8: テストが通ることを確認**

```bash
npm test
```

期待: 全テスト PASS

- [ ] **Step 9: コミット**

```bash
git add src/render/templates.ts src/render/archive-page.ts src/render/index-page.ts src/main.ts src/__tests__/archive-page.test.ts
git commit -m "security: validate and escape date field to prevent XSS and path traversal (FIND-03/04/05)"
```

---

## Task 5: GitHub Actions ハードニング（FIND-06/07/08）

**Files:**
- Modify: `.github/workflows/daily-digest.yml`

- [ ] **Step 1: 各アクションの最新 SHA を取得**

```bash
gh api repos/actions/checkout/git/ref/heads/main --jq '.object.sha'
gh api repos/actions/setup-node/git/ref/heads/main --jq '.object.sha'
gh api repos/actions/configure-pages/git/ref/heads/main --jq '.object.sha'
gh api repos/actions/upload-pages-artifact/git/ref/heads/main --jq '.object.sha'
gh api repos/actions/deploy-pages/git/ref/heads/main --jq '.object.sha'
```

- [ ] **Step 2: ワークフローを新しい内容に置き換える**

以下の内容で `.github/workflows/daily-digest.yml` を書き換える（SHA は Step 1 で取得した値に差し替え）:

```yaml
name: Daily Tech Digest

on:
  schedule:
    - cron: '0 22 * * *'  # 毎日 07:00 JST (UTC+9 = UTC 22:00)
  workflow_dispatch:        # 手動再実行

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout
        uses: actions/checkout@<SHA_CHECKOUT>

      - name: Setup Node.js
        uses: actions/setup-node@<SHA_SETUP_NODE>
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Audit dependencies
        run: npm audit --audit-level=high

      - name: Run digest
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: npm run build

      - name: Commit digest JSON
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/digests/
          git diff --staged --quiet || git commit -m "data: digest $(date -u +%Y-%m-%d)"
          git push

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@<SHA_UPLOAD_PAGES>
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Setup Pages
        uses: actions/configure-pages@<SHA_CONFIGURE_PAGES>

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@<SHA_DEPLOY_PAGES>
```

- [ ] **Step 3: ワークフローが YAML として有効か確認**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/daily-digest.yml'))" && echo "YAML OK"
```

期待: `YAML OK`

- [ ] **Step 4: コミット**

```bash
git add .github/workflows/daily-digest.yml
git commit -m "security: pin Actions to SHA, split jobs, add npm audit (FIND-06/07/08)"
```

---

## Task 6: 全テスト・型チェック・プッシュ

- [ ] **Step 1: 全テスト実行**

```bash
npm test
```

期待: 全テスト PASS (35件以上)

- [ ] **Step 2: TypeScript 型チェック**

```bash
npx tsc --noEmit
```

期待: エラーなし

- [ ] **Step 3: リモートにプッシュ**

```bash
git pull --rebase origin main && git push origin main
```

---

## 自己レビュー

- FIND-01 (Prompt Injection) → Task 2 ✅
- FIND-02 (SSRF) → Task 3 ✅
- FIND-03/04 (XSS via date) → Task 4 ✅
- FIND-05 (Path Traversal) → Task 4 ✅
- FIND-06 (Actions SHA) → Task 5 ✅
- FIND-07 (権限分割) → Task 5 ✅
- FIND-08 (npm audit) → Task 5 ✅
- FIND-09 (javascript: URL) → Task 1 ✅
- FIND-10 (escapeHtml `'`) → Task 1 ✅
