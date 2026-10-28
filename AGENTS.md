# Working in this repository

Read `docs/CODEX_HANDOFF.md` and `README.md` before starting. Run the root app with Docker Compose or `npm run dev:docker` (standard Next.js). `npm run dev` is the original Sites/Vinext path. Reports are static historical evidence; serve them with `npm run reports`.

Never commit real environment files or credentials. No API key is needed for simulated mode. `BETFAIR_ODDS_API_KEY` is server-only; `ISPORTS_API_KEY` is reserved for optional research, not used by the app. Do not replace source odds or apply an undocumented multiplier. Preserve the distinction between offered lay prices and hypothetical conversions from back odds.

For app changes run `npm test` and `npm run typecheck`, and build/test Docker when changing packaging or runtime setup. Preserve raw report snapshots; identify any newly collected evidence by its actual capture date. Do not silently refresh old reports or present supplier examples as current quotes.
