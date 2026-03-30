import { readFileSync } from 'fs';
import type { DailyDigest } from '../types.js';
import { sendSlack, sendDiscord } from './webhook.js';
import { jstToday } from '../utils/date.js';

const date = jstToday();
const digest: DailyDigest = JSON.parse(
  readFileSync(`data/digests/${date}.json`, 'utf-8'),
);

const tasks: Array<{ name: string; fn: () => Promise<void> }> = [];
if (process.env.SLACK_WEBHOOK_URL) tasks.push({ name: 'Slack', fn: () => sendSlack(digest) });
if (process.env.DISCORD_WEBHOOK_URL) tasks.push({ name: 'Discord', fn: () => sendDiscord(digest) });

if (tasks.length === 0) {
  console.error('SLACK_WEBHOOK_URL または DISCORD_WEBHOOK_URL を設定してください');
  process.exit(1);
}

const results = await Promise.allSettled(tasks.map(t => t.fn()));

let hasError = false;
for (const [i, result] of results.entries()) {
  if (result.status === 'fulfilled') {
    console.log(`✅ ${tasks[i].name}: sent`);
  } else {
    console.error(`❌ ${tasks[i].name}: ${result.reason}`);
    hasError = true;
  }
}

if (hasError) process.exit(1);
