import axiosClient from './axiosClient.js';

export async function getSummary() {
  const { data } = await axiosClient.get('/admin/dashboard/summary');
  return data.data;
}

export async function getSalesReport(params = {}) {
  const { data } = await axiosClient.get('/admin/reports/sales', { params });
  return data.data; // { period, sales: [{ period, totalSales, orderCount }] }
}

export async function getTopProducts(limit = 10) {
  const { data } = await axiosClient.get('/admin/reports/top-products', { params: { limit } });
  return data.data.products;
}

// Returns raw CSV text — caller triggers a browser download from it.
export async function exportSalesReport(params = {}) {
  const { data } = await axiosClient.get('/admin/reports/export', {
    params,
    responseType: 'text',
    transformResponse: (res) => res, // keep as raw text, don't try to JSON-parse
  });
  return data;
}
