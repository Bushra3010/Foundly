/** fetch with bounded retries for 429/5xx, honouring Retry-After. */
export async function fetchWithRetry(url: string, init: RequestInit, signal: AbortSignal, retries = 2): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { ...init, signal });
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const wait = Math.min(Number(res.headers.get("retry-after")) * 1000 || 1000 * 2 ** attempt, 15_000);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    return res;
  }
}

export function httpStatusToResult(status: number): "unavailable" | "error" {
  return status === 429 || status >= 500 ? "unavailable" : "error";
}
