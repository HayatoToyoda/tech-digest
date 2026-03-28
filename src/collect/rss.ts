import Parser from 'rss-parser';
import type { RawArticle } from '../types.js';

const parser = new Parser();

const FEEDS: Array<{ url: string; source: string }> = [
  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge' },
  { url: 'https://www.infoq.com/feed/', source: 'InfoQ' },
];

export async function collectRss(): Promise<RawArticle[]> {
  const results: RawArticle[] = [];

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of (parsed.items ?? []).slice(0, 20)) {
        if (!item.link || !item.title) continue;
        results.push({
          id: item.guid ?? item.link,
          title: item.title,
          url: item.link,
          source: feed.source,
          publishedAt: item.isoDate ?? new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn(`[rss] ${feed.source} failed:`, (err as Error).message);
    }
  }

  return results;
}
