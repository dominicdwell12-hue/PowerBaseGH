import axiosClient from './axiosClient.js';

// { orderId, provider } — orderId is the numeric id from the order
// object returned by POST /orders (not the orderNumber).
export async function initializePayment(payload) {
  const { data } = await axiosClient.post('/payments/initialize', payload);
  return data.data; // { authorizationUrl, reference }
}

export async function verifyPayment(reference) {
  const { data } = await axiosClient.get(`/payments/verify/${reference}`);
  return data.data; // { payment, orderStatus }
}
