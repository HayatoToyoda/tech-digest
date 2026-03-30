import { collectHN } from './collect/hn.js';
import { prefilter } from './rank/prefilter.js';
import { extractContent } from './extract/content.js';
import { generateDigest } from './claude/digest.js';
import { buildIndexPage } from './render/index-page.js';
import { buildArchivePage, buildArchiveIndex } from './render/archive-page.js';
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { DailyDigest } from './types.js';
import { jstToday } from './utils/date.js';

const TODAY = jstToday();

async function main(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting digest for ${TODAY}`);

  // 当日 JSON が既に存在する場合は API 呼び出しをスキップ（冪等性・コスト節約）
  const jsonPath = `data/digests/${TODAY}.json`;
  const existingJson = await readFile(jsonPath, 'utf-8').catch(() => null);

  if (existingJson === null) {
    // 1. 収集 (MVP: Hacker News のみ)
    const raw = await collectHN(50);
    console.log(`Collected ${raw.length} raw articles`);

    if (raw.length === 0) {
      throw new Error('No articles collected from any source');
    }

    // 2. プレフィルタ (最大 30 件)
    const topRaw = prefilter(raw);
    console.log(`Pre-filtered to ${topRaw.length} candidates`);

    // 3. 本文抽出 (失敗は無視して続行)
    const extractResults = await Promise.allSettled(topRaw.map(extractContent));
    const candidates = extractResults
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof extractContent>>> =>
        r.status === 'fulfilled'
      )
      .map((r) => r.value);
    console.log(`Extracted content for ${candidates.length} articles`);

    // 4. Claude でダイジェスト生成
    const digest = await generateDigest(TODAY, candidates);
    console.log(`Generated digest: ${digest.items.length} items`);

    // 5. JSON 保存 (repo に commit される)
    await mkdir('data/digests', { recursive: true });
    await writeFile(jsonPath, JSON.stringify(digest, null, 2), 'utf-8');
    console.log(`Saved ${jsonPath}`);
  } else {
    console.log(`Digest for ${TODAY} already exists, skipping API call`);
  }

  // 6. 全 JSON 読み込み (新しい順、破損ファイルはスキップ)
  const jsonFiles = (await readdir('data/digests'))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse();

  const parseResults = await Promise.allSettled(
    jsonFiles.map(async (f) =>
      JSON.parse(await readFile(path.join('data/digests', f), 'utf-8')) as DailyDigest
    )
  );
  const allDigests: DailyDigest[] = parseResults
    .filter((r, i) => {
      if (r.status === 'rejected') {
        console.warn(`Skipping corrupt file: ${jsonFiles[i]} — ${String(r.reason)}`);
        return false;
      }
      return true;
    })
    .map((r) => (r as PromiseFulfilledResult<DailyDigest>).value);

  if (allDigests.length === 0) {
    throw new Error('No valid digest files found');
  }

  // 7. HTML 生成
  await mkdir('dist/archive', { recursive: true });
  await writeFile('dist/index.html', buildIndexPage(allDigests[0]), 'utf-8');
  for (const d of allDigests) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) {
      console.warn(`Skipping invalid date: ${d.date}`);
      continue;
    }
    await writeFile(`dist/archive/${d.date}.html`, buildArchivePage(d), 'utf-8');
  }
  await writeFile('dist/archive/index.html', buildArchiveIndex(allDigests), 'utf-8');

  console.log(`Done. Generated HTML for ${allDigests.length} digest(s) in dist/`);
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
