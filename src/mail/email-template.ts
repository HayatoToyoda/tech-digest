import type { DailyDigest, DigestItem } from '../types.js';

function buildCard(item: DigestItem): string {
  return `
    <div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:16px;">
      <div style="font-size:12px;color:#666;margin-bottom:8px;">
        #${item.rank} &middot; <strong>${item.category}</strong> &middot; ${item.source}
      </div>
      <h2 style="margin:0 0 8px;font-size:18px;line-height:1.3;">
        <a href="${item.url}" style="color:#1a73e8;text-decoration:none;">${item.title}</a>
      </h2>
      <p style="margin:0 0 10px;color:#333;line-height:1.6;">${item.summary}</p>
      <div style="font-size:13px;color:#555;line-height:1.6;">
        <strong>重要な理由:</strong> ${item.importance}<br>
        <strong>対象読者:</strong> ${item.targetReaders}
      </div>
    </div>`;
}

export function buildEmailHtml(digest: DailyDigest): string {
  const cards = digest.items.map(buildCard).join('');
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:0 auto;padding:20px;color:#202124;">
  <h1 style="font-size:24px;margin:0 0 4px;">📰 Tech Digest ${digest.date}</h1>
  <p style="color:#666;margin:0 0 24px;font-size:14px;">本日のトップ ${digest.items.length} 件</p>
  ${cards}
  <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0">
  <p style="font-size:12px;color:#999;">
    <a href="https://hayatotoyoda.github.io/tech-digest/" style="color:#1a73e8;">アーカイブを見る</a>
  </p>
</body>
</html>`;
}
