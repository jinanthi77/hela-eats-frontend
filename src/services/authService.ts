import apiClient from '../api/client';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  GoogleTokenPayload,
  User,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://127.0.0.1:5000';

type MessageResponse = {
  message: string;
};

// ─── Email / Password ────────────────────────────────────────────────
export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/users/login', payload);
  return data;
};

export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/users/register', payload);
  return data;
};

export const requestPasswordReset = async (email: string): Promise<MessageResponse> => {
  const { data } = await apiClient.post<MessageResponse>('/users/forgot-password', {
    email: email.trim().toLowerCase(),
  });
  return data;
};

export const resetPassword = async (token: string, password: string): Promise<MessageResponse> => {
  const { data } = await apiClient.put<MessageResponse>(`/users/reset-password/${encodeURIComponent(token)}`, {
    password,
  });
  return data;
};

// ─── Google OAuth ────────────────────────────────────────────────────
export const googleTokenLogin = async (payload: GoogleTokenPayload): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/auth/google/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Google sign-in failed');
  }

  return res.json();
};

/** Redirect the browser to the backend Google OAuth flow */
export const googleRedirect = () => {
  window.location.href = `${API_BASE}/auth/google`;
};

// ─── Profile ─────────────────────────────────────────────────────────
export const getProfile = async (): Promise<User> => {
  const { data } = await apiClient.get<User>('/users/profile');
  return data;
};

export const updateProfile = async (payload: Partial<User>): Promise<User> => {
  const { data } = await apiClient.put<User>('/users/profile', payload);
  return data;
};
