import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,  // 60 uploads/min — generous because each large APK upload is one request
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many uploads, please slow down.' },
});
