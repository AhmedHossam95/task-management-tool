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
    if (event.previousContainer === event.container) {
      // Reordering within same column - no status change needed
      return;
    }

    // Get the new status from the container id
    const newStatus = event.container.id as TaskStatus;
    const task = event.item.data as Task;

    // Update task status via service
    this.tasksService.updateTaskStatus(task.id, newStatus).subscribe();
  }
}
