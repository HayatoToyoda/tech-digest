import { describe, it, expect } from 'vitest';
import { buildSlackPayload, buildDiscordPayload } from '../format.js';
import type { DailyDigest } from '../../types.js';

function makeDigest(count: number): DailyDigest {
  return {
    date: '2026-03-30',
    generatedAt: '2026-03-30T22:00:00.000Z',
    items: Array.from({ length: count }, (_, i) => ({
      rank: i + 1,
      title: `Article ${i + 1}`,
      url: `https://example.com/${i + 1}`,
      source: 'Hacker News',
      category: 'AI' as const,
      summary: `Summary ${i + 1}`,
      importance: `Importance ${i + 1}`,
      targetReaders: 'Engineers',
    })),
  };
}

describe('buildSlackPayload', () => {
  it('ヘッダーに日付を含む', () => {
    const payload = buildSlackPayload(makeDigest(3)) as { blocks: Array<{ type: string; text?: { text: string } }> };
    const header = payload.blocks[0];
    expect(header.type).toBe('header');
    expect(header.text?.text).toContain('2026-03-30');
  });

  it('PREVIEW_COUNT(5件) 以内はすべて表示し「他N件」が出ない', () => {
    const payload = buildSlackPayload(makeDigest(3)) as { blocks: unknown[] };
    const text = JSON.stringify(payload);
    expect(text).not.toContain('他');
  });

  it('PREVIEW_COUNT(5件) 超は上位5件 + 「他N件」セクションを追加する', () => {
    const payload = buildSlackPayload(makeDigest(8)) as { blocks: unknown[] };
    const text = JSON.stringify(payload);
    expect(text).toContain('他 3 件');
  });
});

describe('buildDiscordPayload', () => {
  it('content に日付と URL を含む', () => {
    const payload = buildDiscordPayload(makeDigest(3)) as { content: string; embeds: unknown[] };
    expect(payload.content).toContain('2026-03-30');
    expect(payload.content).toContain('hayatotoyoda.github.io');
  });

  it('embeds は最大 PREVIEW_COUNT(5件) まで', () => {
    const payload = buildDiscordPayload(makeDigest(8)) as { embeds: unknown[] };
    expect(payload.embeds.length).toBe(5);
  });

  it('PREVIEW_COUNT 超の場合 content に件数の案内を含む', () => {
    const payload = buildDiscordPayload(makeDigest(8)) as { content: string };
    expect(payload.content).toContain('上位 5 件を表示');
  });
});
