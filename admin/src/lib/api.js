import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
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
  const msg = err.response?.data?.error || err.message || 'Request failed';
  return msg;
}
