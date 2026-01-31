import { Observable, retry } from 'rxjs';
import { TASK_CONFIG } from '../../features/home/constants/tasks.constants';

/**
 * Configuration options for the withRetry operator
 */
export type RetryConfig = {
  count: number;
  delay: number;
};

/**
 * RxJS operator that adds retry logic to an Observable
 * @param config - Optional retry configuration (defaults to TASK_CONFIG values)
 * @returns An Observable with retry logic applied
 */
export function withRetry<T>(
  config: RetryConfig = { count: TASK_CONFIG.RETRY_COUNT, delay: TASK_CONFIG.RETRY_DELAY_MS },
) {
  return (source: Observable<T>): Observable<T> =>
    source.pipe(retry({ count: config.count, delay: config.delay }));
}
