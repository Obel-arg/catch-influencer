import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = (options?: {
  windowMs?: number;
  max?: number;
}) => {
  return rateLimit({
    windowMs: options?.windowMs || 60000, // 1 minute default
    max: options?.max || 30, // 30 requests default
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};
