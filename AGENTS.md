# Working in this repository

Read `docs/CODEX_HANDOFF.md` and `README.md` before starting. Run the root app with Docker Compose or `npm run dev:docker` (standard Next.js). `npm run dev` is the original Sites/Vinext path. Reports are static historical evidence; serve them with `npm run reports`.

Never commit real environment files or credentials. No API key is needed for simulated mode. `BETFAIR_ODDS_API_KEY` is server-only; `ISPORTS_API_KEY` powers optional side-by-side correct-score comparisons. Do not replace source odds or apply an undocumented multiplier. Preserve the distinction between offered lay prices and hypothetical conversions from back odds.

For app changes run `npm test` and `npm run typecheck`, and build/test Docker when changing packaging or runtime setup. Preserve raw report snapshots; identify any newly collected evidence by its actual capture date. Do not silently refresh old reports or present supplier examples as current quotes.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
