import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { catchError, EMPTY, Observable, of, tap, throwError } from 'rxjs';
import { CacheService } from '../services/cache.service';
import { SKIP_LOADING } from '../constants/http.constants';

/**
 * HTTP Interceptor implementing stale-while-revalidate caching pattern
 *
 * Behavior:
 * 1. For GET requests with cached data: Returns cache immediately, fetches fresh data in background
 * 2. For GET requests without cache: Waits for network response, caches it
 * 3. On network error with cache: Silently serves cached data
 * 4. On network error without cache: Returns error
 *
 * This enables fast page loads with background updates and offline support.
 *
 * @param req - The HTTP request
 * @param next - The next handler in the interceptor chain
 * @returns Observable of HTTP events
 */
export function CachingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  // Only apply caching to GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  const cacheService = inject(CacheService);
  const cacheKey = req.urlWithParams;
  const cachedData = cacheService.get<unknown>(cacheKey);

  // Stale-while-revalidate: If we have cached data, return it immediately
  // and fetch fresh data in the background
  if (cachedData !== null) {
    // Clone request with SKIP_LOADING context for silent background fetch
    const silentReq = req.clone({
      context: req.context.set(SKIP_LOADING, true),
    });

    // Fire background request to fetch fresh data (without showing loader)
    const backgroundRequest$ = next(silentReq).pipe(
      tap((event) => {
        if (event instanceof HttpResponse && event.body) {
          // Check if fresh data differs from cached data
          if (cacheService.hasDifferentData(cacheKey, event.body)) {
            // Different data available - store as pending for user to review
            cacheService.setPending(cacheKey, event.body);
          } else {
            // Same data - update cache silently
            cacheService.set(cacheKey, event.body);
          }
        }
      }),
      catchError(() => {
        // Silently fail background request - we already have cached data
        return EMPTY;
      }),
    );

    // Subscribe to background request (fire and forget)
    backgroundRequest$.subscribe();

    // Return cached data immediately
    return of(
      new HttpResponse({
        body: cachedData,
        status: 200,
        statusText: 'OK (from cache)',
      }),
    );
  }

  // No cache available - wait for network response
  return next(req).pipe(
    tap((event) => {
      // Cache successful responses
      if (event instanceof HttpResponse && event.body) {
        cacheService.set(cacheKey, event.body);
      }
    }),
    catchError((error) => {
      // On network error without cache, try to serve any pending data
      const pendingData = cacheService.pendingUpdates().get(cacheKey);

      if (pendingData !== undefined) {
        return of(
          new HttpResponse({
            body: pendingData,
            status: 200,
            statusText: 'OK (pending update)',
          }),
        );
      }

      // No cache or pending data available, return the original error
      return throwError(() => error);
    }),
  );
}
