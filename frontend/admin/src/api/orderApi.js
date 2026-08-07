import axiosClient from './axiosClient.js';

// filters: status, paymentStatus, dateFrom, dateTo, search, page, limit
export async function listOrders(params = {}) {
  const { data } = await axiosClient.get('/admin/orders', { params });
  return data.data; // { orders, pagination }
}

export async function getOrderDetail(orderNumber) {
  const { data } = await axiosClient.get(`/admin/orders/${orderNumber}`);
  return data.data.order;
}

// { status, note }
export async function updateOrderStatus(orderNumber, payload) {
  const { data } = await axiosClient.put(`/admin/orders/${orderNumber}/status`, payload);
  return data.data.order;
}
