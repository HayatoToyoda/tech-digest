import Anthropic from '@anthropic-ai/sdk';
import type { ArticleCandidate, DailyDigest } from '../types.js';

const client = new Anthropic();

const SYSTEM_PROMPT = `あなたはテックニュースのキュレーターです。
提供された記事候補から最も重要な5〜10本を選び、日本語ダイジェストを作成してください。

選定基準:
- 実務影響が大きい
- 主要企業/主要OSS/主要プラットフォームの更新
- セキュリティ/障害/規約変更
- AI/開発者ツールの大きな変化
- 単なるバズや雑談は除外

回答は以下のJSON形式のみで返してください（前後のテキスト不要）:
{
  "items": [
    {
      "rank": 1,
      "title": "記事タイトル（原文のまま）",
      "url": "https://...",
      "source": "ソース名",
      "category": "AI|Web|Security|OSS|Platform のいずれか",
      "summary": "日本語で3〜5文のダイジェスト",
      "importance": "なぜ重要か（日本語、1〜2文）",
      "targetReaders": "読むべき人（日本語、1文）"
    }
  ]
}`;

export async function generateDigest(
  date: string,
  candidates: ArticleCandidate[]
): Promise<DailyDigest> {
  const candidateText = candidates
    .map(
      (c, i) =>
        `[${i + 1}] Source: ${c.source}\nTitle: ${c.title}\nURL: ${c.url}\n` +
        (c.bodyText ? `Body: ${c.bodyText}` : '(本文取得なし)')
    )
    .join('\n\n---\n\n');

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `候補記事:\n\n${candidateText}`,
    }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Claude response contained no JSON block');

  const parsed = JSON.parse(match[0]) as { items: DailyDigest['items'] };
  return {
    date,
    generatedAt: new Date().toISOString(),
    items: parsed.items,
  };
}
