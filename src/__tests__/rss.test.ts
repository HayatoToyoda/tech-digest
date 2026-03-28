import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';

const parseURLMock = vi.hoisted(() => vi.fn());

vi.mock('rss-parser', () => ({
  default: class {
    parseURL = parseURLMock;
  },
}));

import { collectRss } from '../collect/rss.js';

const mockItems = [
  { guid: 'g1', link: 'https://tc.com/1', title: 'Article One', isoDate: '2026-03-29T00:00:00Z' },
  { guid: 'g2', link: 'https://tc.com/2', title: 'Article Two', isoDate: '2026-03-29T01:00:00Z' },
];

describe('collectRss', () => {
  beforeEach(() => {
    parseURLMock.mockReset();
    parseURLMock.mockResolvedValue({ items: mockItems });
  });

  it('必須フィールドを持つ RawArticle 配列を返す', async () => {
    const articles = await collectRss();
    expect(articles.length).toBeGreaterThan(0);
    for (const a of articles) {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.url).toBeTruthy();
      expect(a.source).toBeTruthy();
      expect(a.publishedAt).toBeTruthy();
    }
  });

  it('1 フィードが失敗しても残りのフィードから記事を返す', async () => {
    // 最初の呼び出しだけ失敗、残りは成功
    parseURLMock.mockRejectedValueOnce(new Error('network error'));
    const articles = await collectRss();
    // 失敗した 1 フィード以外は成功するので記事が取れる
    expect(articles).toBeInstanceOf(Array);
    expect(articles.length).toBeGreaterThan(0);
  });
});
