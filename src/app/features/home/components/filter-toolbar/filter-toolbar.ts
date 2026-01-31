import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TasksFilterService } from '../../services/tasks-filter.service';
import { UsersService } from '../../services/users.service';
import { AssigneeAvatarComponent } from '../assignee-avatar/assignee-avatar.component';
import {
  PRIORITY_FILTER_OPTIONS,
  SORT_OPTIONS,
  SortOption,
  STATUS_FILTER_OPTIONS,
  StatusFilter,
} from '../../models/task-filters.model';

@Component({
  selector: 'app-filter-toolbar',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    AssigneeAvatarComponent,
  ],
  templateUrl: './filter-toolbar.html',
  styleUrl: './filter-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterToolbarComponent {
  protected readonly filterService = inject(TasksFilterService);
  private readonly usersService = inject(UsersService);

  /** Users list for assignee filter dropdown */
  protected readonly users = computed(() => this.usersService.users() ?? []);

  /** Selected assignee label for display in the dropdown trigger */
  protected readonly selectedAssigneeLabel = computed(() => {
    const assigneeId = this.filterService.assigneeFilter();
    if (assigneeId === 'all') return 'All Assignees';
    const user = this.users().find((u) => u.id === assigneeId);
    return user?.name ?? 'All Assignees';
  });

  /** Filter options for UI */
  protected readonly statusOptions = STATUS_FILTER_OPTIONS;
  protected readonly priorityOptions = PRIORITY_FILTER_OPTIONS;
  protected readonly sortOptions = SORT_OPTIONS;

  /** Current sort label for menu trigger button */
  protected readonly currentSortLabel = computed(() => {
    const config = this.filterService.sortConfig();
    const option = SORT_OPTIONS.find((o) => o.field === config.field && o.order === config.order);
    return option?.label ?? 'Sort';
  });

  /** Check if a sort option is selected */
  protected isSortOptionSelected(option: SortOption): boolean {
    const config = this.filterService.sortConfig();
    return config.field === option.field && config.order === option.order;
  }

  /** Local search input with debounce */
  protected readonly searchInput = signal('');
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Initialize search input from filter service
    this.searchInput.set(this.filterService.searchQuery());
  }

  /**
   * Handle search input change with debounce
   */
  onSearchInput(value: string): void {
    this.searchInput.set(value);

    // Clear previous timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // Debounce search updates (300ms)
    this.searchDebounceTimer = setTimeout(() => {
      this.filterService.setSearch(value);
    }, 300);
  }

  /**
   * Clear search input
   */
  clearSearch(): void {
    this.searchInput.set('');
    this.filterService.setSearch('');
  }

  /**
   * Handle status tab click
   */
  onStatusChange(status: StatusFilter): void {
    this.filterService.setStatus(status);
  }

  /**
   * Check if a status tab is active
   */
  isStatusActive(status: StatusFilter): boolean {
    return this.filterService.statusFilter() === status;
  }
}
