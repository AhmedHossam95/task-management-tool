import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-task-form-footer',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './task-form-footer.html',
  styleUrl: './task-form-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormFooterComponent {
  /** Whether the form is in edit mode (shows delete button) */
  readonly isEditMode = input<boolean>(false);

  /** Emits when delete button is clicked */
  readonly deleteClick = output<void>();

  /** Emits when cancel button is clicked */
  readonly cancelClick = output<void>();
}
