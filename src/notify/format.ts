import type { DailyDigest } from '../types.js';

const PREVIEW_COUNT = 5;
const ARCHIVE_URL = 'https://hayatotoyoda.github.io/tech-digest/';

export function buildSlackPayload(digest: DailyDigest): object {
  const blocks: object[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `TECH DIGEST · ${digest.date}`, emoji: false },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `本日のトップ ${digest.items.length} 件 | <${ARCHIVE_URL}|アーカイブを見る>`,
      },
    },
    { type: 'divider' },
  ];

  for (const item of digest.items.slice(0, PREVIEW_COUNT)) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*#${item.rank} [${item.category}] <${item.url}|${item.title}>*\n${item.summary}`,
      },
    });
  }

  if (digest.items.length > PREVIEW_COUNT) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `_他 ${digest.items.length - PREVIEW_COUNT} 件は <${ARCHIVE_URL}|アーカイブ> から_`,
      },
    });
  }

  return { blocks };
}

export function buildDiscordPayload(digest: DailyDigest): object {
  const preview = digest.items.slice(0, PREVIEW_COUNT);
  const remaining = digest.items.length - preview.length;

  const content =
    remaining > 0
      ? `**TECH DIGEST** · ${digest.date} — 本日のトップ ${digest.items.length} 件（上位 ${PREVIEW_COUNT} 件を表示）\n${ARCHIVE_URL}`
      : `**TECH DIGEST** · ${digest.date} — 本日のトップ ${digest.items.length} 件\n${ARCHIVE_URL}`;

  const embeds = preview.map(item => ({
    title: `#${item.rank} [${item.category}] ${item.title}`,
    url: item.url,
    description: item.summary,
    color: 0xd71921, // Nothing accent red
  }));

  return { content, embeds };
}
