import { TaskPriority, TaskStatus } from './tasks.model';

/** Status filter options - 'all' shows all columns, specific status shows only that column */
export type StatusFilter = 'all' | TaskStatus;

/** Priority filter options - 'all' shows all priorities */
export type PriorityFilter = 'all' | TaskPriority;

/** Available fields for sorting tasks */
export type SortField = 'order' | 'priority' | 'createdAt';

/** Sort order direction */
export type SortOrder = 'asc' | 'desc';

/** Configuration for task sorting */
export type TaskSortConfig = {
  field: SortField;
  order: SortOrder;
};

/** Complete filter state for tasks */
export type TaskFilters = {
  status: StatusFilter;
  priority: PriorityFilter;
  search: string;
  sort: TaskSortConfig;
};

/** Default filter values */
export const DEFAULT_FILTERS: TaskFilters = {
  status: 'all',
  priority: 'all',
  search: '',
  sort: { field: 'order', order: 'asc' },
};

/** Status filter options for UI */
export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

/** Priority filter options for UI */
export const PRIORITY_FILTER_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/** Combined sort option with field and order */
export type SortOption = {
  field: SortField;
  order: SortOrder;
  label: string;
};

/** Sort options for UI - combines field and order */
export const SORT_OPTIONS: SortOption[] = [
  { field: 'order', order: 'asc', label: 'Manual Order' },
  { field: 'priority', order: 'desc', label: 'Priority (High to Low)' },
  { field: 'priority', order: 'asc', label: 'Priority (Low to High)' },
  { field: 'createdAt', order: 'desc', label: 'Date Created (Newest)' },
  { field: 'createdAt', order: 'asc', label: 'Date Created (Oldest)' },
];
