import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Every frontend module talks to the backend only through api/*.js —
// no raw axios/fetch calls inside components (see 03-folder-structure.md).
const axiosClient = axios.create({
  baseURL,
  withCredentials: true, // refresh token travels as an httpOnly cookie
  headers: { 'Content-Type': 'application/json' },
});

// The short-lived access token lives in memory only (never localStorage —
// that would defeat the point of the httpOnly refresh cookie).
let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}

// AuthContext registers a callback here so a failed silent refresh (e.g.
// the refresh cookie itself expired) can clear the user's session state.
let onSessionExpired = null;
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

axiosClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// A bare axios instance (no interceptors) for the refresh call itself —
// calling refresh through axiosClient would risk it retrying itself on
// a 401 and looping.
const refreshClient = axios.create({ baseURL, withCredentials: true });

let inFlightRefresh = null;
async function refreshAccessToken() {
  if (!inFlightRefresh) {
    inFlightRefresh = refreshClient
      .post('/auth/refresh')
      .then((response) => {
        const token = response.data.data.accessToken;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        inFlightRefresh = null;
      });
  }
  return inFlightRefresh;
}

function shapeError(error) {
  // Every backend response is { success, data, message } or
  // { success, message, errors } — surface that shape consistently so
  // api/*.js callers and React Query's `error` always look the same.
  return (
    error.response?.data ?? {
      success: false,
      message: error.message || 'Network error',
      errors: null,
    }
  );
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config ?? {};
    const status = error.response?.status;
    const url = originalRequest.url || '';
    const isAuthFlowRequest =
      url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');

    if (status === 401 && !originalRequest._retried && !isAuthFlowRequest) {
      originalRequest._retried = true;
      try {
        const token = await refreshAccessToken();
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
        return axiosClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        onSessionExpired?.();
        return Promise.reject(shapeError(refreshError));
      }
    }

    return Promise.reject(shapeError(error));
  }
);

export default axiosClient;
