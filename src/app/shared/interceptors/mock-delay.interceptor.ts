import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Mock delay interceptor for development/testing purposes
 * Adds a 200ms delay to all HTTP requests to simulate network latency
 *
 * This interceptor should only be enabled in development environments
 * and helps test loading states and timeout behaviors.
 *
 * @param req - The HTTP request
 * @param next - The next handler in the interceptor chain
 * @returns Observable of HTTP events with 200ms delay applied
 */
export function MockDelayInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const MOCK_DELAY_MS = 200;
  return next(req).pipe(delay(MOCK_DELAY_MS));
}
