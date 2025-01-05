/**
 * Base error class for NPS API related errors.
 * Extends the built-in Error class with additional context specific to NPS API calls.
 */
export class NPSError extends Error {
    constructor(
      message: string,
      public readonly statusCode: number = 500,
      public readonly endpoint?: string,
    ) {
      super(message);
      this.name = 'NPSError';
      // Ensures proper stack traces in modern JavaScript engines
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Specific error for authentication failures (missing or invalid API key)
   */
  export class NPSAuthenticationError extends NPSError {
    constructor(message: string = 'Invalid or missing API key') {
      super(message, 401);
      this.name = 'NPSAuthenticationError';
    }
  }

  /**
   * Error thrown when the API rate limit is exceeded
   */
  export class NPSRateLimitError extends NPSError {
    constructor(message: string = 'API rate limit exceeded') {
      super(message, 429);
      this.name = 'NPSRateLimitError';
    }
  }

  /**
   * Error thrown when a requested resource is not found
   */
  export class NPSNotFoundError extends NPSError {
    constructor(resource: string) {
      super(`The requested ${resource} was not found`, 404);
      this.name = 'NPSNotFoundError';
    }
  }

  /**
   * Error thrown when the API request is malformed
   */
  export class NPSValidationError extends NPSError {
    constructor(message: string) {
      super(message, 400);
      this.name = 'NPSValidationError';
    }
  }
