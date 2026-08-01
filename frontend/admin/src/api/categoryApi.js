import axiosClient from './axiosClient.js';

export async function listCategories() {
  const { data } = await axiosClient.get('/admin/categories');
  return data.data.categories; // includes inactive, unlike the public list
}

export async function createCategory(payload) {
  const { data } = await axiosClient.post('/admin/categories', payload);
  return data.data.category;
}

export async function updateCategory(id, payload) {
  const { data } = await axiosClient.put(`/admin/categories/${id}`, payload);
  return data.data.category;
}

export async function deleteCategory(id) {
  const { data } = await axiosClient.delete(`/admin/categories/${id}`);
  return data;
}
