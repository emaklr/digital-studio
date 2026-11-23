import { prisma } from "@/lib/prisma";
import { sendStudioEmail, escapeHtml } from "@/lib/notifications";

export async function markPaymentPaid(reference: string) {
  const payment = await prisma.payment.findUnique({ where: { reference }, include: { inquiry: true } });
  if (!payment) return { found: false, updated: false };

  const update = await prisma.payment.updateMany({
    where: { id: payment.id, status: { not: "PAID" } },
    data: { status: "PAID", paidAt: new Date() },
  });

  if (update.count === 1) {
    const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(payment.amountNgnKobo / 100);
    try {
      await sendStudioEmail({
        subject: `[Abeeb Studio] Deposit paid: ${payment.inquiry.name} — ${payment.inquiry.packageName ?? "Service"}`,
        replyTo: payment.inquiry.email,
        html: `<h2>Deposit payment confirmed</h2><p><b>${escapeHtml(payment.inquiry.name)}</b> (${escapeHtml(payment.inquiry.email)}) has paid a project deposit.</p><p>Service: ${escapeHtml(payment.inquiry.serviceSlug ?? "")}<br/>Package: ${escapeHtml(payment.inquiry.packageName ?? "")}<br/>Package price: $${payment.packagePriceUsd} USD<br/>Deposit: $${payment.depositUsd} USD (${payment.depositPercent}%)<br/>NGN charged: ${naira}<br/>Reference: ${reference}</p><p>Project brief:</p><p>${escapeHtml(payment.inquiry.details)}</p>`,
      });
    } catch (error) {
      console.error("Paid-order notification failed", error);
    }
  }
  return { found: true, updated: update.count === 1 };
}