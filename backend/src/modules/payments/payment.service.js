const crypto = require('crypto');
const prisma = require('../../config/database');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const providers = require('./payment.providers');

// crypto.timingSafeEqual requires equal-length buffers and throws
// otherwise — a length mismatch is safe to short-circuit on since it
// leaks nothing an attacker doesn't already know (signature/hash lengths
// are fixed by the algorithm, not secret-dependent).
function safeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function generateReference(orderNumber) {
  const random = crypto.randomBytes(4).toString('hex');
  return `PBG-${orderNumber}-${random}`;
}

function serializePayment(payment) {
  return {
    reference: payment.providerReference,
    provider: payment.provider,
    status: payment.status,
    amount: Number(payment.amount),
    currency: payment.currency,
    createdAt: payment.createdAt,
  };
}

// --- Initialize ---

async function initializePayment(userId, { orderId, provider }) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order || order.userId !== userId) {
    throw new AppError('Order not found', 404);
  }

  if (order.paymentMethod === 'pay_on_delivery') {
    throw new AppError('This order is set for Pay on Delivery and does not require online payment', 400);
  }

  if (order.paymentStatus === 'paid') {
    throw new AppError('This order has already been paid for', 409);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const reference = generateReference(order.orderNumber);
  const amount = Number(order.total);

  let gatewayResult;
  if (provider === 'paystack') {
    gatewayResult = await providers.paystackInitialize({
      email: user.email,
      amount,
      reference,
      callbackUrl: env.payments.callbackUrl,
    });
  } else {
    gatewayResult = await providers.flutterwaveInitialize({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      amount,
      reference,
      redirectUrl: env.payments.callbackUrl,
    });
  }

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider,
      providerReference: gatewayResult.reference,
      amount,
      currency: 'GHS',
      status: 'initiated',
      rawResponse: gatewayResult.raw,
    },
  });

  return { authorizationUrl: gatewayResult.authorizationUrl, reference: gatewayResult.reference };
}

// --- Verify (customer-initiated, after gateway redirect) ---

async function verifyPayment(userId, reference) {
  const payment = await prisma.payment.findUnique({
    where: { providerReference: reference },
    include: { order: true },
  });

  if (!payment || payment.order.userId !== userId) {
    throw new AppError('Payment not found', 404);
  }

  // Already reconciled (likely by the webhook beating the browser back
  // from the gateway) — no need to hit the provider API again.
  if (payment.status === 'successful') {
    return { payment: serializePayment(payment), orderStatus: payment.order.orderStatus };
  }

  const gatewayResult =
    payment.provider === 'paystack'
      ? await providers.paystackVerify(reference)
      : await providers.flutterwaveVerify(reference);

  const updatedOrder = await finalizePayment(payment, gatewayResult.isSuccessful, gatewayResult.raw);

  return {
    payment: { ...serializePayment(payment), status: gatewayResult.isSuccessful ? 'successful' : 'failed' },
    orderStatus: updatedOrder.orderStatus,
  };
}

// --- Shared reconciliation logic used by both verify() and the webhooks ---

async function finalizePayment(payment, isSuccessful, rawResponse) {
  return prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: isSuccessful ? 'successful' : 'failed', rawResponse },
    });

    const orderUpdateData = { paymentStatus: isSuccessful ? 'paid' : 'failed' };

    // A successful payment on a still-Pending order moves it forward to
    // Confirmed automatically — the admin doesn't need to manually
    // acknowledge a paid order before it starts moving through fulfillment.
    const order = await tx.order.findUnique({ where: { id: payment.orderId } });
    if (isSuccessful && order.orderStatus === 'Pending') {
      orderUpdateData.orderStatus = 'Confirmed';
      orderUpdateData.statusHistory = {
        create: { status: 'Confirmed', note: `Payment confirmed via ${payment.provider}` },
      };
    }

    return tx.order.update({ where: { id: payment.orderId }, data: orderUpdateData });
  });
}

async function finalizeByReference(reference, isSuccessful, rawResponse) {
  const payment = await prisma.payment.findUnique({ where: { providerReference: reference } });

  // Webhooks can arrive for references we don't recognize (retries,
  // unrelated test events on a shared endpoint) — ack and exit quietly
  // rather than erroring, since there's nothing this app can reconcile.
  if (!payment || payment.status === 'successful') {
    return;
  }

  await finalizePayment(payment, isSuccessful, rawResponse);
}

// --- Webhooks ---

function isValidPaystackSignature(rawBody, signatureHeader) {
  if (!env.payments.paystackSecretKey || !signatureHeader) return false;
  const expected = crypto
    .createHmac('sha512', env.payments.paystackSecretKey)
    .update(rawBody)
    .digest('hex');
  return safeCompare(expected, signatureHeader);
}

async function handlePaystackWebhook(rawBody, signatureHeader, event) {
  if (!isValidPaystackSignature(rawBody, signatureHeader)) {
    throw new AppError('Invalid webhook signature', 401);
  }

  if (event.event === 'charge.success') {
    await finalizeByReference(event.data.reference, true, event);
  } else if (event.event === 'charge.failed') {
    await finalizeByReference(event.data.reference, false, event);
  }
}

function isValidFlutterwaveSignature(signatureHeader) {
  if (!env.payments.flutterwaveWebhookHash || !signatureHeader) return false;
  return safeCompare(signatureHeader, env.payments.flutterwaveWebhookHash);
}

async function handleFlutterwaveWebhook(signatureHeader, event) {
  if (!isValidFlutterwaveSignature(signatureHeader)) {
    throw new AppError('Invalid webhook signature', 401);
  }

  const isSuccessful = event.status === 'successful' && event.data?.status === 'successful';
  const reference = event.data?.tx_ref;

  if (reference) {
    await finalizeByReference(reference, isSuccessful, event);
  }
}

module.exports = {
  initializePayment,
  verifyPayment,
  handlePaystackWebhook,
  handleFlutterwaveWebhook,
};
