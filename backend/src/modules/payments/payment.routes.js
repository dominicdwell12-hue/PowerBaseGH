const express = require('express');
const paymentController = require('./payment.controller');
const { authenticate, requireRole } = require('../auth/auth.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const { initializePaymentSchema } = require('./payment.validation');

const router = express.Router();

// Webhooks are called by the gateway itself, not the browser — they
// carry their own signature-based verification instead of a JWT, so
// they sit outside the authenticate() wall other routes use.
router.post('/webhook/paystack', paymentController.paystackWebhook);
router.post('/webhook/flutterwave', paymentController.flutterwaveWebhook);

router.use(authenticate, requireRole('customer'));

router.post('/initialize', validateRequest(initializePaymentSchema), paymentController.initializePayment);
router.get('/verify/:reference', paymentController.verifyPayment);

module.exports = router;
