import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TasksService } from './tasks.service';
import { TasksFilterService } from './tasks-filter.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Task, TaskStatus } from '../models/tasks.model';
import { TASK_STATUS } from '../constants/tasks.constants';
import { API_URL } from '../../../shared/constants/api.constants';

describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  const mockAssignee = { id: 'user-1', name: 'User', avatar: '', email: 'user@test.com' };
  const baseTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Todo 1',
      description: 'First todo',
      status: TASK_STATUS.TODO,
      priority: 'medium',
      dueDate: '2024-12-31',
      assignee: mockAssignee,
      order: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tags: [],
    },
    {
      id: 'task-2',
      title: 'Todo 2',
      description: 'Second todo',
      status: TASK_STATUS.TODO,
      priority: 'high',
      dueDate: '2024-11-30',
      assignee: mockAssignee,
      order: 1,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      tags: [],
    },
    {
      id: 'task-5',
      title: 'Todo 3',
      description: 'Third todo',
      status: TASK_STATUS.TODO,
      priority: 'medium',
      dueDate: '2024-08-15',
      assignee: mockAssignee,
      order: 2,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z',
      tags: [],
    },
    {
      id: 'task-3',
      title: 'Done 1',
      description: 'Completed task',
      status: TASK_STATUS.DONE,
      priority: 'low',
      dueDate: '2024-10-31',
      assignee: mockAssignee,
      order: 0,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      tags: [],
    },
    {
      id: 'task-4',
      title: 'In Progress 1',
      description: 'Working task',
      status: TASK_STATUS.IN_PROGRESS,
      priority: 'medium',
      dueDate: '2024-09-30',
      assignee: mockAssignee,
      order: 0,
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z',
      tags: [],
    },
  ];

  const cloneTasks = (): Task[] => baseTasks.map((task) => ({ ...task }));
  const setTasksSignal = (tasks: Task[]): void => {
    (service as any)._tasks.set(tasks);
  };

  beforeEach(() => {
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        TasksService,
        TasksFilterService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
      ],
    });

    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signals', () => {
    it('should have tasks signal', () => {
      expect(service.tasks).toBeDefined();
      expect(typeof service.tasks).toBe('function');
    });

    it('should have filteredTasks signal', () => {
      expect(service.filteredTasks).toBeDefined();
      expect(typeof service.filteredTasks).toBe('function');
    });

    it('should have filteredTodoTasks signal', () => {
      expect(service.filteredTodoTasks).toBeDefined();
      expect(typeof service.filteredTodoTasks).toBe('function');
    });

    it('should have filteredInProgressTasks signal', () => {
      expect(service.filteredInProgressTasks).toBeDefined();
      expect(typeof service.filteredInProgressTasks).toBe('function');
    });

    it('should have filteredDoneTasks signal', () => {
      expect(service.filteredDoneTasks).toBeDefined();
      expect(typeof service.filteredDoneTasks).toBe('function');
    });
  });

  describe('count signals', () => {
    it('should have todoCount signal', () => {
      expect(service.todoCount).toBeDefined();
      expect(typeof service.todoCount).toBe('function');
    });

    it('should have inProgressCount signal', () => {
      expect(service.inProgressCount).toBeDefined();
      expect(typeof service.inProgressCount).toBe('function');
    });

    it('should have doneCount signal', () => {
      expect(service.doneCount).toBeDefined();
      expect(typeof service.doneCount).toBe('function');
    });

    it('should have highPriorityCount signal', () => {
      expect(service.highPriorityCount).toBeDefined();
      expect(typeof service.highPriorityCount).toBe('function');
    });

    it('should have mediumPriorityCount signal', () => {
      expect(service.mediumPriorityCount).toBeDefined();
      expect(typeof service.mediumPriorityCount).toBe('function');
    });

    it('should have lowPriorityCount signal', () => {
      expect(service.lowPriorityCount).toBeDefined();
      expect(typeof service.lowPriorityCount).toBe('function');
    });
  });

  describe('filtered count signals', () => {
    it('should have filteredTodoCount signal', () => {
      expect(service.filteredTodoCount).toBeDefined();
      expect(typeof service.filteredTodoCount).toBe('function');
    });

    it('should have filteredInProgressCount signal', () => {
      expect(service.filteredInProgressCount).toBeDefined();
      expect(typeof service.filteredInProgressCount).toBe('function');
    });

    it('should have filteredDoneCount signal', () => {
      expect(service.filteredDoneCount).toBeDefined();
      expect(typeof service.filteredDoneCount).toBe('function');
    });
  });

  describe('CRUD methods', () => {
    it('should have createTask method', () => {
      expect(service.createTask).toBeDefined();
      expect(typeof service.createTask).toBe('function');
    });

    it('should have updateTask method', () => {
      expect(service.updateTask).toBeDefined();
      expect(typeof service.updateTask).toBe('function');
    });

    it('should have deleteTask method', () => {
      expect(service.deleteTask).toBeDefined();
      expect(typeof service.deleteTask).toBe('function');
    });
  });

  describe('CRUD behavior', () => {
    it('should create a task, append to signal, and call POST', () => {
      const tasks = cloneTasks();
      setTasksSignal(tasks);

      const beforeCount = service.tasks().length;
      service.createTask({
        title: 'New Task',
        description: 'From test',
        priority: 'low',
        dueDate: '2025-02-02',
        assignee: mockAssignee,
        status: 'todo',
        tags: ['new'],
      });

      expect(service.tasks().length).toBe(beforeCount + 1);

      const postReq = httpMock.expectOne(API_URL.TASKS);
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body.title).toBe('New Task');
      expect(postReq.request.body.order).toBe(3);
      postReq.flush(postReq.request.body);

      expect(toastServiceSpy.success).toHaveBeenCalledWith('Task created successfully.');
      expect(toastServiceSpy.error).not.toHaveBeenCalled();
    });

    it('should update a task and call PATCH with formatted payload', () => {
      const tasks = cloneTasks();
      setTasksSignal(tasks);

      service.updateTask('task-1', { title: 'Updated Title', dueDate: '2025-03-03' });

      const updated = service.tasks().find((t) => t.id === 'task-1')!;
      expect(updated.title).toBe('Updated Title');

      const patchReq = httpMock.expectOne(`${API_URL.TASKS}/task-1`);
      expect(patchReq.request.method).toBe('PATCH');
      expect(patchReq.request.body.title).toBe('Updated Title');
      expect(patchReq.request.body.dueDate).toBe('2025-03-03');
      patchReq.flush(patchReq.request.body);

      expect(toastServiceSpy.success).toHaveBeenCalledWith('Task updated successfully.');
    });

    it('should delete a task and call DELETE', () => {
      const tasks = cloneTasks();
      setTasksSignal(tasks);

      service.deleteTask('task-3');

      expect(service.tasks().some((t) => t.id === 'task-3')).toBeFalse();

      const deleteReq = httpMock.expectOne(`${API_URL.TASKS}/task-3`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      expect(toastServiceSpy.success).toHaveBeenCalledWith('Task deleted successfully.');
    });
  });

  describe('reorder methods', () => {
    it('should have reorderTasksOptimistic method', () => {
      expect(service.reorderTasksOptimistic).toBeDefined();
      expect(typeof service.reorderTasksOptimistic).toBe('function');
    });

    it('should have moveTaskToColumn method', () => {
      expect(service.moveTaskToColumn).toBeDefined();
      expect(typeof service.moveTaskToColumn).toBe('function');
    });

    it('should have moveTaskToColumnEnd method', () => {
      expect(service.moveTaskToColumnEnd).toBeDefined();
      expect(typeof service.moveTaskToColumnEnd).toBe('function');
    });
  });

  describe('reorder helpers behavior', () => {
    it('should reorder tasks optimistically and persist PATCH requests', () => {
      const tasks = cloneTasks();
      setTasksSignal(tasks);

      service.reorderTasksOptimistic(TASK_STATUS.TODO, 0, 2);

      const reordered = service.tasks().filter((t) => t.status === TASK_STATUS.TODO);
      expect(reordered.find((t) => t.id === 'task-1')?.order).toBe(2);
      const patchRequests = httpMock.match((req) => req.method === 'PATCH');
      expect(patchRequests.length).toBe(3);
      const orderValues = patchRequests.map((req) => req.request.body.order);
      expect(orderValues).toContain(0);
      expect(orderValues).toContain(1);
      expect(orderValues).toContain(2);
      patchRequests.forEach((req) => req.flush({}));
    });

    it('should move a task to another column and send updates for affected tasks', () => {
      const tasks = cloneTasks();
      setTasksSignal(tasks);

      const todoTask = service.tasks().find((t) => t.id === 'task-2')!;
      service.moveTaskToColumn(todoTask, TASK_STATUS.DONE, 1);

      const moved = service.tasks().find((t) => t.id === 'task-2')!;
      expect(moved.status).toBe(TASK_STATUS.DONE);
      expect(moved.order).toBe(1);
      expect(moved.description).toBe('Second todo');

      const patchRequests = httpMock.match((req) => req.method === 'PATCH');
      expect(patchRequests.length).toBeGreaterThanOrEqual(1);
      expect(patchRequests.some((req) => req.request.body.status === TASK_STATUS.DONE)).toBeTrue();
      patchRequests.forEach((req) => req.flush({}));
    });

    it('should append task to column end when using moveTaskToColumnEnd', () => {
      const tasks = cloneTasks();
      setTasksSignal(tasks);

      const todoTask = service.tasks().find((t) => t.id === 'task-1')!;
      service.moveTaskToColumnEnd(todoTask, TASK_STATUS.DONE);

      const moved = service.tasks().find((t) => t.id === 'task-1')!;
      expect(moved.status).toBe(TASK_STATUS.DONE);
      expect(moved.order).toBeGreaterThanOrEqual(1);

      const patchRequests = httpMock.match((req) => req.method === 'PATCH');
      expect(patchRequests.length).toBeGreaterThanOrEqual(1);
      expect(patchRequests[0].request.body.order).toBeGreaterThanOrEqual(1);
      patchRequests.forEach((req) => req.flush({}));
    });
  });

  describe('tasksResource', () => {
    it('should have tasksResource', () => {
      expect(service.tasksResource).toBeDefined();
    });

    it('should have isLoading on tasksResource', () => {
      expect(service.tasksResource.isLoading).toBeDefined();
    });

    it('should have error on tasksResource', () => {
      expect(service.tasksResource.error).toBeDefined();
    });

    it('should have reload on tasksResource', () => {
      expect(service.tasksResource.reload).toBeDefined();
    });
  });

  describe('initial state', () => {
    it('should return empty array for tasks initially', () => {
      expect(service.tasks()).toEqual([]);
    });

    it('should return empty array for filteredTasks initially', () => {
      expect(service.filteredTasks()).toEqual([]);
    });

    it('should return 0 for all counts initially', () => {
      expect(service.todoCount()).toBe(0);
      expect(service.inProgressCount()).toBe(0);
      expect(service.doneCount()).toBe(0);
    });

    it('should return 0 for priority counts initially', () => {
      expect(service.highPriorityCount()).toBe(0);
      expect(service.mediumPriorityCount()).toBe(0);
      expect(service.lowPriorityCount()).toBe(0);
    });
  });
});
