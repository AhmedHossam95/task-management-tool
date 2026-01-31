import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TasksService } from './tasks.service';
import { TasksFilterService } from './tasks-filter.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';

describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

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
