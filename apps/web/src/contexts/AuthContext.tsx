'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import type { ApiResponse } from '@attendance-tracker/shared-types';
import {
  saveTokens,
  saveUser,
  clearTokens,
  getStoredUser,
  getAccessToken,
  isTokenExpired,
  type StoredUser,
} from '@/lib/auth';
import { apiClient } from '@/lib/api-client';

interface LoginPayload {
  accessToken: string;
  refreshToken: string;
  user: StoredUser;
}

interface AuthState {
  user: StoredUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getStoredUser();

    if (token && storedUser && !isTokenExpired(token)) {
      setState({ user: storedUser, isLoading: false, isAuthenticated: true });
    } else {
      clearTokens();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<ApiResponse<LoginPayload>>('/api/auth/login', {
      email,
      password,
    });

    if (!res.data) throw new Error(res.error ?? 'Login failed');

    saveTokens({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
    saveUser(res.data.user);
    setState({ user: res.data.user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('at_refresh_token');
    await apiClient.post('/api/auth/logout', { refreshToken }).catch(() => null);
    clearTokens();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
  );
}
