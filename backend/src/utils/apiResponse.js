// Standardized response shape used across every endpoint, so the
// frontend can rely on a single consistent contract:
//   { success, data, message }  or  { success, message, errors }

function success(res, { data = null, message = 'Success', statusCode = 200 } = {}) {
  return res.status(statusCode).json({ success: true, data, message });
}

function error(res, { message = 'Something went wrong', statusCode = 500, errors = [] } = {}) {
  return res.status(statusCode).json({ success: false, message, errors });
}

module.exports = { success, error };
