"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Result =
  | { status: "success"; customerName: string; serviceSlug: string | null; packageName: string | null; depositUsd: number; amountNgnKobo: number }
  | { status: "pending"; message: string };

export default function PaymentResult() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? "";
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    async function verify() {
      setLoading(true);
      setError("");
      if (!reference) {
        setError("We couldn't find a payment reference in the return URL.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "We couldn't verify the payment.");
        if (active) setResult(data as Result);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "We couldn't verify the payment.");
      } finally {
        if (active) setLoading(false);
      }
    }
    verify();
    return () => { active = false; };
  }, [reference, attempt]);

  const naira = result?.status === "success"
    ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(result.amountNgnKobo / 100)
    : "";

  return (
    <section className="payment-result shell">
      <div className="payment-result-card">
        {loading ? (
          <><span className="payment-result-symbol">◌</span><span className="eyebrow">Verifying payment</span><h1>Checking your<br/><span className="gradient-text">checkout result.</span></h1><p>We’re confirming the transaction directly with Paystack. Please keep this page open.</p></>
        ) : result?.status === "success" ? (
          <><span className="payment-result-symbol success-symbol">✓</span><span className="eyebrow">Payment confirmed</span><h1>You’re one step<br/><span className="gradient-text">closer to launch.</span></h1><p>Thanks {result.customerName}. Your deposit has been verified and the studio has been notified.</p><div className="payment-summary"><div><small>Package</small><b>{result.packageName}</b></div><div><small>Deposit paid</small><b>${result.depositUsd} USD</b></div><div><small>Charged in NGN</small><b>{naira}</b></div><div><small>Reference</small><b className="reference-value">{reference}</b></div></div></>
        ) : result?.status === "pending" ? (
          <><span className="payment-result-symbol pending-symbol">…</span><span className="eyebrow">Payment not confirmed yet</span><h1>We’re still<br/><span className="gradient-text">checking.</span></h1><p>{result.message} This can happen while your bank or card provider completes the payment.</p><button className="button button-primary" onClick={() => setAttempt(value => value + 1)}>Check payment again ↻</button></>
        ) : (
          <><span className="payment-result-symbol pending-symbol">!</span><span className="eyebrow">Verification needs attention</span><h1>We couldn't<br/><span className="gradient-text">confirm that yet.</span></h1><p>{error || "Please try again or contact the studio with your transaction reference."}</p><button className="button button-primary" onClick={() => setAttempt(value => value + 1)}>Try verification again ↻</button></>
        )}
      </div>
    </section>
  );
}
