// In-memory rate limiter by IP
// Resets on server restart (Vercel cold starts). For production scale, use Redis.

const store = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean old entries every 5 min

// Periodic cleanup to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now - entry.start > WINDOW_MS * 2) store.delete(key);
    }
  }, CLEANUP_INTERVAL);
}

/**
 * @param {Request} request
 * @param {number} maxRequests - max requests per window
 * @returns {{ allowed: boolean, remaining: number }}
 */
export function checkRateLimit(request, maxRequests = 30) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.start > WINDOW_MS) {
    store.set(ip, { count: 1, start: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxRequests - entry.count };
}
