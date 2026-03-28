import { describe, it, expect } from 'vitest';
import { escapeHtml, articleCard, categoryColor } from '../render/templates.js';
import type { DigestItem } from '../types.js';

const sampleItem: DigestItem = {
  rank: 1,
  title: 'Test Article',
  url: 'https://example.com/test',
  source: 'Test Source',
  category: 'AI',
  summary: 'これはテスト用のサマリーです。',
  importance: 'テストに重要です。',
  targetReaders: 'テスターの皆さん',
};

describe('escapeHtml', () => {
  it('& < > " をエスケープする', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('<tag>')).toBe('&lt;tag&gt;');
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('空文字をそのまま返す', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('categoryColor', () => {
  it('既知カテゴリに hex カラーを返す', () => {
    expect(categoryColor('AI')).toMatch(/^#[0-9a-f]{6}$/i);
    expect(categoryColor('Security')).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('未知カテゴリにフォールバックカラーを返す', () => {
    expect(categoryColor('Unknown' as any)).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('articleCard', () => {
  it('タイトルと URL を含む HTML を返す', () => {
    const html = articleCard(sampleItem);
    expect(html).toContain('Test Article');
    expect(html).toContain('https://example.com/test');
  });

  it('日本語コンテンツを含む', () => {
    const html = articleCard(sampleItem);
    expect(html).toContain('これはテスト用のサマリーです。');
    expect(html).toContain('テストに重要です。');
  });

  it('タイトルの XSS をエスケープする', () => {
    const xssItem = { ...sampleItem, title: '<script>alert(1)</script>' };
    const html = articleCard(xssItem);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('ランクとカテゴリバッジを含む', () => {
    const html = articleCard(sampleItem);
    expect(html).toContain('#1');
    expect(html).toContain('AI');
  });
});
