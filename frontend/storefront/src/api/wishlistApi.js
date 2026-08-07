import axiosClient from './axiosClient.js';

export async function getWishlist() {
  const { data } = await axiosClient.get('/wishlist');
  return data.data.wishlist;
}

export async function addToWishlist(productId) {
  const { data } = await axiosClient.post('/wishlist', { productId });
  return data.data.wishlist;
}

export async function removeFromWishlist(productId) {
  const { data } = await axiosClient.delete(`/wishlist/${productId}`);
  return data.data.wishlist;
}
