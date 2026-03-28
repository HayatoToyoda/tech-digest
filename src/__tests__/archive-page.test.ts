import { describe, it, expect } from 'vitest';
import { buildArchivePage, buildArchiveIndex } from '../render/archive-page.js';
import type { DailyDigest } from '../types.js';

const digest: DailyDigest = {
  date: '2026-03-28', generatedAt: '2026-03-28T22:00:00.000Z',
  items: [{
    rank: 1, title: 'Past Article', url: 'https://example.com/past',
    source: 'Test', category: 'Web',
    summary: '過去の記事です。', importance: '歴史的に重要です。', targetReaders: '全員',
  }],
};

const digests: DailyDigest[] = [
  { ...digest, date: '2026-03-29', generatedAt: '2026-03-29T22:00:00.000Z' },
  digest,
];

describe('buildArchivePage', () => {
  it('記事コンテンツを含む', () => {
    const html = buildArchivePage(digest);
    expect(html).toContain('Past Article');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('index.html と アーカイブ一覧へのリンクを含む', () => {
    const html = buildArchivePage(digest);
    expect(html).toContain('../index.html');
    expect(html).toContain('index.html');
  });
});

describe('buildArchiveIndex', () => {
  it('全ダイジェスト日付をリストする', () => {
    const html = buildArchiveIndex(digests);
    expect(html).toContain('2026-03-29');
    expect(html).toContain('2026-03-28');
  });

  it('有効な HTML ドキュメントを返す', () => {
    const html = buildArchiveIndex(digests);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  it('個別アーカイブページへのリンクを含む', () => {
    const html = buildArchiveIndex(digests);
    expect(html).toContain('2026-03-29.html');
    expect(html).toContain('2026-03-28.html');
  });
});
