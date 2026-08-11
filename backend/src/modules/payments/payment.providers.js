// Thin wrappers around the Paystack and Flutterwave REST APIs. Kept
// separate from payment.service.js so the business logic (which order,
// whose money, what happens after) doesn't get tangled up with gateway
// request/response shapes — swapping or adding a provider only touches
// this file.

const env = require('../../config/env');
const AppError = require('../../utils/AppError');

const PAYSTACK_BASE = 'https://api.paystack.co';
const FLUTTERWAVE_BASE = 'https://api.flutterwave.com/v3';

async function paystackInitialize({ email, amount, reference, callbackUrl }) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.payments.paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // Paystack expects the smallest currency unit (pesewas)
      currency: 'GHS',
      reference,
      callback_url: callbackUrl,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new AppError(data.message || 'Failed to initialize Paystack payment', 502);
  }

  return { authorizationUrl: data.data.authorization_url, reference: data.data.reference, raw: data };
}

async function paystackVerify(reference) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${env.payments.paystackSecretKey}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new AppError(data.message || 'Failed to verify Paystack payment', 502);
  }

  // Paystack reports amount in pesewas (smallest unit) — the caller
  // converts back to GHS before comparing against the stored order total.
  return { isSuccessful: data.data?.status === 'success', amount: data.data?.amount, raw: data };
}

async function flutterwaveInitialize({ email, name, amount, reference, redirectUrl }) {
  const res = await fetch(`${FLUTTERWAVE_BASE}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.payments.flutterwaveSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: reference,
      amount,
      currency: 'GHS',
      redirect_url: redirectUrl,
      customer: { email, name },
    }),
  });

  const data = await res.json();
  if (!res.ok || data.status !== 'success') {
    throw new AppError(data.message || 'Failed to initialize Flutterwave payment', 502);
  }

  return { authorizationUrl: data.data.link, reference, raw: data };
}

async function flutterwaveVerify(reference) {
  const res = await fetch(
    `${FLUTTERWAVE_BASE}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${env.payments.flutterwaveSecretKey}` } }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new AppError(data.message || 'Failed to verify Flutterwave payment', 502);
  }

  // Flutterwave reports amount in the currency's base unit (GHS), unlike
  // Paystack's smallest-unit convention — no conversion needed here.
  return { isSuccessful: data.data?.status === 'successful', amount: data.data?.amount, raw: data };
}

module.exports = {
  paystackInitialize,
  paystackVerify,
  flutterwaveInitialize,
  flutterwaveVerify,
};
