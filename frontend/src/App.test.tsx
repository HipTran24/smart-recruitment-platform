// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, expect, it, afterEach, beforeEach, vi } from 'vitest';
import App from './App';
import { tokenStore } from './auth/token-store';

describe('App routes & Access Control (INT-02, INT-03)', () => {
  beforeEach(() => {
    tokenStore.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    tokenStore.clear();
    vi.restoreAllMocks();
  });

  describe('Public Routes (Unauthenticated browsing)', () => {
    it('renders the explore jobs route publicly without login', () => {
      window.history.pushState({}, '', '/explore-jobs');
      render(<App />);

      expect(screen.getByText(/Explore Career Opportunities/i)).toBeInTheDocument();
    });

    it('renders the view details route publicly without login', () => {
      window.history.pushState({}, '', '/views_details');
      render(<App />);

      expect(screen.getByRole('heading', { name: /UX Strategist/i })).toBeInTheDocument();
    });
  });

  describe('Guarded Routes (Anonymous Redirection)', () => {
    it('redirects anonymous visitor from /my-applications to /login', () => {
      window.history.pushState({}, '', '/my-applications');
      render(<App />);

      expect(screen.getByRole('heading', { name: /SmartRecruit Platform/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Đăng Nhập/i })).toBeInTheDocument();
    });

    it('redirects anonymous visitor from /recruiter/jobs to /login', () => {
      window.history.pushState({}, '', '/recruiter/jobs');
      render(<App />);

      expect(screen.getByRole('heading', { name: /SmartRecruit Platform/i })).toBeInTheDocument();
    });

    it('redirects anonymous visitor from /admin-console to /login', () => {
      window.history.pushState({}, '', '/admin-console');
      render(<App />);

      expect(screen.getByRole('heading', { name: /SmartRecruit Platform/i })).toBeInTheDocument();
    });
  });

  describe('Authenticated Role-Guarded Access', () => {
    it('renders candidate portal when user is authenticated with ROLE_CANDIDATE', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/v1/auth/me')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              id: 101,
              email: 'candidate@example.com',
              fullName: 'Harriet Candidate',
              roles: ['ROLE_CANDIDATE'],
              roleCodes: ['ROLE_CANDIDATE'],
            }),
          });
        }
        return Promise.reject(new Error('Unknown endpoint: ' + url));
      });

      tokenStore.setTokens({
        accessToken: 'valid-candidate-token',
        refreshToken: 'valid-refresh-token',
        tokenType: 'Bearer',
        accessTokenExpiresAt: new Date(Date.now() + 900000).toISOString(),
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      window.history.pushState({}, '', '/my-applications');
      await act(async () => {
        render(<App />);
      });

      expect(screen.getByText(/Welcome back, Harriet/i)).toBeInTheDocument();
      expect(screen.getByText(/Candidate Portal/i)).toBeInTheDocument();
    });

    it('renders recruiter console when user is authenticated with ROLE_RECRUITER', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/v1/auth/me')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              id: 202,
              email: 'recruiter@example.com',
              fullName: 'Elena Recruiter',
              roles: ['ROLE_RECRUITER'],
              roleCodes: ['ROLE_RECRUITER'],
            }),
          });
        }
        return Promise.reject(new Error('Unknown endpoint: ' + url));
      });

      tokenStore.setTokens({
        accessToken: 'valid-recruiter-token',
        refreshToken: 'valid-refresh-token',
        tokenType: 'Bearer',
        accessTokenExpiresAt: new Date(Date.now() + 900000).toISOString(),
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      window.history.pushState({}, '', '/recruiter/console');
      await act(async () => {
        render(<App />);
      });

      expect(screen.getByRole('heading', { name: /Hiring Operations Dashboard/i })).toBeInTheDocument();
    });

    it('renders admin console when user is authenticated with ROLE_PLATFORM_ADMIN', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/v1/auth/me')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              id: 303,
              email: 'admin@example.com',
              fullName: 'Root Admin',
              roles: ['ROLE_PLATFORM_ADMIN'],
              roleCodes: ['ROLE_PLATFORM_ADMIN'],
            }),
          });
        }
        return Promise.reject(new Error('Unknown endpoint: ' + url));
      });

      tokenStore.setTokens({
        accessToken: 'valid-admin-token',
        refreshToken: 'valid-refresh-token',
        tokenType: 'Bearer',
        accessTokenExpiresAt: new Date(Date.now() + 900000).toISOString(),
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      window.history.pushState({}, '', '/admin-console');
      await act(async () => {
        render(<App />);
      });

      expect(screen.getByText(/Admin Console Overview/i)).toBeInTheDocument();
    });
  });
});
