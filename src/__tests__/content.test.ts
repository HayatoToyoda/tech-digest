import { describe, it, expect, vi } from 'vitest';

vi.mock('@extractus/article-extractor', () => ({
  extract: vi.fn(async (url: string) => {
    if (url === 'https://fail.example.com') throw new Error('fetch failed');
    return { content: '<p>Hello world article content here.</p>' };
  }),
}));

import { extractContent } from '../extract/content.js';
import { extract } from '@extractus/article-extractor';
import type { RawArticle } from '../types.js';

const baseArticle: RawArticle = {
  id: '1', title: 'Test', url: 'https://example.com/test',
  source: 'Test', publishedAt: new Date().toISOString(),
};

describe('extractContent', () => {
  it('HTML タグを除去した bodyText を返す', async () => {
    const result = await extractContent(baseArticle);
    expect(result.bodyText).toBe('Hello world article content here.');
    expect(result.preScore).toBe(0);
  });

  it('取得失敗時は bodyText が undefined で元記事フィールドを保持', async () => {
    const failArticle = { ...baseArticle, url: 'https://fail.example.com' };
    const result = await extractContent(failArticle);
    expect(result.bodyText).toBeUndefined();
    expect(result.id).toBe('1');
  });

  it('bodyText を 3000 文字に切り詰める', async () => {
    vi.mocked(extract).mockResolvedValueOnce({ content: 'x'.repeat(5000) });
    const result = await extractContent(baseArticle);
    expect(result.bodyText?.length).toBeLessThanOrEqual(3000);
  });
});
