# Codex handoff — Terrace demo and odds research

## Start here

This is a play-credit Premier League reverse correct-score (反波胆) demo. There are no payments, exchange orders, prizes or production accounts. The app reserves maximum liability and computes gross profit as `risk / (decimal lay odds - 1)`, rounded down to two decimals. New tickets deduct a 5% platform fee from winning profit; losing bets and returned risk incur no fee. Stored ticket profit is net, with gross profit and fee recorded separately. Existing tickets retain their original payouts. Rates display `95 / (layOdds - 1)` percent. No 50% payout multiplier was applied.

Open this repository as a project in Codex. Read `AGENTS.md` and `README.md` first. Use the Docker/standard Next.js workflow below for a local checkout; `npm run dev` is the original Sites/Vinext workflow.

## Repository access and credentials

- Clone `https://github.com/MysteriousLoner/odds-football.git` using your own GitHub account with read access. The owner must grant you access if cloning fails. Do not use the owner's GitHub token or password.
- Local demo: no username, password, database, Cloudflare or ChatGPT Sites credentials required. Play-credit wallets and tickets are stored in each browser's localStorage.
- Optional API-powered odds: set `BETFAIR_ODDS_API_KEY` in the ignored `.env` file. Obtain the shared key privately from the owner or use your own active subscription/key. The key is absent from Git and images.
- Optional iSports comparison: `ISPORTS_API_KEY` powers the server-only Compare rates view. Set it in .env and recreate the container. The owner can supply this key privately. The historical reports already contain their data and work without either key.
- 1CUF and other betting-site logins are not needed to run the app or view the reports. No such login credentials are included.
- Keys used for the 26 October research may have expired, hit quotas, or lack current feed permissions. Check provider responses rather than treating missing fixtures as an app failure.

## Docker startup (recommended)

Install/start Docker Desktop, then:

```sh
git clone https://github.com/MysteriousLoner/odds-football.git
cd odds-football
cp .env.example .env
# Optional: privately set BETFAIR_ODDS_API_KEY in .env.
docker compose up --build -d
```

Open http://localhost:3000 and http://localhost:3000/api/health. In PowerShell, use `Copy-Item .env.example .env` instead of `cp` if preferred. Docker publishes to localhost only. No API key is required for simulated mode. To request API prices in the app, select **Connect live odds → Check connection & load odds**. It filters English Premier League fixtures; there may be no eligible current fixtures. Refresh is manual, cached for 30 seconds, and uses up to two provider calls. Settlement remains simulated.

```sh
docker compose ps
docker compose logs -f web
docker compose down
# Apply an edited runtime API key:
docker compose up -d --force-recreate
```

For a port conflict, set `PORT=3001` in `.env`, then recreate the container and use http://localhost:3001.

## Native development

Use Node.js 22.13 or newer and npm. Node 22 is used by Docker.

```sh
npm ci
# If using API odds, put BETFAIR_ODDS_API_KEY in .env or .env.local.
npm run dev:docker
```

Open http://localhost:3000. `dev:docker` is the standard Next.js dev server; despite its name it runs without Docker. The production commands are `npm run build:docker` and `npm run start:docker` (the standalone start command needs `HOSTNAME=127.0.0.1` on some hosts and the public/static assets must be copied next to the standalone server; prefer Docker for production-style testing).

Checks:

```sh
npm test
npm run typecheck
npm run build:docker
```

## Reports

The `reports/` directory includes the original HTML, JSON, CSV, screenshots and DOM evidence. Open `reports/index.html` directly in a browser. For an HTTP preview inside Codex, with Node installed run:

```sh
npm run reports
```

Open http://127.0.0.1:8081. The server serves only the reports directory on loopback; Ctrl+C stops it. No credentials, dependencies or network API calls are required. Report filters and credit-risk inputs calculate from embedded historical snapshots.

- `isports-comparison-2026-10-26/report.html`: three-column 反波胆 comparison, match/bookmaker filters, adjustable credit risk, percentage-point gaps. 48 distinct score selections; 64 bookmaker-score comparisons.
- `odds-platform-audit-2026-10-26/report.html`: seven fixtures / six leagues, 112 site/API comparisons.
- `odds-comparison-2026-10-25/api-comparison.html`: original Premier League evidence.
- `platform-search-2026-10-26/findings.json`: attempts to find another accessible operator. A second Chinese-language website comparison was not completed; the found board required login.

### Interpretation limits

Betfair-derived data supplies decimal back/lay prices. iSports correct-score data supplies bookmaker **net back odds**, converted to decimal with `net + 1`. Its reverse-score return column is **hypothetical**: `100 / netBackOdds`, assuming a lay could be offered at that back price. It is not an executable iSports lay quote. The website percentage is reproduced as displayed; its stake/settlement basis is unverified. Captures are timestamped, not perfectly simultaneous. Reports are not live, do not prove a universal coefficient, and do not constitute comparisons of every Chinese operator.

## Work already done / next work

The runnable app is the repository root. It retains the original Sites scaffolding but Docker does not depend on it. The exported original Sites source is in `archive/terrace-sites-source.tar.gz`; it is for provenance and not a second app to start. Report-generation scripts are in `scripts/research/` and read only the saved snapshots; rerunning them overwrites derived report files.

Do not add keys to code, report HTML/JSON, screenshots, URLs in documentation, Git commits or Docker build args. iSports sends its key as a query parameter when used; keep authenticated requests server-side and redact request URLs from errors/logs. Do not treat the existing provider keys as betting-site credentials. Do not place real bets or change the pricing formula as part of setup.

The next unresolved research task is to compare the same fixture/score/time/risk basis between 1CUF and another independently accessible operator, including fees and settlement definitions. Existing iSports conversions do not establish that comparison.
