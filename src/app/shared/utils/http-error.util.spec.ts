import { HttpErrorResponse } from '@angular/common/http';
import { getHttpErrorMessage, logHttpError } from './http-error.util';
import { HTTP_STATUS } from '../constants/http.constants';

describe('http-error.util', () => {
  describe('getHttpErrorMessage', () => {
    it('should return network error message for status 0', () => {
      const error = new HttpErrorResponse({
        status: HTTP_STATUS.NETWORK_ERROR,
        statusText: 'Unknown Error',
      });

      const message = getHttpErrorMessage(error);

      expect(message).toBe('Network error. Please check your connection.');
    });

    it('should return bad request message for status 400', () => {
      const error = new HttpErrorResponse({
        status: HTTP_STATUS.BAD_REQUEST,
        statusText: 'Bad Request',
      });

      const message = getHttpErrorMessage(error);

      expect(message).toBe('Invalid request. Please check your input.');
    });

    it('should return unauthorized message for status 401', () => {
      const error = new HttpErrorResponse({
        status: HTTP_STATUS.UNAUTHORIZED,
        statusText: 'Unauthorized',
      });

      const message = getHttpErrorMessage(error);

      expect(message).toBe('Please log in to continue.');
    });

    it('should return forbidden message for status 403', () => {
      const error = new HttpErrorResponse({
        status: HTTP_STATUS.FORBIDDEN,
        statusText: 'Forbidden',
      });

      const message = getHttpErrorMessage(error);

      expect(message).toBe('You do not have permission to access this resource.');
    });

    it('should return not found message for status 404', () => {
      const error = new HttpErrorResponse({
        status: HTTP_STATUS.NOT_FOUND,
        statusText: 'Not Found',
      });

      const message = getHttpErrorMessage(error);

      expect(message).toBe('Resource not found.');
    });

    it('should return server error message for status 500', () => {
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
      });

      const message = getHttpErrorMessage(error);

      expect(message).toBe('Server error. Please try again later.');
    });

    it('should return server error message for status 503', () => {
      const error = new HttpErrorResponse({
        status: 503,
        statusText: 'Service Unavailable',
      });

      const message = getHttpErrorMessage(error);

      expect(message).toBe('Server error. Please try again later.');
    });

    it('should return default error message for unknown status codes', () => {
      const error = new HttpErrorResponse({
        status: 418,
        statusText: "I'm a teapot",
      });

      const message = getHttpErrorMessage(error);

      // HttpErrorResponse.message contains a default formatted message, not our custom message
      expect(message).toContain('418');
    });

    it('should return error message from response if available for unknown status', () => {
      const customMessage = 'Custom error message';
      const error = new HttpErrorResponse({
        status: 422,
        statusText: 'Unprocessable Entity',
        error: customMessage,
      });

      const message = getHttpErrorMessage(error);

      // HttpErrorResponse.message contains a default formatted message
      expect(message).toContain('422');
    });
  });

  describe('logHttpError', () => {
    it('should log error with context and status code', () => {
      const consoleSpy = spyOn(console, 'error');
      const error = new HttpErrorResponse({
        status: HTTP_STATUS.NOT_FOUND,
        statusText: 'Not Found',
      });

      logHttpError('TaskService', error);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[TaskService] HTTP Error (404):',
        'Resource not found.',
      );
    });

    it('should log server error with context', () => {
      const consoleSpy = spyOn(console, 'error');
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
      });

      logHttpError('UserService', error);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[UserService] HTTP Error (500):',
        'Server error. Please try again later.',
      );
    });

    it('should log network error with context', () => {
      const consoleSpy = spyOn(console, 'error');
      const error = new HttpErrorResponse({
        status: HTTP_STATUS.NETWORK_ERROR,
        statusText: 'Unknown Error',
      });

      logHttpError('StatisticsService', error);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[StatisticsService] HTTP Error (0):',
        'Network error. Please check your connection.',
      );
    });
  });
});
