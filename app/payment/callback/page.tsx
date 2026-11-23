import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentResult from "@/components/payment-result";

export const metadata: Metadata = {
  title: "Payment status",
  robots: { index: false, follow: false },
};

export default function PaymentCallbackPage() {
  return <div className="page-shell"><Suspense fallback={<section className="payment-result shell"><div className="payment-result-card"><span className="eyebrow">Loading</span><h1>Checking your payment…</h1></div></section>}><PaymentResult /></Suspense></div>;
}
