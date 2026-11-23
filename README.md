# Abeeb Digital Studio

International digital solutions studio offering websites, e-commerce, web applications, AI integrations and business automation.

## Direction
- Visual identity: dark premium with bold creative accents.
- Displayed starting prices: USD.
- Target market: international businesses.
- Sales model: fixed service packages plus custom project enquiries.
- Checkout currency for initial launch: NGN, with the fixed-package deposit converted using the studio's configured USD/NGN rate.

## Payment terms
- **Fixed packages:** 50% upfront to start the work; the remaining 50% is due before final handover.
- **Custom projects:** quote after discovery and scope definition. The proposal documents the deliverables, timeline, kickoff deposit and milestone payment schedule. Later payments are tied to agreed, reviewable deliverables rather than arbitrary dates.
- The number of milestones and each payment percentage are agreed per project before work begins. Custom projects do not use the instant fixed-package checkout.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS v4
- PostgreSQL + Prisma
- Paystack NGN checkout
- Resend email notifications
- Vercel deployment target

## Local setup
```bash
npm ci
cp .env.example .env.local
npm run db:validate
npm run db:generate
npm run dev
```

Prisma 7 uses the PostgreSQL driver adapter configured in `lib/prisma.ts` and the schema/migration configuration in `prisma.config.ts`. The generated Prisma client is written to `generated/prisma` and is created during installation; it is intentionally ignored by Git.

Run `npm run db:migrate` only after confirming `DATABASE_URL` points to the intended development database. Never use the local setup instructions to apply migrations to production without a reviewed deployment plan.


## Environment
- `DATABASE_URL`: PostgreSQL connection string.
- `RESEND_API_KEY`, `LEAD_NOTIFICATION_EMAIL`, `LEAD_FROM_EMAIL`: enquiry and payment notifications.
- `PAYSTACK_SECRET_KEY`: Paystack test/live secret key.
- `PAYSTACK_WEBHOOK_SECRET`: Paystack webhook signing secret.
- `USD_NGN_RATE`: studio-managed NGN per USD quote rate. Set it before enabling payments and keep it current.
- `NEXT_PUBLIC_SITE_URL`: canonical deployed HTTPS site URL.
- `PAYMENTS_ENABLED` and `NEXT_PUBLIC_PAYMENTS_ENABLED`: both must be set to `true` to expose and accept checkout; leave false until payment configuration and end-to-end tests are complete.

## Fixed-package deposit calculation
All fixed service packages use a 50% deposit. The server computes the canonical package price, deposit and NGN amount; it never trusts a price or amount sent by the browser. The remaining 50% is invoiced separately before final handover.

## Payment lifecycle
1. The customer chooses a fixed package and submits the project brief.
2. The server looks up the canonical package price and calculates the approved 50% deposit.
3. The server stores the inquiry/payment record and initializes the Paystack transaction in NGN.
4. Paystack redirects the customer to the secure checkout page.
5. The callback verifies the reference, status, currency and exact amount through Paystack's API.
6. The signed Paystack webhook independently verifies the event and marks the payment paid once.

Set the webhook URL in Paystack Dashboard to:
`https://YOUR_DOMAIN/api/paystack/webhook`

Enable international payments in Paystack Dashboard after the account's compliance review. Nigeria-based merchants can accept international cards and settle in NGN by default; USD payout requires a Nigerian USD domiciliary account.

## Operational notes
- The USD/NGN rate is intentionally manually managed; do not treat it as a live market rate.
- Payment checkout is disabled by default.
- Custom-project milestone terms must be written into the approved proposal before kickoff.
- FixTrust and Ritewheel are labelled as studio-owned products in development, not completed client case studies.


## Application security configuration

### Required production environment
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: server-only Upstash Redis REST credentials used by distributed rate limits. Do not expose either with a `NEXT_PUBLIC_` prefix.
- `TRUSTED_ORIGINS`: comma-separated canonical HTTPS origins allowed to submit browser forms and request payment verification. Include the production site origin and any explicitly trusted preview origins.
- `NEXT_PUBLIC_SITE_URL`: canonical HTTPS site URL used for payment callbacks. Production checkout does not fall back to a request Host header.
- `PAYSTACK_WEBHOOK_SECRET_PREVIOUS`: optional previous webhook signing secret during a configured Paystack signing-secret rotation. Remove it after the overlap period ends.

The public enquiry, checkout initialization and payment verification APIs fail closed in production when Upstash rate-limiting configuration is missing or unavailable. Local development can run without Upstash configuration.

### Rate limits
- Enquiries: 5 requests per IP per 15 minutes.
- Checkout initialization: 5 requests per IP per 10 minutes.
- Payment verification: 12 requests per IP per 5 minutes.

The implementation uses an atomic Redis Lua script through the Upstash REST API. Add a Vercel Firewall rule as a second layer of protection. For the Paystack webhook, restrict requests to Paystack's published webhook IP addresses where the hosting firewall supports it; do not apply browser-origin checks to webhook traffic.

### Browser security headers
The application sends HSTS, content-type, frame, referrer and permissions headers. A Content Security Policy is initially in report-only mode and must be observed against production pages before enforcement. Do not switch it to enforcing mode until all legitimate scripts, images, styles and payment flows have been verified.

## Project documentation

- [Project handoff and next steps](docs/PROJECT-HANDOFF.md) — current project status, completed work, branch/deployment state, known gaps and the continuation guide for future work sessions.
- [Security release checklist](docs/SECURITY-RELEASE-CHECKLIST.md) — production environment configuration, security operations and the remaining launch gates.
