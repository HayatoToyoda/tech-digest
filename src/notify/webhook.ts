import type { DailyDigest } from '../types.js';
import { buildSlackPayload, buildDiscordPayload } from './format.js';

async function post(url: string, payload: object): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Webhook failed: ${res.status} ${await res.text()}`);
  }
}

export async function sendSlack(digest: DailyDigest): Promise<void> {
  await post(process.env.SLACK_WEBHOOK_URL!, buildSlackPayload(digest));
}

export async function sendDiscord(digest: DailyDigest): Promise<void> {
  await post(process.env.DISCORD_WEBHOOK_URL!, buildDiscordPayload(digest));
}
