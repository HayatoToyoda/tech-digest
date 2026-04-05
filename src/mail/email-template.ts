import type { DailyDigest, DigestItem } from '../types.js';
import { escapeHtml, categoryClass } from '../render/templates.js';

/** メール用 Nothing 風（ライト既定 + prefers-color-scheme: dark） */
const EMAIL_STYLES = `
  body { margin: 0; padding: 0; background: #f5f5f5; color: #1a1a1a; }
  .wrap { max-width: 640px; margin: 0 auto; padding: 28px 20px 40px; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif; }
  .label { font-family: 'Space Mono', 'Courier New', monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #666666; margin: 0 0 8px; }
  .hero { font-family: 'Doto', 'Space Mono', monospace; font-size: 32px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: #000000; margin: 0 0 8px; }
  .meta { font-size: 14px; color: #666666; margin: 0 0 28px; line-height: 1.5; }
  .card { background: #ffffff; border: 1px solid #e8e8e8; border-radius: 6px; padding: 18px 16px; margin-bottom: 14px; }
  .card-h { font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: #999999; margin: 0 0 10px; }
  .dot { display: inline-block; width: 6px; height: 6px; margin-right: 6px; vertical-align: middle; border-radius: 1px; }
  .cat-AI { background: #007aff; }
  .cat-Web { background: #2d7a3e; }
  .cat-Security { background: #d71921; }
  .cat-OSS { background: #2563a8; }
  .cat-Platform { background: #9a7b24; }
  h2 { margin: 0 0 8px; font-size: 17px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; }
  h2 a { color: #007aff; text-decoration: none; }
  .sum { margin: 0 0 12px; font-size: 14px; color: #666666; line-height: 1.6; }
  .detail { font-size: 13px; color: #555555; line-height: 1.55; border-top: 1px solid #e8e8e8; padding-top: 12px; margin: 0; }
  .detail strong { font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 400; letter-spacing: 0.06em; text-transform: uppercase; color: #999999; display: block; margin-bottom: 4px; }
  .foot { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e8e8e8; font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: #999999; }
  .foot a { color: #007aff; }
  @media (prefers-color-scheme: dark) {
    body { background: #000000; color: #e8e8e8; }
    .wrap { color: #e8e8e8; }
    .label { color: #999999; }
    .hero { color: #ffffff; }
    .meta { color: #999999; }
    .card { background: #111111; border-color: #222222; }
    .card-h { color: #666666; }
    h2 a { color: #5b9bf6; }
    .sum { color: #999999; }
    .detail { color: #999999; border-top-color: #222222; }
    .detail strong { color: #666666; }
    .foot { border-top-color: #222222; color: #666666; }
    .foot a { color: #5b9bf6; }
    .cat-AI { background: #5b9bf6; }
    .cat-Web { background: #4a9e5c; }
    .cat-Security { background: #d71921; }
    .cat-OSS { background: #6b9ed4; }
    .cat-Platform { background: #d4a843; }
  }
`;

function buildCard(item: DigestItem): string {
  const cat = categoryClass(item.category);
  const title = escapeHtml(item.title);
  const url = escapeHtml(item.url);
  const source = escapeHtml(item.source);
  const category = escapeHtml(item.category);
  const summary = escapeHtml(item.summary);
  const importance = escapeHtml(item.importance);
  const readers = escapeHtml(item.targetReaders);
  return `
    <div class="card">
      <p class="card-h"><span class="dot cat-${cat}"></span>#${item.rank} · ${category} · ${source}</p>
      <h2><a href="${url}">${title}</a></h2>
      <p class="sum">${summary}</p>
      <div class="detail">
        <strong>重要な理由</strong>
        ${importance}
        <br><br>
        <strong>対象読者</strong>
        ${readers}
      </div>
    </div>`;
}

export function buildEmailHtml(digest: DailyDigest): string {
  const cards = digest.items.map(buildCard).join('');
  const date = escapeHtml(digest.date);
  const count = String(digest.items.length);
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Doto:wght@700&family=Space+Grotesk:wght@400;500;600&family=Space+Mono&display=swap" rel="stylesheet">
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="wrap">
    <p class="label">Tech Digest</p>
    <h1 class="hero">${date}</h1>
    <p class="meta">本日のトップ ${count} 件</p>
    ${cards}
    <p class="foot"><a href="https://hayatotoyoda.github.io/tech-digest/">アーカイブを見る</a></p>
  </div>
</body>
</html>`;
}
