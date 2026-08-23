const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const { generateAccessToken, generateRefreshToken } = require('../../utils/generateToken');
const { sendPasswordResetEmail } = require('../../utils/email');

const SALT_ROUNDS = 10;
const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

// The raw token is emailed to the user and never stored — only its hash
// is persisted, the same pattern already used for refresh tokens. A plain
// SHA-256 digest (not bcrypt) is fine here since the input is already a
// high-entropy random value, not a low-entropy user-chosen secret.
function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Fields safe to send back to the client — never the password hash.
function toPublicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role?.name,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

async function register({ firstName, lastName, email, phone, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { firstName, lastName, email, phone, passwordHash },
    include: { role: true },
  });

  // Every new customer gets an empty cart ready to use.
  await prisma.cart.create({ data: { userId: user.id } });

  return issueTokens(user);
}

async function verifyCredentials(email, password) {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    // Same message for both cases — don't reveal whether the email exists.
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated. Contact support.', 403);
  }

  return user;
}

async function login({ email, password }) {
  const user = await verifyCredentials(email, password);
  return issueTokens(user);
}

async function adminLogin({ email, password }) {
  // Check credentials and role *before* issuing/persisting anything —
  // issuing tokens first (as this used to) would overwrite the user's
  // refreshTokenHash the moment their password checked out, silently
  // invalidating any existing storefront session as a side effect of a
  // customer mistakenly hitting the admin login form.
  const user = await verifyCredentials(email, password);
  if (user.role?.name !== 'admin') {
    throw new AppError('You are not authorized to access the admin dashboard', 403);
  }
  return issueTokens(user);
}

async function issueTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store a hash of the refresh token so it can be invalidated on logout,
  // without needing a separate sessions table for the MVP.
  const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash },
  });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new AppError('Refresh token missing', 401);
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
  } catch {
    throw new AppError('Invalid or expired refresh token, please log in again', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } });
  if (!user || !user.refreshTokenHash) {
    throw new AppError('Invalid or expired refresh token, please log in again', 401);
  }

  const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!matches) {
    throw new AppError('Invalid or expired refresh token, please log in again', 401);
  }

  const accessToken = generateAccessToken(user);
  return { accessToken };
}

async function logout(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: null },
  });
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always behave the same way whether or not the account exists, so a
  // caller can't use this endpoint to discover which emails are registered.
  if (!user || !user.isActive) {
    return;
  }

  const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
  const resetPasswordTokenHash = hashResetToken(rawToken);
  const resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordTokenHash, resetPasswordExpiresAt },
  });

  const resetUrl = `${env.resetPasswordUrl}?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
  await sendPasswordResetEmail(user.email, resetUrl);
}

async function resetPassword({ email, token, newPassword }) {
  const genericError = new AppError('This reset link is invalid or has expired. Please request a new one.', 400);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.resetPasswordTokenHash || !user.resetPasswordExpiresAt) {
    throw genericError;
  }

  if (user.resetPasswordExpiresAt.getTime() < Date.now()) {
    throw genericError;
  }

  const tokenHash = hashResetToken(token);
  if (tokenHash !== user.resetPasswordTokenHash) {
    throw genericError;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordTokenHash: null,
      resetPasswordExpiresAt: null,
      // Resetting the password invalidates any existing session — force
      // re-login everywhere, in case the reset was triggered by someone
      // who had gotten hold of the account.
      refreshTokenHash: null,
    },
  });
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return toPublicUser(user);
}

module.exports = {
  register,
  login,
  adminLogin,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  toPublicUser,
};
