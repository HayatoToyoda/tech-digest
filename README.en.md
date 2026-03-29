<div align="center">

# 📰 Tech Digest

**Claude AI curates and summarizes the best Hacker News articles daily in Japanese,
auto-published to GitHub Pages via GitHub Actions — zero server costs.**

[![Daily Digest](https://github.com/HayatoToyoda/tech-digest/actions/workflows/daily-digest.yml/badge.svg)](https://github.com/HayatoToyoda/tech-digest/actions/workflows/daily-digest.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-46%20passing-brightgreen.svg)](src/__tests__)

**[→ View Today's Digest](https://hayatotoyoda.github.io/tech-digest/)**

</div>

<div align="right">🌐 <a href="README.md">日本語</a> | <b>English</b></div>

---

## The Problem

Reading English tech news every morning takes time.
Scanning Hacker News means parsing titles, judging relevance, and understanding context — all in a foreign language.

**Tech Digest automates all of it:**

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

Categories: **AI / Web / Security / OSS / Platform** — Claude auto-classifies each article and outputs a summary, importance rationale, and target audience.

---

## Quick Start

> Fork → Add secret → Enable Pages → **Done in 3 minutes**

### 1. Fork this repository

```bash
gh repo fork HayatoToyoda/tech-digest --clone
```

### 2. Add your Anthropic API key

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Get yours at [console.anthropic.com](https://console.anthropic.com/) |

### 3. Enable GitHub Pages

**Settings → Pages → Source**: set to `GitHub Actions`

Then trigger a first run: **Actions → Daily Tech Digest → Run workflow**

Your digest will be live at `https://<your-username>.github.io/tech-digest/`.

---

## How It Works

```mermaid
flowchart LR
    A["⏰ GitHub Actions\n07:00 JST daily"] --> B["Hacker News\nFirebase API\ntop 50 stories"]
    B --> C["Article Content\nExtractor\n10s timeout · SSRF blocked"]
    C --> D["Claude Haiku\nAI Summarizer\nsystem/user separated"]
    D --> E[("data/digests/\nYYYY-MM-DD.json\n→ git commit")]
    D --> F["🌐 GitHub Pages\ndist/index.html\nauto-deployed"]
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22, TypeScript (via tsx) |
| AI | Claude Haiku (`claude-haiku-4-5-20251001`) |
| Data source | Hacker News Firebase API |
| Testing | Vitest (46 tests) |
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

# Generate digest (requires ANTHROPIC_API_KEY)
ANTHROPIC_API_KEY=sk-ant-... npm run build

# Run tests
npm test

# Type check
npx tsc --noEmit
```

The generated page is available at `dist/index.html`.

---

## License

MIT — Feel free to fork and run your own digest.
