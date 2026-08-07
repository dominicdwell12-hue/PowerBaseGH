import axiosClient from './axiosClient.js';

// Distinct endpoint from the storefront's customer login — same request/
// response shape ({ user, accessToken }), see auth.controller.js::adminLogin.
export async function adminLogin(payload) {
  const { data } = await axiosClient.post('/auth/admin/login', payload);
  return data.data;
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
  return data.data;
}
