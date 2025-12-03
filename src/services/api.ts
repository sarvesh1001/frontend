import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../utils/constants';
import { getItem, setItem } from './storage';

const api = axios.create({
  baseURL: `${API_CONFIG.baseUrl}${API_CONFIG.apiVersion}`,
  timeout: 30000,
  headers: {
    'Content-Type': API_CONFIG.contentType,
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Enhanced secure request interceptor
api.interceptors.request.use(
  async (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    
    try {
      // Always add device headers from storage
      const deviceId = await getItem('device_id');
      const userAgent = await getItem('user_agent');
      const deviceFingerprint = await SecureStore.getItemAsync('device_fingerprint');
      const fingerprintSignature = await SecureStore.getItemAsync('fingerprint_signature');
      
      if (deviceId) {
        config.headers['X-Device-ID'] = deviceId;
      }
      if (userAgent) {
        config.headers['User-Agent'] = userAgent;
      }
      if (deviceFingerprint) {
        config.headers['X-Device-Fingerprint'] = deviceFingerprint;
      }
      if (fingerprintSignature) {
        config.headers['X-Fingerprint-Signature'] = fingerprintSignature;
      }

      // Add auth token if available
      const accessToken = await getItem('access_token');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      console.log(`➡️ SECURE API REQUEST: ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`🔐 SECURE HEADERS:`, {
        'X-Device-ID': deviceId?.substring(0, 12) + '...',
        'User-Agent': userAgent,
        'X-Device-Fingerprint': deviceFingerprint ? '***' : 'None',
        'X-Fingerprint-Signature': fingerprintSignature ? '***' : 'None',
        'Authorization': accessToken ? 'Bearer ***' : 'None'
      });

    } catch (error) {
      console.error('❌ SECURE HEADER SETUP FAILED:', error);
    }

    return config;
  },
  (error) => {
    console.error('❌ SECURE API REQUEST INTERCEPTOR ERROR:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`✅ SECURE API SUCCESS: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url;
    const status = error.response?.status;
    const message = error.response?.data?.message;
    
    console.log(`❌ SECURE API ERROR: ${status} ${url} - ${message}`);
    
    // Handle token refresh on 401
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('🔄 AUTO REFRESHING TOKEN...');
        
        const refreshResponse = await axios.post(
          `${API_CONFIG.baseUrl}${API_CONFIG.apiVersion}/admin-auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );

        if (refreshResponse.data.success && refreshResponse.data.data.tokens) {
          // Store new tokens
          await setItem('access_token', refreshResponse.data.data.tokens.access_token);
          await setItem('refresh_token', refreshResponse.data.data.tokens.refresh_token);
          
          console.log('✅ TOKENS REFRESHED SUCCESSFULLY');
          
          // Update the failed request with new token
          const newAccessToken = refreshResponse.data.data.tokens.access_token;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Process queued requests
          processQueue(null, newAccessToken);
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ TOKEN REFRESH FAILED:', refreshError);
        
        // Clear tokens and redirect to login
        await Promise.all([
          SecureStore.deleteItemAsync('access_token'),
          SecureStore.deleteItemAsync('refresh_token'),
        ]);
        
        // Process queue with error
        processQueue(refreshError, null);
        
        // Return the original error
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    } else if (status === 403) {
      console.log('🚫 SECURE FORBIDDEN - Device fingerprint rejected');
    } else if (status === 429) {
      console.log('⏰ SECURE RATE LIMITED - Too many requests');
    } else if (status === 409) {
      console.log('🔍 SECURE CONFLICT - Resource already exists');
    } else if (status >= 500) {
      console.log('🔧 SECURE SERVER ERROR - Backend issue');
    }
    
    return Promise.reject(error);
  }
);

export default api;