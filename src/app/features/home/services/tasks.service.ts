import { computed, inject, Injectable, Signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import {
  CreateTaskDto,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskDto,
} from '../models/tasks.model';
import { catchError, Observable, retry, tap, throwError } from 'rxjs';
import { API_URL } from '../../../shared/constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly http = inject(HttpClient);

  /**
   * httpResource for fetching tasks with automatic loading states
   * Provides: value(), isLoading(), error(), reload()
   */
  readonly tasksResource = httpResource<Task[]>(() => ({
    url: API_URL.TASKS,
    method: 'GET',
  }));

  /** Computed signal for tasks array */
  readonly tasks = computed(() => this.tasksResource.value() ?? []);

  /** Computed signal for total count */
  readonly totalCount = computed(() => this.tasks().length);

  /** Filter tasks by status */
  tasksByStatus(status: TaskStatus): Signal<Task[]> {
    return computed(() => this.tasks().filter((task) => task.status === status));
  }

  /** Filter tasks by priority */
  tasksByPriority(priority: TaskPriority): Signal<Task[]> {
    return computed(() => this.tasks().filter((task) => task.priority === priority));
  }

  /** Get overdue tasks */
  readonly overdueTasks = computed(() => this.tasks().filter((task) => task.isOverdue));

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
   * Create a new task
   */
  createTask(taskData: CreateTaskDto): Observable<Task> {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: this.generateTaskId(),
      createdAt: now,
      updatedAt: now,
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
}
