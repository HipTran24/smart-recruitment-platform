export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface AuthenticatedUser {
  id: number | string;
  email: string;
  fullName: string;
  roleCodes: string[];
}

export interface RegistrationRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface PasswordLoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}
