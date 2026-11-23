# Abeeb Digital Studio — Project Handoff

> **Last updated:** 23 November 2026  
> **Repository:** [emaklr/digital-studio](https://github.com/emaklr/digital-studio)  
> **Source of truth:** main  
> **Current main commit:** 34a821f3973bdbe1699eecec6e807f88fb057f1b — Security hardening and Prisma 7 upgrade

This document is the continuity record for future work sessions. Read it together with [README.md](../README.md) and [SECURITY-RELEASE-CHECKLIST.md](./SECURITY-RELEASE-CHECKLIST.md) before making changes. Update this document whenever meaningful work is completed, a deployment changes status, or a new blocker is discovered.

## 1. Project purpose and current product direction

Abeeb Digital Studio is an international digital solutions studio. Its public offer includes websites and landing pages, e-commerce stores, custom web applications, business workflow automation, and AI integrations and assistants.

The approved direction recorded in the repository is a premium dark visual identity with bold creative accents, USD starting prices, and an international target market. FixTrust and Ritewheel are studio-owned products in development; do not present them as completed client case studies.

### Current advertised starting prices

These are the values currently defined in lib/services.ts. Treat them as current site content, not as independently validated final commercial pricing.

| Service | Starting price |
|---|---:|
| Websites | $150 |
| E-commerce | $500 |
| Web applications | $800 |
| Business automation | $250 |
| AI solutions | $300 |

The detailed fixed-package prices currently in code are:

| Service | Package prices |
|---|---|
| Websites | Landing page $150; Business website $300; Growth website $550 |
| E-commerce | Store launch $500; Store growth $950; Commerce plus $1,600 |
| Web applications | MVP build $800; Business platform $1,800; Custom platform $3,500 |
| Business automation | Quick win $250; Connected ops $600; Automation suite $1,200 |
| AI solutions | AI starter $300; AI assistant $750; AI workflow $1,500 |

### Commercial terms

- **Fixed packages:** 50% deposit to start; remaining 50% due before final handover.
- **Custom work:** discovery and scope first, then a written proposal with deliverables, timeline, kickoff deposit and milestone payment schedule. Custom work does not use instant fixed-package checkout.
- **Checkout currency:** NGN through Paystack. The site displays USD prices; the server converts the 50% deposit using the manually maintained USD_NGN_RATE (NGN per USD).
- The FX rate is a studio-managed quote rate, not a live market feed. Keep it current before enabling checkout.
- Third-party subscriptions, API usage, payment-gateway fees and hosting costs may be separate from the quoted project price where stated.

## 2. What has been completed

### A. Initial website delivery

- **PR #1** — [Build Abeeb Digital Studio website](https://github.com/emaklr/digital-studio/pull/1) was merged into main.
- The initial marketing site includes the main public experience and pages for the home page, services, work/portfolio, about, contact, booking and custom-project enquiries.
- Service definitions, fixed packages and advertised prices are centralized in lib/services.ts.
- FixTrust and Ritewheel are positioned as studio products in development rather than finished client work.
- README and page copy record the fixed-package deposit and custom-project milestone model.

### B. Prisma 7 and Node.js upgrade

The upgrade was first completed and validated locally, pushed on feat/abeeb-studio-website, and then incorporated into the security branch so the application changes could be tested together. It is now merged into main.

- Node runtime: 26.13.1, recorded in .nvmrc and the CI workflow.
- Local environment report: npm 11.20.0.
- Prisma CLI and client: 7.10.1.
- PostgreSQL driver adapter: @prisma/adapter-pg 7.10.1.
- dotenv 17.4.2 and prisma.config.ts handle local environment loading and Prisma CLI configuration.
- Prisma generator is prisma-client, outputting to generated/prisma; this generated directory is intentionally ignored and regenerated during install/build.
- lib/prisma.ts creates the Prisma client with the PostgreSQL adapter and DATABASE_URL.
- Prisma 7 obtains the datasource URL from prisma.config.ts; the connection URL was removed from the Prisma schema.
- TypeScript target is ES2023. The typecheck script is next typegen && tsc --noEmit.
- next-env.d.ts and generated build/client artefacts are ignored as appropriate.
- The lockfile is committed. A scoped Prisma Config override pins effect to 3.22.5; the dependency tree also resolves deepmerge-ts to 8.0.2.

The Prisma model definitions remain the existing Inquiry, Payment and WebhookEvent models. The upgrade did not intentionally change the business data model or apply migrations to a database.

### C. API and application security hardening

The security work was merged through **PR #2**:

[PR #2 — Security hardening: API validation, rate limits and payment privacy](https://github.com/emaklr/digital-studio/pull/2)

It was squash-merged on 23 November 2026. The merge commit is:

34a821f3973bdbe1699eecec6e807f88fb057f1b

The main code areas changed include:

- lib/request-security.ts: bounded streaming JSON/raw-body readers, content-type and body-size validation, field/text helpers, email/URL checks, browser-origin allowlisting and canonical site URL handling.
- lib/rate-limit.ts: shared Upstash Redis REST rate limiting using an atomic Lua script. Production fails closed (503) when the shared store is missing or unavailable; local development may continue without it.
- app/api/inquiries/route.ts: origin checking, rate limiting, JSON/field validation, allowlisted service/package values, persistence and studio notification.
- app/api/checkout/initialize/route.ts: server-side payment feature flag, origin/rate checks, server-canonical package selection and deposit/NGN calculation, canonical callback URL, persisted inquiry/payment records and Paystack initialization.
- app/api/payments/verify/route.ts: POST-only verification; validates the payment reference; verifies the transaction against Paystack and checks reference, status, currency and exact amount; returns a minimal no-store result rather than exposing the full payment record.
- components/payment-result.tsx: calls the verification endpoint with POST.
- app/api/paystack/webhook/route.ts: bounded raw JSON body and modern timestamped Paystack-Signature verification, with a legacy signature fallback; supports current/previous configured webhook secrets and a five-minute timestamp tolerance; checks amount, currency and payment reference before marking paid.
- lib/mark-payment-paid.ts: uses a conditional database update so a payment transitions to PAID once and the paid notification is only attempted for the first successful transition.
- next.config.ts: security headers including HSTS, content-type, frame, referrer and permissions policies, plus a report-only CSP.
- .env.example, README.md and docs/SECURITY-RELEASE-CHECKLIST.md: document required environment settings, limits and release checks.

### D. Rate limits currently implemented

| Endpoint | Limit |
|---|---:|
| POST /api/inquiries | 5 requests per IP per 15 minutes |
| POST /api/checkout/initialize | 5 requests per IP per 10 minutes |
| POST /api/payments/verify | 12 requests per IP per 5 minutes |

The Redis key uses a SHA-256 hash of the client IP rather than storing the raw address in the key. Vercel Firewall rules are still recommended as an additional edge layer.

### E. CI and validation results

The workflow is .github/workflows/ci.yml. It runs on Node 26.13.1 and checks:

1. npm ci
2. Full dependency audit: npm audit --audit-level=high
3. Production dependency audit: npm audit --omit=dev --audit-level=high
4. Prisma schema validation
5. Prisma client generation
6. Next.js type generation and TypeScript check
7. Production build

The following runs were confirmed successful:

- [PR validation run #45229488492](https://github.com/emaklr/digital-studio/actions/runs/45229488492) — passed on security branch head f33e6b2.
- [Main push run #45229713160](https://github.com/emaklr/digital-studio/actions/runs/45229713160) — passed on merge commit 34a821f.

The local validation report also recorded successful npm ci, Prisma validation/generation, typecheck, production build and clean full/production dependency audits.

**What these results do not prove:** CI did not connect to a real database, apply migrations to production, test a deployed Vercel environment, run a full browser QA pass, or complete Paystack test-mode/live-payment scenarios. A successful build and clean audit are not a penetration test or security certification.

## 3. Current GitHub state

### Source-of-truth branch

- main is the authoritative branch.
- Current head: 34a821f3973bdbe1699eecec6e807f88fb057f1b.
- PR #2 is closed and merged.
- The security branch and original feature branch still exist. They are not the source of truth.

### Important branch warning

The security PR was squash-merged. Its old branch security/production-hardening still points to the pre-squash PR head f33e6b2eb616264f2e96e35610708ec69553c6db; comparing that branch with main shows divergent history even though its delivered code is now present in the squash merge. **Do not merge that old branch again.**

The original feat/abeeb-studio-website branch currently compares to main as **1 commit ahead and 2 behind**. The Prisma 7 files that mattered from it were incorporated into PR #2 and are already on main. Do not force-push, reset, or delete either old branch without first inspecting the diff and confirming it is safe.

For all new work, branch from the current main, e.g. feat/<short-description>, fix/<short-description> or docs/<short-description>, open a PR to main, wait for CI, review the diff, and merge only when consistent.

## 4. Deployment and infrastructure status

### Vercel

As checked on 23 November 2026, the Vercel team did **not** have a digital-studio project linked to this GitHub repository. The team search showed other projects (including Ritewheel and Weemove), but no Abeeb Digital Studio project. Therefore, merging PR #2 did not trigger a Vercel deployment for this site.

Next deployment action: import/link emaklr/digital-studio in the intended Vercel team, use main as the production branch, verify the build settings, and configure the environment variables below. Re-check the Vercel project list after linking; do not assume deployment is configured until an actual deployment is visible and the deployed URL is tested.

### Database

- The app uses PostgreSQL through Prisma 7 and the @prisma/adapter-pg driver adapter.
- DATABASE_URL is required at runtime.
- No database connection test was performed during the local upgrade because no local DATABASE_URL was available.
- No production migration was run as part of the code upgrade.
- Confirm the correct database, credentials, networking/SSL requirements and migration history before executing npm run db:migrate (which runs prisma migrate deploy).

### Upstash Redis

Production needs both server-only variables:

- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN

Without these, the protected public APIs intentionally fail closed in production. Never use a NEXT_PUBLIC_ prefix for the token.

### Site URL and browser origins

Configure:

- NEXT_PUBLIC_SITE_URL: canonical production HTTPS site URL.
- TRUSTED_ORIGINS: comma-separated exact origins allowed to submit the browser forms/payment verification. Do not use wildcard origins.

The checkout callback uses the configured trusted site URL in production, not an untrusted request Host header.

### Email / Resend

For enquiry and payment notifications configure:

- RESEND_API_KEY
- LEAD_NOTIFICATION_EMAIL
- LEAD_FROM_EMAIL

Verify the sender domain and DNS in Resend before testing enquiries. Email delivery currently happens inline in API flows; there is no durable outbox/retry mechanism yet.

### Paystack

The application uses Paystack NGN checkout. The relevant server-side values are:

- PAYSTACK_SECRET_KEY
- PAYSTACK_WEBHOOK_SECRET
- PAYSTACK_WEBHOOK_SECRET_PREVIOUS (only during a signing-secret rotation overlap)
- USD_NGN_RATE
- PAYMENTS_ENABLED
- NEXT_PUBLIC_PAYMENTS_ENABLED

Both payment feature flags are currently documented as false by default. Keep them false until all launch gates have passed. The webhook URL will be:

https://YOUR_DOMAIN/api/paystack/webhook

Configure it in the Paystack dashboard only after the real deployed domain is known. Run test-mode checks before any live payment.

## 5. Known gaps and release blockers

These are unfinished items, not completed work. Track their status here and in [SECURITY-RELEASE-CHECKLIST.md](./SECURITY-RELEASE-CHECKLIST.md).

### P0 — Complete before public production launch

- [ ] Link/import the GitHub repository as a Vercel project; set main as production branch.
- [ ] Provision or select the intended production PostgreSQL database; test a real connection from the deployed environment.
- [ ] Verify Prisma migration history and apply reviewed migrations to the intended database only, with a backup/rollback plan.
- [ ] Configure Upstash Redis REST variables and verify production rate-limited routes return expected responses.
- [ ] Configure canonical site URL and exact trusted origins.
- [ ] Configure Resend API key, verified sender identity and notification recipient; send and receive real test emails.
- [ ] Configure Vercel Firewall rules as an additional layer, tuning them to avoid blocking legitimate customers.
- [ ] Complete a deployed-site smoke test for every page and form on desktop and mobile.
- [ ] Keep both payment flags false until the payment-specific gates below also pass.

### P1 — Payment correctness and reliability (before enabling checkout)

- [ ] Add checkout idempotency. A repeated browser submission/retry must not create multiple independent inquiries, payment records or Paystack sessions for the same intended checkout. Back the design with an appropriate database uniqueness constraint and concurrency-safe handling.
- [ ] Add a durable notification outbox/retry mechanism. Current enquiry email delivery occurs after saving the inquiry; a failed email can leave a saved inquiry without a delivered notification. Payment notification is also attempted inline from lib/mark-payment-paid.ts; failures are logged, not durably retried. Webhook processing waits for that inline attempt, which can delay acknowledgement.
- [ ] Review webhook event processing and persistence ordering for duplicate/concurrent delivery and recovery. The WebhookEvent.eventKey is unique, and the payment transition itself uses a conditional update, but this still needs integration testing.
- [ ] Add automated tests for modern and legacy Paystack signatures, stale timestamps, invalid signatures, key rotation, unknown references, wrong currency/amount/reference, duplicate deliveries and concurrent deliveries.
- [ ] Run end-to-end Paystack test-mode scenarios: successful card/bank transfer, abandoned/pending payment, failed payment, callback verification, webhook delivery, duplicate webhook and retry/reconciliation.
- [ ] Confirm Paystack account/compliance readiness and supported channels for the intended business before considering live mode.
- [ ] Only after all checks pass, make an explicit decision to enable PAYMENTS_ENABLED=true and NEXT_PUBLIC_PAYMENTS_ENABLED=true in the intended environment.

### P2 — Security and product quality follow-through

- [ ] Observe report-only CSP violations on the deployed site. Verify scripts, styles, fonts, images, navigation, forms and payment redirects, then plan a controlled move to enforcing CSP.
- [ ] Confirm production IP header behaviour and test rate limits through the actual Vercel edge/proxy.
- [ ] Review logging/monitoring and alerting for API errors, failed email delivery, rate-limit-store outages and webhook failures.
- [ ] Perform manual security review and a scoped penetration test before treating the site as security-assessed.
- [ ] Review service copy, package scope, delivery timelines and prices before advertising them as final.
- [ ] Test accessibility, responsive layouts, SEO metadata, analytics/consent requirements and contact paths.
- [ ] Add automated route/integration tests and a repeatable release smoke-test checklist.

## 6. Local developer setup and safe Git workflow

Use Node 26.13.1 and the committed lockfile.

~~~bash
# First inspect local edits; do not discard work.
git status --short --branch

# Fetch the latest refs.
git fetch origin

# Move to the authoritative branch and fast-forward only.
git switch main
git pull --ff-only origin main

# Install exactly from the committed lockfile.
npm ci

# Validate and generate the Prisma client.
npm run db:validate
npm run db:generate

# Check types and build.
npm run typecheck
npm run build
~~~

If the working tree is not clean, stop before switching branches. Review the edits and commit them on the correct branch or stash them intentionally; do not use git reset --hard, git clean -fd or force-push to make the working tree appear clean.

For feature work:

~~~bash
git switch -c feat/short-description
# make and test the change
git status --short
git add <specific-files>
git commit -m "Describe the change"
git push -u origin feat/short-description
~~~

Open a PR to main, inspect the full diff, confirm CI passes and then merge. Do not put real secrets in GitHub files, commits, screenshots or chat. Use Vercel environment settings or the relevant provider dashboard for credentials. Keep local .env and .env.local untracked.

**Database caution:** npm run db:migrate deploys migrations. Do not run it against production until the target URL has been explicitly checked, the migration diff/history is reviewed, and a backup/rollback plan exists.

## 7. Context for the next work session

Start by reading this file, then inspect the live repository rather than relying only on this snapshot:

1. Confirm main still points to the latest expected commit and inspect open PRs/workflow status.
2. Check whether a Vercel project has since been linked and whether a production deployment exists.
3. Ask for or inspect only the current deployment configuration needed for the next task; never request or print secret values in chat.
4. Work from a fresh branch off main.
5. Start with P0 infrastructure and deployment readiness. Do not jump to live payments or unrelated redesign while the production foundation is unfinished.
6. Update this handoff and the release checklist as tasks are completed.

### Files worth opening first

- README.md — product direction, pricing model, local setup and environment overview.
- docs/PROJECT-HANDOFF.md — this continuity record.
- docs/SECURITY-RELEASE-CHECKLIST.md — operational security and launch checklist.
- lib/services.ts — source of service/package names and prices.
- lib/payment-config.ts — server-side fixed-package pricing/deposit/FX calculations.
- lib/request-security.ts and lib/rate-limit.ts — request validation, origin and distributed rate limits.
- app/api/inquiries/route.ts, app/api/checkout/initialize/route.ts, app/api/payments/verify/route.ts, app/api/paystack/webhook/route.ts — public API and payment lifecycle.
- lib/mark-payment-paid.ts — payment paid-state transition and notification attempt.
- prisma/schema.prisma, prisma.config.ts, lib/prisma.ts — schema and Prisma 7 database setup.
- .github/workflows/ci.yml — CI checks.

**Operating rule:** keep checkout disabled until the database, Redis, origins, email delivery, webhook handling, idempotency and test-mode scenarios are proven in the deployed environment.
