import axiosClient from './axiosClient.js';

// filters: search, status ('active'|'inactive'|'all'), page, limit
export async function listCustomers(params = {}) {
  const { data } = await axiosClient.get('/admin/customers', { params });
  return data.data; // { customers, pagination }
}

export async function getCustomerDetail(id) {
  const { data } = await axiosClient.get(`/admin/customers/${id}`);
  return data.data.customer;
}

export async function updateCustomerStatus(id, isActive) {
  const { data } = await axiosClient.put(`/admin/customers/${id}/status`, { isActive });
  return data.data.customer;
}
