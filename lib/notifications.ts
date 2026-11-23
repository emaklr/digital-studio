type StudioEmail = { subject: string; html: string; replyTo?: string };

export async function sendStudioEmail({ subject, html, replyTo }: StudioEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.LEAD_NOTIFICATION_EMAIL;
  const sender = process.env.LEAD_FROM_EMAIL;
  if (!apiKey || !recipient || !sender) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html,
    }),
    cache: "no-store",
  });
  return response.ok;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char] ?? char);
}
