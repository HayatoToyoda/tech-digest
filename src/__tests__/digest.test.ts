import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.hoisted(() => vi.fn());

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

import { generateDigest } from '../claude/digest.js';
import type { ArticleCandidate } from '../types.js';

const validResponse = {
  content: [{
    type: 'text',
    text: JSON.stringify({
      items: [{
        rank: 1,
        title: 'Test Article',
        url: 'https://example.com',
        source: 'Test',
        category: 'AI',
        summary: 'これはテスト要約です。',
        importance: '重要な理由です。',
        targetReaders: 'エンジニア全般',
      }],
    }),
  }],
};

const candidates: ArticleCandidate[] = [{
  id: '1', title: 'Test', url: 'https://example.com',
  source: 'Test', publishedAt: new Date().toISOString(),
  bodyText: 'article text', preScore: 5,
}];

describe('generateDigest', () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue(validResponse);
  });

  it('date と items を持つ DailyDigest を返す', async () => {
    const result = await generateDigest('2026-03-29', candidates);
    expect(result.date).toBe('2026-03-29');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].category).toBe('AI');
    expect(result.items[0].summary).toBe('これはテスト要約です。');
  });

  it('generatedAt が ISO タイムスタンプである', async () => {
    const result = await generateDigest('2026-03-29', candidates);
    expect(new Date(result.generatedAt).toISOString()).toBe(result.generatedAt);
  });

  it('system パラメータで呼ばれる', async () => {
    await generateDigest('2026-03-29', candidates);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('JSON'),
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user' }),
        ]),
      })
    );
  });

  it('Claude レスポンスに JSON がない場合 throw する', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'No JSON here' }],
    });
    await expect(generateDigest('2026-03-29', candidates)).rejects.toThrow();
  });
});
