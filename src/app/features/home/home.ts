import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TasksService } from './services/tasks.service';
import { TasksFilterService } from './services/tasks-filter.service';
import { KanbanColumnComponent } from './components/kanban-column/kanban-column';
import { FilterToolbarComponent } from './components/filter-toolbar/filter-toolbar';
import { Task, TaskStatus } from './models/tasks.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [KanbanColumnComponent, FilterToolbarComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private readonly tasksService = inject(TasksService);
  private readonly filterService = inject(TasksFilterService);

  /** Use filtered tasks for display */
  protected readonly todoTasks = this.tasksService.filteredTodoTasks;
  protected readonly inProgressTasks = this.tasksService.filteredInProgressTasks;
  protected readonly doneTasks = this.tasksService.filteredDoneTasks;

  /** Filtered counts for display */
  protected readonly todoCount = this.tasksService.filteredTodoCount;
  protected readonly inProgressCount = this.tasksService.filteredInProgressCount;
  protected readonly doneCount = this.tasksService.filteredDoneCount;

  /** Determine which columns are visible based on status filter */
  protected readonly visibleColumns = computed(() => {
    const status = this.filterService.statusFilter();
    if (status === 'all') {
      return ['todo', 'in_progress', 'done'];
    }
    return [status];
  });

  /** Column IDs for drag-drop connectivity (only visible columns) */
  protected readonly columnIds = this.visibleColumns;

  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    const task = event.item.data as Task;
    const hasFiltersOrSort = this.filterService.hasActiveFiltersOrSort();

    if (event.previousContainer === event.container) {
      // Same column - only allow reorder when no filters/sort active
      if (hasFiltersOrSort) return;
      if (event.previousIndex === event.currentIndex) return;

      const status = event.container.id as TaskStatus;
      this.tasksService.reorderTasksOptimistic(status, event.previousIndex, event.currentIndex);
    } else {
      // Cross-column move
      const newStatus = event.container.id as TaskStatus;
      if (hasFiltersOrSort) {
        // Append to end when filters/sort active
        this.tasksService.moveTaskToColumnEnd(task, newStatus);
      } else {
        // Use exact drop position when no filters/sort
        this.tasksService.moveTaskToColumn(task, newStatus, event.currentIndex);
      }
    }
  }
}
