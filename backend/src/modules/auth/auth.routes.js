const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
const { authenticate } = require('./auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('./auth.validation');

const router = express.Router();

// Brute-force protection on login attempts specifically.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration had no rate limiting at all — left open, it's an easy
// target for automated account-creation spam.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many accounts created from this network. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Same tight limiter shape as login — password-reset requests are a
// classic target for both enumeration probing and email-bombing abuse.
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, validateRequest(registerSchema), authController.register);
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  passwordResetLimiter,
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);
router.post('/login', loginLimiter, validateRequest(loginSchema), authController.login);
router.post('/admin/login', loginLimiter, validateRequest(loginSchema), authController.adminLogin);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
