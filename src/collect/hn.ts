import type { RawArticle } from '../types.js';

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

interface HNItem {
  id: number;
  title: string;
  url?: string;
  time: number;
  score: number;
  descendants?: number;
}

export async function collectHN(topN = 30): Promise<RawArticle[]> {
  const resp = await fetch(`${HN_BASE}/topstories.json`, { signal: AbortSignal.timeout(10_000) });
  const ids: number[] = await resp.json();

  const settled = await Promise.allSettled(
    ids.slice(0, topN).map((id) =>
      fetch(`${HN_BASE}/item/${id}.json`, { signal: AbortSignal.timeout(10_000) })
        .then((r) => r.json() as Promise<HNItem>)
    )
  );

  return settled
    .filter((r): r is PromiseFulfilledResult<HNItem> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((item): item is HNItem & { url: string } => Boolean(item?.url && item?.title))
    .map((item) => ({
      id: String(item.id),
      title: item.title,
      url: item.url,
      source: 'Hacker News',
      publishedAt: new Date(item.time * 1000).toISOString(),
      score: item.score,
      commentCount: item.descendants,
    }));
}
