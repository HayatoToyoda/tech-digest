import { describe, it, expect } from 'vitest';
import { jstToday } from '../date.js';

describe('jstToday', () => {
  it('YYYY-MM-DD 形式の文字列を返す', () => {
    expect(jstToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('有効な日付を返す', () => {
    const date = new Date(jstToday());
    expect(isNaN(date.getTime())).toBe(false);
  });
});
