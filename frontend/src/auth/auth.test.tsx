// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { tokenStore } from './token-store';
import { sanitizeReturnUrl } from './guards';

function TestAuthConsumer() {
  const { user, status, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="user">{user ? user.fullName : 'anonymous'}</div>
      <button
        onClick={() =>
          login({ email: 'test@candidate.internal', password: 'ValidPassword123!' })
        }
      >
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext & Session In-Memory (INT-03)', () => {
  beforeEach(() => {
    cleanup();
    tokenStore.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    tokenStore.clear();
    vi.restoreAllMocks();
  });

  it('initializes to anonymous when tokenStore is empty', () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('anonymous');
    expect(screen.getByTestId('user').textContent).toBe('anonymous');
  });

  it('performs login and loads user into memory without localStorage persistence', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/auth/login')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token',
            tokenType: 'Bearer',
            accessTokenExpiresAt: '2026-10-06T00:00:00Z',
            refreshTokenExpiresAt: '2026-10-13T00:00:00Z',
          }),
        });
      }

      if (url.includes('/api/v1/auth/me')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            id: 101,
            email: 'test@candidate.internal',
            fullName: 'Nguyen Candidate',
            roleCodes: ['ROLE_CANDIDATE'],
          }),
        });
      }

      return Promise.reject(new Error('Unknown url: ' + url));
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    const loginBtn = screen.getByText('Login');
    await act(async () => {
      loginBtn.click();
    });

    expect(screen.getByTestId('status').textContent).toBe('authenticated');
    expect(screen.getByTestId('user').textContent).toBe('Nguyen Candidate');
    expect(tokenStore.getAccessToken()).toBe('test-access-token');

    // Confirm nothing was stored in localStorage
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('clears session in memory on logout', async () => {
    tokenStore.setTokens({
      accessToken: 'initial-access',
      refreshToken: 'initial-refresh',
      tokenType: 'Bearer',
      accessTokenExpiresAt: '2026-10-06T00:00:00Z',
      refreshTokenExpiresAt: '2026-10-13T00:00:00Z',
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
    });

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    const logoutBtn = screen.getByText('Logout');
    await act(async () => {
      logoutBtn.click();
    });

    expect(tokenStore.getTokens()).toBeNull();
    expect(screen.getByTestId('status').textContent).toBe('anonymous');
  });

  it('sanitizes returnUrl preventing open redirects and auth page loops', () => {
    expect(sanitizeReturnUrl('/my-applications')).toBe('/my-applications');
    expect(sanitizeReturnUrl('/recruiter/candidates?page=1')).toBe('/recruiter/candidates?page=1');
    expect(sanitizeReturnUrl('//evil.com')).toBe('/');
    expect(sanitizeReturnUrl('https://evil.com')).toBe('/');
    expect(sanitizeReturnUrl('/login')).toBe('/');
    expect(sanitizeReturnUrl('/register')).toBe('/');
    expect(sanitizeReturnUrl('/forgot-password')).toBe('/');
    expect(sanitizeReturnUrl(null)).toBe('/');
  });
});
