# Abeeb Digital Studio

An international digital solutions studio offering websites, e-commerce, web applications, AI integrations and business automation.

## Direction
- Visual identity: dark premium with bold creative accents.
- Primary displayed currency: USD starting prices.
- Target market: international businesses.
- Sales model: bookable service packages plus custom project enquiries.
- Deposits: vary by service and are confirmed after scope and delivery dates are agreed.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS v4
- Resend HTTP API for enquiry notifications
- Vercel deployment target

## Local setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

Configure these environment variables to enable enquiry email delivery:
- `RESEND_API_KEY`
- `LEAD_NOTIFICATION_EMAIL`
- `LEAD_FROM_EMAIL` (must use a sender/domain verified in Resend)
- `NEXT_PUBLIC_SITE_URL` (optional; set the final public URL before launch)

## Current implementation
- Public pages: home, services, service details, work, about and contact.
- Lead journeys: package booking request and custom project brief.
- API: validates core enquiry fields and sends notifications through Resend when configured.
- Payment checkout: **not enabled yet**. A payment provider, accepted currencies, settlement path and exact deposit rules must be confirmed before enabling live deposits.
- Portfolio: FixTrust and Ritewheel are labelled as studio-owned products in development, not completed client case studies.
- Pricing shown is preliminary starting-price guidance and should be reviewed before public launch.
