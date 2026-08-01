import axiosClient from './axiosClient.js';

export async function listProducts(params = {}) {
  const { data } = await axiosClient.get('/admin/products', { params });
  return data.data; // { items, pagination }
}

export async function createProduct(payload) {
  const { data } = await axiosClient.post('/admin/products', payload);
  return data.data.product;
}

export async function updateProduct(id, payload) {
  const { data } = await axiosClient.put(`/admin/products/${id}`, payload);
  return data.data.product;
}

export async function deleteProduct(id) {
  const { data } = await axiosClient.delete(`/admin/products/${id}`);
  return data;
}

export async function updateStock(id, stockQuantity) {
  const { data } = await axiosClient.put(`/admin/products/${id}/stock`, { stockQuantity });
  return data.data.product;
}

export async function uploadImages(id, files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('images', file));
  const { data } = await axiosClient.post(`/admin/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.images;
}

export async function deleteImage(productId, imageId) {
  const { data } = await axiosClient.delete(`/admin/products/${productId}/images/${imageId}`);
  return data;
}

export async function setPrimaryImage(productId, imageId) {
  const { data } = await axiosClient.put(`/admin/products/${productId}/images/${imageId}/primary`);
  return data;
}
