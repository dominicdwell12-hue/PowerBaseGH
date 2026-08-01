import axiosClient from './axiosClient.js';

export async function getProfile() {
  const { data } = await axiosClient.get('/users/profile');
  return data.data.user;
}

export async function updateProfile(payload) {
  const { data } = await axiosClient.put('/users/profile', payload);
  return data.data.user;
}

export async function changePassword(payload) {
  const { data } = await axiosClient.put('/users/change-password', payload);
  return data;
}

export async function listAddresses() {
  const { data } = await axiosClient.get('/users/addresses');
  return data.data.addresses;
}

export async function addAddress(payload) {
  const { data } = await axiosClient.post('/users/addresses', payload);
  return data.data.address;
}

export async function updateAddress(id, payload) {
  const { data } = await axiosClient.put(`/users/addresses/${id}`, payload);
  return data.data.address;
}

export async function deleteAddress(id) {
  const { data } = await axiosClient.delete(`/users/addresses/${id}`);
  return data;
}

export async function setDefaultAddress(id) {
  const { data } = await axiosClient.put(`/users/addresses/${id}/default`);
  return data.data.address;
}
