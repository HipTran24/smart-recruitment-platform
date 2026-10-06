export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

const STORAGE_KEY = 'sr_auth_session';

function loadInitialTokens(): TokenPair | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // Ignore storage parsing error
  }
  return null;
}

let inMemoryTokens: TokenPair | null = loadInitialTokens();
let refreshPromise: Promise<TokenPair | null> | null = null;
let sessionGeneration = 0;
const listeners = new Set<(tokens: TokenPair | null) => void>();

/**
 * Purely in-memory session token store conforming to ADR 0003 and least-privilege security.
 * Session is kept in tab sessionStorage for page reload resilience, never in localStorage.
 */
export const tokenStore = {
  getTokens(): TokenPair | null {
    return inMemoryTokens;
  },

  getAccessToken(): string | null {
    return inMemoryTokens?.accessToken ?? null;
  },

  getRefreshToken(): string | null {
    return inMemoryTokens?.refreshToken ?? null;
  },

  getSessionGeneration(): number {
    return sessionGeneration;
  },

  setTokens(tokens: TokenPair | null): void {
    inMemoryTokens = tokens;
    sessionGeneration++;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        if (tokens) {
          window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
        } else {
          window.sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // Ignore
    }
    listeners.forEach((listener) => {
      try {
        listener(inMemoryTokens);
      } catch (err) {
        console.error('Token listener error:', err);
      }
    });
  },

  clear(): void {
    inMemoryTokens = null;
    refreshPromise = null;
    sessionGeneration++;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
    listeners.forEach((listener) => {
      try {
        listener(null);
      } catch (err) {
        console.error('Token listener error:', err);
      }
    });
  },

  subscribe(listener: (tokens: TokenPair | null) => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getRefreshPromise(): Promise<TokenPair | null> | null {
    return refreshPromise;
  },

  setRefreshPromise(promise: Promise<TokenPair | null> | null): void {
    refreshPromise = promise;
  },
};
