const authService = require('./auth.service');
const { success } = require('../../utils/apiResponse');

// Refresh token is set as an httpOnly cookie so client-side JS can never
// read it (mitigates XSS token theft). Access token goes in the JSON
// response body — the frontend keeps it in memory and attaches it to
// the Authorization header on each request.
//
// sameSite must be 'none' in production: the storefront and API live on
// different subdomains (powerbase-storefront.onrender.com vs
// powerbasegh.onrender.com), which browsers treat as separate "sites".
// 'lax' cookies are withheld from cross-site XHR/fetch calls — including
// the silent refresh this app makes on every page load — so with 'lax'
// the cookie would round-trip correctly on login but silently fail to
// be sent back on the very next visit, making every returning user look
// logged out until they signed in again. 'none' requires 'secure: true',
// which is fine since production is always served over HTTPS; locally
// (http://localhost, genuinely same-site) 'lax' still works as before.
const isProduction = process.env.NODE_ENV === 'production';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function register(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    return success(res, { data: { user, accessToken }, message: 'Account created', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    return success(res, { data: { user, accessToken }, message: 'Logged in' });
  } catch (err) {
    next(err);
  }
}

async function adminLogin(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.adminLogin(req.body);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    return success(res, { data: { user, accessToken }, message: 'Logged in' });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { accessToken } = await authService.refreshAccessToken(req.cookies?.refreshToken);
    return success(res, { data: { accessToken }, message: 'Token refreshed' });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user.id);
    // Must match the sameSite/secure attributes used when the cookie was
    // set, or some browsers silently ignore the clear.
    res.clearCookie('refreshToken', {
      path: '/api/v1/auth',
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
    });
    return success(res, { message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    return success(res, { data: { user } });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req.body.email);
    // Same response whether or not the email exists — see auth.service.js.
    return success(res, { message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body);
    return success(res, { message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, adminLogin, refresh, logout, me, forgotPassword, resetPassword };
