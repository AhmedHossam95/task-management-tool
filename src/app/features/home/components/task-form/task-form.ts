import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { Assignee, Task, TaskPriority } from '../../models/tasks.model';
import { AssigneeAvatarComponent } from '../assignee-avatar/assignee-avatar.component';
import { TaskFormFooterComponent } from '../task-form-footer/task-form-footer';
import { parseDateFromBackend } from '../../utils/tasks.utils';
import { UserNameFromIdPipe } from '../../pipes/user-name-from-id-pipe';
import { futureDateValidator } from '../../validators/future-date.validator';

/** Typed form group for task form */
type TaskFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  priority: FormControl<TaskPriority>;
  dueDate: FormControl<string | Date>;
  assignee: FormControl<string>;
  tags: FormArray<FormControl<string>>;
}>;

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    AssigneeAvatarComponent,
    TaskFormFooterComponent,
    UserNameFromIdPipe,
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  /** Task to edit (null for create mode) */
  readonly task = input<Task | null>(null);

  /** Available users for assignee selection */
  readonly users = input.required<Assignee[]>();

  /** Emits form data on save */
  readonly save = output<Partial<Task>>();

  /** Emits task id on delete */
  readonly delete = output<string>();

  /** Emits on cancel */
  readonly closeModal = output<void>();

  /** Whether in edit mode */
  readonly isEditMode = computed(() => this.task() !== null);

  /** Form title */
  readonly formTitle = computed(() => (this.isEditMode() ? 'Edit Task' : 'Create Task'));

  /** Separator keys for chip input */
  readonly separatorKeyCodes = [ENTER, COMMA] as const;

  /** Priority options */
  readonly priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  /** Minimum date for date picker (today) */
  minDate = new Date();

  /** Typed reactive form */
  form!: TaskFormGroup;

  /** Getter for tags FormArray */
  get tagsArray(): FormArray<FormControl<string>> {
    return this.form.controls.tags;
  }

  constructor() {
    // Initialize form when task input changes
    effect(() => {
      const task = this.task();

      // Set minDate based on mode
      if (this.isEditMode()) {
        this.minDate = parseDateFromBackend(this.task()?.dueDate) || new Date();
      } else {
        this.minDate = new Date();
      }
      this.minDate.setHours(0, 0, 0, 0);

      if (task) {
        this.form.patchValue({
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate,
          assignee: task.assignee.id,
        });
        // Clear and repopulate tags FormArray
        this.tagsArray.clear();
        task.tags.forEach((tag) => this.tagsArray.push(this.fb.nonNullable.control(tag)));
      } else {
        this.form.reset({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
          assignee: '',
        });
        this.tagsArray.clear();
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
      description: this.fb.nonNullable.control('', Validators.maxLength(500)),
      priority: this.fb.nonNullable.control<TaskPriority>('medium', Validators.required),
      dueDate: this.fb.nonNullable.control<string | Date>('', [
        Validators.required,
        futureDateValidator.bind(this, this.isEditMode()),
      ]),
      assignee: this.fb.nonNullable.control('', Validators.required),
      tags: this.fb.array<FormControl<string>>([]),
    });
  }

  /** Add a tag to the FormArray */
  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.tagsArray.value.includes(value)) {
      this.tagsArray.push(this.fb.nonNullable.control(value));
    }
    event.chipInput.clear();
  }

  /** Remove a tag from the FormArray by index */
  removeTag(index: number): void {
    this.tagsArray.removeAt(index);
  }

  /** Handle form submission */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const selectedUser = this.users().find((u) => u.id === formValue.assignee);

    if (!selectedUser) return;

    const taskData: Partial<Task> = {
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      dueDate: formValue.dueDate as string, // Date objects are converted by the service
      assignee: selectedUser,
      tags: formValue.tags,
    };

    this.save.emit(taskData);
  }

  /** Handle delete */
  onDelete(): void {
    const task = this.task();
    if (task && confirm('Are you sure you want to delete this task?')) {
      this.delete.emit(task.id);
    }
  }

  /** Handle cancel */
  onCancel(): void {
    this.closeModal.emit();
  }
}
