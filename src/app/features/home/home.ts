import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TasksService } from './services/tasks.service';
import { KanbanColumnComponent } from './components/kanban-column/kanban-column';
import { Task, TaskStatus } from './models/tasks.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [KanbanColumnComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private readonly tasksService = inject(TasksService);

  protected readonly todoTasks = this.tasksService.todoTasks;
  protected readonly inProgressTasks = this.tasksService.inProgressTasks;
  protected readonly doneTasks = this.tasksService.doneTasks;

  protected readonly todoCount = this.tasksService.todoCount;
  protected readonly inProgressCount = this.tasksService.inProgressCount;
  protected readonly doneCount = this.tasksService.doneCount;

  protected readonly columnIds = ['todo', 'in_progress', 'done'];

  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    const task = event.item.data as Task;

    if (event.previousContainer === event.container) {
      // Same column reorder
      if (event.previousIndex === event.currentIndex) return;

      const status = event.container.id as TaskStatus;
      this.tasksService.reorderTasksOptimistic(status, event.previousIndex, event.currentIndex);
    } else {
      // Cross-column move to exact drop position
      const newStatus = event.container.id as TaskStatus;
      this.tasksService.moveTaskToColumn(task, newStatus, event.currentIndex);
    }
  }
}
