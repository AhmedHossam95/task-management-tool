import { WritableSignal } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

/**
 * Options for executing an optimistic update
 */
export type OptimisticUpdateOptions<T> = {
  /** The writable signal to update */
  signal: WritableSignal<T>;
  /** Function to compute the optimistic (immediate) update */
  optimisticUpdate: (current: T) => T;
  /** Function that returns the Observable for persisting the change */
  persistFn: () => Observable<unknown>;
  /** Callback invoked on error (after rollback) */
  onError: (error: unknown) => void;
  /** Optional callback invoked on success */
  onSuccess?: () => void;
};

/**
 * Executes an optimistic update pattern:
 * 1. Captures previous state for potential rollback
 * 2. Applies optimistic update to signal immediately
 * 3. Persists change via Observable
 * 4. On error: rolls back to previous state and calls onError
 * 5. On success: optionally calls onSuccess
 *
 * @param options - Configuration for the optimistic update
 */
export function executeOptimisticUpdate<T>(options: OptimisticUpdateOptions<T>): void {
  const { signal, optimisticUpdate, persistFn, onError, onSuccess } = options;

  // 1. Capture previous state for rollback
  const previousState = signal();

  // 2. Apply optimistic update immediately
  signal.update(optimisticUpdate);

  // 3. Persist and handle success/failure
  persistFn()
    .pipe(
      catchError((error) => {
        // Rollback on failure
        signal.set(previousState);
        onError(error);
        return throwError(() => error);
      }),
    )
    .subscribe({
      next: () => onSuccess?.(),
    });
}

/**
 * Creates a reorder function for arrays with an order property
 * @param items - Array of items to reorder
 * @param previousIndex - Original index of the item
 * @param currentIndex - New index for the item
 * @returns New array with updated order values
 */
export function reorderItems<T extends { order: number }>(
  items: T[],
  previousIndex: number,
  currentIndex: number,
): T[] {
  const result = [...items];
  const [movedItem] = result.splice(previousIndex, 1);
  result.splice(currentIndex, 0, movedItem);

  // Update order values to match new positions
  return result.map((item, index) => ({ ...item, order: index }));
}
