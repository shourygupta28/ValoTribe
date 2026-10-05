# Validation for ValoTribe 0.3.0

Completed in the authoring environment:

- Prisma Client generated from the updated schema.
- Next.js production build and TypeScript checks passed.
- Six unit checks passed for preference matching, privacy filtering, overnight availability and password hashing.
- Twenty-eight HTTP integration checks passed against a temporary PGlite PostgreSQL-compatible database. Both tracked SQL migrations were applied.
- Verified policy acceptance, private defaults, email verification and single-use tokens, old-account policy acceptance, verified-only discovery/LFG, public-field filtering, LFG ownership, blocking in both directions, manual reports, origin checks, export redaction, stored Riot-link removal, recovery expiry/session revocation, email delivery failure recovery, suspension, deletion, session expiry, throttling, closed signup and Secure cookies.
- Resend HTTP calls were intercepted by the test subprocess. No messages were sent to real recipients and no Riot calls were made.

Not verified here:

- The included browser suite could not run because a Chromium browser was unavailable and its download failed. No visual or automated browser-pass claim is made. Run the suite and inspect the hosted desktop/mobile screens before review.
- Real PostgreSQL migration deployment, live Resend sending, hosting/domain setup and database backup/restore must be smoke-tested on your staging service.
- Docker and Render provisioning were not executed; the archive contains their configuration and instructions, not a deployed service.
- Riot approval, actual RSO, consented live match data and competition outcomes remain unimplemented/unverified.

The policy pages are deployment templates describing the implemented prototype. Complete operator/contact values and actual provider/backup details before submission or public signup.
