import { extract } from '@extractus/article-extractor';
import type { RawArticle, ArticleCandidate } from '../types.js';

const MAX_BODY_CHARS = 3000;
const FETCH_TIMEOUT_MS = 10_000;

const PRIVATE_IP_RE = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.|::1$|localhost$)/i;

export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (PRIVATE_IP_RE.test(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function extractContent(article: RawArticle): Promise<ArticleCandidate> {
  if (!isSafeUrl(article.url)) {
    return { ...article, preScore: 0 };
  }
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
