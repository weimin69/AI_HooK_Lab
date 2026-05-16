/**
 * In-memory rate limiter.
 *
 * Caveat for Vercel serverless: each cold start gets a fresh Map.
 * This is "best effort" protection for the MVP. For production scale,
 * swap to Vercel KV or Upstash Redis.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    // Fresh window
    const resetAt = now + WINDOW_MS;
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetMs: WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetMs: entry.resetAt - now };
}

// Periodic cleanup to prevent memory leak (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of store) {
      if (now > val.resetAt + 60_000) store.delete(key);
    }
  }, 300_000);
}
