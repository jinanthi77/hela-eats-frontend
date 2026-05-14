import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, AuthResponse, LoginPayload, RegisterPayload, GoogleTokenPayload } from '../types';
import * as authService from '../services/authService';

// ─── Context Shape ───────────────────────────────────────────────────
export interface AuthContextType {
  /** The authenticated user object (null when logged out or still loading) */
  user: User | null;
  /** JWT token stored in localStorage */
  token: string | null;
  /** True while the initial profile hydration is in progress */
  isLoading: boolean;
  /** Convenience boolean — true when token exists AND user is hydrated */
  isAuthenticated: boolean;
  /** Login with email & password */
  login: (payload: LoginPayload) => Promise<void>;
  /** Register with email & password */
  register: (payload: RegisterPayload) => Promise<void>;
  /** Login / register via Google ID-token flow */
  googleLogin: (payload: GoogleTokenPayload) => Promise<void>;
  /** Clear token and user state */
  logout: () => void;
  /** Force-refresh the user profile from the server */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(!!localStorage.getItem('token'));

  // ── Hydrate user profile from token on mount ─────────────────────
  const hydrateUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setToken(storedToken);
    } catch {
      // Token is invalid or expired — clean up
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  // ── Helper: persist token and hydrate profile ────────────────────
  const handleAuthResponse = useCallback(async (response: AuthResponse) => {
    localStorage.setItem('token', response.token);
    setToken(response.token);

    // Immediately set basic user info from the auth response
    setUser({
      _id: response._id,
      name: response.name,
      email: response.email,
      role: response.role,
      profilePicture: response.profilePicture as any,
    });

    // Then hydrate the full profile (addresses, pantry, etc.)
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      // Basic info from auth response is still valid — no-op
    }
  }, []);

  // ── Public API ───────────────────────────────────────────────────
  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.loginUser(payload);
    await handleAuthResponse(response);
  }, [handleAuthResponse]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.registerUser(payload);
    await handleAuthResponse(response);
  }, [handleAuthResponse]);

  const googleLogin = useCallback(async (payload: GoogleTokenPayload) => {
    const response = await authService.googleTokenLogin(payload);
    await handleAuthResponse(response);
  }, [handleAuthResponse]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await hydrateUser();
  }, [hydrateUser]);

  // ── Value ────────────────────────────────────────────────────────
  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    googleLogin,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
