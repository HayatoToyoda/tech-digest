export const CSS = `
:root {
  --bg: #0f172a;
  --surface: #1e293b;
  --text: #e2e8f0;
  --muted: #94a3b8;
  --accent: #38bdf8;
  --border: #334155;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Helvetica Neue', Arial, 'Hiragino Sans', sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.7;
  max-width: 860px; margin: 0 auto; padding: 2rem 1rem;
}
header { border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 2rem; }
header h1 { font-size: 1.4rem; color: var(--accent); }
header p { color: var(--muted); font-size: 0.875rem; margin-top: 0.25rem; }
nav { margin-top: 0.5rem; }
nav a { color: var(--muted); text-decoration: none; font-size: 0.85rem; margin-right: 1rem; }
nav a:hover { color: var(--accent); }
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;
}
.card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
.rank { color: var(--muted); font-size: 0.85rem; font-weight: 700; min-width: 2rem; }
.badge {
  font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem;
  border-radius: 4px; color: white; text-transform: uppercase; letter-spacing: 0.04em;
}
.source { color: var(--muted); font-size: 0.82rem; }
h2 { font-size: 1.05rem; margin-bottom: 0.75rem; font-weight: 600; }
h2 a { color: var(--text); text-decoration: none; }
h2 a:hover { color: var(--accent); }
.summary { color: var(--text); margin-bottom: 1rem; font-size: 0.95rem; }
.meta { font-size: 0.85rem; color: var(--muted); display: flex; flex-direction: column; gap: 0.3rem; }
.meta strong { color: var(--text); }
footer {
  margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border);
  text-align: center; color: var(--muted); font-size: 0.8rem;
}
a.archive-link {
  display: block; padding: 0.5rem 0; border-bottom: 1px solid var(--border);
  color: var(--text); text-decoration: none; font-size: 0.9rem;
}
a.archive-link:hover { color: var(--accent); }
a.archive-link .count { color: var(--muted); font-size: 0.8rem; margin-left: 0.5rem; }
`;
