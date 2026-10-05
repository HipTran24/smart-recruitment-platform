export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

let inMemoryTokens: TokenPair | null = null;
let refreshPromise: Promise<TokenPair | null> | null = null;
let sessionGeneration = 0;
const listeners = new Set<(tokens: TokenPair | null) => void>();

/**
 * Purely in-memory session token store conforming to ADR 0003 and least-privilege security.
 * Under no circumstances are tokens written to localStorage, sessionStorage, or URL query parameters.
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
