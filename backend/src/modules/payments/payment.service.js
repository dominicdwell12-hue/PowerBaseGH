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

// Cross-checks the amount a gateway reports settling against the amount
// we recorded in the database at initialize() time (itself derived from
// order.total, never from the client). A gateway "success" status alone
// is not sufficient — this guards against a transaction reference somehow
// getting reconciled against the wrong amount. Small epsilon accounts for
// GHS decimal rounding, not for a genuinely different amount.
function isAmountMatching(provider, expectedGhsAmount, rawAmount) {
  if (rawAmount === undefined || rawAmount === null) return false;
  const actualGhsAmount = provider === 'paystack' ? rawAmount / 100 : rawAmount;
  return Math.abs(actualGhsAmount - expectedGhsAmount) < 0.01;
}

// Pulls the channel a transaction actually settled through (e.g. "card",
// "mobile_money") out of the *verified* gateway response — this is only
// ever called with data that came back from Paystack/Flutterwave's own
// API or a signature-checked webhook, never from anything the browser sent.
function extractPaymentMethod(provider, rawResponse) {
  if (provider === 'paystack') {
    return rawResponse?.data?.channel ?? null;
  }
  return rawResponse?.data?.payment_type ?? null;
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

  const isSuccessful =
    gatewayResult.isSuccessful && isAmountMatching(payment.provider, Number(payment.amount), gatewayResult.amount);

  const updatedOrder = await finalizePayment(payment, isSuccessful, gatewayResult.raw);

  return {
    payment: { ...serializePayment(payment), status: isSuccessful ? 'successful' : 'failed' },
    orderStatus: updatedOrder.orderStatus,
  };
}

// --- Shared reconciliation logic used by both verify() and the webhooks ---

async function finalizePayment(payment, isSuccessful, rawResponse) {
  return prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: isSuccessful ? 'successful' : 'failed',
        rawResponse,
        ...(isSuccessful
          ? { paidAt: new Date(), paymentMethod: extractPaymentMethod(payment.provider, rawResponse) }
          : {}),
      },
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

async function reconcilePayment(reference, { isSuccessful, amount, rawResponse }) {
  const payment = await prisma.payment.findUnique({ where: { providerReference: reference } });

  // Webhooks can arrive for references we don't recognize (retries,
  // unrelated test events on a shared endpoint) — ack and exit quietly
  // rather than erroring, since there's nothing this app can reconcile.
  if (!payment || payment.status === 'successful') {
    return;
  }

  const confirmed = isSuccessful && isAmountMatching(payment.provider, Number(payment.amount), amount);
  await finalizePayment(payment, confirmed, rawResponse);
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
    await reconcilePayment(event.data.reference, { isSuccessful: true, amount: event.data.amount, rawResponse: event });
  } else if (event.event === 'charge.failed') {
    await reconcilePayment(event.data.reference, { isSuccessful: false, amount: event.data.amount, rawResponse: event });
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
  const amount = event.data?.amount;

  if (reference) {
    await reconcilePayment(reference, { isSuccessful, amount, rawResponse: event });
  }
}

module.exports = {
  initializePayment,
  verifyPayment,
  handlePaystackWebhook,
  handleFlutterwaveWebhook,
};
