/** Nothing UI 準拠の静的 HTML 用スタイル（nothing-design tokens / 角丸なし・ダーク既定） */
export const CSS = `
:root {
  --bg: #0a0a0a;
  --bg-1: #111111;
  --bg-2: #1a1a1a;
  --bg-3: #242424;
  --border: #2a2a2a;
  --border-2: #444444;
  --fg: #f2f2f2;
  --fg-2: #888888;
  --fg-3: #444444;
  --accent: #ff2d20;
  --accent-dim: #b01f16;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html {
  background: var(--bg);
  color: var(--fg);
  font-family: "Space Grotesk", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
body {
  background: var(--bg);
  color: var(--fg);
  line-height: 1.6;
  max-width: 42rem;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
}
.ndot {
  font-family: "VT323", "Courier New", monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
*:focus-visible {
  outline: 1px solid var(--accent);
  outline-offset: 2px;
}
header { margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
.site-title {
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--fg-2);
  margin-bottom: 0.75rem;
}
.header-date {
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--fg);
  line-height: 1.15;
  margin-bottom: 0.35rem;
}
.header-meta { font-size: 0.875rem; color: var(--fg-2); margin-bottom: 1.25rem; }
nav { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
nav a {
  display: inline-flex;
  align-items: center;
  font-size: 0.8125rem;
  color: var(--fg-2);
  text-decoration: none;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 0;
  background: var(--bg-1);
  transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}
nav a:hover {
  background: var(--bg-2);
  color: var(--fg);
  border-color: var(--border-2);
}
main { display: flex; flex-direction: column; gap: 1rem; }
.card {
  padding: 1.35rem 1.25rem;
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: 0;
  transition: border-color 0.15s ease;
}
.card:hover { border-color: var(--border-2); }
.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
  flex-wrap: wrap;
}
.rank {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--fg-3);
  min-width: 1.75rem;
  font-variant-numeric: tabular-nums;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--fg-2);
  background: var(--bg-2);
  padding: 0.15rem 0.5rem 0.15rem 0.4rem;
  border: 1px solid var(--border);
  border-radius: 0;
}
.badge-dot { display: inline-block; width: 6px; height: 6px; border-radius: 0; flex-shrink: 0; }
.source { font-size: 0.75rem; color: var(--fg-3); margin-left: auto; }
h2 { font-size: 1.05rem; font-weight: 600; line-height: 1.45; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
h2 a { color: var(--fg); text-decoration: none; }
h2 a:hover { text-decoration: underline; text-decoration-color: var(--accent); text-underline-offset: 3px; }
.summary { font-size: 0.875rem; color: var(--fg-2); line-height: 1.75; margin-bottom: 0.85rem; }
.meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--fg-2);
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}
.meta div { display: flex; align-items: baseline; gap: 0.35rem; }
.meta strong {
  color: var(--fg-3);
  font-weight: 500;
  font-size: 0.75rem;
  min-width: 5.5em;
  flex-shrink: 0;
  font-family: "VT323", "Courier New", monospace;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
footer {
  margin-top: 3rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
  text-align: center;
  font-size: 0.75rem;
  color: var(--fg-3);
  font-family: "VT323", "Courier New", monospace;
  letter-spacing: 0.04em;
}
.archive-list { border: 1px solid var(--border); background: var(--bg-1); }
a.archive-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  color: var(--fg);
  text-decoration: none;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.12s ease, color 0.12s ease;
}
a.archive-link:last-child { border-bottom: none; }
a.archive-link:hover { background: var(--bg-2); color: var(--fg); }
a.archive-link .count {
  font-size: 0.75rem;
  color: var(--fg-2);
  font-family: "VT323", "Courier New", monospace;
  letter-spacing: 0.05em;
  border: 1px solid var(--border);
  padding: 0.12rem 0.45rem;
  border-radius: 0;
}
`;

/** Google Fonts（<style> 内 @import は無効になりやすいため head で読み込む） */
export const FONT_LINKS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=VT323&display=swap" rel="stylesheet">
`;
