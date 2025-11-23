export interface LoginInitiateResponse {
    success: boolean;
    data: {
      user_exists: boolean;
      has_mpin: boolean;
      mpin_locked: boolean;
      device_trusted: boolean;
      flow_state: string;
      message: string;
      user_id?: string;   // <-- FIX ADDED
    };
    message: string;
    timestamp?: string;
  }
  
  export interface VerifyOtpResponse {
    success: boolean;
    data: {
      admin_id?: string;
      user_id?: string;
      device_trusted: boolean;
      has_mpin: boolean;
      message: string;
      mpin_locked: boolean;
      next_step?: string;
    };
    message: string;
    timestamp?: string;
  }
  
  export interface VerifyMpinResponse {
    success: boolean;
    data: {
      tokens: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        token_type: string;
      };
      company_context?: any;
      admin?: any;
      message: string;
      user_id?: string;
    };
    message: string;
    timestamp?: string;
  }
  
  export interface UserType {
    type: 'admin' | 'user';
    phoneNumber?: string;
  }
  