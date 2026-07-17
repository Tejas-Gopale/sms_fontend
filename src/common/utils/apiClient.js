// src/services/apiClient.js
// Axios instance with automatic JWT refresh interceptor + global error toasts

import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  updateTokens,
  clearAuthData,
  isTokenExpired,
} from '../utils/tokenStorage';
import { pushToast } from './toastBus';

const BASE_URL = 'http://localhost:8085/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Flag to prevent multiple concurrent refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ─── Extract the real backend error message from any response shape ─────────
const extractErrorMessage = (error) => {
  const data = error.response?.data;
  if (!data) return error.message || 'Something went wrong. Please try again.';

  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return typeof data.errors[0] === 'string'
      ? data.errors[0]
      : data.errors[0].message || 'Validation failed.';
  }
  return error.message || 'Something went wrong. Please try again.';
};

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Attaches the access token to every outgoing request
apiClient.interceptors.request.use(
  async (config) => {
    // Skip auth header for login/refresh endpoints
    const isAuthEndpoint =
      config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh');
    if (isAuthEndpoint) return config;

    let token = getAccessToken();

    // Proactively refresh if token is about to expire (within 60s)
    if (token && isTokenExpired(token)) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          updateTokens(data);
          token = data.accessToken;
        } catch {
          clearAuthData();
          window.dispatchEvent(new CustomEvent('auth:logout'));
          return Promise.reject(new Error('Session expired. Please log in again.'));
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// Handles 401 with token refresh; shows a toast with the backend's own
// message for every other error status (400, 403, 404, 409, 422, 500, ...).
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ── 401: attempt token refresh once, then retry ─────────────────────────
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthData();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        updateTokens(data);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthData();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        pushToast('Session expired. Please log in again.', 'error');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403: authenticated but not permitted ─────────────────────────────────
    if (status === 403) {
      pushToast(extractErrorMessage(error) || 'You are not authorized to perform this action.', 'error');
      return Promise.reject(error);
    }

    // ── 400 / 404 / 409 / 422 / 500 etc: show backend's own message ──────────
    if (status && status !== 401) {
      pushToast(extractErrorMessage(error), 'error');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
//commented on 12/07/2026 :- adding the access deniey tost
// // src/services/apiClient.js
// // Axios instance with automatic JWT refresh interceptor

// import axios from 'axios';
// import {
//   getAccessToken,
//   getRefreshToken,
//   updateTokens,
//   clearAuthData,
//   isTokenExpired,
// } from '../utils/tokenStorage';

// const BASE_URL = 'http://localhost:8085/api/v1';

// const apiClient = axios.create({
//   baseURL: BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
//   timeout: 15000,
// });

// // Flag to prevent multiple concurrent refresh requests
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error);
//     else prom.resolve(token);
//   });
//   failedQueue = [];
// };

// // ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// // Attaches the access token to every outgoing request
// apiClient.interceptors.request.use(
//   async (config) => {
//     // Skip auth header for login/refresh endpoints
//     const isAuthEndpoint =
//       config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh');
//     if (isAuthEndpoint) return config;

//     let token = getAccessToken();

//     // Proactively refresh if token is about to expire (within 60s)
//     if (token && isTokenExpired(token)) {
//       const refreshToken = getRefreshToken();
//       if (refreshToken) {
//         try {
//           const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
//           updateTokens(data);
//           token = data.accessToken;
//         } catch {
//           clearAuthData();
//           window.dispatchEvent(new CustomEvent('auth:logout'));
//           return Promise.reject(new Error('Session expired. Please log in again.'));
//         }
//       }
//     }

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// // Handles 401 responses by attempting a token refresh once, then retrying
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Only handle 401 Unauthorized and don't retry refresh endpoint itself
//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url?.includes('/auth/refresh')
//     ) {
//       if (isRefreshing) {
//         // Queue requests that come in while a refresh is already happening
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return apiClient(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       const refreshToken = getRefreshToken();
//       if (!refreshToken) {
//         clearAuthData();
//         window.dispatchEvent(new CustomEvent('auth:logout'));
//         return Promise.reject(error);
//       }

//       try {
//         const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
//         updateTokens(data);
//         processQueue(null, data.accessToken);
//         originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError, null);
//         clearAuthData();
//         window.dispatchEvent(new CustomEvent('auth:logout'));
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;
