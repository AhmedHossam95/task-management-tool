import { Observable, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { withRetry } from './http.utils';

describe('http.utils', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('withRetry', () => {
    it('should pass through successful observable', (done) => {
      const source$ = of(42);

      source$.pipe(withRetry()).subscribe({
        next: (value) => {
          expect(value).toBe(42);
          done();
        },
      });
    });

    it('should retry on error with default config', (done) => {
      let attempts = 0;
      const source$ = throwError(() => {
        attempts++;
        return new Error('Test error');
      });

      source$.pipe(withRetry({ count: 2, delay: 10 })).subscribe({
        error: (error) => {
          expect(error.message).toBe('Test error');
          // Original attempt + 2 retries = 3 attempts
          expect(attempts).toBe(3);
          done();
        },
      });
    });

    it('should succeed after retry', (done) => {
      let attempts = 0;
      const source$ = new Observable((observer) => {
        attempts++;
        if (attempts < 2) {
          observer.error(new Error('Temporary error'));
        } else {
          observer.next('success');
          observer.complete();
        }
      });

      source$.pipe(withRetry({ count: 3, delay: 10 })).subscribe({
        next: (value) => {
          expect(value).toBe('success');
          expect(attempts).toBe(2);
          done();
        },
      });
    });

    it('should use custom retry count', (done) => {
      let attempts = 0;
      const source$ = throwError(() => {
        attempts++;
        return new Error('Test error');
      });

      source$.pipe(withRetry({ count: 1, delay: 10 })).subscribe({
        error: () => {
          // Original attempt + 1 retry = 2 attempts
          expect(attempts).toBe(2);
          done();
        },
      });
    });

    it('should use custom delay', (done) => {
      let attempts = 0;
      const startTime = Date.now();
      const source$ = throwError(() => {
        attempts++;
        return new Error('Test error');
      });

      source$.pipe(withRetry({ count: 1, delay: 50 })).subscribe({
        error: () => {
          const elapsed = Date.now() - startTime;
          // Original attempt + 1 retry = 2 attempts
          expect(attempts).toBe(2);
          // Should have delayed at least 40ms (allowing some margin)
          expect(elapsed).toBeGreaterThanOrEqual(40);
          done();
        },
      });
    });

    it('should handle zero retry count', (done) => {
      let attempts = 0;
      const source$ = throwError(() => {
        attempts++;
        return new Error('Test error');
      });

      source$.pipe(withRetry({ count: 0, delay: 10 })).subscribe({
        error: () => {
          // Only original attempt, no retries
          expect(attempts).toBe(1);
          done();
        },
      });
    });

    it('should propagate the original error after all retries', (done) => {
      const errorMessage = 'Original error message';
      const source$ = throwError(() => new Error(errorMessage));

      source$.pipe(withRetry({ count: 2, delay: 10 })).subscribe({
        error: (error) => {
          expect(error.message).toBe(errorMessage);
          done();
        },
      });
    });

    it('should work as RxJS operator', (done) => {
      let attempts = 0;
      const source$ = new Observable((observer) => {
        attempts++;
        if (attempts === 1) {
          observer.error(new Error('First error'));
        } else {
          observer.next(100);
          observer.complete();
        }
      });

      source$.pipe(withRetry({ count: 3, delay: 10 })).subscribe({
        next: (value) => {
          expect(value).toBe(100);
          done();
        },
      });
    });
  });
});
