# Deploy ValoTribe for Riot review

This is a full Next.js Node server with PostgreSQL, not a static export. You own the deployment and any hosting/email charges. No deployed URL is included in this source archive.

## GitHub Pages: fictional demo only

GitHub Pages cannot run the Node server or PostgreSQL. The separate Pages build
publishes the interactive fictional demo at `/`, plus `/demo/`, `/review/`,
`/privacy/` and `/terms/`. Accounts, email, saved Passports and live LFG require
the server deployment below. The policy pages are drafts for that server app.

1. Push these files to the `main` branch of `shourygupta28/ValoTribe`.
2. In the GitHub repository, open **Settings > Pages** and select **GitHub Actions** as the source.
3. Open **Actions > Deploy demo to GitHub Pages > Run workflow**. Future pushes to `main` deploy automatically.
4. After the workflow succeeds, open `https://shourygupta28.github.io/ValoTribe/`.

To verify locally, use Node 22, run `npm ci` and `npm run build:pages`.
The static artifact is `.pages-build/out`; never upload the repository or `.env` as
the Pages artifact. The workflow derives the URL prefix from GitHub Pages settings
so repository paths and custom domains work. For a local root-path preview, set
`PAGES_BASE_PATH` to an empty string before building. No database or secrets are
needed. The existing `npm run build` still builds the full server app.

## Recommended path: Render web service and PostgreSQL

1. Extract the ZIP. Upload the **contents of the valotribe folder** to your GitHub repository root, including package-lock.json, prisma and render.yaml. Do not upload .env, node_modules, .next or secrets.
2. Sign in to Render and create a Blueprint from that repository. Review the web-service/database plans and billing before accepting. The included render.yaml creates a Node web service and PostgreSQL database and wires DATABASE_URL. No particular free tier or price is assumed.
3. Set APP_ORIGIN to the actual HTTPS service address Render assigns, with no trailing slash. If the initial service needs a value before its address exists, use a clearly temporary HTTPS value, then replace it and redeploy before testing any account action. Set COOKIE_SECURE=true. Keep PUBLIC_SIGNUP_ENABLED=false for the initial review deployment.
4. Supply OPERATOR_NAME (your actual legal name or operating entity), SUPPORT_EMAIL (an inbox you monitor), RESEND_API_KEY and EMAIL_FROM. Configure and verify your sending domain in Resend; the sender must be on that domain. Do not use invented contact details. Leave signup closed if email is not ready: /demo and /review are still reviewable.
5. Render builds with `npm ci && npm run build` and starts with `npm run start:deploy`. Startup applies tracked Prisma migrations before the server starts. Check the logs for successful migration and server startup. /api/health must return HTTP 200. Database schema changes should always be reviewed and backed up before deployment.
6. Read /privacy and /terms. Adapt them to your actual operator, providers, backup retention and deployed practices. Backups are managed by your database provider; this code does not automatically erase them. Set and document your backup retention, keep a protected deletion ledger for restoring backups, and test restoration before public launch.
7. Schedule `npm run maintenance` daily in a secure environment with DATABASE_URL (for example a scheduled hosting job or your own scheduler). It removes expired sessions, attempt counters, account tokens, LFG posts and reports older than 90 days. It uses the database directly; there is no public maintenance endpoint. Retention promises assume that this task is running successfully.
8. Set PUBLIC_SIGNUP_ENABLED=true only after the operator/policy/email setup is complete. Redeploy. Create two consenting test accounts and complete the checks below. Add monitoring and infrastructure-level IP/traffic throttling before a wider public launch; the application includes account-scoped limits but these alone do not stop distributed signup abuse.
9. Use a domain you control for Riot review if possible. Add it to Render and update APP_ORIGIN to its exact HTTPS origin. Confirm the new address works, then redeploy and retest all account links. Old verification/recovery emails point at the old origin, so request fresh ones.

### Manual Render service alternative

Create PostgreSQL first and a **Web Service**, not a Static Site, from the repository. Runtime Node 22, Build `npm ci && npm run build`, Start `npm run start:deploy`, health path `/api/health`. Add the environment variables listed above; use the database's internal connection string when supported for your service region/network. Avoid multiple app replicas migrating simultaneously during initial provisioning.

## Verify before sending Riot the URL

- `/review`, `/demo`, `/privacy` and `/terms` open without an account. The demo says fictional and never creates database records.
- With signup closed, registration API rejects new accounts.
- With signup open, registration requires an 18+ declaration and policy acceptance. A private Passport is created and a verification message arrives from your verified sender.
- An unverified account can edit a private Passport but cannot publicly share, discover players or post.
- Verify both accounts. Finish onboarding; public visibility without discovery opt-in remains hidden. Public plus opt-in appears to the other account. Real email addresses and credentials are absent from discovery.
- LFG saves and expires; another account cannot delete your post. Going private hides both your profile and posts.
- Block a player: both accounts stop seeing each other in discovery and feed. Settings can unblock. Reports are stored for operator review, not converted into public labels.
- Run `npm run reports` from a trusted administrative shell to review pending reports. Treat output as private. `npm run reports -- resolve REPORT_ID` marks a reviewed report resolved. `npm run reports -- suspend USER_ID` restricts an account, hides its Passport/posts and revokes its sessions. `npm run reports -- resume USER_ID` restores login eligibility while leaving its Passport private; no public admin API is exposed. An operator must actually monitor reports.
- Export downloads your own JSON without password hashes, tokens or other people's account emails.
- Recovery link works once, expires after 30 minutes and signs out all sessions when used. Verification links expire after 24 hours. Requesting recovery for an unknown account gives the same response.
- Password-confirmed deletion removes the active account and related rows; a previous session can no longer access it.
- HTTPS session cookies are HttpOnly, SameSite=Lax and Secure. Cross-origin account changes fail.

## Riot verification and submission

Provide your operator/contact details, product description/API use, deployed `/review` and `/demo` links, policy URLs and the proposal through Riot's Developer Portal. The ZIP is a developer handoff, not a replacement for the hosted site. Register the product before serving real players, even while no Riot API is used.

After application submission, Riot supplies a verification string and exact URL. Add the exact requested plain-text file under `public/` at the corresponding relative path, commit it and redeploy; for example `/ownership.txt` maps to `public/ownership.txt`. Do not guess the filename or publish unrelated secrets. If the requested path cannot be served by public assets, add a narrow text-only route at that exact path. Test that the requested URL returns only the required verification text.

Record the application identifier generated by registration. Production approval precedes RSO application. Live Riot auth, consent persistence and match ingestion are **not implemented** here; keep them disabled until approved and tested. The consent demo is a design walkthrough, not an OAuth implementation. No real Riot player directory, ranks or match history are included.

## Local development

### One-command fictional demo

With Node 22 installed, run `npm ci`, then `npm run dev:demo`.
Open http://localhost:3000 and sign in using the demo accounts below.
The command creates an in-memory PGlite database, applies every tracked migration,
seeds all seven fictional accounts and starts Next.js. It ignores the database
connection in `.env` and leaves existing database files untouched. Signup and
outbound mail are disabled. It binds both services to your own machine.
All edits are discarded when the process stops; each start restores the initial
demo accounts and fresh 24-hour LFG posts. Use the PostgreSQL setup below for
persistent local data. This demo command refuses to run in production.

If ports are occupied, set `DEMO_PORT` (default 3000) and/or `DEMO_DB_PORT`
(default 55435) in your shell before starting. Stop both services with Ctrl+C.
Database binaries, runtime files and credentials are not committed; the included
migrations and fictional seed data reproduce the demo database on any machine.

### Persistent PostgreSQL development

Requires Node 22 and PostgreSQL (Docker Compose is optional).

```
npm ci
cp .env.example .env
docker compose up -d db
npm run db:deploy
npm run dev
```

Open http://localhost:3000. The demo works without mail; live signup remains closed until the operator and Resend values are set and PUBLIC_SIGNUP_ENABLED=true. Resend account emails use APP_ORIGIN; localhost links work only on your own machine. Never use COOKIE_SECURE=false outside local HTTP.

## Local demo accounts

After `npm run db:deploy`, run `npm run db:seed:demo`, then sign in at `/`.
The command loads your local `.env` files and only accepts local database hosts
(`localhost`, `127.0.0.1`, `::1`, or Compose `db`) outside production. It is optional
and is never run during installation, builds, migrations or deployment.

All accounts initially use password **`ValoTribe-Demo-2026!`**.

| Email | Starting state / feature to test |
| --- | --- |
| `demo.controller@example.test` | Verified, public Controller; discovery, competitive fit and LFG |
| `demo.duelist@example.test` | Verified, public Duelist; complementary roles, blocking and reports |
| `demo.sentinel@example.test` | Verified, public Sentinel; overnight availability and language fit |
| `demo.initiator@example.test` | Verified, public Initiator; casual intent and different play window |
| `demo.private@example.test` | Verified, private; hidden from discovery, sharing and privacy controls |
| `demo.unverified@example.test` | Unverified, private; verification restrictions |
| `demo.new@example.test` | Verified, private, not onboarded; first-time Passport setup |

These are fictional test accounts with synthetic policy/verification timestamps,
not verified email owners. Login works with signup closed and without mail setup.
Their reserved `.test` addresses cannot receive real verification or recovery email;
use the integration suite or real consenting staging accounts for mail flows.
No Riot links or match history are created.

Each public account starts with a sample Mumbai LFG post, expiring after 24 hours.
You can create fresh posts through the app. Rerunning the seed skips existing demo
accounts and preserves edits, passwords, blocks and posts; it recreates deleted
demo accounts. It never resets the database or modifies other accounts. Test export,
password-confirmed deletion, blocking and reporting through the normal Settings
and discovery screens. There is no admin login; report review uses the existing
`npm run reports` CLI.

## Existing data

If you already run the previous local Compose database, keep that database, container/volume and DATABASE_URL. The rebranded Compose file is for new installations; changing volume names would start a different empty database.

Keep both migrations. A database already created by the previous 0.2 migration receives only the new additive migration. Legacy accounts have unverified email status and must verify and accept the current policies in Settings before sharing. Databases created by older manual `db push` without migration history need reviewed baselining; do not delete or reset data to bypass errors.

## Validation commands

```
npm run db:generate
npm run typecheck
npm test
npm run build
npm run test:integration
```

Optional local browser checks (not part of the production dependencies):

```
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run test:browser
```

The browser suite starts its own temporary database and app, intercepts email delivery, exercises the fictional demo and the signup/verification/onboarding/LFG/Settings journey, and writes desktop/mobile screenshots to artifacts/. Ports 55436 and 3006 must be free. The browser suite was included but could not be executed in the authoring environment because its browser download was unavailable. Inspect the hosted screens on desktop/mobile before submitting.

The integration suite uses an ephemeral PGlite PostgreSQL-compatible database and intercepts email transport inside the test subprocess. It never sends messages. Run a real PostgreSQL migration and real email delivery smoke test on your own staging service before submitting its URL.

## Official references checked 3 October 2026

- Render Next.js Node service: https://render.com/docs/deploy-nextjs-app
- Render Blueprint fields: https://render.com/docs/blueprint-spec
- Resend email API: https://resend.com/docs/api-reference/emails/send-email
- Riot product requirements: https://developer.riotgames.com/docs/valorant
- Riot production/website verification/RSO sequence: https://developer.riotgames.com/docs/faqs
