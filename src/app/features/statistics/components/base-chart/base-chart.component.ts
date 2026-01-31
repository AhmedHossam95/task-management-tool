import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { createChartOptions } from '../../../../shared/config/chart-options.config';

/**
 * Generic reusable chart component for rendering pie and doughnut charts.
 *
 * Follows SOLID principles:
 * - Single Responsibility: Only responsible for chart rendering
 * - Open/Closed: Extensible for new chart types without modification
 * - Dependency Inversion: Depends on abstractions (inputs) not concrete implementations
 *
 * @example
 * <app-base-chart
 *   [title]="'Tasks by Status'"
 *   [chartType]="'pie'"
 *   [labels]="['Todo', 'In Progress', 'Done']"
 *   [data]="[5, 3, 10]"
 *   [colors]="['#6b7280', '#3b82f6', '#22c55e']"
 *   [isLoading]="false"
 *   [isEmpty]="false"
 * />
 */
@Component({
  selector: 'app-base-chart',
  standalone: true,
  imports: [BaseChartDirective, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './base-chart.component.html',
  styleUrl: './base-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseChartComponent {
  /** Chart title displayed in the card header */
  readonly title = input.required<string>();

  /** Type of chart to render ('pie' or 'doughnut') */
  readonly chartType = input.required<'pie' | 'doughnut'>();

  /** Array of labels for the chart segments */
  readonly labels = input.required<string[]>();

  /** Array of data values corresponding to each label */
  readonly data = input.required<number[]>();

  /** Array of colors for each chart segment */
  readonly colors = input.required<string[]>();

  /** Indicates whether data is currently loading */
  readonly isLoading = input<boolean>(false);

  /** Indicates whether the chart has no data to display */
  readonly isEmpty = input<boolean>(false);

  /**
   * Computed signal that builds the chart data structure.
   * Combines labels, data, and colors into Chart.js format.
   */
  protected readonly chartData = computed<ChartData<'pie' | 'doughnut'>>(() => ({
    labels: this.labels(),
    datasets: [
      {
        data: this.data(),
        backgroundColor: this.colors(),
        borderWidth: 0,
      },
    ],
  }));

  /**
   * Computed signal that creates chart options based on chart type.
   * Uses the shared chart options factory for consistency.
   */
  protected readonly chartOptions = computed<ChartOptions<'pie' | 'doughnut'>>(() =>
    createChartOptions(this.chartType()),
  );
}
