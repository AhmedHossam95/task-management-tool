import { computed, Signal } from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../models/tasks.model';

/**
 * Creates a computed signal that filters and sorts tasks by status
 * @param tasks - Source signal containing all tasks
 * @param status - The status to filter by
 * @returns A computed signal of filtered and sorted tasks
 */
export function createTasksByStatusSignal(
  tasks: Signal<Task[]>,
  status: TaskStatus,
): Signal<Task[]> {
  return computed(() =>
    tasks()
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order),
  );
}

/**
 * Creates a computed signal that filters tasks by priority
 * @param tasks - Source signal containing all tasks
 * @param priority - The priority to filter by
 * @returns A computed signal of filtered tasks
 */
export function createTasksByPrioritySignal(
  tasks: Signal<Task[]>,
  priority: TaskPriority,
): Signal<Task[]> {
  return computed(() => tasks().filter((task) => task.priority === priority));
}

/**
 * Creates a computed signal for overdue tasks
 * @param tasks - Source signal containing all tasks
 * @returns A computed signal of overdue tasks
 */
export function createOverdueTasksSignal(tasks: Signal<Task[]>): Signal<Task[]> {
  return computed(() => tasks().filter((task) => task.isOverdue));
}

/**
 * Filters and sorts tasks by status (pure function version)
 * @param tasks - Array of tasks to filter
 * @param status - The status to filter by
 * @returns Filtered and sorted array of tasks
 */
export function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status).sort((a, b) => a.order - b.order);
}
