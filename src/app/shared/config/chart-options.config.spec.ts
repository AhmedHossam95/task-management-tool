import { createChartOptions } from './chart-options.config';

describe('chart-options.config', () => {
  describe('createChartOptions', () => {
    it('should create options for pie chart', () => {
      const options = createChartOptions('pie');

      expect(options).toBeDefined();
      expect(options.responsive).toBeTrue();
      expect(options.maintainAspectRatio).toBeFalse();
    });

    it('should create options for doughnut chart', () => {
      const options = createChartOptions('doughnut');

      expect(options).toBeDefined();
      expect(options.responsive).toBeTrue();
      expect(options.maintainAspectRatio).toBeFalse();
    });

    it('should have legend positioned at bottom', () => {
      const options = createChartOptions('pie');

      expect(options.plugins?.legend?.position).toBe('bottom');
    });

    it('should have legend labels with usePointStyle', () => {
      const options = createChartOptions('pie');

      expect(options.plugins?.legend?.labels?.usePointStyle).toBeTrue();
    });

    it('should have legend labels with padding of 16', () => {
      const options = createChartOptions('pie');

      expect(options.plugins?.legend?.labels?.padding).toBe(16);
    });

    it('should include tooltip callback', () => {
      const options = createChartOptions('pie');

      expect(options.plugins?.tooltip?.callbacks?.label).toBeDefined();
      expect(typeof options.plugins?.tooltip?.callbacks?.label).toBe('function');
    });

    it('should have same options structure for pie and doughnut', () => {
      const pieOptions = createChartOptions('pie');
      const doughnutOptions = createChartOptions('doughnut');

      expect(pieOptions.responsive).toBe(doughnutOptions.responsive);
      expect(pieOptions.maintainAspectRatio).toBe(doughnutOptions.maintainAspectRatio);
      expect(pieOptions.plugins?.legend?.position).toBe(doughnutOptions.plugins?.legend?.position);
    });

    it('should return new options object on each call', () => {
      const options1 = createChartOptions('pie');
      const options2 = createChartOptions('pie');

      expect(options1).not.toBe(options2);
    });
  });
});
