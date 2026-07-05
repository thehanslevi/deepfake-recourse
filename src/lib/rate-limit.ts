import "server-only";

// Per-IP rate limiting for the public AI routes. Each call to /api/triage and
// /api/assembly spends real Anthropic credits, so unauthenticated traffic is
// capped. In-memory and per-instance, matching the storage architecture; a
// shared store (Upstash/Redis) replaces this when the database lands. That
// means the cap is per warm serverless instance, which is imperfect but
// removes the trivial single-source abuse case.

type Window = { count: number; resetAt: number };

const globalForRl = globalThis as unknown as {
  __dfrRateLimit?: Map<string, Window>;
};

function getStore(): Map<string, Window> {
  if (!globalForRl.__dfrRateLimit) {
    globalForRl.__dfrRateLimit = new Map();
  }
  return globalForRl.__dfrRateLimit;
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

// Fixed-window limiter: `limit` calls per `windowMs` per key.
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const store = getStore();
  const now = Date.now();

  // Opportunistic cleanup so the map does not grow unbounded.
  if (store.size > 5000) {
    for (const [k, w] of store) {
      if (w.resetAt <= now) store.delete(k);
    }
  }

  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

// Client IP from proxy headers (Vercel sets x-forwarded-for).
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
