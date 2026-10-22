import "server-only";

export type SignInEmail = { to: string; link: string };

/**
 * Replaceable mail adapter. Without a configured provider the link is logged
 * to the server console, which is only acceptable in development.
 */
export async function sendSignInEmail({ to, link }: SignInEmail): Promise<{ delivered: boolean }> {
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to,
        subject: "Your sign-in link",
        text: `Use this link to sign in. It expires in 15 minutes and works once.\n\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
      }),
    });
    if (!res.ok) throw new Error(`Mail provider returned ${res.status}`);
    return { delivered: true };
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("No mail provider configured. Set RESEND_API_KEY and MAIL_FROM.");
  }
  console.info(`\n[dev mailer] Sign-in link for ${to}:\n${link}\n`);
  return { delivered: false };
}
