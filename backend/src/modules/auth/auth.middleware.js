const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const prisma = require('../../config/database');

// Verifies the access token from the Authorization header and attaches
// { id, roleId, roleName } to req.user for downstream handlers.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = jwt.verify(token, env.jwt.accessSecret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('Account not found or deactivated', 401);
    }

    req.user = { id: user.id, roleId: user.roleId, roleName: user.role.name };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('Invalid or expired access token', 401));
  }
}

// Usage: router.get('/admin/x', authenticate, requireRole('admin'), handler)
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.roleName)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
