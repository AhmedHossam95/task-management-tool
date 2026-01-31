import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Task } from '../../models/tasks.model';
import { UpperCasePipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { NameLettersPipe } from '../../pipes/name-letters-pipe';
import { DueDateStatusPipe } from '../../pipes/due-date-status-pipe';

@Component({
  selector: 'app-task',
  imports: [MatDividerModule, NameLettersPipe, UpperCasePipe, DueDateStatusPipe],
  templateUrl: './task.html',
  styleUrl: './task.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComponent {
  readonly task = input<Task>();
}
