import { describe, it, expect } from 'vitest';
import { prefilter } from '../rank/prefilter.js';
import type { RawArticle } from '../types.js';

function make(overrides: Partial<RawArticle> & { id: string; url: string }): RawArticle {
  return {
    title: 'Default Title',
    source: 'TechCrunch',
    publishedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('prefilter', () => {
  it('URL が同じ記事を重複排除し、最初のものを残す', () => {
    const articles = [
      make({ id: '1', url: 'https://example.com/a' }),
      make({ id: '2', url: 'https://example.com/a', title: 'Duplicate' }),
    ];
    const result = prefilter(articles);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('最大 30 件を返す', () => {
    const articles = Array.from({ length: 50 }, (_, i) =>
      make({ id: String(i), url: `https://example.com/${i}` })
    );
    expect(prefilter(articles).length).toBeLessThanOrEqual(30);
  });

  it('HN 高スコア記事を TechCrunch 記事より上位に置く', () => {
    const articles = [
      make({ id: 'tc', url: 'https://tc.com/1', source: 'TechCrunch' }),
      make({ id: 'hn', url: 'https://hn.com/1', source: 'Hacker News', score: 500, commentCount: 200 }),
    ];
    expect(prefilter(articles)[0].id).toBe('hn');
  });

  it('30 件未満のときは全件返す', () => {
    const articles = Array.from({ length: 10 }, (_, i) =>
      make({ id: String(i), url: `https://example.com/${i}` })
    );
    expect(prefilter(articles)).toHaveLength(10);
  });
});
