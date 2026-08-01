const AppError = require('../utils/AppError');

// Wraps a Zod schema into Express middleware. Validates req.body (or
// req.query/req.params if specified) before the request ever reaches a
// controller — controllers can then trust their input is well-formed.
function validateRequest(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Validation failed', 400, errors));
    }

    req[source] = result.data;
    next();
  };
}

module.exports = validateRequest;
