import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksFilterService } from './tasks-filter.service';
import { DEFAULT_FILTERS } from '../models/task-filters.model';

describe('TasksFilterService', () => {
  let service: TasksFilterService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        TasksFilterService,
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: {} },
          },
        },
      ],
    });

    service = TestBed.inject(TasksFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have default status filter', () => {
      expect(service.statusFilter()).toBe(DEFAULT_FILTERS.status);
    });

    it('should have default priority filter', () => {
      expect(service.priorityFilter()).toBe(DEFAULT_FILTERS.priority);
    });

    it('should have default assignee filter', () => {
      expect(service.assigneeFilter()).toBe(DEFAULT_FILTERS.assignee);
    });

    it('should have empty search query', () => {
      expect(service.searchQuery()).toBe('');
    });

    it('should have default sort config', () => {
      expect(service.sortConfig()).toEqual(DEFAULT_FILTERS.sort);
    });
  });

  describe('setStatus', () => {
    it('should update status signal', () => {
      service.setStatus('todo');
      expect(service.statusFilter()).toBe('todo');
    });

    it('should sync to URL', () => {
      service.setStatus('in_progress');
      expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should set different status values', () => {
      service.setStatus('done');
      expect(service.statusFilter()).toBe('done');

      service.setStatus('all');
      expect(service.statusFilter()).toBe('all');

      service.setStatus('in_progress');
      expect(service.statusFilter()).toBe('in_progress');
    });
  });

  describe('setPriority', () => {
    it('should update priority signal', () => {
      service.setPriority('high');
      expect(service.priorityFilter()).toBe('high');
    });

    it('should sync to URL', () => {
      service.setPriority('low');
      expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should set different priority values', () => {
      service.setPriority('medium');
      expect(service.priorityFilter()).toBe('medium');

      service.setPriority('all');
      expect(service.priorityFilter()).toBe('all');
    });
  });

  describe('setAssignee', () => {
    it('should update assignee signal', () => {
      service.setAssignee('user123');
      expect(service.assigneeFilter()).toBe('user123');
    });

    it('should sync to URL', () => {
      service.setAssignee('user456');
      expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should set all as assignee filter', () => {
      service.setAssignee('user1');
      service.setAssignee('all');
      expect(service.assigneeFilter()).toBe('all');
    });
  });

  describe('setSearch', () => {
    it('should update search query signal', () => {
      service.setSearch('test query');
      expect(service.searchQuery()).toBe('test query');
    });

    it('should sync to URL', () => {
      service.setSearch('search term');
      expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should handle empty search', () => {
      service.setSearch('something');
      service.setSearch('');
      expect(service.searchQuery()).toBe('');
    });
  });

  describe('setSort', () => {
    it('should update sort config signal', () => {
      service.setSort('priority', 'desc');
      expect(service.sortConfig()).toEqual({ field: 'priority', order: 'desc' });
    });

    it('should sync to URL', () => {
      service.setSort('createdAt', 'asc');
      expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should set different sort configurations', () => {
      service.setSort('order', 'asc');
      expect(service.sortConfig()).toEqual({ field: 'order', order: 'asc' });

      service.setSort('createdAt', 'desc');
      expect(service.sortConfig()).toEqual({ field: 'createdAt', order: 'desc' });
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to defaults', () => {
      // Set non-default values
      service.setPriority('high');
      service.setAssignee('user1');
      service.setSearch('query');
      service.setSort('priority', 'desc');

      // Reset
      service.resetFilters();

      expect(service.statusFilter()).toBe(DEFAULT_FILTERS.status);
      expect(service.priorityFilter()).toBe(DEFAULT_FILTERS.priority);
      expect(service.assigneeFilter()).toBe(DEFAULT_FILTERS.assignee);
      expect(service.searchQuery()).toBe('');
      expect(service.sortConfig()).toEqual(DEFAULT_FILTERS.sort);
    });

    it('should sync to URL after reset', () => {
      service.resetFilters();
      expect(routerSpy.navigate).toHaveBeenCalled();
    });
  });

  describe('hasActiveFiltersOrSort', () => {
    it('should return false when all defaults', () => {
      expect(service.hasActiveFiltersOrSort()).toBeFalse();
    });

    it('should return true when priority filter is active', () => {
      service.setPriority('high');
      expect(service.hasActiveFiltersOrSort()).toBeTrue();
    });

    it('should return true when assignee filter is active', () => {
      service.setAssignee('user1');
      expect(service.hasActiveFiltersOrSort()).toBeTrue();
    });

    it('should return true when search query is set', () => {
      service.setSearch('test');
      expect(service.hasActiveFiltersOrSort()).toBeTrue();
    });

    it('should return true when sort is changed', () => {
      service.setSort('priority', 'desc');
      expect(service.hasActiveFiltersOrSort()).toBeTrue();
    });

    it('should return false for whitespace-only search', () => {
      service.setSearch('   ');
      expect(service.hasActiveFiltersOrSort()).toBeFalse();
    });

    it('should return true when multiple filters are active', () => {
      service.setPriority('high');
      service.setSearch('test');
      expect(service.hasActiveFiltersOrSort()).toBeTrue();
    });
  });

  describe('initFromUrl', () => {
    it('should read status from query params', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TasksFilterService,
          { provide: Router, useValue: routerSpy },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { queryParams: { status: 'todo' } },
            },
          },
        ],
      });

      const serviceWithParams = TestBed.inject(TasksFilterService);
      expect(serviceWithParams.statusFilter()).toBe('todo');
    });

    it('should read priority from query params', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TasksFilterService,
          { provide: Router, useValue: routerSpy },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { queryParams: { priority: 'high' } },
            },
          },
        ],
      });

      const serviceWithParams = TestBed.inject(TasksFilterService);
      expect(serviceWithParams.priorityFilter()).toBe('high');
    });

    it('should read search from query params', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TasksFilterService,
          { provide: Router, useValue: routerSpy },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { queryParams: { search: 'test query' } },
            },
          },
        ],
      });

      const serviceWithParams = TestBed.inject(TasksFilterService);
      expect(serviceWithParams.searchQuery()).toBe('test query');
    });

    it('should read assignee from query params', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TasksFilterService,
          { provide: Router, useValue: routerSpy },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { queryParams: { assignee: 'user123' } },
            },
          },
        ],
      });

      const serviceWithParams = TestBed.inject(TasksFilterService);
      expect(serviceWithParams.assigneeFilter()).toBe('user123');
    });

    it('should read sort from query params', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TasksFilterService,
          { provide: Router, useValue: routerSpy },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { queryParams: { sort: 'priority', order: 'desc' } },
            },
          },
        ],
      });

      const serviceWithParams = TestBed.inject(TasksFilterService);
      expect(serviceWithParams.sortConfig()).toEqual({ field: 'priority', order: 'desc' });
    });
  });
});
