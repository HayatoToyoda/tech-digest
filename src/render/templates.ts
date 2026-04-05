import type { DigestItem, Category } from '../types.js';

/** CSS クラス名用（nothing-design: データ値に色、ラベルはモノクロ） */
export function categoryClass(cat: Category): string {
  const allowed: Category[] = ['AI', 'Web', 'Security', 'OSS', 'Platform'];
  return allowed.includes(cat) ? cat : 'AI';
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
  const cat = categoryClass(item.category);
  return `<article class="card">
  <div class="card-header">
    <span class="rank">#${item.rank}</span>
    <span class="badge"><span class="badge-dot cat-${cat}"></span>${escapeHtml(item.category)}</span>
    <span class="source">${escapeHtml(item.source)}</span>
  </div>
  <h2><a href="${safeHref(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h2>
  <p class="summary">${escapeHtml(item.summary)}</p>
  <div class="meta">
    <div class="meta-row"><strong>重要な理由</strong><span>${escapeHtml(item.importance)}</span></div>
    <div class="meta-row"><strong>対象読者</strong><span>${escapeHtml(item.targetReaders)}</span></div>
  </div>
</article>`;
}
