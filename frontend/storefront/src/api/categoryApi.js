import axiosClient from './axiosClient.js';

// Top-level categories with their subcategories nested.
export async function listCategories() {
  const { data } = await axiosClient.get('/categories');
  return data.data.categories;
}

// Category detail + its products, paginated.
export async function getCategoryWithProducts(slug, params = {}) {
  const { data } = await axiosClient.get(`/categories/${slug}`, { params });
  return data.data; // { category, products, pagination }
}
