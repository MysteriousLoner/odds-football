# Terrace — Premier League 反波胆 demo

A responsive reverse correct-score sportsbook with 10,000 starting play credits, risk-based bet slips, credit refills, history, watchlist, team search, and simulated settlement. No deposits, payments, prizes, or exchange order execution.

## Run with Docker

Requirements: Docker Desktop or Docker Engine with the Compose plugin.

```sh
cp .env.example .env
# Optional: edit .env and set BETFAIR_ODDS_API_KEY to your own key.
docker compose up --build -d
```

Open **http://localhost:3000**. A blank key keeps the simulated demo fully usable. To load API odds, select **Connect live odds → Check connection & load odds**.

```sh
docker compose ps
docker compose logs -f web
docker compose down
```

Set `PORT=8080` in `.env` to use http://localhost:8080. Compose binds to `127.0.0.1` by default. Wallets and tickets live in the visitor's browser, so container restarts do not erase them. Clearing browser site data resets that browser's demo.

After changing the API key, apply the runtime environment again:

```sh
docker compose up -d --force-recreate
```

The Dockerfile builds a Next.js standalone Node server from the same app source used by the Sites/Vinext version. The runtime image contains the traced server and public assets, runs as the `node` user, and listens on port 3000. Compose uses a read-only filesystem, a temporary `/tmp`, and no added Linux capabilities. Health checks use `/api/health`; they never call the odds provider.

Environment files, local credentials, Git history, dependencies, build outputs and review artifacts are excluded from the Docker context. **Never pass API keys as build arguments or commit them.** No key is included in this repository or image.

To run the image without Compose:

```sh
docker build -t terrace-odds-football:local .
# Export BETFAIR_ODDS_API_KEY in your shell first, or omit --env for demo mode.
docker run --rm --init -p 127.0.0.1:3000:3000 \
  --env BETFAIR_ODDS_API_KEY terrace-odds-football:local
```

## Development and checks

Node 22.13+:

```sh
npm ci
npm run dev:docker
npm test
npm run typecheck
npm run build:docker
```

`dev:docker` starts the standard Next.js development server. The existing `dev`, `build`, and `start` scripts retain the original Sites/Vinext workflow. `.openai/hosting.json` identifies the original private Site; Docker does not require Sites credentials or Cloudflare login.

The GitHub Actions workflow builds the container, runs the accounting tests during the image build, and smoke-tests the page, health check, and missing-key API response. It does not publish an image or require the API key.

## Betfair Odds API

Reference: https://betfair-odds.com/docs

The server endpoint `/api/markets` reads the live and prematch soccer feeds using the `x-portal-apikey` header. It filters events labeled Premier League and supports all 19 standard `CORRECT_SCORE` outcomes: 16 exact scores (0–0 through 3–3), Any Other Home Win, Any Other Away Win and Any Other Draw. Only selections with positive available lay size and valid lay odds can be selected. Market ID, runner ID, and handicap identify each selection. Provider fixture and competition labels are not independently verified.

`BETFAIR_ODDS_API_KEY` is read at runtime from the server environment. It is never sent to the browser. The original hosted Site's secret is managed separately and is not exported into this checkout.

Prices refresh manually. A 30-second server cache limits duplicate provider calls, and quotes expire after 30 seconds until refreshed. Both feeds must be fresh; stale or failed feeds pause new API-priced bets. Refresh uses up to two provider requests and is subject to your provider account's limits. There is no continuous polling or WebSocket streaming.

## Credit model and settlement

The amount entered is **maximum loss / liability**, not exchange lay stake. Profit = liability / (lay odds − 1), rounded down to two decimals. Placement reserves liability. A final score outside the excluded outcome returns liability plus profit; a score in that outcome loses the liability. Any Other Home/Away Win covers the corresponding winner scoring 4+ goals, and Any Other Draw covers 4–4 and higher draws. New tickets deduct a 5% platform fee from winning profit only. Gross profit is rounded down to 2 decimals, the fee rounds to the nearest cent, and stored net profit is gross minus fee. Returned liability and losing tickets incur no fee. Existing tickets retain their recorded payouts. Displayed net return is `95 / (layOdds - 1)` percent; credit rounding may differ slightly.

**My bets → Simulate result** applies one chosen demo score to all open tickets on a match, once. Settled matches cannot accept further bets. Settlement is simulated even with API-sourced prices: no official result verification is implemented. Provider liquidity is informational; no orders are matched on an exchange.

Wallet and tickets are stored together in localStorage. This is a browser-local demo with no shared ledger or cross-device account sync.

## Assets

Stadium photo: https://images.unsplash.com/photo-1522778119026-d647f0596c20

Barlow Condensed and DM Sans are served locally from Google Fonts. Club badges are illustrative initials, not official marks.

## Colleague / Codex handoff and research archive

Start with [docs/CODEX_HANDOFF.md](docs/CODEX_HANDOFF.md). All historical research is under [reports/](reports/index.html). With Node installed, `npm run reports` opens a local report server at http://127.0.0.1:8081; it makes no provider requests. The original Sites source is preserved in `archive/terrace-sites-source.tar.gz`. API keys must be shared privately and are excluded from the repository.

## Compare iSports rates

Set `ISPORTS_API_KEY` in ignored `.env` and recreate the container. Open **Compare rates → Load / refresh both sources**. This manually fetches the Betfair-derived app prices and iSports English Premier League schedule / correct-score quotes. iSports responses are cached for 60 seconds per server process; failed refresh attempts also have a 60-second cooldown. The schedule and required prematch/in-play feeds use up to three iSports requests.

Fixtures pair only when canonical home/away names, exact UTC kickoff and prematch/in-play phase match uniquely. Demo fixtures never pair with real data. All 19 standard outcomes and every additional numeric score available from either source are shown; missing or closed quotes remain unavailable. Bookmaker, source capture time, last price-change time and snapshot expiry are visible. An expired comparison is a historical snapshot.

iSports quotes net **back** odds, not lay odds. Its comparison return is hypothetical: `100 / netBackOdds`, assuming a lay could be offered at `netBackOdds + 1` decimal. Terrace now displays net returns after its 5% platform fee, while the iSports hypothetical reference is explicitly before fees. The gap is iSports gross minus Terrace net in percentage points. Historical reports remain unchanged. iSports rows cannot be placed as credit bets and no payout multiplier was added.

## Current local deployment (28 October 2026)

The active Docker checkout is this directory. Start or stop its container with:

```sh
docker compose -p terrace up --build -d
docker compose -p terrace down
```

Local address: http://localhost:3000. The existing ngrok agent forwards to http://127.0.0.1:3000. Its public URL is available from http://localhost:4040/api/tunnels. Keep Docker Desktop, the Mac and ngrok running for colleagues to connect. First-time visitors may need to click ngrok's Visit Site button. If the agent has stopped, run `ngrok http http://127.0.0.1:3000 --host-header=rewrite`.

Both provider keys are configured in the ignored local `.env` file. The app opens in simulated mode; use Connect live odds or Compare rates to fetch provider data. Each browser has its own play-credit wallet. The old Sites deployment is being retired separately; do not republish it when updating this local deployment.
