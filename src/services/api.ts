import axios from 'axios';
import { API_CONFIG } from '../utils/constants';
import { getItem } from './storage';

const api = axios.create({
  baseURL: `${API_CONFIG.baseUrl}${API_CONFIG.apiVersion}`,
  timeout: 30000,
  headers: {
    'Content-Type': API_CONFIG.contentType,
  },
});

// ✅ MERGED REQUEST INTERCEPTOR (debug + token)
api.interceptors.request.use(
  async (config) => {
    // Debug log
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`➡️ API CALL: ${config.method?.toUpperCase()} ${fullUrl}`);

    // Add token
    const accessToken = await getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // refresh logic later
    }
    return Promise.reject(error);
  }
);

export default api;