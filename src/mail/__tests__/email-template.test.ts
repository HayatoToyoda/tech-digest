import { describe, it, expect } from 'vitest';
import { buildEmailHtml } from '../email-template.js';
import type { DailyDigest } from '../../types.js';

const mockDigest: DailyDigest = {
  date: '2026-03-30',
  generatedAt: '2026-03-30T22:00:00.000Z',
  items: [
    {
      rank: 1,
      title: 'Test Article',
      url: 'https://example.com',
      source: 'Hacker News',
      category: 'AI',
      summary: 'テスト記事の要約です。',
      importance: '重要な理由のテキスト。',
      targetReaders: 'エンジニア全般',
    },
  ],
};

describe('buildEmailHtml', () => {
  it('日付とアイテム数をヘッダーに含む', () => {
    const html = buildEmailHtml(mockDigest);
    expect(html).toContain('2026-03-30');
    expect(html).toContain('1 件');
  });

  it('記事タイトルと URL を含む', () => {
    const html = buildEmailHtml(mockDigest);
    expect(html).toContain('Test Article');
    expect(html).toContain('https://example.com');
  });

  it('日本語コンテンツを含む', () => {
    const html = buildEmailHtml(mockDigest);
    expect(html).toContain('テスト記事の要約です。');
    expect(html).toContain('重要な理由のテキスト。');
  });
});
