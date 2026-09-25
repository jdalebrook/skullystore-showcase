type Bucket = { count: number; resetAt: number };

// En memoria: suficiente para un único proceso/VPS de bajo tráfico. Se
// reinicia si el proceso reinicia y no se comparte entre varias instancias
// -- si en el futuro hay más de un contenedor de la app, esto debe pasar a
// un almacén compartido (ej. Redis).
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}
