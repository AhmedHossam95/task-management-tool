import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskDialogComponent, TaskDialogData, TaskDialogResult } from './task-dialog';
import { Assignee, Task } from '../../models/tasks.model';
import { TaskFormComponent } from '../task-form/task-form';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TaskDialogComponent', () => {
  let component: TaskDialogComponent;
  let fixture: ComponentFixture<TaskDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<TaskDialogComponent, TaskDialogResult>>;

  const mockUsers: Assignee[] = [
    { id: '1', name: 'John Doe', avatar: 'avatar1.jpg', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', avatar: 'avatar2.jpg', email: 'jane@example.com' },
  ];

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    priority: 'high',
    dueDate: '2024-12-31',
    assignee: mockUsers[0],
    order: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tags: ['test', 'important'],
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [TaskDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { task: null, users: mockUsers } },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Data injection', () => {
    it('should inject dialog data', () => {
      expect(component.data).toBeTruthy();
      expect(component.data.users).toEqual(mockUsers);
      expect(component.data.task).toBeNull();
    });
  });

  describe('onSave', () => {
    it('should close dialog with save action and task data', () => {
      const taskData: Partial<Task> = {
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        status: 'todo',
      };

      component.onSave(taskData);

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        action: 'save',
        data: taskData,
        taskId: undefined,
      });
    });

    it('should include task ID when editing existing task', () => {
      // Simulate editing by manually setting data
      (component as any).data = { task: mockTask, users: mockUsers };

      const taskData: Partial<Task> = {
        title: 'Updated Task',
      };

      component.onSave(taskData);

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        action: 'save',
        data: taskData,
        taskId: mockTask.id,
      });
    });

    it('should pass partial task data', () => {
      const partialData: Partial<Task> = {
        title: 'Only Title',
      };

      component.onSave(partialData);

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        action: 'save',
        data: partialData,
        taskId: undefined,
      });
    });
  });

  describe('onDelete', () => {
    it('should close dialog with delete action and task ID', () => {
      const taskId = 'task-123';

      component.onDelete(taskId);

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        action: 'delete',
        taskId: taskId,
      });
    });

    it('should not include data property in delete result', () => {
      component.onDelete('task-456');

      const callArgs = mockDialogRef.close.calls.mostRecent().args[0];
      expect(callArgs).toEqual({
        action: 'delete',
        taskId: 'task-456',
      });
      expect(callArgs?.data).toBeUndefined();
    });
  });

  describe('onCloseModal', () => {
    it('should close dialog without result', () => {
      component.onCloseModal();

      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Template integration', () => {
    it('should render TaskFormComponent', () => {
      const taskForm = fixture.debugElement.nativeElement.querySelector('app-task-form');

      expect(taskForm).toBeTruthy();
    });

    it('should pass data to TaskFormComponent', () => {
      const taskFormDebug = fixture.debugElement.query(
        (de) => de.componentInstance instanceof TaskFormComponent,
      );

      if (taskFormDebug) {
        const taskFormComponent = taskFormDebug.componentInstance as TaskFormComponent;
        expect(taskFormComponent.task()).toBeNull();
        expect(taskFormComponent.users()).toEqual(mockUsers);
      }
    });

    it('should handle save event from TaskFormComponent', () => {
      const taskData: Partial<Task> = { title: 'Test' };
      component.onSave(taskData);

      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle delete event from TaskFormComponent', () => {
      component.onDelete('task-1');

      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle closeModal event from TaskFormComponent', () => {
      component.onCloseModal();

      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Dialog result types', () => {
    it('should return correct result type for save action', () => {
      const taskData: Partial<Task> = { title: 'Test' };
      component.onSave(taskData);

      const result = mockDialogRef.close.calls.mostRecent().args[0];
      expect(result?.action).toBe('save');
      expect(result?.data).toEqual(taskData);
    });

    it('should return correct result type for delete action', () => {
      component.onDelete('task-1');

      const result = mockDialogRef.close.calls.mostRecent().args[0];
      expect(result?.action).toBe('delete');
      expect(result?.taskId).toBe('task-1');
    });
  });
});
