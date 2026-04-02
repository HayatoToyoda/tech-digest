import { google } from 'googleapis';
import type { DailyDigest } from '../types.js';
import { buildEmailHtml } from './email-template.js';

// recipients / ccRecipients: 送信先アドレスの配列（send.ts でパース済み）
export async function sendDigestEmail(
  digest: DailyDigest,
  recipients: string[],
  ccRecipients: string[] = [],
): Promise<void> {
  const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

  const gmail = google.gmail({ version: 'v1', auth });
  const subject = `📰 Tech Digest ${digest.date}`;
  const html = buildEmailHtml(digest);

  // RFC 2822 形式のメッセージを base64url エンコード
  const headerLines = [
    `To: ${recipients.join(', ')}`,
    ...(ccRecipients.length > 0 ? [`Cc: ${ccRecipients.join(', ')}`] : []),
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
  ];
  const raw = Buffer.from(
    [
      ...headerLines,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      html,
    ].join('\r\n'),
  ).toString('base64url');

  await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
}
