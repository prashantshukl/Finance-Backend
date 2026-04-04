const rateBuckets = new Map();

const rateLimit = ({ windowMs = 60_000, max = 60 } = {}) => (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.connection?.remoteAddress || "unknown";
  const entry = rateBuckets.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  rateBuckets.set(key, entry);

  res.setHeader("X-RateLimit-Limit", String(max));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(max - entry.count, 0)));
  res.setHeader("X-RateLimit-Reset", String(entry.resetAt));

  if (entry.count > max) {
    return res.status(429).json({ message: "Rate limit exceeded." });
  }

  return next();
};

export default rateLimit;
