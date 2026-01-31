import { Task, TaskPriority } from '../models/tasks.model';
import { SortField, TaskSortConfig } from '../models/task-filters.model';

/** Priority ordering for sorting (low = 0, medium = 1, high = 2) */
const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 2,
  medium: 1,
  low: 0,
};

/** Sort strategy function type */
type SortStrategy = (a: Task, b: Task) => number;

/** Sort strategies map - extensible without modifying sortTasks function */
const SORT_STRATEGIES: Record<SortField, SortStrategy> = {
  order: (a, b) => a.order - b.order,
  priority: (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  createdAt: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
};

/**
 * Sorts tasks by the specified field and order
 * @param tasks - Array of tasks to sort
 * @param config - Sort configuration (field and order)
 * @returns New sorted array of tasks
 */
export function sortTasks(tasks: Task[], config: TaskSortConfig): Task[] {
  const strategy = SORT_STRATEGIES[config.field];
  return [...tasks].sort((a, b) => {
    const comparison = strategy(a, b);
    return config.order === 'asc' ? comparison : -comparison;
  });
}
