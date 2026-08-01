const env = require('../config/env');

// Last-resort middleware — every thrown/next(err) error in the app ends
// up here. Keeps error response shape consistent everywhere and hides
// internal error details in production.

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  if (!isOperational) {
    // Unexpected/programmer error — log full detail server-side.
    console.error('UNEXPECTED ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'Something went wrong. Please try again.',
    errors: err.errors || [],
    ...(env.nodeEnv === 'development' && !isOperational ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
