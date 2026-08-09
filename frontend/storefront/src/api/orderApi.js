import axiosClient from './axiosClient.js';

// { addressId, paymentMethod } — POD eligibility is re-validated
// server-side against the address's delivery zone, never trusted from
// the client (see order.service.js::createOrder).
export async function createOrder(payload) {
  const { data } = await axiosClient.post('/orders', payload);
  return data.data.order;
}

export async function listOrders(params = {}) {
  const { data } = await axiosClient.get('/orders', { params });
  return data.data; // { orders, pagination }
}

export async function getOrderDetail(orderNumber) {
  const { data } = await axiosClient.get(`/orders/${orderNumber}`);
  return data.data.order;
}

export async function getOrderTracking(orderNumber) {
  const { data } = await axiosClient.get(`/orders/${orderNumber}/tracking`);
  return data.data.tracking;
}

export async function cancelOrder(orderNumber, reason) {
  const { data } = await axiosClient.put(`/orders/${orderNumber}/cancel`, { reason });
  return data.data.order;
}
