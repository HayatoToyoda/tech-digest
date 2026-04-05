import type { DigestItem, Category } from '../types.js';

/** ダーク背景上で視認しやすいカテゴリ色 */
const CATEGORY_COLORS: Record<Category, string> = {
  AI: '#a5b4fc',
  Web: '#7dd3fc',
  Security: '#fca5a5',
  OSS: '#86efac',
  Platform: '#fcd34d',
};

export function categoryColor(cat: Category): string {
  return CATEGORY_COLORS[cat] ?? '#6b7280';
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
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

export function articleCard(item: DigestItem): string {
  const color = categoryColor(item.category);
  return `<article class="card">
  <div class="card-header">
    <span class="rank ndot">#${item.rank}</span>
    <span class="badge"><span class="badge-dot" style="background:${color}"></span>${escapeHtml(item.category)}</span>
    <span class="source">${escapeHtml(item.source)}</span>
  </div>
  <h2><a href="${safeHref(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h2>
  <p class="summary">${escapeHtml(item.summary)}</p>
  <div class="meta">
    <div><strong>重要な理由</strong>　${escapeHtml(item.importance)}</div>
    <div><strong>対象読者</strong>　${escapeHtml(item.targetReaders)}</div>
  </div>
</article>`;
}
