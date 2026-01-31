import { computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AssigneeFilter,
  DEFAULT_FILTERS,
  PRIORITY_FILTER_OPTIONS,
  PriorityFilter,
  SORT_OPTIONS,
  SortField,
  SortOrder,
  STATUS_FILTER_OPTIONS,
  StatusFilter,
  TaskSortConfig,
} from '../models/task-filters.model';

@Injectable({
  providedIn: 'root',
})
export class TasksFilterService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Status filter signal */
  readonly statusFilter = signal<StatusFilter>(DEFAULT_FILTERS.status);

  /** Priority filter signal */
  readonly priorityFilter = signal<PriorityFilter>(DEFAULT_FILTERS.priority);

  /** Assignee filter signal */
  readonly assigneeFilter = signal<AssigneeFilter>(DEFAULT_FILTERS.assignee);

  /** Search query signal */
  readonly searchQuery = signal<string>(DEFAULT_FILTERS.search);

  /** Sort configuration signal */
  readonly sortConfig = signal<TaskSortConfig>(DEFAULT_FILTERS.sort);

  /** Whether drag-drop is enabled (only when sorting by manual order) */
  readonly isDragEnabled = computed(() => this.sortConfig().field === 'order');

  constructor() {
    this.initFromUrl();
  }

  /**
   * Initialize filter state from URL query params
   */
  private initFromUrl(): void {
    const params = this.route.snapshot.queryParams;

    if (params['status'] && this.isValidStatus(params['status'])) {
      this.statusFilter.set(params['status'] as StatusFilter);
    }

    if (params['priority'] && this.isValidPriority(params['priority'])) {
      this.priorityFilter.set(params['priority'] as PriorityFilter);
    }

    if (params['assignee']) {
      this.assigneeFilter.set(params['assignee'] as AssigneeFilter);
    }

    if (params['search']) {
      this.searchQuery.set(params['search']);
    }

    if (params['sort'] && this.isValidSortField(params['sort'])) {
      const field = params['sort'] as SortField;
      const order = params['order'] === 'asc' ? 'asc' : 'desc';
      this.sortConfig.set({ field, order });
    }
  }

  /**
   * Set status filter and sync to URL
   */
  setStatus(status: StatusFilter): void {
    this.statusFilter.set(status);
    this.syncToUrl();
  }

  /**
   * Set priority filter and sync to URL
   */
  setPriority(priority: PriorityFilter): void {
    this.priorityFilter.set(priority);
    this.syncToUrl();
  }

  /**
   * Set assignee filter and sync to URL
   */
  setAssignee(assignee: AssigneeFilter): void {
    this.assigneeFilter.set(assignee);
    this.syncToUrl();
  }

  /**
   * Set search query and sync to URL
   */
  setSearch(query: string): void {
    this.searchQuery.set(query);
    this.syncToUrl();
  }

  /**
   * Set sort configuration (field and order) and sync to URL
   */
  setSort(field: SortField, order: SortOrder): void {
    this.sortConfig.set({ field, order });
    this.syncToUrl();
  }

  /**
   * Reset all filters to defaults
   */
  resetFilters(): void {
    this.statusFilter.set(DEFAULT_FILTERS.status);
    this.priorityFilter.set(DEFAULT_FILTERS.priority);
    this.assigneeFilter.set(DEFAULT_FILTERS.assignee);
    this.searchQuery.set(DEFAULT_FILTERS.search);
    this.sortConfig.set(DEFAULT_FILTERS.sort);
    this.syncToUrl();
  }

  /**
   * Sync current filter state to URL query params
   */
  private syncToUrl(): void {
    const params: Record<string, string> = {};

    // Only add non-default values to URL
    if (this.statusFilter() !== DEFAULT_FILTERS.status) {
      params['status'] = this.statusFilter();
    }

    if (this.priorityFilter() !== DEFAULT_FILTERS.priority) {
      params['priority'] = this.priorityFilter();
    }

    if (this.assigneeFilter() !== DEFAULT_FILTERS.assignee) {
      params['assignee'] = this.assigneeFilter();
    }

    if (this.searchQuery().trim()) {
      params['search'] = this.searchQuery();
    }

    const sort = this.sortConfig();
    if (sort.field !== DEFAULT_FILTERS.sort.field) {
      params['sort'] = sort.field;
    }

    if (sort.order !== DEFAULT_FILTERS.sort.order) {
      params['order'] = sort.order;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: '', // Replace all query params
      replaceUrl: true, // Don't add to browser history
    });
  }

  private isValidStatus(value: string): boolean {
    return STATUS_FILTER_OPTIONS.some((opt) => opt.value === value);
  }

  private isValidPriority(value: string): boolean {
    return PRIORITY_FILTER_OPTIONS.some((opt) => opt.value === value);
  }

  private isValidSortField(value: string): boolean {
    return SORT_OPTIONS.some((opt) => opt.field === value);
  }
}
