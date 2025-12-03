// src/services/auth.ts
import {
  CreateCompanyRequest,
  CreateCompanyResponse,
  Department,
  LoginInitiateResponse,
  VerifyMpinResponse,
  VerifyOtpResponse
} from '../types';
import { getStoredDeviceInfo } from '../utils/device';
import api from './api';
import { clearAllStorage, getItem, removeItem, setItem } from './storage';

function formatPhone(phone: string): string {
  if (!phone) return phone;
  return phone.startsWith("+91") ? phone : `+91${phone}`;
}

export class AuthService {
  private static refreshTimer: NodeJS.Timeout | null = null;
  private static isRefreshing = false;
  private static refreshQueue: Array<{ resolve: (value: any) => void; reject: (error: any) => void }> = [];

  // Helper method to ensure device info is always available and consistent
  private static async getDeviceInfoForApi() {
    try {
      const deviceInfo = await getStoredDeviceInfo();
      
      if (!deviceInfo.deviceId || !deviceInfo.deviceFingerprint || !deviceInfo.userAgent) {
        throw new Error('Incomplete device information');
      }

      console.log("🔐 SECURE HARDWARE DEVICE INFO VERIFIED");
      
      return deviceInfo;
    } catch (error) {
      console.error('❌ CRITICAL: Device info verification failed', error);
      throw new Error('Device information not available. Please restart the app.');
    }
  }

  // ============================================================
  // TOKEN MANAGEMENT & REFRESH SYSTEM
  // ============================================================

  static async startTokenRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // Refresh every 4.5 minutes (270000 ms) to be safe (token expires in 5 minutes)
    this.refreshTimer = setInterval(async () => {
      try {
        const refreshToken = await getItem('refresh_token');
        if (refreshToken) {
          console.log("🔄 AUTO-REFRESHING TOKENS...");
          await this.refreshTokens();
        }
      } catch (error) {
        console.error("❌ AUTO REFRESH FAILED:", error);
      }
    }, 270000); // 4.5 minutes
  }

  static stopTokenRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Enhanced token refresh with queue system to prevent multiple simultaneous refreshes
  static async refreshTokens(): Promise<any> {
    // If already refreshing, add to queue
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;
    const refreshToken = await getItem('refresh_token');
    const deviceInfo = await this.getDeviceInfoForApi();

    if (!refreshToken) {
      this.isRefreshing = false;
      throw new Error('No refresh token available');
    }

    console.log("🔄 TOKEN REFRESH WITH SECURE HARDWARE DEVICE:", {
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.post('/admin-auth/refresh', {
        refresh_token: refreshToken,
        device_fingerprint: deviceInfo.deviceFingerprint,
        user_agent: deviceInfo.userAgent,
      });

      console.log("✅ TOKEN REFRESH SUCCESSFUL");
      
      if (response.data.success && response.data.data.tokens) {
        await setItem('access_token', response.data.data.tokens.access_token);
        await setItem('refresh_token', response.data.data.tokens.refresh_token);
        console.log("💾 SECURE NEW TOKENS STORED");
      }

      // Process all queued requests
      this.refreshQueue.forEach(({ resolve }) => resolve(response.data));
      this.refreshQueue = [];
      this.isRefreshing = false;

      return response.data;
    } catch (error: any) {
      console.error("❌ TOKEN REFRESH FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });

      // If refresh token is invalid, logout user but preserve phone number
      if (error.response?.status === 401) {
        console.log("🔐 INVALID REFRESH TOKEN, CLEARING TOKENS BUT PRESERVING PHONE NUMBER...");
        await this.clearTokensOnly();
      }

      // Reject all queued requests
      this.refreshQueue.forEach(({ reject }) => reject(error));
      this.refreshQueue = [];
      this.isRefreshing = false;

      throw error;
    }
  }

  // Clear only tokens, preserve admin ID, phone number and device info
  static async clearTokensOnly(): Promise<void> {
    try {
      await Promise.all([
        removeItem('access_token'),
        removeItem('refresh_token'),
        removeItem('admin_info'),
      ]);
      console.log("✅ TOKENS CLEARED, ADMIN ID & PHONE NUMBER PRESERVED");
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // ============================================================
  // COMPANY MANAGEMENT APIs
  // ============================================================

  static async createCompany(companyData: CreateCompanyRequest): Promise<CreateCompanyResponse> {
    const deviceInfo = await this.getDeviceInfoForApi();

    console.log("🚀 CREATE COMPANY WITH SECURE HARDWARE DEVICE:", {
      company_name: companyData.company_name,
      owner_phone: companyData.owner_phone,
      subscription_tier: companyData.subscription_tier,
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.post('/admin/companies', companyData);
      
      console.log("✅ COMPANY CREATED SUCCESSFULLY");
      return response.data;
    } catch (error: any) {
      console.error("❌ COMPANY CREATION FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  static async getDepartments(): Promise<Department[]> {
    const deviceInfo = await this.getDeviceInfoForApi();

    console.log("🚀 FETCHING DEPARTMENTS WITH SECURE HARDWARE DEVICE:", {
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      // Note: This endpoint might not exist yet, you may need to create it
      // For now, we'll return the static departments
      const standardDepartments: Department[] = [
        { name: 'HR', module_code: 'hr', description: 'Human resource management' },
        { name: 'Finance', module_code: 'finance', description: 'Finance operations' },
        { name: 'Accounting', module_code: 'accounting', description: 'Accounting and ledger' },
        { name: 'Procurement', module_code: 'procurement', description: 'Purchasing & vendor mgmt' },
        { name: 'Inventory', module_code: 'inventory', description: 'Stock & warehouse' },
        { name: 'Logistics', module_code: 'logistics', description: 'Dispatch & delivery' },
        { name: 'Sales', module_code: 'sales', description: 'Lead & pipeline mgmt' },
        { name: 'Marketing', module_code: 'marketing', description: 'Campaigns & analysis' },
        { name: 'Customer Support', module_code: 'support', description: 'Support & helpdesk' },
        { name: 'Operations', module_code: 'operations', description: 'Operations & workflows' },
        { name: 'IT', module_code: 'it', description: 'IT assets & incidents' },
        { name: 'Production', module_code: 'production', description: 'Manufacturing operations' },
        { name: 'Quality Control', module_code: 'qc', description: 'QC inspections' },
        { name: 'Quality Assurance', module_code: 'qa', description: 'QA processes' },
        { name: 'R&D', module_code: 'rnd', description: 'Research & development' },
        { name: 'Administration', module_code: 'administration', description: 'Company administration and management', is_default: true }
      ];
      
      return standardDepartments;
    } catch (error: any) {
      console.error("❌ FETCH DEPARTMENTS FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  // ============================================================
  // ADMIN APIs (Using Secure Hardware Device Info)
  // ============================================================

  static async adminLoginInitiate(phoneNumber: string): Promise<LoginInitiateResponse> {
    const formattedPhone = formatPhone(phoneNumber);
    const deviceInfo = await this.getDeviceInfoForApi();

    console.log("🚀 ADMIN LOGIN WITH SECURE HARDWARE DEVICE:", {
      phone_number: formattedPhone,
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.post('/admin-auth/login/initiate', {
        phone_number: formattedPhone,
        device_id: deviceInfo.deviceId,
        device_fingerprint: deviceInfo.deviceFingerprint,
        user_agent: deviceInfo.userAgent,
      });

      console.log("✅ ADMIN LOGIN INITIATE SUCCESS");
      return response.data;
    } catch (error: any) {
      console.error("❌ ADMIN LOGIN INITIATE FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  static async sendOtp(phoneNumber: string, purpose: string): Promise<any> {
    const formattedPhone = formatPhone(phoneNumber);
    const deviceInfo = await this.getDeviceInfoForApi();

    console.log("🚀 SEND OTP WITH SECURE HARDWARE DEVICE:", {
      phone_number: formattedPhone,
      purpose,
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.post('/otp/send', {
        phone_number: formattedPhone,
        purpose,
        device_id: deviceInfo.deviceId,
        device_fingerprint: deviceInfo.deviceFingerprint,
        user_agent: deviceInfo.userAgent,
        provider: 'mock',
      });

      console.log("✅ OTP SENT SUCCESSFULLY");
      return response.data;
    } catch (error: any) {
      console.error("❌ OTP SEND FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  static async verifyAdminOtp(phoneNumber: string, otp: string): Promise<VerifyOtpResponse> {
    // Extract country code and phone number
    const countryCodeMatch = phoneNumber.match(/^(\+\d{1,3})/);
    const countryCode = countryCodeMatch ? countryCodeMatch[1] : '+91';
    const cleanPhoneNumber = phoneNumber.replace(/^\+\d{1,3}/, '');
    
    const deviceInfo = await this.getDeviceInfoForApi();

    console.log("🚀 VERIFY ADMIN OTP WITH SECURE HARDWARE DEVICE:", {
      phone_number: phoneNumber,
      country_code: countryCode,
      clean_phone: cleanPhoneNumber,
      otp_length: otp.length,
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.post('/admin-auth/login/verify-otp', {
        phone_number: phoneNumber,
        otp,
        device_id: deviceInfo.deviceId,
        device_fingerprint: deviceInfo.deviceFingerprint,
        user_agent: deviceInfo.userAgent,
      });

      console.log("✅ ADMIN OTP VERIFIED SUCCESSFULLY");
      
      if (response.data.success && response.data.data.admin_id) {
        await setItem('admin_id', response.data.data.admin_id);
        await setItem('phone_number', cleanPhoneNumber);
        await setItem('country_code', countryCode);
        console.log("💾 ADMIN ID, PHONE NUMBER & COUNTRY CODE STORED");
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ ADMIN OTP VERIFICATION FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  static async setupAdminMpin(mpin: string): Promise<any> {
    const adminId = await getItem('admin_id');
    const deviceInfo = await this.getDeviceInfoForApi();

    if (!adminId) {
      throw new Error('Admin ID not found. Please complete OTP verification first.');
    }

    console.log("🚀 SETUP ADMIN MPIN WITH SECURE HARDWARE DEVICE:", {
      admin_id: adminId,
      mpin_length: mpin.length,
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.post('/admin-auth/mpin/setup', {
        admin_id: adminId,
        mpin,
        device_id: deviceInfo.deviceId,
        device_fingerprint: deviceInfo.deviceFingerprint,
        user_agent: deviceInfo.userAgent,
      });

      console.log("✅ ADMIN MPIN SETUP SUCCESSFULLY");
      return response.data;
    } catch (error: any) {
      console.error("❌ ADMIN MPIN SETUP FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  static async verifyAdminMpin(mpin: string): Promise<VerifyMpinResponse> {
    const adminId = await getItem('admin_id');
    const deviceInfo = await this.getDeviceInfoForApi();

    if (!adminId) {
      throw new Error('Admin ID not found. Please login again.');
    }

    console.log("🚀 VERIFY ADMIN MPIN WITH SECURE HARDWARE DEVICE:", {
      admin_id: adminId,
      mpin_length: mpin.length,
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.post('/admin-auth/login/verify-mpin', {
        admin_id: adminId,
        mpin,
        device_id: deviceInfo.deviceId,
        device_fingerprint: deviceInfo.deviceFingerprint,
        user_agent: deviceInfo.userAgent,
      });

      console.log("✅ ADMIN MPIN VERIFICATION SUCCESSFULLY");
      
      if (response.data.success && response.data.data.tokens) {
        // Store tokens
        await setItem('access_token', response.data.data.tokens.access_token);
        await setItem('refresh_token', response.data.data.tokens.refresh_token);
        
        // Store admin info
        if (response.data.data.admin) {
          await setItem('admin_info', JSON.stringify(response.data.data.admin));
        }
        
        console.log("💾 SECURE TOKENS AND ADMIN INFO STORED");
        
        // Start auto token refresh timer
        this.startTokenRefreshTimer();
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ ADMIN MPIN VERIFICATION FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  // ============================================================
  // FORGOT MPIN APIs (Using Secure Hardware Device Info)
  // ============================================================

  static async forgotAdminMpin(phoneNumber: string): Promise<any> {
    const formattedPhone = formatPhone(phoneNumber);
    const deviceInfo = await this.getDeviceInfoForApi();

    console.log("🚀 FORGOT MPIN WITH SECURE HARDWARE DEVICE:", {
      phone_number: formattedPhone,
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.post('/admin-auth/mpin/forgot', {
        phone_number: formattedPhone,
        device_id: deviceInfo.deviceId,
        device_fingerprint: deviceInfo.deviceFingerprint,
        user_agent: deviceInfo.userAgent,
      });

      console.log("✅ FORGOT MPIN INITIATE SUCCESS");
      return response.data;
    } catch (error: any) {
      console.error("❌ FORGOT MPIN INITIATE FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  static async verifyForgotAdminMpin(phoneNumber: string, otp: string, newMpin: string): Promise<any> {
    const formattedPhone = formatPhone(phoneNumber);
    const deviceInfo = await this.getDeviceInfoForApi();

    console.log("🚀 VERIFY FORGOT MPIN WITH SECURE HARDWARE DEVICE:", {
      phone_number: formattedPhone,
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
      new_mpin_length: newMpin.length,
      otp_length: otp.length
    });

    try {
      const response = await api.post('/admin-auth/mpin/forgot/verify', {
        phone_number: formattedPhone,
        device_id: deviceInfo.deviceId,
        new_mpin: newMpin,
        otp_code: otp,
        device_fingerprint: deviceInfo.deviceFingerprint,
        user_agent: deviceInfo.userAgent,
      });

      console.log("✅ FORGOT MPIN VERIFICATION SUCCESSFULLY");
      
      // Store admin_id if present in response
      if (response.data.success && response.data.data.admin_id) {
        await setItem('admin_id', response.data.data.admin_id);
      }
      
      return response.data;
    } catch (error: any) {
      console.error("❌ FORGOT MPIN VERIFICATION FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  // ============================================================
  // WEB LOGIN PAIRING (Using Secure Hardware Device Info)
  // ============================================================

  static async pairWebLogin(sessionId: string, signature: string): Promise<any> {
    const deviceInfo = await this.getDeviceInfoForApi();

    console.log("🚀 WEB LOGIN PAIR WITH SECURE HARDWARE DEVICE:", {
      session_id: sessionId,
      signature_length: signature.length,
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.post('/web/login/pair', {
        session_id: sessionId,
        signature: signature,
        device_fingerprint: deviceInfo.deviceFingerprint,
        user_agent: deviceInfo.userAgent,
      });
      
      console.log("✅ WEB LOGIN PAIR SUCCESSFUL");
      return response.data;
    } catch (error: any) {
      console.error("❌ WEB LOGIN PAIR FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  // ============================================================
  // LOGOUT (Preserves Admin ID & Phone Number for MPIN Login)
  // ============================================================

  static async logout(): Promise<any> {
    try {
      // Stop the refresh timer
      this.stopTokenRefreshTimer();
      
      const refreshToken = await getItem('refresh_token');
      const deviceInfo = await this.getDeviceInfoForApi();

      if (refreshToken) {
        await api.post('/admin-auth/logout', {
          refresh_token: refreshToken,
          device_fingerprint: deviceInfo.deviceFingerprint,
          user_agent: deviceInfo.userAgent,
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Only clear tokens and admin info, preserve admin ID, phone number and country code
      await this.clearTokensOnly();
      console.log("✅ LOGOUT COMPLETE - ADMIN ID & PHONE NUMBER PRESERVED FOR MPIN LOGIN");
    }
  }

  // Full logout with phone number removal (for switching accounts)
  static async fullLogout(): Promise<any> {
    try {
      // Stop the refresh timer
      this.stopTokenRefreshTimer();
      
      const refreshToken = await getItem('refresh_token');
      const deviceInfo = await this.getDeviceInfoForApi();

      if (refreshToken) {
        await api.post('/admin-auth/logout', {
          refresh_token: refreshToken,
          device_fingerprint: deviceInfo.deviceFingerprint,
          user_agent: deviceInfo.userAgent,
        });
      }
    } catch (error) {
      console.error('Full logout API error:', error);
    } finally {
      // Clear everything including phone number
      await clearAllStorage();
      console.log("✅ FULL LOGOUT COMPLETE - ALL DATA CLEARED");
    }
  }

  // ============================================================
  // SESSION MANAGEMENT
  // ============================================================

  static async validateSession(): Promise<any> {
    const deviceInfo = await this.getDeviceInfoForApi();
    console.log("🔐 SESSION VALIDATION WITH SECURE HARDWARE DEVICE:", {
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });
    
    try {
      const response = await api.get('/auth/validate');
      console.log("✅ SESSION VALIDATION SUCCESS");
      return response.data;
    } catch (error: any) {
      console.error("❌ SESSION VALIDATION FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  // ============================================================
  // CHANGE MPIN (Using Secure Hardware Device Info)
  // ============================================================

  static async changeAdminMpin(currentMpin: string, newMpin: string): Promise<any> {
    const adminId = await getItem('admin_id');
    const deviceInfo = await this.getDeviceInfoForApi();

    if (!adminId) {
      throw new Error('Admin ID not found. Please login again.');
    }

    console.log("🔄 CHANGE ADMIN MPIN WITH SECURE HARDWARE DEVICE:", {
      admin_id: adminId,
      current_mpin_length: currentMpin.length,
      new_mpin_length: newMpin.length,
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.post('/admin-auth/mpin/change', {
        admin_id: adminId,
        current_mpin: currentMpin,
        new_mpin: newMpin,
        device_id: deviceInfo.deviceId,
        device_fingerprint: deviceInfo.deviceFingerprint,
        user_agent: deviceInfo.userAgent,
      });

      console.log("✅ ADMIN MPIN CHANGE SUCCESSFULLY");
      return response.data;
    } catch (error: any) {
      console.error("❌ ADMIN MPIN CHANGE FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  // ============================================================
  // GET STORED PHONE FOR MPIN LOGIN
  // ============================================================

  static async getStoredPhoneForMpin(): Promise<string | null> {
    try {
      const phoneNumber = await getItem('phone_number');
      const countryCode = await getItem('country_code') || '+91';
      
      if (phoneNumber) {
        return `${countryCode}${phoneNumber}`;
      }
      return null;
    } catch (error) {
      console.error('Error getting stored phone:', error);
      return null;
    }
  }

  // ============================================================
  // DEVICE MANAGEMENT APIS (Optional - For Future Use)
  // ============================================================

  static async getDeviceTrustStatus(): Promise<any> {
    const deviceInfo = await this.getDeviceInfoForApi();
    
    console.log("📱 CHECKING DEVICE TRUST STATUS:", {
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.get('/admin-auth/device/trust-status', {
        params: {
          device_id: deviceInfo.deviceId
        }
      });

      console.log("✅ DEVICE TRUST STATUS RETRIEVED");
      return response.data;
    } catch (error: any) {
      console.error("❌ DEVICE TRUST STATUS CHECK FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  static async revokeDeviceTrust(): Promise<any> {
    const deviceInfo = await this.getDeviceInfoForApi();

    console.log("🚫 REVOKING DEVICE TRUST:", {
      device_id: deviceInfo.deviceId.substring(0, 20) + '...',
    });

    try {
      const response = await api.post('/admin-auth/device/revoke-trust', {
        device_id: deviceInfo.deviceId,
        device_fingerprint: deviceInfo.deviceFingerprint,
        user_agent: deviceInfo.userAgent,
      });

      console.log("✅ DEVICE TRUST REVOKED");
      return response.data;
    } catch (error: any) {
      console.error("❌ DEVICE TRUST REVOCATION FAILED:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      throw error;
    }
  }
}