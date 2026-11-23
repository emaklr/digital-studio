CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "website" TEXT,
    "kind" TEXT NOT NULL,
    "serviceSlug" TEXT,
    "packageName" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amountNgnKobo" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "packagePriceUsd" INTEGER NOT NULL,
    "depositPercent" INTEGER NOT NULL,
    "depositUsd" INTEGER NOT NULL,
    "usdNgnRate" DECIMAL(14,4) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INITIALIZING',
    "authorizationUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");
CREATE UNIQUE INDEX "WebhookEvent_eventKey_key" ON "WebhookEvent"("eventKey");
CREATE INDEX "Payment_inquiryId_idx" ON "Payment"("inquiryId");
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");
CREATE INDEX "WebhookEvent_reference_idx" ON "WebhookEvent"("reference");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_inquiryId_fkey"
FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
