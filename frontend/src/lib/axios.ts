import axios from 'axios';
import { getTenantSlug } from './tenant';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use((config) => {
  const tenant = getTenantSlug();
  if (tenant) {
    config.headers = (config.headers || {}) as any;
    (config.headers as any)['x-tenant-id'] = tenant;
  }
  return config;
});

export default axiosInstance;
