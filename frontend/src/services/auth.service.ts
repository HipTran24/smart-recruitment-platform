import { apiClient } from '../lib/api';
import { tokenStore } from '../auth/token-store';
import type {
  AuthenticatedUser,
  ChangePasswordRequest,
  PasswordLoginRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RegistrationRequest,
  TokenResponse,
  VerifyEmailRequest,
} from '../contracts/auth';

export const authService = {
  async register(payload: RegistrationRequest): Promise<TokenResponse> {
    const tokens = await apiClient.post<TokenResponse>('/api/v1/auth/register', payload, {
      auth: false,
    });
    tokenStore.setTokens(tokens);
    return tokens;
  },

  async login(payload: PasswordLoginRequest): Promise<TokenResponse> {
    const tokens = await apiClient.post<TokenResponse>('/api/v1/auth/login', payload, {
      auth: false,
    });
    tokenStore.setTokens(tokens);
    return tokens;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', { refreshToken }, { auth: false });
      }
    } finally {
      tokenStore.clear();
    }
  },

  async getCurrentUser(): Promise<AuthenticatedUser> {
    return apiClient.get<AuthenticatedUser>('/api/v1/auth/me', { auth: true });
  },

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/api/v1/auth/password/change', payload, { auth: true });
  },

  async requestPasswordReset(payload: PasswordResetRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/api/v1/auth/password/reset-request', payload, {
      auth: false,
    });
  },

  async confirmPasswordReset(payload: PasswordResetConfirmRequest): Promise<void> {
    await apiClient.post('/api/v1/auth/password/reset-confirm', payload, { auth: false });
  },

  async verifyEmail(payload: VerifyEmailRequest): Promise<void> {
    await apiClient.post('/api/v1/auth/verify-email', payload, { auth: false });
  },

  async fetchLocalTestVerificationToken(email: string): Promise<string | null> {
    try {
      const res = await apiClient.get<{ token: string }>('/api/v1/test/mailbox/verification-token', {
        params: { email },
        auth: false,
      });
      return res?.token ?? null;
    } catch {
      return null;
    }
  },

  async fetchLocalTestResetToken(email: string): Promise<string | null> {
    try {
      const res = await apiClient.get<{ token: string }>('/api/v1/test/mailbox/reset-token', {
        params: { email },
        auth: false,
      });
      return res?.token ?? null;
    } catch {
      return null;
    }
  },
};
