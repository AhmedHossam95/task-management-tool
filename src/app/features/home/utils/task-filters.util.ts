import { computed, Signal } from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../models/tasks.model';
import { AssigneeFilter, PriorityFilter } from '../models/task-filters.model';

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
 * Filters tasks by status (pure function version)
 * @param tasks - Array of tasks to filter
 * @param status - The status to filter by
 * @returns Filtered array of tasks
 */
export function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status);
}

/**
 * Filters tasks by search query across title and description
 * @param tasks - Array of tasks to search
 * @param query - Search query string
 * @returns Filtered array of tasks matching the query
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return tasks;

  const lowerQuery = trimmedQuery.toLowerCase();
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Filters tasks by priority
 * @param tasks - Array of tasks to filter
 * @param priority - Priority filter value ('all' or specific priority)
 * @returns Filtered array of tasks
 */
export function filterByPriority(tasks: Task[], priority: PriorityFilter): Task[] {
  if (priority === 'all') return tasks;
  return tasks.filter((task) => task.priority === priority);
}

/**
 * Filters tasks by assignee
 * @param tasks - Array of tasks to filter
 * @param assigneeId - Assignee filter value ('all' or specific user id)
 * @returns Filtered array of tasks
 */
export function filterByAssignee(tasks: Task[], assigneeId: AssigneeFilter): Task[] {
  if (assigneeId === 'all') return tasks;
  return tasks.filter((task) => task.assignee.id === assigneeId);
}
