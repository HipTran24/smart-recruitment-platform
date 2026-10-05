export interface ApiErrorPayload {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  requestId?: string;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;
  readonly requestId?: string;
  readonly isCancelled: boolean;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      fieldErrors?: Record<string, string>;
      requestId?: string;
      isCancelled?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? 0;
    this.code = options.code ?? (options.isCancelled ? 'REQUEST_CANCELLED' : 'UNKNOWN_ERROR');
    this.fieldErrors = options.fieldErrors;
    this.requestId = options.requestId;
    this.isCancelled = Boolean(options.isCancelled);
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isConflict(): boolean {
    return this.status === 409;
  }

  isRateLimited(): boolean {
    return this.status === 429;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }
}
