import type { Config } from "@netlify/functions";

// Netlify replacement for the Vercel cron in vercel.json: billing transitions, due deletions, weekly summaries.
const run = async () => {
  const base = process.env.URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.error("cron-daily: URL or CRON_SECRET is not set");
    return new Response("not configured", { status: 500 });
  }
  const res = await fetch(`${base}/api/cron/daily`, { headers: { Authorization: `Bearer ${secret}` } });
  console.log("cron-daily:", res.status, (await res.text()).slice(0, 300));
  return new Response(null, { status: res.ok ? 204 : 502 });
};

export default run;

export const config: Config = { schedule: "30 1 * * *" };
