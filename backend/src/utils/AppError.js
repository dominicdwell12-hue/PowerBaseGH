// Custom error class so controllers/services can throw a single error
// type carrying an HTTP status code. The centralized error handler
// middleware knows how to translate this into the standard response
// shape, instead of every route having its own try/catch formatting.

class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
