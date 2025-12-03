// src/utils/constants.ts
export const API_CONFIG = {
  baseUrl: 'http://192.168.101.11:8080',
  apiVersion: '/api/v1',
  contentType: 'application/json',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ADMIN_ID: 'admin_id',
  ADMIN_INFO: 'admin_info',
  PHONE_NUMBER: 'phone_number', // Already exists
  DEVICE_ID: 'device_id',
  DEVICE_FINGERPRINT: 'device_fingerprint',
  USER_AGENT: 'user_agent',
  IS_FIRST_LAUNCH: 'is_first_launch',
  COUNTRY_CODE: 'country_code', // Add for phone login
};

export const DEVICE_CONSTANTS = {
  DEFAULT_DEVICE_ID_PREFIX: 'prayantra-admin',
};

export const COLORS = {
  primary: '#00BFA5',
  primaryDark: '#00897B',
  secondary: '#2962FF',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  error: '#FF5252',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
};