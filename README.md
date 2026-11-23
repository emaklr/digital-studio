# Abeeb Digital Studio

International digital solutions studio offering websites, e-commerce, web applications, AI integrations and business automation.

## Direction
- Visual identity: dark premium with bold creative accents.
- Displayed starting prices: USD.
- Target market: international businesses.
- Sales model: productized service packages plus custom project enquiries.
- Checkout currency for initial launch: NGN, with a displayed/quoted USD deposit converted using the studio's configured USD/NGN rate.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS v4
- PostgreSQL + Prisma
- Paystack NGN checkout
- Resend email notifications
- Vercel deployment target

## Local setup
```bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma migrate deploy
npm run dev
```

## Environment
- `DATABASE_URL`: PostgreSQL connection string.
- `RESEND_API_KEY`, `LEAD_NOTIFICATION_EMAIL`, `LEAD_FROM_EMAIL`: enquiry and payment notifications.
- `PAYSTACK_SECRET_KEY`: Paystack test/live secret key.
- `PAYSTACK_WEBHOOK_SECRET`: current Paystack webhook signing secret (the `whsec_...` key).
- `USD_NGN_RATE`: studio-managed NGN per USD quote rate. Set it before enabling payments and keep it current.
- `NEXT_PUBLIC_SITE_URL`: canonical deployed HTTPS site URL.
- `PAYMENTS_ENABLED` and `NEXT_PUBLIC_PAYMENTS_ENABLED`: both must be set to `true` to expose and accept live checkout; leave false until final approval.

## Provisional deposit policy
The current code includes draft deposit assumptions, not approved commercial terms:
- Websites: 50%
- E-commerce: 60%
- Web applications: 40%
- Business automation: 70%
- AI solutions: 60%

Review these percentages and the studio's conversion rate before setting the payment flags to true. The server computes all package prices, deposits and NGN amounts; it never trusts a price or amount sent by the browser.

## Payment lifecycle
1. The customer chooses a package and submits the project brief.
2. The server looks up the canonical package price and deposit policy.
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
- The deposits above are draft assumptions and should be approved before launch.
- FixTrust and Ritewheel are labelled as studio-owned products in development, not completed client case studies.
