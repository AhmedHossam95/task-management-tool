import { HttpErrorResponse } from '@angular/common/http';
import {
  DEFAULT_ERROR_MESSAGE,
  HTTP_ERROR_MESSAGES,
  HTTP_STATUS,
  SERVER_ERROR_MESSAGE,
} from '../constants/http.constants';

/**
 * Extracts a user-friendly error message from an HTTP error response.
 * Follows Single Responsibility Principle - only handles error message extraction.
 *
 * @param error - The HTTP error response
 * @returns A user-friendly error message
 */
export function getHttpErrorMessage(error: HttpErrorResponse): string {
  // Check for known status codes
  if (error.status in HTTP_ERROR_MESSAGES) {
    return HTTP_ERROR_MESSAGES[error.status];
  }

  // Check for server errors (5xx)
  if (error.status >= HTTP_STATUS.SERVER_ERROR_MIN) {
    return SERVER_ERROR_MESSAGE;
  }

  // Fallback to error message or default
  return error.message || DEFAULT_ERROR_MESSAGE;
}

/**
 * Logs an HTTP error with context for debugging.
 *
 * @param context - The context/service name where the error occurred
 * @param error - The HTTP error response
 */
export function logHttpError(context: string, error: HttpErrorResponse): void {
  const message = getHttpErrorMessage(error);
  console.error(`[${context}] HTTP Error (${error.status}):`, message);
}
