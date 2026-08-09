import axiosClient from './axiosClient.js';

export async function listCategories() {
  const { data } = await axiosClient.get('/admin/categories');
  return data.data.categories; // includes inactive, unlike the public list
}

// Categories are always submitted as multipart/form-data (even with no
// image file selected) because the admin picks an image file rather than
// pasting a URL — the backend uploads it to Cloudinary and stores the
// resulting URL itself.
function buildCategoryFormData({ name, parentId, imageFile, removeImage }) {
  const formData = new FormData();
  formData.append('name', name);
  if (parentId !== undefined && parentId !== null && parentId !== '') {
    formData.append('parentId', parentId);
  }
  if (imageFile) {
    formData.append('image', imageFile);
  }
  if (removeImage) {
    formData.append('removeImage', 'true');
  }
  return formData;
}

export async function createCategory(payload) {
  const { data } = await axiosClient.post('/admin/categories', buildCategoryFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.category;
}

export async function updateCategory(id, payload) {
  const { data } = await axiosClient.put(`/admin/categories/${id}`, buildCategoryFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.category;
}

export async function deleteCategory(id) {
  const { data } = await axiosClient.delete(`/admin/categories/${id}`);
  return data;
}
