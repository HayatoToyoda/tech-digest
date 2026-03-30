// OAuth2 認証フロー（ブラウザ経由）でリフレッシュトークンを取得する一時スクリプト
// 使い方: npx tsx scripts/get-gmail-token.ts  (.env に GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET を設定)
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { google } from 'googleapis';
import * as http from 'http';
import { URL } from 'url';

// .env を読み込む（既存の環境変数は上書きしない）
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    const unquoted = value.replace(/^(['"])(.*)\1$/, '$2');
    if (key && !(key in process.env)) process.env[key] = unquoted;
  }
}

const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET } = process.env;
if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
  console.error('GMAIL_CLIENT_ID と GMAIL_CLIENT_SECRET を環境変数に設定してください');
  process.exit(1);
}

const REDIRECT_PORT = 3000;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  REDIRECT_URI,
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.send'],
  prompt: 'consent', // リフレッシュトークンを確実に取得するため
});

console.log('\n以下 URL をブラウザで開いて認証してください:\n');
console.log(authUrl);
console.log();

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url!, `http://localhost:${REDIRECT_PORT}`);
  const code = parsed.searchParams.get('code');
  if (!code) {
    res.end('code が見つかりません');
    return;
  }

  const { tokens } = await oauth2Client.getToken(code);
  res.end('認証完了。ターミナルを確認してください。');
  server.close();

  console.log('\n✅ リフレッシュトークン:');
  console.log(tokens.refresh_token);
  console.log('\nGitHub Secrets の GMAIL_REFRESH_TOKEN に登録してください');
});

server.listen(REDIRECT_PORT, () => {
  console.log(`ローカルサーバー起動中 (port ${REDIRECT_PORT})...`);
});
