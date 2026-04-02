<div align="center">

# 📰 Tech Digest

**Claude AI curates and summarizes the best Hacker News articles daily in Japanese,
auto-published to GitHub Pages via GitHub Actions — zero server costs.**

[![Daily Digest](https://github.com/HayatoToyoda/tech-digest/actions/workflows/daily-digest.yml/badge.svg)](https://github.com/HayatoToyoda/tech-digest/actions/workflows/daily-digest.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](src/__tests__)

**[→ Author's live demo](https://hayatotoyoda.github.io/tech-digest/)**  
(After you fork and enable Pages, your site will be at `https://<your-username>.github.io/tech-digest/`.)

</div>

<div align="right">🌐 <a href="README.md">日本語</a> | <b>English</b></div>

---

## The problem

You open Twitter, scroll through the feed. Then Instagram. Then Hacker News — good articles, but all in English. Parse the title, judge whether it's worth reading, skim the content. Repeat for a dozen more. Thirty minutes later, you're drained and still not sure what actually mattered today.

The problem isn't a lack of information. It's the daily exhaustion of curating and processing it all on your own.

**Tech Digest is meant to do that curation for you:**

- Fetches the **top 50 Hacker News articles** every morning at 07:00 JST
- Claude AI **selects, categorizes, and summarizes** the most important ones in Japanese
- Publishes a clean digest to **GitHub Pages** automatically — no server, no maintenance

---

## Output Example

```
#1  [Security]  TechCrunch
Iran-linked hackers breach FBI director's personal email

FBIディレクターの個人メールアカウントがイラン系ハッカー集団に侵害された。
標的型スピアフィッシングにより認証情報が盗まれ、機密性の高い通信内容が
流出した可能性がある。米政府機関の高官を標的にした攻撃の高度化を示す事例。

重要な理由: 政府高官への標的型攻撃の深刻化と、個人アカウントの
           セキュリティ管理の重要性を改めて示している
対象読者:  セキュリティ担当者・政策立案者・ITエンジニア全般
```

> Note: All digest content is generated in Japanese regardless of the source article language.

Categories: **AI / Web / Security / OSS / Platform** — Claude auto-classifies each article and outputs a summary, importance rationale, and target audience.

---

## Run your own copy (fork setup)

**Forking** creates a **copy under your GitHub account** that you control.  
Use **that fork’s** **Settings** (secrets, Pages) and **Actions** from then on. Even with a public repo, you can keep API keys and email addresses in **GitHub Secrets only**—nothing needs to be committed in plain text.

> Fork → Add secret → Enable Pages → **Done in ~3 minutes**

### 1. Fork the repository

Use **Fork** on GitHub, or:

```bash
gh repo fork HayatoToyoda/tech-digest --clone
```

### 2. Add your Anthropic API key

In **your fork**, open **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret | Value |
|---|---|
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com/) |

### 3. Enable GitHub Pages

Still in **your fork**: **Settings → Pages → Build and deployment → Source** → **GitHub Actions**.

Open the **Actions** tab, choose **Daily Tech Digest**, and run **Run workflow** once to verify the pipeline.

Your site URL will look like this (adjust username / repo name to match your fork):

`https://<your-username>.github.io/tech-digest/`

> Tip: Run `npm test` locally before triggering the workflow to make debugging easier.

### (Optional) Get the digest by email (Gmail)

Email is **not sent until you add the secrets below**. Set this up only if you want it. Put recipients in **Actions secrets**; you do not need to hardcode addresses in the repo.

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project and enable the **Gmail API**
2. Create an **OAuth 2.0 Client ID** (e.g. Desktop app) and copy the client ID and secret
3. On your machine, add `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` to `.env`, run `npx tsx scripts/get-gmail-token.ts`, complete the browser flow, and copy the **refresh token** from the terminal
4. In **your fork**, under **Settings → Secrets and variables → Actions**, add:

| Secret | Description |
|---|---|
| `GMAIL_CLIENT_ID` | OAuth client ID |
| `GMAIL_CLIENT_SECRET` | OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | Refresh token from step 3 |
| `GMAIL_TO` | To recipients (comma-separated for multiple) |
| `GMAIL_CC` | (Optional) Cc recipients (comma-separated). **If omitted, no Cc header is added** |

The **Send email digest** step in the daily workflow reads these. Omit `GMAIL_CC` if you do not need Cc.

---

## How It Works

```mermaid
flowchart LR
    A["⏰ GitHub Actions\n07:00 JST daily"] --> B["Hacker News\nFirebase API\ntop 50 stories"]
    B --> C["Article Content\nExtractor\n10s timeout · SSRF blocked"]
    C --> D["Claude Haiku\nAI Summarizer\nsystem/user separated"]
    D --> E[("data/digests/\nYYYY-MM-DD.json\n→ git push")]
    D --> F["dist/ HTML\n(index + archive)"]
    F --> G["🌐 GitHub Pages\nauto-deployed"]
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22, TypeScript (via tsx) |
| AI | Claude Haiku (`claude-haiku-4-5-20251001`) |
| Data source | Hacker News Firebase API |
| Testing | Vitest |
| CI/CD | GitHub Actions (SHA-pinned) |
| Hosting | GitHub Pages |

---

## Security

| Risk | Mitigation |
|---|---|
| **Prompt Injection** | Instructions in `system` parameter only; article data stays in `user` role |
| **SSRF** | Private IPs (10.x / 172.16-31.x / 192.168.x / 127.x / 169.254.x) and non-http(s) URLs blocked |
| **XSS** | All output sanitized via `escapeHtml` and `safeHref`; `javascript:` URLs blocked |
| **Timeouts** | 10-second `AbortController` timeout on every external fetch |
| **Least privilege** | Build and deploy jobs separated with minimal permission scopes |
| **Supply chain** | All Actions pinned to exact commit SHAs; `npm audit` runs on every build |

---

## Local Development

```bash
npm install

# Generate digest (requires ANTHROPIC_API_KEY — Claude API calls will be made)
ANTHROPIC_API_KEY=sk-ant-... npm run build
# → generates data/digests/YYYY-MM-DD.json and HTML files under dist/

# Run tests
npm test

# Type check
npx tsc --noEmit
```

The generated page is available at `dist/index.html`.

---

## License

MIT — Fork it, change it, and run it however you like.

This repository is the author’s personal project. Forks and customizations are welcome, but Issues and PRs are not accepted at this time.
