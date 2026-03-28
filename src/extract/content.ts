import { extract } from '@extractus/article-extractor';
import type { RawArticle, ArticleCandidate } from '../types.js';

const MAX_BODY_CHARS = 3000;

export async function extractContent(article: RawArticle): Promise<ArticleCandidate> {
  try {
    const result = await extract(article.url);
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
  }
}
