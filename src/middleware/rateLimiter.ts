import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  limit: 10,
  message: {
    error: 'Too many requests, please try again later',
  },
});
