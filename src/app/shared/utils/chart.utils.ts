import { TooltipItem } from 'chart.js';

/**
 * Formats tooltip labels for pie and doughnut charts with value and percentage.
 *
 * @param context - The tooltip context from Chart.js
 * @returns Formatted string showing label, value, and percentage
 *
 * @example
 * Output: "High: 5 (25.0%)"
 */
export const formatChartTooltipLabel = (context: TooltipItem<'pie' | 'doughnut'>): string => {
  const dataset = context.dataset.data as number[];
  const total = dataset.reduce((a, b) => a + b, 0);
  const value = context.raw as number;
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  return `${context.label}: ${value} (${percentage}%)`;
};
