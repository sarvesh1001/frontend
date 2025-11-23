import { LoginInitiateResponse, VerifyMpinResponse, VerifyOtpResponse } from '../types';
import { getDeviceInfo } from '../utils/device';
import api from './api';
import { clearStorage, getItem, setItem } from './storage';

// ============================================================
// PHONE NUMBER NORMALIZER
// ============================================================

function formatPhone(phone: string): string {
  if (!phone) return phone;
  return phone.startsWith("+91") ? phone : `+91${phone}`;
}

export class AuthService {
  // ============================================================
  // ADMIN APIs
  // ============================================================

  // 1️⃣ ADMIN LOGIN INITIATE
  static async adminLoginInitiate(phoneNumber: string): Promise<LoginInitiateResponse> {
    const formattedPhone = formatPhone(phoneNumber);
    const deviceInfo = await getDeviceInfo();

    console.log("📌 LOGIN INITIATE PAYLOAD:", {
      phone_number: formattedPhone,
      device_id: deviceInfo.deviceId,
      device_fingerprint: deviceInfo.deviceFingerprint,
    });

    const response = await api.post('/admin-auth/login/initiate', {
      phone_number: formattedPhone,
      device_id: deviceInfo.deviceId,
      device_fingerprint: deviceInfo.deviceFingerprint,
    });

    return response.data;
  }

  // 2️⃣ SEND OTP
  static async sendOtp(phoneNumber: string, purpose: string): Promise<any> {
    const formattedPhone = formatPhone(phoneNumber);
    const deviceInfo = await getDeviceInfo();

    console.log("📌 OTP SEND PAYLOAD:", {
      phone_number: formattedPhone,
      purpose,
      device_id: deviceInfo.deviceId,
      provider: 'mock',
    });

    const response = await api.post('/otp/send', {
      phone_number: formattedPhone,
      purpose,
      device_id: deviceInfo.deviceId,
      provider: 'mock',
    });

    return response.data;
  }

  // 3️⃣ VERIFY ADMIN OTP
  static async verifyAdminOtp(phoneNumber: string, otp: string): Promise<VerifyOtpResponse> {
    const formattedPhone = formatPhone(phoneNumber);
    const deviceInfo = await getDeviceInfo();

    console.log("📌 OTP VERIFY PAYLOAD:", {
      phone_number: formattedPhone,
      otp,
      device_id: deviceInfo.deviceId,
      device_fingerprint: deviceInfo.deviceFingerprint,
    });

    const response = await api.post('/admin-auth/login/verify-otp', {
      phone_number: formattedPhone,
      otp,
      device_id: deviceInfo.deviceId,
      device_fingerprint: deviceInfo.deviceFingerprint,
    });

    if (response.data.success && response.data.data.admin_id) {
      await setItem('admin_id', response.data.data.admin_id);
    }

    return response.data;
  }

  // 4️⃣ SETUP ADMIN MPIN
  static async setupAdminMpin(mpin: string): Promise<any> {
    const adminId = await getItem('admin_id');
    const deviceInfo = await getDeviceInfo();

    console.log("📌 MPIN SETUP PAYLOAD:", {
      admin_id: adminId,
      mpin,
      device_id: deviceInfo.deviceId,
    });

    const response = await api.post('/admin-auth/mpin/setup', {
      admin_id: adminId,
      mpin,
      device_id: deviceInfo.deviceId,
    });

    return response.data;
  }

  // 5️⃣ VERIFY ADMIN MPIN
  static async verifyAdminMpin(mpin: string): Promise<VerifyMpinResponse> {
    const adminId = await getItem('admin_id');
    const deviceInfo = await getDeviceInfo();

    console.log("📌 MPIN VERIFY PAYLOAD:", {
      admin_id: adminId,
      mpin,
      device_id: deviceInfo.deviceId,
      device_fingerprint: deviceInfo.deviceFingerprint,
    });

    const response = await api.post('/admin-auth/login/verify-mpin', {
      admin_id: adminId,
      mpin,
      device_id: deviceInfo.deviceId,
      device_fingerprint: deviceInfo.deviceFingerprint,
    });

    if (response.data.success && response.data.data.tokens) {
      await setItem('access_token', response.data.data.tokens.access_token);
      await setItem('refresh_token', response.data.data.tokens.refresh_token);
    }

    return response.data;
  }

  // ============================================================
  // USER APIs
  // ============================================================

  static async checkUserExists(phoneNumber: string): Promise<any> {
    const formattedPhone = formatPhone(phoneNumber);
    return (await api.get(`/users/phone/${formattedPhone}`)).data;
  }

  static async userLoginInitiate(phoneNumber: string): Promise<LoginInitiateResponse> {
    const formattedPhone = formatPhone(phoneNumber);
    const deviceInfo = await getDeviceInfo();

    console.log("📌 USER LOGIN INITIATE PAYLOAD:", {
      phone_number: formattedPhone,
      device_id: deviceInfo.deviceId,
      device_fingerprint: deviceInfo.deviceFingerprint,
      data_region: "ap-south-1",
    });

    const response = await api.post('/auth/login/initiate', {
      phone_number: formattedPhone,
      device_id: deviceInfo.deviceId,
      device_fingerprint: deviceInfo.deviceFingerprint,
      data_region: 'ap-south-1',
    });

    return response.data;
  }

  static async verifyUserOtp(phoneNumber: string, otp: string): Promise<VerifyOtpResponse> {
    const formattedPhone = formatPhone(phoneNumber);
    const deviceInfo = await getDeviceInfo();

    console.log("📌 USER OTP VERIFY PAYLOAD:", {
      phone_number: formattedPhone,
      otp,
      device_id: deviceInfo.deviceId,
      device_fingerprint: deviceInfo.deviceFingerprint,
    });

    const response = await api.post('/auth/login/verify-otp', {
      phone_number: formattedPhone,
      otp,
      device_id: deviceInfo.deviceId,
      device_fingerprint: deviceInfo.deviceFingerprint,
    });

    if (response.data.success && response.data.data.user_id) {
      await setItem('user_id', response.data.data.user_id);
    }

    return response.data;
  }

  static async setupUserMpin(mpin: string): Promise<any> {
    const userId = await getItem('user_id');
    const deviceInfo = await getDeviceInfo();

    const response = await api.post('/auth/mpin/setup', {
      user_id: userId,
      mpin,
      device_id: deviceInfo.deviceId,
    });

    return response.data;
  }

  static async verifyUserMpin(mpin: string): Promise<VerifyMpinResponse> {
    const userId = await getItem('user_id');
    const deviceInfo = await getDeviceInfo();

    const response = await api.post('/auth/login/verify-mpin', {
      user_id: userId,
      mpin,
      device_id: deviceInfo.deviceId,
      device_fingerprint: deviceInfo.deviceFingerprint,
    });

    if (response.data.success && response.data.data.tokens) {
      await setItem('access_token', response.data.data.tokens.access_token);
      await setItem('refresh_token', response.data.data.tokens.refresh_token);

      if (response.data.data.company_context) {
        await setItem('company_context', JSON.stringify(response.data.data.company_context));
      }
    }

    return response.data;
  }

  // ============================================================
  // LOGOUT (UPDATED)
  // ============================================================

  static async logout(): Promise<any> {
    try {
      const refreshToken = await getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await clearStorage();
    }
  }

  static async validateSession(): Promise<any> {
    return (await api.get('/auth/validate')).data;
  }
}
