export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  code?: string;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.code = code;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
