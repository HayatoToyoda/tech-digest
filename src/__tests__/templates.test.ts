import { describe, it, expect } from 'vitest';
import { escapeHtml, articleCard, categoryClass, safeHref } from '../render/templates.js';
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

  it("' をエスケープする", () => {
    expect(escapeHtml("it's")).toBe('it&#x27;s');
  });
});

describe('safeHref', () => {
  it('https:// URL をそのまま返す', () => {
    expect(safeHref('https://example.com')).toBe('https://example.com');
  });

  it('http:// URL をそのまま返す', () => {
    expect(safeHref('http://example.com')).toBe('http://example.com');
  });

  it('javascript: URL を # に変換する', () => {
    expect(safeHref('javascript:alert(1)')).toBe('#');
  });

  it('data: URL を # に変換する', () => {
    expect(safeHref('data:text/html,<script>alert(1)</script>')).toBe('#');
  });

  it('空文字を # に変換する', () => {
    expect(safeHref('')).toBe('#');
  });
});

describe('categoryClass', () => {
  it('既知カテゴリにそのままの識別子を返す', () => {
    expect(categoryClass('AI')).toBe('AI');
    expect(categoryClass('Security')).toBe('Security');
  });

  it('未知カテゴリは AI にフォールバックする', () => {
    expect(categoryClass('Unknown' as any)).toBe('AI');
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
