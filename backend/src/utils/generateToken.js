const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Access token: short-lived, sent in the Authorization header on every request.
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, roleId: user.roleId },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
}

// Refresh token: long-lived, stored as an httpOnly cookie. Only used to
// obtain a new access token via POST /auth/refresh.
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );
}

module.exports = { generateAccessToken, generateRefreshToken };
