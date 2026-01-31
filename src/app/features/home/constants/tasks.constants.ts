/**
 * Configuration constants for tasks feature
 */
export const TASK_CONFIG = {
  /** Number of retry attempts for failed HTTP requests */
  RETRY_COUNT: 2,
  /** Delay in milliseconds between retry attempts */
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * Task status constants to avoid magic strings
 */
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;
