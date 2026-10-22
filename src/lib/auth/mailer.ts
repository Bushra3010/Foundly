import "server-only";

export type Email = { to: string; subject: string; text: string };

/**
 * Replaceable mail adapter. Without a configured provider, messages are
 * logged to the server console — acceptable only in development.
 */
export async function sendEmail({ to, subject, text }: Email): Promise<{ delivered: boolean }> {
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, text }),
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

export async function sendSignInEmail({ to, link }: { to: string; link: string }) {
  return sendEmail({
    to,
    subject: "Your sign-in link",
    text: `Use this link to sign in. It expires in 15 minutes and works once.\n\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
  });
}

export function safeNextPath(next: string | null | undefined): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : null;
}
