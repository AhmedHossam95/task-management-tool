import { computed, effect, inject, Injectable, signal, Signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import {
  CreateTaskDto,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskDto,
} from '../models/tasks.model';
import { catchError, forkJoin, Observable, retry, tap, throwError } from 'rxjs';
import { API_URL } from '../../../shared/constants/api.constants';
import { ToastService } from '../../../shared/services/toast.service';

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

  /** Private writable signal for optimistic updates */
  private readonly _tasks = signal<Task[]>([]);

  constructor() {
    // Sync from httpResource when data loads
    effect(() => {
      const resourceTasks = this.tasksResource.value();
      console.log('resourceTasks', resourceTasks);
      if (resourceTasks) {
        this._tasks.set(resourceTasks);
      }
    });
  }

  /** Computed signal for tasks array (read-only) */
  readonly tasks = this._tasks.asReadonly();

  /** Computed signal for total count */
  readonly totalCount = computed(() => this.tasks().length);

  /** Filter tasks by status */
  tasksByStatus(status: TaskStatus): Signal<Task[]> {
    return computed(() =>
      this.tasks()
        .filter((task) => task.status === status)
        .sort((a, b) => a.order - b.order),
    );
  }

  /** Filter tasks by priority */
  tasksByPriority(priority: TaskPriority): Signal<Task[]> {
    return computed(() => this.tasks().filter((task) => task.priority === priority));
  }

  /** Get overdue tasks */
  readonly overdueTasks = computed(() => this.tasks().filter((task) => task.isOverdue));

  /** Tasks filtered by status - sorted by order */
  readonly todoTasks = computed(() =>
    this.tasks()
      .filter((task) => task.status === 'todo')
      .sort((a, b) => a.order - b.order),
  );
  readonly inProgressTasks = computed(() =>
    this.tasks()
      .filter((task) => task.status === 'in_progress')
      .sort((a, b) => a.order - b.order),
  );
  readonly doneTasks = computed(() =>
    this.tasks()
      .filter((task) => task.status === 'done')
      .sort((a, b) => a.order - b.order),
  );

  /** Task counts by status */
  readonly todoCount = computed(() => this.todoTasks().length);
  readonly inProgressCount = computed(() => this.inProgressTasks().length);
  readonly doneCount = computed(() => this.doneTasks().length);

  /** Reload tasks data */
  reload(): void {
    this.tasksResource.reload();
  }

  /**
   * Error handler for HTTP operations
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error('TasksService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Generate a unique task ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Create a new task (placed at the top of its status column)
   */
  createTask(taskData: CreateTaskDto): Observable<Task> {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: this.generateTaskId(),
      createdAt: now,
      updatedAt: now,
      order: 0, // New tasks are placed at the top
    };

    return this.http.post<Task>(API_URL.TASKS, newTask).pipe(
      retry({ count: 2, delay: 1000 }),
      tap(() => this.reload()),
      catchError(this.handleError.bind(this)),
    );
  }

  /**
   * Update an existing task
   */
  updateTask(taskData: UpdateTaskDto): Observable<Task> {
    const updatedTask = {
      ...taskData,
      updatedAt: new Date().toISOString(),
    };

    return this.http.put<Task>(`${API_URL.TASKS}/${taskData.id}`, updatedTask).pipe(
      retry({ count: 2, delay: 1000 }),
      tap(() => this.reload()),
      catchError(this.handleError.bind(this)),
    );
  }

  /**
   * Partially update a task (PATCH)
   */
  patchTask(id: string, updates: Partial<Task>): Observable<Task> {
    const patchData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.http.patch<Task>(`${API_URL.TASKS}/${id}`, patchData).pipe(
      retry({ count: 2, delay: 1000 }),
      tap(() => this.reload()),
      catchError(this.handleError.bind(this)),
    );
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL.TASKS}/${id}`).pipe(
      retry({ count: 2, delay: 1000 }),
      tap(() => this.reload()),
      catchError(this.handleError.bind(this)),
    );
  }

  /**
   * Update task status (convenience method)
   */
  updateTaskStatus(id: string, status: TaskStatus): Observable<Task> {
    const updates: Partial<Task> = { status };

    // If moving to 'done', set completedAt
    if (status === 'done') {
      updates.completedAt = new Date().toISOString();
      updates.isOverdue = false;
    }

    return this.patchTask(id, updates);
  }

  /**
   * Get a single task by ID
   */
  getTaskById(id: string): Observable<Task> {
    return this.http
      .get<Task>(`${API_URL.TASKS}/${id}`)
      .pipe(retry({ count: 2, delay: 1000 }), catchError(this.handleError.bind(this)));
  }

  /**
   * Fetch all tasks with retry logic (alternative to httpResource)
   */
  fetchTasksWithRetry(): Observable<Task[]> {
    return this.http
      .get<Task[]>(API_URL.TASKS)
      .pipe(retry({ count: 3, delay: 1000 }), catchError(this.handleError.bind(this)));
  }

  /**
   * Optimistically reorder tasks within the same column
   * Updates UI instantly, syncs to server in background
   */
  reorderTasksOptimistic(status: TaskStatus, previousIndex: number, currentIndex: number): void {
    // 1. Capture previous state for rollback
    const previousState = this._tasks();

    // 2. Get and reorder tasks for this status
    const statusTasks = this.tasks()
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);

    const reordered = [...statusTasks];
    moveItemInArray(reordered, previousIndex, currentIndex);

    // 3. Update local signal immediately (optimistic)
    this._tasks.update((tasks) =>
      tasks.map((t) => {
        const idx = reordered.findIndex((r) => r.id === t.id);
        return idx !== -1 ? { ...t, order: idx } : t;
      }),
    );

    // 4. Persist only affected tasks with retry
    const minIdx = Math.min(previousIndex, currentIndex);
    const maxIdx = Math.max(previousIndex, currentIndex);
    const affectedTasks = reordered.slice(minIdx, maxIdx + 1);

    const requests = affectedTasks.map((task, i) =>
      this.http
        .patch(`${API_URL.TASKS}/${task.id}`, {
          order: minIdx + i,
          updatedAt: new Date().toISOString(),
        })
        .pipe(retry({ count: 2, delay: 1000 })),
    );

    forkJoin(requests)
      .pipe(
        catchError((error) => {
          // Rollback on failure
          this._tasks.set(previousState);
          this.toastService.error('Failed to save task order. Please try again.');
          return throwError(() => error);
        }),
      )
      .subscribe();
  }

  /**
   * Move a task to a different column at a specific position
   * Updates UI instantly, syncs to server in background
   */
  moveTaskToColumn(task: Task, newStatus: TaskStatus, targetIndex: number): void {
    const previousState = this._tasks();

    // 1. Get target column tasks (excluding the moved task, sorted)
    const targetTasks = this.tasks()
      .filter((t) => t.status === newStatus && t.id !== task.id)
      .sort((a, b) => a.order - b.order);

    // 2. Insert task at target position
    const updatedTargetTasks = [...targetTasks];
    const movedTask = { ...task, status: newStatus, order: targetIndex };
    updatedTargetTasks.splice(targetIndex, 0, movedTask);

    // 3. Update local signal (optimistic)
    this._tasks.update((tasks) =>
      tasks.map((t) => {
        if (t.id === task.id) {
          return {
            ...t,
            status: newStatus,
            order: targetIndex,
            ...(newStatus === 'done'
              ? { completedAt: new Date().toISOString(), isOverdue: false }
              : {}),
          };
        }
        const idx = updatedTargetTasks.findIndex((ut) => ut.id === t.id);
        if (idx !== -1) {
          return { ...t, order: idx };
        }
        return t;
      }),
    );

    // 4. Persist: update moved task + affected tasks in target column
    const movedTaskUpdate = this.http
      .patch(`${API_URL.TASKS}/${task.id}`, {
        status: newStatus,
        order: targetIndex,
        updatedAt: new Date().toISOString(),
        ...(newStatus === 'done'
          ? { completedAt: new Date().toISOString(), isOverdue: false }
          : {}),
      })
      .pipe(retry({ count: 2, delay: 1000 }));

    // Update order for tasks after insertion point
    const affectedUpdates = updatedTargetTasks.slice(targetIndex + 1).map((t, i) =>
      this.http
        .patch(`${API_URL.TASKS}/${t.id}`, {
          order: targetIndex + 1 + i,
          updatedAt: new Date().toISOString(),
        })
        .pipe(retry({ count: 2, delay: 1000 })),
    );

    forkJoin([movedTaskUpdate, ...affectedUpdates])
      .pipe(
        catchError((error) => {
          this._tasks.set(previousState);
          this.toastService.error('Failed to move task. Please try again.');
          return throwError(() => error);
        }),
      )
      .subscribe();
  }
}
