// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient, request } from './api';
import { ApiError } from './api-error';
import { tokenStore } from '../auth/token-store';

describe('HTTP Client & ApiError (INT-02)', () => {
  beforeEach(() => {
    tokenStore.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    tokenStore.clear();
    vi.restoreAllMocks();
  });

  it('handles successful JSON response', async () => {
    const mockData = { id: 'job-123', title: 'Senior Backend Engineer' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockData,
    });

    const res = await apiClient.get<typeof mockData>('/api/v1/jobs/job-123');
    expect(res).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/jobs/job-123',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('handles 204 No Content without parsing JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
    });

    const res = await apiClient.delete('/api/v1/jobs/job-123');
    expect(res).toBeUndefined();
  });

  it('handles 400 Bad Request with field errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json', 'x-request-id': 'req-test-1' }),
      json: async () => ({
        code: 'VALIDATION_FAILED',
        message: 'Invalid registration input',
        fieldErrors: { email: 'Email format is invalid' },
      }),
    });

    await expect(apiClient.post('/api/v1/auth/register', {})).rejects.toThrow(ApiError);

    try {
      await apiClient.post('/api/v1/auth/register', {});
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(400);
      expect(err.code).toBe('VALIDATION_FAILED');
      expect(err.fieldErrors?.email).toBe('Email format is invalid');
      expect(err.requestId).toBe('req-test-1');
    }
  });

  it('handles 403 Forbidden', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ code: 'ACCESS_DENIED', message: 'Admin cannot view raw dossier' }),
    });

    try {
      await apiClient.get('/api/v1/recruiter/applications/app-1');
    } catch (err: any) {
      expect(err.isForbidden()).toBe(true);
      expect(err.code).toBe('ACCESS_DENIED');
    }
  });

  it('handles 409 Conflict', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ code: 'EMAIL_ALREADY_REGISTERED', message: 'Email already exists' }),
    });

    try {
      await apiClient.post('/api/v1/auth/register', {});
    } catch (err: any) {
      expect(err.isConflict()).toBe(true);
    }
  });

  it('handles 429 Too Many Requests', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' }),
    });

    try {
      await apiClient.post('/api/v1/auth/login', {});
    } catch (err: any) {
      expect(err.isRateLimited()).toBe(true);
    }
  });

  it('handles 500 Internal Server Error with HTML body gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'text/html' }),
      text: async () => '<html><body>Gateway error</body></html>',
    });

    try {
      await apiClient.get('/api/v1/jobs');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(500);
    }
  });

  it('serializes query parameters properly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ items: [], totalElements: 0 }),
    });

    await apiClient.get('/api/v1/jobs', {
      params: { page: 0, size: 10, search: 'react', empty: null },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/jobs?page=0&size=10&search=react',
      expect.anything()
    );
  });

  it('supports FormData without overriding multipart content-type', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 'file-1' }),
    });

    const formData = new FormData();
    formData.append('file', new Blob(['test cv'], { type: 'application/pdf' }));

    await apiClient.post('/api/v1/candidates/me/resumes/upload', formData);

    const callArgs = (global.fetch as any).mock.calls[0];
    const headers = callArgs[1].headers;
    expect(headers.get('Content-Type')).toBeNull();
  });

  it('performs single-flight refresh on 401 response and retries request', async () => {
    tokenStore.setTokens({
      accessToken: 'expired-access-token',
      refreshToken: 'valid-refresh-token',
      tokenType: 'Bearer',
      accessTokenExpiresAt: '2026-10-05T00:00:00Z',
      refreshTokenExpiresAt: '2026-10-12T00:00:00Z',
    });

    let originalCallCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string, opts: any) => {
      if (url.includes('/api/v1/auth/refresh')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            accessToken: 'new-fresh-token',
            refreshToken: 'new-refresh-token',
            tokenType: 'Bearer',
            accessTokenExpiresAt: '2026-10-05T01:00:00Z',
            refreshTokenExpiresAt: '2026-10-12T01:00:00Z',
          }),
        });
      }

      if (url.includes('/api/v1/candidates/me')) {
        originalCallCount++;
        if (originalCallCount === 1) {
          // First attempt fails with 401
          return Promise.resolve({
            ok: false,
            status: 401,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ code: 'UNAUTHORIZED' }),
          });
        }
        // Second attempt with new token succeeds
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ fullName: 'Harriet Candidate' }),
        });
      }

      return Promise.reject(new Error('Unknown url'));
    });

    const profile = await apiClient.get<{ fullName: string }>('/api/v1/candidates/me');
    expect(profile.fullName).toBe('Harriet Candidate');
    expect(tokenStore.getAccessToken()).toBe('new-fresh-token');
    expect(originalCallCount).toBe(2);
  });
});
