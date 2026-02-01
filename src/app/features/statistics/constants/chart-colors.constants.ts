/**
 * Chart color constants for consistent theming across all chart components.
 * Eliminates magic values and provides a single source of truth for colors.
 */
export const CHART_COLORS = {
  STATUS: {
    TODO: '#6b7280',
    IN_PROGRESS: '#3b82f6',
    DONE: '#22c55e',
  },
  PRIORITY: {
    HIGH: '#ef4444',
    MEDIUM: '#f59e0b',
    LOW: '#22c55e',
  },
} as const;

/**
 * Type helper to extract chart color values.
 */
export type ChartColorCategory = keyof typeof CHART_COLORS;
