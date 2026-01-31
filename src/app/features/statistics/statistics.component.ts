import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StatisticsService } from './services/statistics.service';
import { TasksService } from '../home/services/tasks.service';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { BaseChartComponent } from './components/base-chart/base-chart.component';
import { CHART_COLORS } from '../../shared/constants/chart-colors.constants';

/**
 * Statistics page component that displays task analytics.
 * Shows stat cards and charts for task status and priority distribution.
 *
 * Follows SOLID principles:
 * - Single Responsibility: Only responsible for composing statistics view
 * - Dependency Inversion: Depends on service abstractions
 */
@Component({
  selector: 'app-statistics',
  imports: [StatCardComponent, BaseChartComponent],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent {
  private readonly statisticsService = inject(StatisticsService);
  private readonly tasksService = inject(TasksService);

  protected readonly statistics = this.statisticsService.statistics;

  // Status chart configuration
  protected readonly statusLabels = ['Todo', 'In Progress', 'Done'];
  protected readonly statusColors = [
    CHART_COLORS.STATUS.TODO,
    CHART_COLORS.STATUS.IN_PROGRESS,
    CHART_COLORS.STATUS.DONE,
  ];
  protected readonly statusData = computed(() => [
    this.tasksService.todoCount(),
    this.tasksService.inProgressCount(),
    this.tasksService.doneCount(),
  ]);

  // Priority chart configuration
  protected readonly priorityLabels = ['High', 'Medium', 'Low'];
  protected readonly priorityColors = [
    CHART_COLORS.PRIORITY.HIGH,
    CHART_COLORS.PRIORITY.MEDIUM,
    CHART_COLORS.PRIORITY.LOW,
  ];
  protected readonly priorityData = computed(() => [
    this.tasksService.highPriorityCount(),
    this.tasksService.mediumPriorityCount(),
    this.tasksService.lowPriorityCount(),
  ]);

  // Shared loading and empty states
  protected readonly isLoading = this.tasksService.tasksResource.isLoading;
  protected readonly isEmpty = computed(() => this.tasksService.tasks().length === 0);
}
