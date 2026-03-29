import { extract } from '@extractus/article-extractor';
import type { RawArticle, ArticleCandidate } from '../types.js';

const MAX_BODY_CHARS = 3000;
const FETCH_TIMEOUT_MS = 10_000;

export async function extractContent(article: RawArticle): Promise<ArticleCandidate> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const result = await extract(article.url, undefined, { signal: controller.signal });
    const bodyText = result?.content
      ? result.content
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, MAX_BODY_CHARS)
      : undefined;
    return { ...article, bodyText, preScore: 0 };
  } catch {
    return { ...article, preScore: 0 };
  } finally {
    clearTimeout(timer);
  }
}
