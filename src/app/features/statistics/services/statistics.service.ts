import { computed, inject, Injectable, Signal } from '@angular/core';
import { TasksService } from '../../home/services/tasks.service';
import { Statistic } from '../models/statistics.model';

/**
 * Service responsible for computing and providing access to statistics data.
 * Calculates statistics from TasksService in real-time using computed signals.
 * All values are dynamically derived from the current tasks state.
 */
@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private readonly tasksService = inject(TasksService);

  /**
   * Computed signal providing the statistics array.
   * Dynamically builds statistics from current task counts.
   * Updates automatically whenever task data changes.
   */
  readonly statistics: Signal<Statistic[]> = computed(() => [
    {
      id: 'stat-001',
      title: 'Total Tasks',
      icon: '📊',
      value: this.tasksService.tasks().length,
      change: '',
      changeLabel: 'current',
      changeType: 'neutral',
      color: '#1976D2',
    },
    {
      id: 'stat-002',
      title: 'Completed',
      icon: '✅',
      value: this.tasksService.doneCount(),
      change: '',
      changeLabel: 'current',
      changeType: 'neutral',
      color: '#388E3C',
    },
    {
      id: 'stat-003',
      title: 'In Progress',
      icon: '🔄',
      value: this.tasksService.inProgressCount(),
      change: '',
      changeLabel: 'current',
      changeType: 'neutral',
      color: '#FF6F00',
    },
    {
      id: 'stat-004',
      title: 'Overdue',
      icon: '⚠️',
      value: this.tasksService.overdueCount(),
      change: '',
      changeLabel: 'current',
      changeType: 'neutral',
      color: '#D32F2F',
    },
  ]);

  /**
   * Computed signal for loading state.
   * Reflects whether tasks are currently being fetched.
   */
  readonly isLoading = computed(() => this.tasksService.tasksResource.isLoading());
}
