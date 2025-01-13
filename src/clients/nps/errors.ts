/**
 * Base error class for NPS API related errors.
 * Extends the built-in Error class with additional context specific to NPS API calls.
 */
export class NPSError extends Error {
   /**
    * Creates an instance of NPSError.
    *
    * @param message - A descriptive error message.
    * @param statusCode - The HTTP status code associated with the error (default is 500).
    * @param endpoint - The API endpoint that triggered the error (optional).
    */
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
 * Specific error for authentication failures (e.g., missing or invalid API key).
 * Extends NPSError with a default status code of 401 (Unauthorized).
 */
export class NPSAuthenticationError extends NPSError {
   /**
    * Creates an instance of NPSAuthenticationError.
    *
    * @param message - A descriptive error message (default is 'Invalid or missing API key').
    */
   constructor(message: string = 'Invalid or missing API key') {
      super(message, 401);
      this.name = 'NPSAuthenticationError';
   }
}

/**
 * Error thrown when the API rate limit is exceeded.
 * Extends NPSError with a default status code of 429 (Too Many Requests).
 */
export class NPSRateLimitError extends NPSError {
   /**
    * Creates an instance of NPSRateLimitError.
    *
    * @param message - A descriptive error message (default is 'API rate limit exceeded').
    */
   constructor(message: string = 'API rate limit exceeded') {
      super(message, 429);
      this.name = 'NPSRateLimitError';
   }
}

/**
 * Error thrown when a requested resource is not found.
 * Extends NPSError with a default status code of 404 (Not Found).
 */
export class NPSNotFoundError extends NPSError {
   /**
    * Creates an instance of NPSNotFoundError.
    *
    * @param resource - The name of the resource that was not found.
    */
   constructor(resource: string) {
      super(`The requested ${resource} was not found`, 404);
      this.name = 'NPSNotFoundError';
   }
}

/**
 * Error thrown when the API request is malformed.
 * Extends NPSError with a default status code of 400 (Bad Request).
 */
export class NPSValidationError extends NPSError {
   /**
    * Creates an instance of NPSValidationError.
    *
    * @param message - A descriptive error message indicating why the request is invalid.
    */
   constructor(message: string) {
      super(message, 400);
      this.name = 'NPSValidationError';
   }
}
