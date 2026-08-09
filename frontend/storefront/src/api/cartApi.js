import axiosClient from './axiosClient.js';

export async function getCart() {
  const { data } = await axiosClient.get('/cart');
  return data.data.cart;
}

export async function addCartItem({ productId, quantity }) {
  const { data } = await axiosClient.post('/cart/items', { productId, quantity });
  return data.data.cart;
}

export async function updateCartItem(itemId, quantity) {
  const { data } = await axiosClient.put(`/cart/items/${itemId}`, { quantity });
  return data.data.cart;
}

export async function removeCartItem(itemId) {
  const { data } = await axiosClient.delete(`/cart/items/${itemId}`);
  return data.data.cart;
}

export async function clearCart() {
  const { data } = await axiosClient.delete('/cart');
  return data.data.cart;
}
