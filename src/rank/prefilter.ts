import type { RawArticle } from '../types.js';

const SOURCE_SCORE: Record<string, number> = {
  'Hacker News': 2,
  'InfoQ': 3,
  'Ars Technica': 3,
  'TechCrunch': 2,
  'The Verge': 2,
};

function scoreArticle(a: RawArticle): number {
  let score = SOURCE_SCORE[a.source] ?? 1;
  if (a.score != null) score += Math.min(a.score / 100, 5);
  if (a.commentCount != null) score += Math.min(a.commentCount / 50, 3);
  const ageHours = (Date.now() - new Date(a.publishedAt).getTime()) / 3_600_000;
  if (ageHours < 24) score += 2;
  else if (ageHours < 48) score += 1;
  return score;
}

export function prefilter(articles: RawArticle[]): RawArticle[] {
  const seen = new Set<string>();
  const unique = articles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  return unique
    .map((a) => ({ article: a, score: scoreArticle(a) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, 30)
    .map((x) => x.article);
}
