export const CSS = `
:root {
  --bg: #f7f6f3;
  --surface: #ffffff;
  --text: #37352f;
  --text-2: #6b6b67;
  --muted: #9b9a97;
  --border: #e9e8e6;
  --hover: #f1f0ee;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', 'Hiragino Sans', sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.6;
  max-width: 760px; margin: 0 auto; padding: 3rem 1.5rem;
  -webkit-font-smoothing: antialiased;
}
header { margin-bottom: 2.5rem; }
.site-title {
  font-size: 0.75rem; font-weight: 600; color: var(--muted);
  letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.75rem;
}
.header-date {
  font-size: 1.9rem; font-weight: 700; letter-spacing: -0.03em;
  color: var(--text); line-height: 1.2; margin-bottom: 0.4rem;
}
.header-meta { font-size: 0.875rem; color: var(--muted); margin-bottom: 1.25rem; }
nav { display: flex; gap: 0.25rem; }
nav a {
  display: inline-flex; align-items: center; font-size: 0.83rem;
  color: var(--muted); text-decoration: none;
  padding: 0.25rem 0.6rem; border-radius: 4px;
  transition: background 0.1s, color 0.1s;
}
nav a:first-child { padding-left: 0; }
nav a:hover { background: var(--hover); color: var(--text); }
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 6px; padding: 1.25rem 1.5rem; margin-bottom: 0.6rem;
  transition: box-shadow 0.15s;
}
.card:hover { box-shadow: 0 2px 8px rgba(55,53,47,0.07); }
.card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem; flex-wrap: wrap; }
.rank { font-size: 0.78rem; font-weight: 600; color: var(--muted); min-width: 1.75rem; font-variant-numeric: tabular-nums; }
.badge {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.74rem; font-weight: 500; color: var(--text-2);
  background: var(--hover); padding: 0.15rem 0.5rem 0.15rem 0.4rem; border-radius: 3px;
}
.badge-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.source { font-size: 0.78rem; color: var(--muted); margin-left: auto; }
h2 { font-size: 0.975rem; font-weight: 600; line-height: 1.5; margin-bottom: 0.5rem; letter-spacing: -0.01em; }
h2 a { color: var(--text); text-decoration: none; }
h2 a:hover { text-decoration: underline; text-decoration-color: var(--border); text-underline-offset: 3px; }
.summary { font-size: 0.88rem; color: var(--text-2); line-height: 1.75; margin-bottom: 0.9rem; }
.meta {
  font-size: 0.8rem; color: var(--muted);
  border-top: 1px solid var(--border); padding-top: 0.7rem;
  display: flex; flex-direction: column; gap: 0.2rem;
}
.meta strong { color: #7a7a76; font-weight: 500; }
footer {
  margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border);
  text-align: center; font-size: 0.78rem; color: var(--muted);
}
.archive-list {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 6px; overflow: hidden;
}
a.archive-link {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.8rem 1.25rem; color: var(--text); text-decoration: none;
  font-size: 0.9rem; border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}
a.archive-link:last-child { border-bottom: none; }
a.archive-link:hover { background: var(--hover); }
a.archive-link .count {
  font-size: 0.78rem; color: var(--muted);
  background: var(--hover); padding: 0.1rem 0.5rem; border-radius: 3px;
}
`;
