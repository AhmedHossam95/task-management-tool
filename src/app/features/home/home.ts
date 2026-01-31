import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TasksService } from './services/tasks.service';
import { TaskComponent } from './components/task/task';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [TaskComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private readonly tasksService = inject(TasksService);
  protected readonly tasks = this.tasksService.tasks;
}
