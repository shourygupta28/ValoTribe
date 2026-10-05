# ValoTribe

**Find the tribe that matches your vibe.**

Opt-in VALORANT teammate discovery, with self-reported preferences and an isolated fictional reviewer demo. This release is prepared for hosted review; it is not Riot-approved and contains no live Riot integration.

## Implemented

- ValoTribe branding and tagline; public reviewer guide, interactive fictional demo and planned Riot consent walkthrough.
- Email/password accounts, hashed revocable seven-day sessions, per-account attempt limits and origin-checked writes.
- Policy acceptance with version/time; private default Passports; email verification before public sharing, discovery, moderation and LFG.
- Single-use verification/recovery emails through configured Resend. Reset revokes all sessions.
- Roles, agents, languages, rank, daily IST availability and competitive/casual intent; transparent preference fit, not skill or conduct scoring.
- Database-backed LFG, owner deletion and 24-hour expiry. Blocking filters discovery and LFG in both directions. Reports queue for manual operator review; trusted CLI commands suspend/resume accounts.
- Settings: data export, password-confirmed deletion, link removal and block management.
- Privacy and Terms pages with explicit operator setup notice when legal/contact details are missing. Signup defaults closed until operator and mail settings are complete.
- Additive PostgreSQL migration, health endpoint, daily maintenance and report-review commands.
- Render Blueprint and Dockerfile, with deployment and Riot submission checklist.

## Competitive use case

Discovery and LFG can help aspiring players find practice teammates for the expanded 2027 VCT open-qualifier routes. Partner teams remain in the announced system. Dedicated roster invitations, management and tournament registration are planned, not built. No eligibility or qualification guarantee is made.

## Start or deploy

For a GitHub Pages fictional demo, see the GitHub Pages section in **DEPLOYMENT.md**.
`npm run build:pages` exports the demo and reviewer/policy pages; the included
GitHub Actions workflow deploys them. Live accounts and database features need
the server hosting described below.

For a complete local preview with seven fictional accounts and sample LFG posts,
use Node 22, run `npm ci`, then `npm run dev:demo` and open http://localhost:3000.
This command applies the included database migrations and seeds an isolated
in-memory database. No PostgreSQL installation or email configuration is needed.
Sign in with `demo.controller@example.test` and `ValoTribe-Demo-2026!`.
All demo edits reset when the server stops. See **DEPLOYMENT.md** for all accounts.

Read **DEPLOYMENT.md** for local setup, Render deployment, required environment values, verification steps and submission links. Demo route `/demo`; reviewer guide `/review`; policies `/privacy` and `/terms`.

The app starts without seeded players. For local feature testing, run `npm run db:seed:demo` after applying migrations; see the demo account table in **DEPLOYMENT.md**. The isolated `/demo` preview never writes to the database. Email ownership is separate from Riot identity verification. Live Riot OAuth, match ingestion, weekly/multi-slot scheduling, DMs, team rosters and reputation ratings remain outside this release. Discovery is limited to 100 eligible profiles and the LFG feed to 50 posts; pagination/scaling remain future work.

## Validation

`npm run db:generate`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:integration`.

PGlite integration checks do not replace staging on real PostgreSQL, real email delivery, backup/restore testing or Riot review. Review the policy text against your real deployment before accepting users.
