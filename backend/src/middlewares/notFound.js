const AppError = require('../utils/AppError');

// Catches any request that didn't match a route. Placed after all
// route mounts in app.js, before the error handler.
function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

module.exports = notFound;
