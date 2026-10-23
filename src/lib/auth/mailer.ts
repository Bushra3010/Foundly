import "server-only";

export type Email = { to: string; subject: string; text: string; html?: string };

/**
 * Replaceable mail adapter. Without a configured provider, messages are
 * logged to the server console — acceptable only in development.
 */
export async function sendEmail({ to, subject, text, html }: Email): Promise<{ delivered: boolean }> {
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, text, ...(html ? { html } : {}) }),
    });
    if (!res.ok) throw new Error(`Mail provider returned ${res.status}`);
    return { delivered: true };
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("No mail provider configured. Set RESEND_API_KEY and MAIL_FROM.");
  }
  console.info(`\n[dev mailer] To: ${to}\nSubject: ${subject}\n\n${text}\n`);
  return { delivered: false };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendPasswordResetEmail({ to, link }: { to: string; link: string }) {
  const safe = escapeHtml(link);
  return sendEmail({
    to,
    subject: "Reset your Foundly password",
    text: `Someone asked to reset the password for your Foundly account.\n\nChoose a new password here. The link works once and expires in 15 minutes:\n${link}\n\nIf this wasn't you, ignore this email. Your password stays the same.`,
    html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#20221e">
<h1 style="font-size:22px;margin:0 0 12px">Reset your password</h1>
<p style="font-size:15px;line-height:1.6;color:#55574f;margin:0 0 24px">Someone asked to reset the password for your Foundly account. The link works once and expires in 15 minutes.</p>
<p style="margin:0 0 24px"><a href="${safe}" style="display:inline-block;background:#20221e;color:#ffffff;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:999px">Choose a new password</a></p>
<p style="font-size:13px;line-height:1.6;color:#7a7d74;margin:0">If this wasn't you, ignore this email. Your password stays the same.</p>
</div>`,
  });
}

export function safeNextPath(next: string | null | undefined): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : null;
}
