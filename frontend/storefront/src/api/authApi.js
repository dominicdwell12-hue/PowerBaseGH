import axiosClient from './axiosClient.js';

export async function register(payload) {
  const { data } = await axiosClient.post('/auth/register', payload);
  return data.data; // { user, accessToken }
}

export async function login(payload) {
  const { data } = await axiosClient.post('/auth/login', payload);
  return data.data; // { user, accessToken }
}

export async function logout() {
  const { data } = await axiosClient.post('/auth/logout');
  return data;
}

export async function fetchMe() {
  const { data } = await axiosClient.get('/auth/me');
  return data.data.user;
}

export async function refresh() {
  const { data } = await axiosClient.post('/auth/refresh');
  return data.data; // { accessToken }
}

export async function forgotPassword(email) {
  const { data } = await axiosClient.post('/auth/forgot-password', { email });
  return data; // { success, message }
}

export async function resetPassword(payload) {
  // payload: { email, token, newPassword, confirmPassword }
  const { data } = await axiosClient.post('/auth/reset-password', payload);
  return data; // { success, message }
}
