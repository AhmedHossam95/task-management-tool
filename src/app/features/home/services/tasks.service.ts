import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Task, TaskStatus } from '../models/tasks.model';
import { forkJoin, Observable } from 'rxjs';
import { API_URL } from '../../../shared/constants/api.constants';
import { ToastService } from '../../../shared/services/toast.service';
import { withRetry } from '../../../shared/utils/http.utils';
import { TASK_STATUS } from '../constants/tasks.constants';
import { getStatusTransitionUpdates, withUpdatedTimestamp } from '../utils/tasks.utils';
import { executeOptimisticUpdate } from '../utils/optimistic-update.util';
import { TasksFilterService } from './tasks-filter.service';
import { sortTasks } from '../utils/task-sort.util';
import { filterByAssignee, filterByPriority, searchTasks } from '../utils/task-filters.util';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly filterService = inject(TasksFilterService);

  /**
   * httpResource for fetching tasks with automatic loading states
   * Provides: value(), isLoading(), error(), reload()
   */
  readonly tasksResource = httpResource<Task[]>(() => ({
    url: API_URL.TASKS,
    method: 'GET',
  }));

  /** Writable signal that syncs from httpResource, supports optimistic updates */
  private readonly _tasks = linkedSignal(() => this.tasksResource.value() ?? []);

  /** Computed signal for tasks array (read-only) */
  readonly tasks = this._tasks.asReadonly();

  /**
   * Filtered and sorted tasks based on current filter state
   * Applies: search query, priority filter, assignee filter, and sorting
   */
  readonly filteredTasks = computed(() => {
    let tasks = this.tasks();

    // Apply search filter
    tasks = searchTasks(tasks, this.filterService.searchQuery());

    // Apply priority filter
    tasks = filterByPriority(tasks, this.filterService.priorityFilter());

    // Apply assignee filter
    tasks = filterByAssignee(tasks, this.filterService.assigneeFilter());

    // Apply sorting
    tasks = sortTasks(tasks, this.filterService.sortConfig());

    return tasks;
  });

  /** Filtered tasks by status - for kanban columns (sorting applied in filteredTasks) */
  readonly filteredTodoTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === TASK_STATUS.TODO),
  );

  readonly filteredInProgressTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === TASK_STATUS.IN_PROGRESS),
  );

  readonly filteredDoneTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === TASK_STATUS.DONE),
  );

  /** Task counts by status (from filtered tasks) */
  readonly filteredTodoCount = computed(() => this.filteredTodoTasks().length);
  readonly filteredInProgressCount = computed(() => this.filteredInProgressTasks().length);
  readonly filteredDoneCount = computed(() => this.filteredDoneTasks().length);

  /** Total counts (unfiltered) for display */
  readonly todoCount = computed(
    () => this.tasks().filter((t) => t.status === TASK_STATUS.TODO).length,
  );
  readonly inProgressCount = computed(
    () => this.tasks().filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length,
  );
  readonly doneCount = computed(
    () => this.tasks().filter((t) => t.status === TASK_STATUS.DONE).length,
  );

  /**
   * Gets filtered tasks for a specific status (used for reordering)
   */
  private getFilteredTasksByStatus(status: TaskStatus): Task[] {
    return this.filteredTasks()
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Optimistically reorder tasks within the same column
   * Updates UI instantly, syncs to server in background
   * Uses filtered tasks as the source for reordering
   */
  reorderTasksOptimistic(status: TaskStatus, previousIndex: number, currentIndex: number): void {
    // Get the currently displayed (filtered) tasks for this status
    const statusTasks = this.getFilteredTasksByStatus(status);
    const reordered = [...statusTasks];
    moveItemInArray(reordered, previousIndex, currentIndex);

    executeOptimisticUpdate({
      signal: this._tasks,
      optimisticUpdate: (tasks) => this.applyReorder(tasks, reordered),
      persistFn: () => this.persistReorder(reordered, previousIndex, currentIndex),
      onError: () => this.toastService.error('Failed to save task order. Please try again.'),
    });
  }

  /**
   * Applies reorder changes to tasks array
   */
  private applyReorder(tasks: Task[], reordered: Task[]): Task[] {
    return tasks.map((t) => {
      const idx = reordered.findIndex((r) => r.id === t.id);
      return idx !== -1 ? { ...t, order: idx } : t;
    });
  }

  /**
   * Persists reorder changes to backend
   */
  private persistReorder(
    reordered: Task[],
    previousIndex: number,
    currentIndex: number,
  ): Observable<unknown> {
    const minIdx = Math.min(previousIndex, currentIndex);
    const maxIdx = Math.max(previousIndex, currentIndex);
    const affectedTasks = reordered.slice(minIdx, maxIdx + 1);

    const requests = affectedTasks.map((task, i) =>
      this.http
        .patch(`${API_URL.TASKS}/${task.id}`, withUpdatedTimestamp({ order: minIdx + i }))
        .pipe(withRetry()),
    );

    return forkJoin(requests);
  }

  /**
   * Move a task to a different column at a specific position
   * Updates UI instantly, syncs to server in background
   */
  moveTaskToColumn(task: Task, newStatus: TaskStatus, targetIndex: number): void {
    const targetTasks = this.getTargetColumnTasks(task.id, newStatus);
    const updatedTargetTasks = this.insertTaskAtPosition(task, newStatus, targetIndex, targetTasks);

    executeOptimisticUpdate({
      signal: this._tasks,
      optimisticUpdate: (tasks) =>
        this.applyMoveToColumn(tasks, task, newStatus, targetIndex, updatedTargetTasks),
      persistFn: () => this.persistMoveToColumn(task, newStatus, targetIndex, updatedTargetTasks),
      onError: () => this.toastService.error('Failed to move task. Please try again.'),
    });
  }

  /**
   * Move a task to a different column at the last position
   * Uses the entire column (not filtered) to determine last position
   */
  moveTaskToColumnEnd(task: Task, newStatus: TaskStatus): void {
    const targetTasks = this.getTargetColumnTasks(task.id, newStatus);
    const lastPosition = targetTasks.length;
    this.moveTaskToColumn(task, newStatus, lastPosition);
  }

  /**
   * Gets tasks in target column excluding the moved task
   */
  private getTargetColumnTasks(excludeTaskId: string, status: TaskStatus): Task[] {
    return this.tasks()
      .filter((t) => t.status === status && t.id !== excludeTaskId)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Inserts task at specified position in task list
   */
  private insertTaskAtPosition(
    task: Task,
    newStatus: TaskStatus,
    targetIndex: number,
    targetTasks: Task[],
  ): Task[] {
    const result = [...targetTasks];
    const movedTask = { ...task, status: newStatus, order: targetIndex };
    result.splice(targetIndex, 0, movedTask);
    return result;
  }

  /**
   * Applies move-to-column changes to tasks array
   */
  private applyMoveToColumn(
    tasks: Task[],
    task: Task,
    newStatus: TaskStatus,
    targetIndex: number,
    updatedTargetTasks: Task[],
  ): Task[] {
    const statusUpdates = getStatusTransitionUpdates(newStatus);

    return tasks.map((t) => {
      if (t.id === task.id) {
        return {
          ...t,
          status: newStatus,
          order: targetIndex,
          ...statusUpdates,
        };
      }
      const idx = updatedTargetTasks.findIndex((ut) => ut.id === t.id);
      if (idx !== -1) {
        return { ...t, order: idx };
      }
      return t;
    });
  }

  /**
   * Persists move-to-column changes to backend
   */
  private persistMoveToColumn(
    task: Task,
    newStatus: TaskStatus,
    targetIndex: number,
    updatedTargetTasks: Task[],
  ): Observable<unknown> {
    const statusUpdates = getStatusTransitionUpdates(newStatus);

    const movedTaskUpdate = this.http
      .patch(
        `${API_URL.TASKS}/${task.id}`,
        withUpdatedTimestamp({
          status: newStatus,
          order: targetIndex,
          ...statusUpdates,
        }),
      )
      .pipe(withRetry());

    const affectedUpdates = updatedTargetTasks
      .slice(targetIndex + 1)
      .map((t, i) =>
        this.http
          .patch(`${API_URL.TASKS}/${t.id}`, withUpdatedTimestamp({ order: targetIndex + 1 + i }))
          .pipe(withRetry()),
      );

    return forkJoin([movedTaskUpdate, ...affectedUpdates]);
  }
}
