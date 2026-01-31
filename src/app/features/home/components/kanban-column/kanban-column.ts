import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Task } from '../../models/tasks.model';
import { TaskComponent } from '../task/task';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [TaskComponent, CdkDropList, CdkDrag],
  templateUrl: './kanban-column.html',
  styleUrl: './kanban-column.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumnComponent {
  readonly title = input.required<string>();
  readonly tasks = input.required<Task[]>();
  readonly count = input.required<number>();
  readonly columnId = input.required<string>();
  readonly connectedTo = input<string[]>([]);
  readonly dragEnabled = input<boolean>(true);

  readonly taskDropped = output<CdkDragDrop<Task[]>>();

  onDrop(event: CdkDragDrop<Task[]>): void {
    this.taskDropped.emit(event);
  }
}
