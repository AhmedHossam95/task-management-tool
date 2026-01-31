import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Task } from '../../models/tasks.model';
import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { NameLettersPipe } from '../../pipes/name-letters-pipe';

@Component({
  selector: 'app-task',
  imports: [TitleCasePipe, MatDividerModule, NameLettersPipe, UpperCasePipe],
  templateUrl: './task.html',
  styleUrl: './task.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComponent {
  readonly task = input<Task>();
}
