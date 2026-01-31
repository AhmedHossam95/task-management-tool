import { ChartOptions } from 'chart.js';
import { formatChartTooltipLabel } from '../utils/chart.utils';

/**
 * Factory function to create consistent chart options for pie and doughnut charts.
 * Provides a single source of truth for chart configuration.
 *
 * @param type - The type of chart ('pie' or 'doughnut')
 * @returns Configured ChartOptions object
 */
export const createChartOptions = <T extends 'pie' | 'doughnut'>(type: T): ChartOptions<T> => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: formatChartTooltipLabel,
        },
      },
    },
  } as ChartOptions<T>;
};
