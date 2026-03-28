import { describe, it, expect } from 'vitest';
import { buildIndexPage } from '../render/index-page.js';
import type { DailyDigest } from '../types.js';

const sampleDigest: DailyDigest = {
  date: '2026-03-29',
  generatedAt: '2026-03-29T22:00:00.000Z',
  items: [{
    rank: 1, title: 'Top Article', url: 'https://example.com/top',
    source: 'Test', category: 'AI',
    summary: '重要な記事です。', importance: 'AIの進化に関係します。', targetReaders: 'エンジニア',
  }],
};

describe('buildIndexPage', () => {
  it('DOCTYPE と </html> を含む HTML ドキュメントを返す', () => {
    const html = buildIndexPage(sampleDigest);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  it('記事タイトルとリンクを含む', () => {
    const html = buildIndexPage(sampleDigest);
    expect(html).toContain('Top Article');
    expect(html).toContain('https://example.com/top');
  });

  it('ヘッダーに日付を含む', () => {
    const html = buildIndexPage(sampleDigest);
    expect(html).toContain('2026-03-29');
  });

  it('アーカイブへのリンクを含む', () => {
    const html = buildIndexPage(sampleDigest);
    expect(html).toContain('archive/');
  });
});
