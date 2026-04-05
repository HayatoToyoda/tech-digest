/**
 * Nothing OS 風静的 UI（dominikmartn/nothing-design-skill のトークン準拠）
 * フォント: Space Grotesk（本文）/ Space Mono（ラベル・数値）/ Doto（ヒーロー日付）
 */

export const CSS = `
:root {
  /* Dark（既定）— tokens.md Primary Palette */
  --black: #000000;
  --surface: #111111;
  --surface-raised: #1a1a1a;
  --border: #222222;
  --border-visible: #333333;
  --text-disabled: #666666;
  --text-secondary: #999999;
  --text-primary: #e8e8e8;
  --text-display: #ffffff;
  --accent: #d71921;
  --accent-subtle: rgba(215, 25, 33, 0.15);
  --interactive: #5b9bf6;
  --success: #4a9e5c;
  --warning: #d4a843;
  /* カテゴリ（値への色付け — ラベルはモノクロのまま） */
  --cat-ai: #5b9bf6;
  --cat-web: #4a9e5c;
  --cat-security: #d71921;
  --cat-oss: #6b9ed4;
  --cat-platform: #d4a843;
  --dot-grid-opacity: 0.14;
}

html.light {
  --black: #f5f5f5;
  --surface: #ffffff;
  --surface-raised: #f0f0f0;
  --border: #e8e8e8;
  --border-visible: #cccccc;
  --text-disabled: #999999;
  --text-secondary: #666666;
  --text-primary: #1a1a1a;
  --text-display: #000000;
  --interactive: #007aff;
  --accent-subtle: rgba(215, 25, 33, 0.12);
  --cat-ai: #007aff;
  --cat-web: #2d7a3e;
  --cat-security: #b0151c;
  --cat-oss: #2563a8;
  --cat-platform: #9a7b24;
  --dot-grid-opacity: 0.08;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html {
  background: var(--black);
  color: var(--text-primary);
  font-family: "Space Grotesk", "DM Sans", system-ui, -apple-system, "Segoe UI", "Noto Sans JP", sans-serif;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  position: relative;
  background: var(--black);
  color: var(--text-primary);
  max-width: 40rem;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
  min-height: 100dvh;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle, var(--border-visible) 1px, transparent 1px);
  background-size: 16px 16px;
  opacity: var(--dot-grid-opacity);
  pointer-events: none;
  z-index: 0;
}

body > * { position: relative; z-index: 1; }

/* ラベル: Space Mono, ALL CAPS（計器パネル） */
.label {
  font-family: "Space Mono", "JetBrains Mono", "SF Mono", ui-monospace, monospace;
  font-size: 0.6875rem;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

/* ヒーロー日付 — Doto、36px 相当以上 */
.display-date {
  font-family: "Doto", "Space Mono", monospace;
  font-size: clamp(2.25rem, 8vw, 3rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--text-display);
}

.display-date--sm {
  font-size: clamp(1.75rem, 6vw, 2.25rem);
}

*:focus-visible {
  outline: 1px solid var(--accent);
  outline-offset: 2px;
}

.top-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.theme-segment {
  display: inline-flex;
  border: 1px solid var(--border-visible);
  background: var(--surface);
}

.theme-segment button {
  font-family: "Space Mono", monospace;
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.45rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.15s cubic-bezier(0.25, 0.1, 0.25, 1),
    background 0.15s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.theme-segment button + button {
  border-left: 1px solid var(--border-visible);
}

.theme-segment button[aria-pressed="true"] {
  background: var(--surface-raised);
  color: var(--text-display);
}

.theme-segment button:hover {
  color: var(--text-primary);
}

header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.site-title {
  margin-bottom: 0.5rem;
}

.top-bar .site-title {
  margin-bottom: 0;
}

.header-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.digest-meter-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}

.digest-meter-label {
  font-family: "Space Mono", monospace;
  font-size: 0.625rem;
  letter-spacing: 0.06em;
  color: var(--text-disabled);
  text-transform: uppercase;
}

.digest-meter {
  display: flex;
  gap: 3px;
}

.digest-meter span {
  display: block;
  width: 6px;
  height: 14px;
  background: var(--border);
  transition: background 0.15s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.digest-meter span.on {
  background: var(--accent);
}

.header-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  max-width: 28rem;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

nav a {
  display: inline-flex;
  align-items: center;
  font-family: "Space Mono", monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--interactive);
  text-decoration: none;
  padding: 0.4rem 0.65rem;
  border: 1px solid var(--border-visible);
  border-radius: 999px;
  background: var(--surface);
  transition: border-color 0.15s cubic-bezier(0.25, 0.1, 0.25, 1),
    color 0.15s cubic-bezier(0.25, 0.1, 0.25, 1);
}

nav a:hover {
  border-color: var(--text-secondary);
  color: var(--text-display);
}

main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  padding: 1.25rem 1.15rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  transition: border-color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.card:hover {
  border-color: var(--border-visible);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
  flex-wrap: wrap;
}

.rank {
  font-family: "Space Mono", monospace;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-disabled);
  min-width: 2rem;
  font-variant-numeric: tabular-nums;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: "Space Mono", "JetBrains Mono", "SF Mono", ui-monospace, monospace;
  font-size: 0.625rem;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.45rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface-raised);
  color: var(--text-secondary);
}

.badge-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 1px;
  flex-shrink: 0;
}

.cat-AI { background: var(--cat-ai); }
.cat-Web { background: var(--cat-web); }
.cat-Security { background: var(--cat-security); }
.cat-OSS { background: var(--cat-oss); }
.cat-Platform { background: var(--cat-platform); }

.source {
  font-family: "Space Mono", monospace;
  font-size: 0.625rem;
  color: var(--text-disabled);
  margin-left: auto;
  letter-spacing: 0.03em;
}

h2 {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.35;
  margin-bottom: 0.5rem;
  letter-spacing: -0.015em;
  color: var(--text-display);
}

h2 a {
  color: inherit;
  text-decoration: none;
  transition: color 0.15s cubic-bezier(0.25, 0.1, 0.25, 1);
}

h2 a:hover {
  color: var(--interactive);
}

.summary {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin-bottom: 0.85rem;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  padding-top: 0.85rem;
  border-top: 1px solid var(--border);
}

.meta-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.meta strong {
  font-family: "Space Mono", monospace;
  font-size: 0.625rem;
  font-weight: 400;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-disabled);
  min-width: 6.5em;
  flex-shrink: 0;
}

footer {
  margin-top: 3rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
  text-align: center;
}

footer p {
  font-family: "Space Mono", monospace;
  font-size: 0.625rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-disabled);
}

.archive-list {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 6px;
  overflow: hidden;
}

a.archive-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.9375rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s cubic-bezier(0.25, 0.1, 0.25, 1);
}

a.archive-link:last-child {
  border-bottom: none;
}

a.archive-link:hover {
  background: var(--surface-raised);
}

a.archive-link .count {
  font-family: "Space Mono", monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-secondary);
  border: 1px solid var(--border-visible);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}
`;

/** Google Fonts — SKILL: declare in head（<style> 内 @import は使わない） */
export const FONT_LINKS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Doto:wght@100..900&family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
`;

const THEME_STORAGE_KEY = 'tech-digest-theme';

/** セグメントメーター（最大10セグ、件数に応じて点灯） */
export function buildDigestMeter(itemCount: number): string {
  const n = Math.min(10, Math.max(0, itemCount));
  const segments = Array.from({ length: 10 }, (_, i) => `<span${i < n ? ' class="on"' : ''}></span>`).join('');
  return `<div class="digest-meter-wrap" aria-hidden="true">
    <span class="digest-meter-label">Volume</span>
    <div class="digest-meter" role="presentation">${segments}</div>
  </div>`;
}

export function themeToggleHtml(): string {
  return `<div class="theme-segment" role="group" aria-label="カラーテーマ">
  <button type="button" class="theme-btn" data-theme="dark" aria-pressed="false">Dark</button>
  <button type="button" class="theme-btn" data-theme="light" aria-pressed="false">Light</button>
</div>`;
}

export function themeInitScript(): string {
  const key = THEME_STORAGE_KEY;
  return `<script>(function(){var k=${JSON.stringify(key)};var r=document.documentElement;function p(){try{var s=localStorage.getItem(k);if(s==="light"||s==="dark")return s;}catch(e){}return window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}function a(m){r.classList.toggle("light",m==="light");try{localStorage.setItem(k,m);}catch(e){}document.querySelectorAll(".theme-btn").forEach(function(b){var on=b.getAttribute("data-theme")===m;b.setAttribute("aria-pressed",on?"true":"false");});}a(p());document.querySelectorAll(".theme-btn").forEach(function(b){b.addEventListener("click",function(){a(b.getAttribute("data-theme"));});});})();</script>`;
}
