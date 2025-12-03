export interface LoginInitiateResponse {
  success: boolean;
  data: {
    user_exists: boolean;
    has_mpin: boolean;
    mpin_locked: boolean;
    device_trusted: boolean;
    flow_state: string;
    message: string;
    user_id?: string;
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

// Company Types
export interface Company {
  company_id: string;
  company_name: string;
  owner_user_id: string;
  subscription_tier: SubscriptionTier;
  subscription_status: 'active' | 'inactive' | 'suspended';
  max_employees: number;
  data_region: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_start_date: string;
  subscription_end_date: string;
}

export type SubscriptionTier = 'basic' | 'premium' | 'diamond' | 'gold' | 'platinum';

export interface CreateCompanyRequest {
  company_name: string;
  owner_phone: string;
  subscription_tier: SubscriptionTier;
  max_employees: number;
  data_region: string;
  subscription_months: number;
  subscription_days: number;
  departments: string[];
}

export interface CreateCompanyResponse {
  success: boolean;
  data: Company;
  message: string;
  timestamp: string;
}

export interface Department {
  name: string;
  module_code: string;
  description: string;
  is_default?: boolean;
}

export interface ErrorResponse {
  success: boolean;
  error: string;
  message: string;
  timestamp: string;
}