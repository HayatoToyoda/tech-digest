export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&display=swap');
:root {
  --bg: #f7f6f3;
  --text: #37352f;
  --text-2: #6b6b67;
  --muted: #9b9a97;
  --border: #e9e8e6;
  --hover: #eeecea;
  --tag-bg: rgba(55,53,47,0.06);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', 'Hiragino Sans', sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.6;
  max-width: 720px; margin: 0 auto; padding: 4rem 2rem;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: 'cv02','cv03','cv04','cv11';
}
header { margin-bottom: 3rem; }
.site-title {
  font-size: 0.7rem; font-weight: 600; color: var(--muted);
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1rem;
}
.header-date {
  font-size: 2.2rem; font-weight: 700; letter-spacing: -0.04em;
  color: var(--text); line-height: 1.1; margin-bottom: 0.5rem;
}
.header-meta { font-size: 0.875rem; color: var(--muted); margin-bottom: 1.5rem; }
nav { display: flex; }
nav a {
  display: inline-flex; align-items: center; font-size: 0.82rem;
  color: var(--muted); text-decoration: none;
  padding: 0.28rem 0.6rem; border-radius: 4px;
  transition: background 0.12s, color 0.12s;
}
nav a:first-child { padding-left: 0; }
nav a:hover { background: var(--hover); color: var(--text-2); }
.card {
  padding: 1.75rem 0;
  border-bottom: 1px solid var(--border);
  position: relative;
}
.card:last-child { border-bottom: none; padding-bottom: 0; }
.card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.rank {
  font-size: 0.74rem; font-weight: 600; color: var(--muted);
  min-width: 1.5rem; font-variant-numeric: tabular-nums; letter-spacing: 0.01em;
}
.badge {
  display: inline-flex; align-items: center; gap: 0.32rem;
  font-size: 0.72rem; font-weight: 500; color: var(--text-2);
  background: var(--tag-bg); padding: 0.18rem 0.55rem 0.18rem 0.42rem; border-radius: 3px;
}
.badge-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.source { font-size: 0.74rem; color: var(--muted); margin-left: auto; }
h2 { font-size: 1rem; font-weight: 600; line-height: 1.5; margin-bottom: 0.6rem; letter-spacing: -0.015em; }
h2 a { color: var(--text); text-decoration: none; }
h2 a:hover { text-decoration: underline; text-decoration-color: rgba(55,53,47,0.25); text-underline-offset: 3px; }
.summary { font-size: 0.875rem; color: var(--text-2); line-height: 1.8; margin-bottom: 1rem; }
.meta {
  display: flex; flex-direction: column; gap: 0.3rem;
  font-size: 0.8rem; color: var(--text-2);
}
.meta div { display: flex; align-items: baseline; }
.meta strong {
  color: var(--muted); font-weight: 500; font-size: 0.77rem;
  min-width: 6.5em; flex-shrink: 0;
}
footer {
  margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border);
  text-align: center; font-size: 0.75rem; color: var(--muted);
}
.archive-list { }
a.archive-link {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.9rem 0; color: var(--text); text-decoration: none;
  font-size: 0.9rem; border-bottom: 1px solid var(--border);
  transition: padding-left 0.15s ease;
}
a.archive-link:last-child { border-bottom: none; }
a.archive-link:hover { padding-left: 0.4rem; }
a.archive-link .count {
  font-size: 0.74rem; color: var(--muted);
  background: var(--tag-bg); padding: 0.12rem 0.5rem; border-radius: 3px; flex-shrink: 0;
}
`;
