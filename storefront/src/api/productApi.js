import axiosClient from './axiosClient.js';

// GET /products?category=&search=&minPrice=&maxPrice=&sort=&page=&limit=
// Returns { items, pagination: { page, limit, total, totalPages } }
export async function listProducts(params = {}) {
  const { data } = await axiosClient.get('/products', { params });
  return data.data;
}

export async function getProductBySlug(slug) {
  const { data } = await axiosClient.get(`/products/${slug}`);
  return data.data.product;
}

export async function getFeaturedProducts() {
  const { data } = await axiosClient.get('/products/featured');
  return data.data.products;
}

export async function getRelatedProducts(slug) {
  const { data } = await axiosClient.get(`/products/${slug}/related`);
  return data.data.products;
}
