const paymentService = require('./payment.service');
const { success } = require('../../utils/apiResponse');

async function initializePayment(req, res, next) {
  try {
    const result = await paymentService.initializePayment(req.user.id, req.body);
    return success(res, { data: result, message: 'Payment initialized' });
  } catch (err) {
    next(err);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const result = await paymentService.verifyPayment(req.user.id, req.params.reference);
    return success(res, { data: result, message: 'Payment verified' });
  } catch (err) {
    next(err);
  }
}

async function paystackWebhook(req, res, next) {
  try {
    await paymentService.handlePaystackWebhook(
      req.rawBody,
      req.headers['x-paystack-signature'],
      req.body
    );
    // Gateways expect a fast 200 acknowledging receipt — anything else
    // triggers their retry/backoff logic.
    return res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}

async function flutterwaveWebhook(req, res, next) {
  try {
    await paymentService.handleFlutterwaveWebhook(req.headers['verif-hash'], req.body);
    return res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { initializePayment, verifyPayment, paystackWebhook, flutterwaveWebhook };
