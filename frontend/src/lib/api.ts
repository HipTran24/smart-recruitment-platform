import { ApiError, type ApiErrorPayload } from './api-error';
import { tokenStore, type TokenPair } from '../auth/token-store';

const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Retained for backward-compatibility if referenced
export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  auth?: boolean;
  timeoutMs?: number;
  _retry?: boolean;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;

  if (!params) {
    return fullUrl;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${fullUrl}?${queryString}` : fullUrl;
}

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

async function executeRefresh(): Promise<TokenPair | null> {
  const existingPromise = tokenStore.getRefreshPromise();
  if (existingPromise) {
    return existingPromise;
  }

  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) {
    tokenStore.clear();
    return null;
  }

  const capturedGeneration = tokenStore.getSessionGeneration();

  const refreshPromise = (async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const url = buildUrl('/api/v1/auth/refresh');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': generateRequestId(),
        },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal,
      });

      if (!res.ok) {
        if (tokenStore.getSessionGeneration() === capturedGeneration) {
          tokenStore.clear();
        }
        return null;
      }

      const newTokens: TokenPair = await res.json();
      // Drop late refresh response if session generation has progressed (e.g. user logged out or switched accounts)
      if (tokenStore.getSessionGeneration() !== capturedGeneration) {
        return null;
      }

      tokenStore.setTokens(newTokens);
      return newTokens;
    } catch {
      if (tokenStore.getSessionGeneration() === capturedGeneration) {
        tokenStore.clear();
      }
      return null;
    } finally {
      clearTimeout(timeoutId);
      tokenStore.setRefreshPromise(null);
    }
  })();

  tokenStore.setRefreshPromise(refreshPromise);
  return refreshPromise;
}

export async function request<T = void>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    params,
    body,
    auth = true,
    headers: customHeaders = {},
    timeoutMs = 20000,
    signal: userSignal,
    _retry = false,
    ...rest
  } = options;

  const url = buildUrl(path, params);
  const requestId = generateRequestId();

  const headers = new Headers(customHeaders);
  if (!headers.has('X-Request-Id')) {
    headers.set('X-Request-Id', requestId);
  }

  // Attach Authorization header if requested and token is present
  const isPublicAuth = path.includes('/auth/login') ||
                       path.includes('/auth/register') ||
                       path.includes('/auth/refresh') ||
                       path.includes('/auth/password/reset-') ||
                       path.includes('/auth/verify-email');

  if (auth && !isPublicAuth) {
    const accessToken = tokenStore.getAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  // Handle request body
  let formattedBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
      formattedBody = body as BodyInit;
      // Do NOT set Content-Type: browser sets multipart boundary automatically
    } else {
      headers.set('Content-Type', 'application/json');
      formattedBody = JSON.stringify(body);
    }
  }

  // Timeout and signal combination
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error('REQUEST_TIMEOUT'));
  }, timeoutMs);

  if (userSignal) {
    userSignal.addEventListener('abort', () => {
      controller.abort(userSignal.reason);
    });
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers,
      body: formattedBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseRequestId = response.headers.get('x-request-id') || requestId;

    // Handle 401 and single-flight token refresh
    if (response.status === 401 && auth && !_retry && !isPublicAuth && tokenStore.getRefreshToken()) {
      const refreshedTokens = await executeRefresh();
      if (refreshedTokens) {
        return request<T>(path, {
          ...options,
          _retry: true,
        });
      }
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json') || contentType.includes('+json');

    if (!response.ok) {
      let errorPayload: ApiErrorPayload = {};
      let message = `Request failed with status ${response.status}`;

      if (isJson) {
        try {
          const json = await response.json();
          errorPayload = json as ApiErrorPayload;
          message = errorPayload.message || message;
        } catch {
          // fallback to status text
        }
      } else {
        try {
          const text = await response.text();
          if (text) message = text;
        } catch {
          // ignore
        }
      }

      throw new ApiError(message, {
        status: response.status,
        code: errorPayload.code,
        fieldErrors: errorPayload.fieldErrors,
        requestId: responseRequestId,
      });
    }

    if (isJson) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    const isAbort =
      (err instanceof DOMException && err.name === 'AbortError') ||
      (err instanceof Error && err.name === 'AbortError');

    if (isAbort) {
      const isTimeout = controller.signal.reason?.message === 'REQUEST_TIMEOUT';
      throw new ApiError(isTimeout ? 'Request timed out after limit.' : 'Request was cancelled.', {
        status: 0,
        code: isTimeout ? 'REQUEST_TIMEOUT' : 'REQUEST_CANCELLED',
        isCancelled: true,
        requestId,
      });
    }

    const networkMessage = err instanceof Error ? err.message : 'Network error or backend unreachable.';
    throw new ApiError(networkMessage, {
      status: 0,
      code: 'NETWORK_ERROR',
      requestId,
    });
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
