import { readFileSync } from 'fs';
import type { DailyDigest } from '../types.js';
import { sendDigestEmail } from './gmail.js';
import { jstToday } from '../utils/date.js';

const date = jstToday();
const digest: DailyDigest = JSON.parse(
  readFileSync(`data/digests/${date}.json`, 'utf-8'),
);

// GMAIL_TO はカンマ区切りで複数アドレスを指定可能
// 例: "me@gmail.com" または "me@gmail.com, friend@example.com"
const recipients = (process.env.GMAIL_TO ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

if (recipients.length === 0) {
  console.error('GMAIL_TO が設定されていません');
  process.exit(1);
}

await sendDigestEmail(digest, recipients);
console.log(`✅ Email sent to ${recipients.length} recipient(s) for ${date}`);
