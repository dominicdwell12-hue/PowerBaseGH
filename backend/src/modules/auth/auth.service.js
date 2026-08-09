const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const { generateAccessToken, generateRefreshToken } = require('../../utils/generateToken');

const SALT_ROUNDS = 10;

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
  getProfile,
  toPublicUser,
};
