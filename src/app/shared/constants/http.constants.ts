/**
 * HTTP status code constants to avoid magic numbers
 * Follows Open/Closed Principle - extend by adding new constants
 */
export const HTTP_STATUS = {
  /** Network error - no connection */
  NETWORK_ERROR: 0,
  /** Bad request */
  BAD_REQUEST: 400,
  /** Unauthorized */
  UNAUTHORIZED: 401,
  /** Forbidden */
  FORBIDDEN: 403,
  /** Resource not found */
  NOT_FOUND: 404,
  /** Internal server error threshold */
  SERVER_ERROR_MIN: 500,
} as const;

/**
 * User-friendly error messages for HTTP status codes
 */
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  [HTTP_STATUS.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [HTTP_STATUS.BAD_REQUEST]: 'Invalid request. Please check your input.',
  [HTTP_STATUS.UNAUTHORIZED]: 'Please log in to continue.',
  [HTTP_STATUS.FORBIDDEN]: 'You do not have permission to access this resource.',
  [HTTP_STATUS.NOT_FOUND]: 'Resource not found.',
} as const;

export const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';
export const SERVER_ERROR_MESSAGE = 'Server error. Please try again later.';
