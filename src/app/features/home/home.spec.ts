import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { computed, signal } from '@angular/core';
import { of } from 'rxjs';
import { HomeComponent } from './home';
import { TasksService } from './services/tasks.service';
import { TasksFilterService } from './services/tasks-filter.service';
import { UsersService } from './services/users.service';
import { Assignee, Task } from './models/tasks.model';
import { TaskDialogResult } from './components/task-dialog/task-dialog';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let tasksService: jasmine.SpyObj<TasksService>;
  let filterService: jasmine.SpyObj<TasksFilterService>;
  let usersService: jasmine.SpyObj<UsersService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let hasActiveFiltersSignal: ReturnType<typeof signal<boolean>>;

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
    tags: ['test'],
  };

  beforeEach(async () => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', [
      'reorderTasksOptimistic',
      'moveTaskToColumn',
      'moveTaskToColumnEnd',
      'createTask',
      'updateTask',
      'deleteTask',
    ]);

    hasActiveFiltersSignal = signal(false);
    const filterServiceSpy = jasmine.createSpyObj('TasksFilterService', [], {
      statusFilter: signal('all' as any),
      priorityFilter: signal('all' as any),
      assigneeFilter: signal('all' as any),
      searchQuery: signal(''),
      sortConfig: signal({ field: 'order' as any, order: 'asc' as any }),
    });

    // Add hasActiveFiltersOrSort as a function that returns the signal value
    Object.defineProperty(filterServiceSpy, 'hasActiveFiltersOrSort', {
      get: () => hasActiveFiltersSignal,
      configurable: true,
    });

    const usersServiceSpy = jasmine.createSpyObj('UsersService', [], {
      users: signal(mockUsers),
    });

    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    // Setup default signal values for TasksService
    Object.defineProperty(tasksServiceSpy, 'filteredTodoTasks', {
      value: signal([mockTask]),
    });
    Object.defineProperty(tasksServiceSpy, 'filteredInProgressTasks', {
      value: signal([]),
    });
    Object.defineProperty(tasksServiceSpy, 'filteredDoneTasks', { value: signal([]) });
    Object.defineProperty(tasksServiceSpy, 'filteredTodoCount', { value: signal(1) });
    Object.defineProperty(tasksServiceSpy, 'filteredInProgressCount', {
      value: signal(0),
    });
    Object.defineProperty(tasksServiceSpy, 'filteredDoneCount', { value: signal(0) });

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: TasksFilterService, useValue: filterServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
    filterService = TestBed.inject(TasksFilterService) as jasmine.SpyObj<TasksFilterService>;
    usersService = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Visible columns', () => {
    it('should show all columns when status filter is "all"', () => {
      const columns = component['visibleColumns']();
      expect(columns).toEqual(['todo', 'in_progress', 'done']);
    });

    it('should show only todo column when filtered by todo', () => {
      filterService.statusFilter.set('todo' as any);
      const columns = component['visibleColumns']();
      expect(columns).toEqual(['todo']);
    });

    it('should show only in_progress column when filtered by in_progress', () => {
      filterService.statusFilter.set('in_progress' as any);
      const columns = component['visibleColumns']();
      expect(columns).toEqual(['in_progress']);
    });

    it('should show only done column when filtered by done', () => {
      filterService.statusFilter.set('done' as any);
      const columns = component['visibleColumns']();
      expect(columns).toEqual(['done']);
    });
  });

  describe('Task drag and drop', () => {
    it('should reorder tasks in same column when no filters active', () => {
      // The computed returns false by default, so filterService.hasActiveFiltersOrSort() should be false
      // Use the same container reference for same-column drag since component checks reference equality
      const container = { id: 'todo' };

      const event = {
        previousContainer: container,
        container: container,
        previousIndex: 0,
        currentIndex: 2,
        item: { data: mockTask },
      } as unknown as CdkDragDrop<Task[]>;

      component.onTaskDrop(event);

      expect(tasksService.reorderTasksOptimistic).toHaveBeenCalledWith('todo', 0, 2);
    });

    it('should not reorder tasks in same column when filters are active', () => {
      // Set hasActiveFiltersOrSort to return true
      hasActiveFiltersSignal.set(true);

      // Use the same container reference for same-column drag
      const container = { id: 'todo' };

      const event = {
        previousContainer: container,
        container: container,
        previousIndex: 0,
        currentIndex: 2,
        item: { data: mockTask },
      } as unknown as CdkDragDrop<Task[]>;

      component.onTaskDrop(event);

      expect(tasksService.reorderTasksOptimistic).not.toHaveBeenCalled();

      // Reset for other tests
      hasActiveFiltersSignal.set(false);
    });

    it('should not reorder when dropped at same position', () => {
      // Use the same container reference for same-column drag
      const container = { id: 'todo' };

      const event = {
        previousContainer: container,
        container: container,
        previousIndex: 1,
        currentIndex: 1,
        item: { data: mockTask },
      } as unknown as CdkDragDrop<Task[]>;

      component.onTaskDrop(event);

      expect(tasksService.reorderTasksOptimistic).not.toHaveBeenCalled();
    });

    it('should move task to new column at specific position when no filters', () => {
      const event = {
        previousContainer: { id: 'todo' },
        container: { id: 'in_progress' },
        previousIndex: 0,
        currentIndex: 1,
        item: { data: mockTask },
      } as unknown as CdkDragDrop<Task[]>;

      component.onTaskDrop(event);

      expect(tasksService.moveTaskToColumn).toHaveBeenCalledWith(mockTask, 'in_progress', 1);
    });

    it('should move task to end of column when filters are active', () => {
      // Set hasActiveFiltersOrSort to return true
      hasActiveFiltersSignal.set(true);

      const event = {
        previousContainer: { id: 'todo' },
        container: { id: 'done' },
        previousIndex: 0,
        currentIndex: 1,
        item: { data: mockTask },
      } as unknown as CdkDragDrop<Task[]>;

      component.onTaskDrop(event);

      expect(tasksService.moveTaskToColumnEnd).toHaveBeenCalledWith(mockTask, 'done');

      // Reset for other tests
      hasActiveFiltersSignal.set(false);
    });
  });

  describe('Task dialog operations', () => {
    it('should open dialog when creating new task', () => {
      const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<any, TaskDialogResult>>(
        'MatDialogRef',
        ['afterClosed'],
      );
      dialogRefSpy.afterClosed.and.returnValue(of(undefined));
      dialog.open.and.returnValue(dialogRefSpy);

      component.onCreateTask();

      expect(dialog.open).toHaveBeenCalled();
      const callArgs = dialog.open.calls.mostRecent().args;
      expect((callArgs[1] as any).data.task).toBeNull();
      expect((callArgs[1] as any).data.users).toEqual(mockUsers);
    });

    it('should open dialog when clicking on task', () => {
      const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<any, TaskDialogResult>>(
        'MatDialogRef',
        ['afterClosed'],
      );
      dialogRefSpy.afterClosed.and.returnValue(of(undefined));
      dialog.open.and.returnValue(dialogRefSpy);

      component.onTaskClick(mockTask);

      expect(dialog.open).toHaveBeenCalled();
      const callArgs = dialog.open.calls.mostRecent().args;
      expect((callArgs[1] as any).data.task).toEqual(mockTask);
      expect((callArgs[1] as any).data.users).toEqual(mockUsers);
    });

    it('should create task when dialog returns save action without taskId', () => {
      const taskData = { title: 'New Task', description: 'New Description' };
      const dialogResult: TaskDialogResult = {
        action: 'save',
        data: taskData,
      };

      const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<any, TaskDialogResult>>(
        'MatDialogRef',
        ['afterClosed'],
      );
      dialogRefSpy.afterClosed.and.returnValue(of(dialogResult));
      dialog.open.and.returnValue(dialogRefSpy);

      component.onCreateTask();

      expect(tasksService.createTask).toHaveBeenCalledWith(taskData);
    });

    it('should update task when dialog returns save action with taskId', () => {
      const taskData = { title: 'Updated Task' };
      const dialogResult: TaskDialogResult = {
        action: 'save',
        data: taskData,
        taskId: 'task-1',
      };

      const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<any, TaskDialogResult>>(
        'MatDialogRef',
        ['afterClosed'],
      );
      dialogRefSpy.afterClosed.and.returnValue(of(dialogResult));
      dialog.open.and.returnValue(dialogRefSpy);

      component.onTaskClick(mockTask);

      expect(tasksService.updateTask).toHaveBeenCalledWith('task-1', taskData);
    });

    it('should delete task when dialog returns delete action', () => {
      const dialogResult: TaskDialogResult = {
        action: 'delete',
        taskId: 'task-1',
      };

      const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<any, TaskDialogResult>>(
        'MatDialogRef',
        ['afterClosed'],
      );
      dialogRefSpy.afterClosed.and.returnValue(of(dialogResult));
      dialog.open.and.returnValue(dialogRefSpy);

      component.onTaskClick(mockTask);

      expect(tasksService.deleteTask).toHaveBeenCalledWith('task-1');
    });

    it('should not perform any action when dialog is cancelled', () => {
      const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<any, TaskDialogResult>>(
        'MatDialogRef',
        ['afterClosed'],
      );
      dialogRefSpy.afterClosed.and.returnValue(of(undefined));
      dialog.open.and.returnValue(dialogRefSpy);

      component.onCreateTask();

      expect(tasksService.createTask).not.toHaveBeenCalled();
      expect(tasksService.updateTask).not.toHaveBeenCalled();
      expect(tasksService.deleteTask).not.toHaveBeenCalled();
    });

    it('should open dialog with correct width and maxWidth', () => {
      const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<any, TaskDialogResult>>(
        'MatDialogRef',
        ['afterClosed'],
      );
      dialogRefSpy.afterClosed.and.returnValue(of(undefined));
      dialog.open.and.returnValue(dialogRefSpy);

      component.onCreateTask();

      const callArgs = dialog.open.calls.mostRecent().args;
      expect((callArgs[1] as any).width).toBe('100%');
      expect((callArgs[1] as any).maxWidth).toBe('550px');
      expect((callArgs[1] as any).disableClose).toBe(false);
    });
  });
});
