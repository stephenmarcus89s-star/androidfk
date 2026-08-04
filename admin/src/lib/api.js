import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  baseURL: '/api',
  // Default timeout for regular API calls (login, get stats, etc.)
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;

  // For upload requests (multipart/form-data), use a much longer timeout.
  // A 100MB APK on a 5Mbps upload connection takes ~3 minutes.
  // We set 10 minutes to be safe — Render Pro supports up to 300s response time,
  // but the upload itself can stream longer because chunks are ACK'd.
  const isUpload = cfg.data instanceof FormData;
  if (isUpload) {
    cfg.timeout = 10 * 60 * 1000; // 10 minutes
    // Allow browser to track upload progress
    cfg.onUploadProgress = cfg.onUploadProgress || (() => {});
  }

  return cfg;
});

// Auto-logout on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Helper for handling API errors in components
export function apiError(err) {
  // Timeout / network errors get friendlier messages
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'Upload timed out. Please try again on a faster network connection.';
  }
  if (err.message === 'Network Error') {
    return 'Network error — check your internet connection.';
  }
  const msg = err.response?.data?.error || err.message || 'Request failed';
  return msg;
}
