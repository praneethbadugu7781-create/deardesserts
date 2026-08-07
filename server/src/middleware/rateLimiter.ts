import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const attemptsMap = new Map<string, RateLimitRecord>();

/**
 * In-memory Sliding Window Rate Limiter for Auth Routes
 * Prevents brute-force attacks on login and password reset endpoints.
 */
export function createRateLimiter(maxAttempts = 10, windowMs = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const key = `${req.path}:${clientIp}`;
    const now = Date.now();

    const record = attemptsMap.get(key);

    if (!record || now > record.resetTime) {
      attemptsMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxAttempts) {
      const remainingSeconds = Math.ceil((record.resetTime - now) / 1000);
      console.warn(`⚠️ [SECURITY] Rate limit exceeded for IP ${clientIp} on endpoint ${req.path}`);
      return res.status(429).json({
        error: `Too many attempts. Please wait ${remainingSeconds} seconds before trying again.`,
      });
    }

    record.count += 1;
    next();
  };
}
