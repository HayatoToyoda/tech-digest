import { describe, it, expect, vi } from 'vitest';

const mockTopStories = [1, 2, 3];
const mockItems: Record<number, object> = {
  1: { id: 1, title: 'HN Story One', url: 'https://hn.com/1', time: 1711699200, score: 300, descendants: 80 },
  2: { id: 2, title: 'HN Story Two', url: 'https://hn.com/2', time: 1711699200, score: 150, descendants: 40 },
  3: { id: 3, title: 'No URL story', time: 1711699200, score: 100, descendants: 10 }, // url なし
};

vi.stubGlobal('fetch', vi.fn((url: string) => {
  if (url.endsWith('topstories.json')) {
    return Promise.resolve({ ok: true, json: async () => mockTopStories });
  }
  const match = url.match(/item\/(\d+)\.json/);
  const id = match ? parseInt(match[1]) : 0;
  return Promise.resolve({ ok: true, json: async () => mockItems[id] ?? null });
}));

import { collectHN } from '../collect/hn.js';

describe('collectHN', () => {
  it('必須フィールドを持つ記事を返す', async () => {
    const articles = await collectHN(3);
    expect(articles.length).toBeGreaterThan(0);
    for (const a of articles) {
      expect(a.source).toBe('Hacker News');
      expect(a.url).toBeTruthy();
      expect(a.score).toBeTypeOf('number');
    }
  });

  it('URL のないアイテムをスキップする', async () => {
    const articles = await collectHN(3);
    expect(articles.every((a) => Boolean(a.url))).toBe(true);
  });

  it('HN スコアとコメント数をマッピングする', async () => {
    const articles = await collectHN(2);
    const first = articles.find((a) => a.id === '1');
    expect(first?.score).toBe(300);
    expect(first?.commentCount).toBe(80);
  });
});
