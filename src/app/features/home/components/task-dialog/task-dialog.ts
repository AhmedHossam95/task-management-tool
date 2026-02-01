import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { Assignee, Task } from '../../models/tasks.model';
import { TaskFormComponent } from '../task-form/task-form';

/** Data passed to the dialog */
export type TaskDialogData = {
  task: Task | null; // null = create mode
  users: Assignee[];
};

/** Result returned from the dialog */
export type TaskDialogResult = {
  action: 'save' | 'delete';
  data?: Partial<Task>;
  taskId?: string;
};

/** Mobile breakpoint (max-width: 425px) */
const MOBILE_BREAKPOINT = '(max-width: 425px)';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [MatDialogModule, TaskFormComponent],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<TaskDialogComponent, TaskDialogResult>);
  private readonly breakpointObserver = inject(BreakpointObserver);
  readonly data = inject<TaskDialogData>(MAT_DIALOG_DATA);

  /** Whether the viewport is mobile */
  readonly isMobile = toSignal(
    this.breakpointObserver.observe(MOBILE_BREAKPOINT).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  /** Handle save from form */
  onSave(taskData: Partial<Task>): void {
    this.dialogRef.close({
      action: 'save',
      data: taskData,
      taskId: this.data.task?.id,
    });
  }

  /** Handle delete from form */
  onDelete(taskId: string): void {
    this.dialogRef.close({
      action: 'delete',
      taskId,
    });
  }

  /** Handle cancel */
  onCloseModal(): void {
    this.dialogRef.close();
  }
}
