import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Task } from '../../models/tasks.model';
import { UpperCasePipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { DueDateStatusPipe } from '../../pipes/due-date-status-pipe';
import { AssigneeAvatarComponent } from '../assignee-avatar/assignee-avatar.component';

@Component({
  selector: 'app-task',
  imports: [MatDividerModule, UpperCasePipe, DueDateStatusPipe, AssigneeAvatarComponent],
  templateUrl: './task.html',
  styleUrl: './task.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComponent {
  readonly task = input<Task>();
}
