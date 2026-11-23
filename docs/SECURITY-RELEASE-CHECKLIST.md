# Security release checklist

This checklist separates code protections from the deployment configuration required to activate them.

## Required environment configuration

Configure these values in the Vercel project settings for each environment that should accept enquiries.

| Variable | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `RESEND_API_KEY` | Server-side Resend API credential | Yes for enquiry notifications |
| `LEAD_NOTIFICATION_EMAIL` | Studio notification recipient | Yes for enquiry notifications |
| `LEAD_FROM_EMAIL` | Verified sender identity | Yes for enquiry notifications |
| `UPSTASH_REDIS_REST_URL` | Upstash HTTPS REST endpoint | Yes in production |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash server-side token | Yes in production |
| `NEXT_PUBLIC_SITE_URL` | Canonical HTTPS site URL | Yes in production |
| `TRUSTED_ORIGINS` | Comma-separated browser origins | Yes in production |
| `PAYSTACK_SECRET_KEY` | Paystack server-side secret | Only when payments are configured |
| `PAYSTACK_WEBHOOK_SECRET` | Paystack webhook signing secret | Only when modern webhooks are configured |
| `PAYSTACK_WEBHOOK_SECRET_PREVIOUS` | Previous signing secret during rotation | Optional |
| `USD_NGN_RATE` | Studio-managed NGN per USD rate | Only when payments are configured |

Never prefix Redis tokens, Paystack secrets, database credentials or Resend API keys with `NEXT_PUBLIC_`.

The rate-limited public APIs intentionally return 503 in production if Upstash is not configured or cannot be reached. Configure the shared store before enabling production enquiry or checkout flows.

## Rate limiting

Application-level Upstash limits currently are:

- `POST /api/inquiries`: 5 requests per IP per 15 minutes.
- `POST /api/checkout/initialize`: 5 requests per IP per 10 minutes.
- `POST /api/payments/verify`: 12 requests per IP per 5 minutes.

The counters use an atomic Redis script. The client address is taken from the hosting proxy's IP headers and stored as a SHA-256 hash in the Redis key; raw IPs are not used as Redis key values.

Also configure a Vercel Firewall rate-limit rule as an outer layer. Observe legitimate traffic first and tune limits before enforcing broad blocks. The Paystack webhook is intentionally excluded from browser-origin checks and application rate limits so provider retries are not accidentally rejected.

## Browser origin allowlist

Set `TRUSTED_ORIGINS` to exact origins, separated by commas. Include:
- The canonical production origin, e.g. `https://www.example.com`.
- Only preview origins that are intentionally allowed to submit enquiries.

Do not add wildcard origins. Keep the canonical URL in `NEXT_PUBLIC_SITE_URL`; the checkout callback no longer derives its production host from an incoming request.

## Paystack webhook configuration

1. Configure the production webhook URL as `https://YOUR_DOMAIN/api/paystack/webhook`.
2. Generate and configure the modern webhook signing secret in the Paystack Dashboard.
3. Keep the Paystack secret key available while migrating from the legacy `x-paystack-signature` header.
4. Confirm live webhook deliveries include `Paystack-Signature` and verify successful signatures before removing legacy verification.
5. During signing-secret rotation, set the previous secret in `PAYSTACK_WEBHOOK_SECRET_PREVIOUS` for the overlap period; remove it after the old secret expires.
6. Where supported by the host firewall, allowlist Paystack's published webhook IPs: `52.31.139.75`, `52.49.173.169`, and `52.214.14.220`.
7. Test a real test-mode payment, webhook signature, duplicate delivery and transaction reconciliation before enabling live checkout.

Do not rate-limit the webhook with the same browser/API rules. Paystack retries failed webhook deliveries and expects a timely 200 acknowledgement. See the official [Paystack webhook documentation](https://paystack.com/docs/payments/webhooks/).

## Security headers

The application sends:
- HSTS (only browsers receiving the header over HTTPS will honor it).
- X-Content-Type-Options.
- X-Frame-Options.
- Referrer-Policy.
- Permissions-Policy.
- A Content Security Policy in report-only mode.

Observe the report-only CSP on the actual deployed site. Verify navigation, checkout redirects, images, fonts, CSS and any future third-party analytics before changing it to enforcing mode.

## Current launch blockers

The following items remain outside this GitHub code-only pass and must be resolved before live checkout:

1. Create/link the `emaklr/digital-studio` Vercel project, connect the GitHub repository and use `main` as the production branch. This was not linked when last checked on 23 November 2026.
2. Configure and test the intended PostgreSQL database connection from the deployed environment. The Prisma 7.10.1 upgrade, Prisma config, adapter and lockfile are now merged into `main`, and the PR and main CI runs passed. No real database connection test or production migration was performed during that upgrade.
3. Configure and verify production Upstash Redis REST credentials, `NEXT_PUBLIC_SITE_URL`, exact `TRUSTED_ORIGINS`, and the required Vercel environment values.
4. Configure Resend credentials and a verified sender identity; verify actual delivery to the studio notification inbox.
5. Add a durable notification outbox/retry mechanism. Payment and enquiry emails are currently sent inline; a provider timeout can delay webhook acknowledgement or leave a saved enquiry without a delivered notification.
6. Add checkout idempotency backed by a suitable database uniqueness constraint and concurrency-safe handling so repeated submissions cannot create multiple payment sessions for one intended checkout.
7. Review webhook event processing and test duplicate/concurrent delivery and recovery. The payment transition is conditionally idempotent, but integration tests are still required.
8. Run automated and end-to-end Paystack test-mode scenarios, including valid/invalid signatures, stale timestamps, key rotation, amount/currency/reference mismatches, duplicate webhooks and retries.
9. Configure Vercel Firewall rules and observe report-only CSP violations against the real deployed site before considering CSP enforcement.
10. Complete deployed-site smoke tests for all pages, enquiry flows and payment flows before any public launch.
Keep `PAYMENTS_ENABLED` and `NEXT_PUBLIC_PAYMENTS_ENABLED` set to `false` until the above tests and manual checks pass.

A clean dependency audit or a successful production build alone is not a security certification or a penetration test.


## Prisma 7 and Node runtime

- Local and CI runtime: Node.js 26.13.1, with npm 11.20.0.
- Prisma CLI and Prisma Client: 7.10.1.
- PostgreSQL driver adapter: `@prisma/adapter-pg` 7.10.1.
- Prisma client generation output: `generated/prisma` (ignored; regenerated during install/build).
- `prisma.config.ts` loads local environment files for CLI usage and defines the schema and migrations paths.
- The dependency lockfile pins `deepmerge-ts` 8.0.2 and applies a scoped Prisma Config override to `effect` 3.22.5.

The local validation report recorded clean full and production dependency audits, Prisma schema validation, client generation, TypeScript checking and production build. CI repeats those checks against the committed lockfile.

No database connection test was run during the local upgrade because no local `DATABASE_URL` was available. A successful Prisma schema validation is not evidence that the deployed database connection works.
