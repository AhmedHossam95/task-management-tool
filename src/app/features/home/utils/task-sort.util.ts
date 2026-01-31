import { Task, TaskPriority } from '../models/tasks.model';
import { PriorityFilter, TaskSortConfig } from '../models/task-filters.model';

/** Priority ordering for sorting (low = 0, medium = 1, high = 2) */
const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 2,
  medium: 1,
  low: 0,
};

/**
 * Sorts tasks by the specified field and order
 * @param tasks - Array of tasks to sort
 * @param config - Sort configuration (field and order)
 * @returns New sorted array of tasks
 */
export function sortTasks(tasks: Task[], config: TaskSortConfig): Task[] {
  return [...tasks].sort((a, b) => {
    let comparison = 0;

    if (config.field === 'order') {
      // Sort by manual drag-drop order
      comparison = a.order - b.order;
    } else if (config.field === 'priority') {
      comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    } else {
      // Sort by createdAt
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return config.order === 'asc' ? comparison : -comparison;
  });
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
