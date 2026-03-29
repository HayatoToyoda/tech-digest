import type { DigestItem, Category } from '../types.js';

const CATEGORY_COLORS: Record<Category, string> = {
  AI: '#6366f1',
  Web: '#0ea5e9',
  Security: '#ef4444',
  OSS: '#22c55e',
  Platform: '#f59e0b',
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
    <span class="rank">#${item.rank}</span>
    <span class="badge" style="background:${color}">${escapeHtml(item.category)}</span>
    <span class="source">${escapeHtml(item.source)}</span>
  </div>
  <h2><a href="${safeHref(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h2>
  <p class="summary">${escapeHtml(item.summary)}</p>
  <div class="meta">
    <div><strong>重要な理由:</strong> ${escapeHtml(item.importance)}</div>
    <div><strong>対象読者:</strong> ${escapeHtml(item.targetReaders)}</div>
  </div>
</article>`;
}
