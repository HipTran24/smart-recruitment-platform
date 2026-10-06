import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { tokenStore } from './token-store';
import { authService } from '../services/auth.service';
import type {
  AuthenticatedUser,
  ChangePasswordRequest,
  PasswordLoginRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RegistrationRequest,
} from '../contracts/auth';

export type AuthStatus = 'initializing' | 'anonymous' | 'authenticated' | 'refreshing';

export interface AuthContextType {
  user: AuthenticatedUser | null;
  status: AuthStatus;
  error: string | null;
  login: (credentials: PasswordLoginRequest) => Promise<AuthenticatedUser>;
  register: (data: RegistrationRequest) => Promise<void>;
  logout: () => Promise<void>;
  quickSwitch: (role: 'admin' | 'recruiter' | 'candidate') => Promise<string>;
  verifyEmail: (token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  confirmPasswordReset: (token: string, newPass: string) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  hasRole: (role: string) => boolean;
  isCandidate: boolean;
  isRecruiter: boolean;
  isAdmin: boolean;
}

export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@smartrecruit.local',
    password: 'SecurePassword123!',
    path: '/admin-console',
    label: 'Platform Admin',
  },
  recruiter: {
    email: 'recruiter@smartrecruit.local',
    password: 'SecurePassword123!',
    path: '/recruiter/console',
    label: 'Recruiter Lead',
  },
  candidate: {
    email: 'candidate@smartrecruit.local',
    password: 'SecurePassword123!',
    path: '/my-applications',
    label: 'Job Applicant',
  },
} as const;


const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [error, setError] = useState<string | null>(null);

  const loadCurrentUser = useCallback(async (): Promise<AuthenticatedUser | null> => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setStatus('authenticated');
      setError(null);
      return currentUser;
    } catch {
      setUser(null);
      tokenStore.clear();
      setStatus('anonymous');
      return null;
    }
  }, []);

  useEffect(() => {
    // If token exists in memory on startup, load current user
    if (tokenStore.getAccessToken()) {
      loadCurrentUser();
    } else {
      setStatus('anonymous');
    }

    // Subscribe to in-memory token changes
    const unsubscribe = tokenStore.subscribe((tokens) => {
      if (!tokens) {
        setUser(null);
        setStatus('anonymous');
      }
    });

    return unsubscribe;
  }, [loadCurrentUser]);

  const login = useCallback(
    async (credentials: PasswordLoginRequest): Promise<AuthenticatedUser> => {
      setError(null);
      try {
        await authService.login(credentials);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setStatus('authenticated');
        return currentUser;
      } catch (err: any) {
        setError(err.message || 'Login failed');
        throw err;
      }
    },
    []
  );

  const register = useCallback(async (data: RegistrationRequest): Promise<void> => {
    setError(null);
    try {
      await authService.register(data);
      // After registration, token is issued.
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setStatus('authenticated');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      tokenStore.clear();
      setStatus('anonymous');
    }
  }, []);

  const verifyEmail = useCallback(async (token: string): Promise<void> => {
    await authService.verifyEmail({ token });
    if (tokenStore.getAccessToken()) {
      await loadCurrentUser();
    }
  }, [loadCurrentUser]);

  const requestPasswordReset = useCallback(async (email: string): Promise<string> => {
    const res = await authService.requestPasswordReset({ email });
    return res.message;
  }, []);

  const confirmPasswordReset = useCallback(
    async (token: string, newPassword: string): Promise<void> => {
      await authService.confirmPasswordReset({ token, newPassword });
    },
    []
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      await authService.changePassword({ currentPassword, newPassword });
      // Changing password revokes sessions per ADR 0003 -> log out and require re-login
      await logout();
    },
    [logout]
  );

  const hasRole = useCallback(
    (roleCode: string): boolean => {
      if (!user) return false;
      return user.roleCodes.includes(roleCode);
    },
    [user]
  );

  const isCandidate = useMemo(() => hasRole('ROLE_CANDIDATE'), [hasRole]);
  const isRecruiter = useMemo(() => hasRole('ROLE_RECRUITER'), [hasRole]);
  const isAdmin = useMemo(() => hasRole('ROLE_PLATFORM_ADMIN'), [hasRole]);

  const quickSwitch = useCallback(
    async (role: 'admin' | 'recruiter' | 'candidate'): Promise<string> => {
      const target = DEMO_ACCOUNTS[role];
      await login({ email: target.email, password: target.password });
      return target.path;
    },
    [login]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      status,
      error,
      login,
      register,
      logout,
      quickSwitch,
      verifyEmail,
      requestPasswordReset,
      confirmPasswordReset,
      changePassword,
      hasRole,
      isCandidate,
      isRecruiter,
      isAdmin,
    }),
    [
      user,
      status,
      error,
      login,
      register,
      logout,
      quickSwitch,
      verifyEmail,
      requestPasswordReset,
      confirmPasswordReset,
      changePassword,
      hasRole,
      isCandidate,
      isRecruiter,
      isAdmin,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
