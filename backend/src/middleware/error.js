// Centralized error handler — last-resort middleware
export function notFound(req, res) {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Multer file-too-large
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large', detail: err.field || 'file' });
  }
  // Multer unexpected file
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field', detail: err.field });
  }
  // Custom thrown errors with status
  const status = err.status || err.statusCode || 500;
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Something went wrong';

  if (status >= 500) {
    console.error('🔥 Server error:', err);
  }
  res.status(status).json({ error: message, ...(err.detail ? { detail: err.detail } : {}) });
}

// Wrap async handlers so rejections hit the error middleware
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
