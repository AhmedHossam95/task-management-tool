import { TooltipItem } from 'chart.js';
import { formatChartTooltipLabel } from './chart.utils';

describe('chart.utils', () => {
  describe('formatChartTooltipLabel', () => {
    it('should format label with value and percentage', () => {
      const context = {
        label: 'High',
        raw: 5,
        dataset: {
          data: [5, 10, 5], // total = 20
        },
      } as any;

      const result = formatChartTooltipLabel(context);

      expect(result).toBe('High: 5 (25.0%)');
    });

    it('should handle single item at 100%', () => {
      const context = {
        label: 'Complete',
        raw: 10,
        dataset: {
          data: [10], // total = 10
        },
      } as any;

      const result = formatChartTooltipLabel(context);

      expect(result).toBe('Complete: 10 (100.0%)');
    });

    it('should handle zero value', () => {
      const context = {
        label: 'Low',
        raw: 0,
        dataset: {
          data: [0, 5, 10], // total = 15
        },
      } as any;

      const result = formatChartTooltipLabel(context);

      expect(result).toBe('Low: 0 (0.0%)');
    });

    it('should handle empty dataset (total = 0)', () => {
      const context = {
        label: 'Empty',
        raw: 0,
        dataset: {
          data: [0, 0, 0], // total = 0
        },
      } as any;

      const result = formatChartTooltipLabel(context);

      expect(result).toBe('Empty: 0 (0%)');
    });

    it('should format percentage with one decimal place', () => {
      const context = {
        label: 'Medium',
        raw: 7,
        dataset: {
          data: [3, 7, 20], // total = 30
        },
      } as any;

      const result = formatChartTooltipLabel(context);

      expect(result).toBe('Medium: 7 (23.3%)');
    });

    it('should work with doughnut chart type', () => {
      const context = {
        label: 'In Progress',
        raw: 15,
        dataset: {
          data: [10, 15, 25], // total = 50
        },
      } as any;

      const result = formatChartTooltipLabel(context);

      expect(result).toBe('In Progress: 15 (30.0%)');
    });

    it('should handle fractional percentages', () => {
      const context = {
        label: 'Critical',
        raw: 1,
        dataset: {
          data: [1, 2, 3, 4, 5, 6], // total = 21
        },
      } as any;

      const result = formatChartTooltipLabel(context);

      expect(result).toBe('Critical: 1 (4.8%)');
    });

    it('should handle large numbers', () => {
      const context = {
        label: 'Tasks',
        raw: 1000,
        dataset: {
          data: [1000, 2000, 3000], // total = 6000
        },
      } as any;

      const result = formatChartTooltipLabel(context);

      expect(result).toBe('Tasks: 1000 (16.7%)');
    });
  });
});
