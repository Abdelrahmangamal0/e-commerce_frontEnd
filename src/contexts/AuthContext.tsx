// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import toast from 'react-hot-toast';

import { authApi }           from '@/lib/api/auth.api';
import { apiClient }         from '@/lib/api/client';
import { tokenStorage }      from '@/lib/api/token.storage';
import { User, RoleEnum, LoginDto, SignupDto } from '@/types';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextType {
  user:            User | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  isAdmin:         boolean;
  login:           (data: LoginDto)   => Promise<void>;
  signup:          (data: SignupDto)  => Promise<void>;
  logout:          ()                 => Promise<void>;
  refreshUser:     ()                 => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === RoleEnum.Admin || user?.role === RoleEnum.SuperAdmin;

  // ── Internal helpers ─────────────────────────────────────────────────────

  /** Fetches fresh profile data and stores it in state. */
  const refreshUser = useCallback(async () => {
    const profile = await authApi.getProfile(); // throws on failure
    setUser(profile);
  }, []);

  /**
   * Clears all tokens + user state without calling the backend.
   * Used both by the normal logout flow and by the forced-logout
   * callback we register on the API client.
   */
  const clearSession = useCallback(() => {
    tokenStorage.clearAll();
    setUser(null);
  }, []);

  // ── Register forced-logout handler on the Axios client ──────────────────
  //
  // When the refresh token is invalid/expired the Axios interceptor needs to
  // log the user out.  We can't import AuthContext there (circular dep), so
  // instead we hand a callback to the client instance once on mount.
  useEffect(() => {
    apiClient.setAuthFailureHandler(() => {
      clearSession();
      toast.error('Your session has expired. Please log in again.');
    });
  }, [clearSession]);

  // ── Bootstrap: restore session on page load ──────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      if (tokenStorage.getAccess()) {
        try {
          await refreshUser();
        } catch {
          // Access token may already be expired; the interceptor will attempt
          // a refresh automatically.  If that also fails, clearSession() will
          // be called via onAuthFailure, so we only need to handle the case
          // where no refresh is possible at all.
          clearSession();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth actions ─────────────────────────────────────────────────────────

  const login = async (data: LoginDto) => {
    try {
      const response = await authApi.login(data);

      if (!response.credentials) {
        throw new Error('Login response missing credentials');
      }

      // Determine the token signature expected by the backend guard
      const signature =
        response.role === RoleEnum.SuperAdmin || response.role === RoleEnum.Admin
          ? 'System'
          : 'Bearer';

      tokenStorage.setSignature(signature);
      tokenStorage.setCredentials(
        response.credentials.access_token,
        response.credentials.refresh_token,
      );

      await refreshUser();
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (data: SignupDto) => {
    try {
      await authApi.signup(data);
      toast.success('Account created successfully. Please verify your email.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signup failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout(); // tell backend to revoke the refresh token
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      toast.success('Logged out successfully');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, isAdmin, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};