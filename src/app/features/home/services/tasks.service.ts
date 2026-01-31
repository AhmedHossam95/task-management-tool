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
import { createTasksByStatusSignal, filterTasksByStatus } from '../utils/task-filters.util';
import { executeOptimisticUpdate } from '../utils/optimistic-update.util';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);

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

  /** Tasks filtered by status - sorted by order */
  readonly todoTasks = createTasksByStatusSignal(this.tasks, TASK_STATUS.TODO as TaskStatus);
  readonly inProgressTasks = createTasksByStatusSignal(
    this.tasks,
    TASK_STATUS.IN_PROGRESS as TaskStatus,
  );
  readonly doneTasks = createTasksByStatusSignal(this.tasks, TASK_STATUS.DONE as TaskStatus);

  /** Task counts by status */
  readonly todoCount = computed(() => this.todoTasks().length);
  readonly inProgressCount = computed(() => this.inProgressTasks().length);
  readonly doneCount = computed(() => this.doneTasks().length);

  /**
   * Optimistically reorder tasks within the same column
   * Updates UI instantly, syncs to server in background
   */
  reorderTasksOptimistic(status: TaskStatus, previousIndex: number, currentIndex: number): void {
    const statusTasks = filterTasksByStatus(this.tasks(), status);
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
