const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

class APIError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    data: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

async function apiRequest<T>(
  url: string,
  options: RequestInit
): Promise<T> {
  try {
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log('🔌 API Request:', fullUrl, options.method);

    const res = await fetch(fullUrl, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include',
      ...options,
    });

    console.log('📡 Response Status:', res.status, res.statusText);

    if (!res.ok) {
      const errorData = await res.json();
      console.error('❌ API Error:', errorData);

      throw new APIError(
        errorData.message || `HTTP ${res.status}`,
        res.status,
        errorData
      );
    }

    const data = await res.json();
    console.log('✅ API Success:', data);
    return data;
  } catch (error) {
    console.error('❌ API Request Failed:', error);
    throw error;
  }
}

export async function registerAdmin(data: {
  full_name: string;
  email: string;
  password: string;
}) {
  return apiRequest<{
    message: string;
    admin_id: string;
  }>('/auth/create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginAdmin(data: {
  email: string;
  password: string;
}) {
  return apiRequest<{
    message: string;
    admin_id: string;
    admin_email: string;
    attempt_id?: string;
    approvers_notified?: number;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyOtp(data: {
  admin_id: string;
  otp: string;
  purpose: 'register' | 'login' | 'reset_password' | 'login_approved';
}) {
  return apiRequest<{
    message: string;
    token: string;
    admin: Record<string, unknown>;
  }>('/auth/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyApprovedLoginOtp(data: {
  admin_id: string;
  otp: string;
  login_attempt_id: string;
}) {
  return apiRequest<{
    message: string;
    token: string;
    admin: Record<string, unknown>;
  }>('/auth/verify-approved-login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resendOtp({
  email,
  purpose,
  login_attempt_id,
}: {
  email: string;
  purpose: string;
  login_attempt_id?: string;
}) {
  return apiRequest<{
    message: string;
    admin_id: string;
  }>('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({
      email,
      purpose,
      ...(login_attempt_id && { login_attempt_id }),
    }),
  });
}

export async function forgotPassword(data: { email: string }) {
  return apiRequest<{
    message: string;
    admin_id: string;
  }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resetPassword(data: {
  admin_id: string;
  new_password: string;
}) {
  return apiRequest<{
    message: string;
  }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}