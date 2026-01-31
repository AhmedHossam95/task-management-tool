import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
  readonly data = inject<TaskDialogData>(MAT_DIALOG_DATA);

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
