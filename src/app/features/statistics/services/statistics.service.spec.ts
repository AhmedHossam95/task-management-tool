import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { StatisticsService } from './statistics.service';
import { TasksService } from '../../home/services/tasks.service';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let tasksServiceMock: Partial<TasksService>;
  let tasksSignal: WritableSignal<Record<string, unknown>[]>;
  let todoCountSignal: WritableSignal<number>;
  let doneCountSignal: WritableSignal<number>;
  let inProgressCountSignal: WritableSignal<number>;
  let overdueCountSignal: WritableSignal<number>;
  let isLoadingSignal: WritableSignal<boolean>;

  beforeEach(() => {
    // Create mock signals
    tasksSignal = signal<Record<string, unknown>[]>([]);
    todoCountSignal = signal(0);
    doneCountSignal = signal(0);
    inProgressCountSignal = signal(0);
    overdueCountSignal = signal(0);
    isLoadingSignal = signal(false);

    // Create TasksService mock
    tasksServiceMock = {
      tasks: () => tasksSignal(),
      todoCount: () => todoCountSignal(),
      doneCount: () => doneCountSignal(),
      inProgressCount: () => inProgressCountSignal(),
      overdueCount: () => overdueCountSignal(),
      tasksResource: {
        isLoading: () => isLoadingSignal(),
      },
    } as unknown as Partial<TasksService>;

    TestBed.configureTestingModule({
      providers: [
        StatisticsService,
        {
          provide: TasksService,
          useValue: tasksServiceMock,
        },
      ],
    });

    service = TestBed.inject(StatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have statistics signal defined', () => {
    expect(service.statistics).toBeDefined();
    expect(typeof service.statistics).toBe('function');
  });

  it('should have isLoading signal defined', () => {
    expect(service.isLoading).toBeDefined();
    expect(typeof service.isLoading).toBe('function');
  });

  it('should return statistics array with all 4 stat cards', () => {
    const stats = service.statistics();
    expect(Array.isArray(stats)).toBeTrue();
    expect(stats.length).toBe(4);
  });

  it('should return correct stat card ids', () => {
    const stats = service.statistics();
    const ids = stats.map((s) => s.id);
    expect(ids).toEqual(['stat-001', 'stat-002', 'stat-003', 'stat-004']);
  });

  it('should return correct stat card titles', () => {
    const stats = service.statistics();
    const titles = stats.map((s) => s.title);
    expect(titles).toEqual(['Total Tasks', 'Completed', 'In Progress', 'Overdue']);
  });

  it('should return correct stat card icons', () => {
    const stats = service.statistics();
    const icons = stats.map((s) => s.icon);
    expect(icons).toEqual(['📊', '✅', '🔄', '⚠️']);
  });

  it('should compute Total Tasks value from tasks length', () => {
    tasksSignal.set([{}, {}, {}]);
    const stats = service.statistics();
    expect(stats[0].value).toBe(3);
  });

  it('should compute Completed value from doneCount', () => {
    doneCountSignal.set(5);
    const stats = service.statistics();
    expect(stats[1].value).toBe(5);
  });

  it('should compute In Progress value from inProgressCount', () => {
    inProgressCountSignal.set(8);
    const stats = service.statistics();
    expect(stats[2].value).toBe(8);
  });

  it('should compute Overdue value from overdueCount', () => {
    overdueCountSignal.set(3);
    const stats = service.statistics();
    expect(stats[3].value).toBe(3);
  });

  it('should update statistics when task counts change', () => {
    const initialStats = service.statistics();
    expect(initialStats[0].value).toBe(0);

    tasksSignal.set([{}, {}, {}, {}]);
    const updatedStats = service.statistics();
    expect(updatedStats[0].value).toBe(4);
  });

  it('should have all changeLabels set to "current"', () => {
    const stats = service.statistics();
    stats.forEach((stat) => {
      expect(stat.changeLabel).toBe('current');
    });
  });

  it('should have all changes as empty string', () => {
    const stats = service.statistics();
    stats.forEach((stat) => {
      expect(stat.change).toBe('');
    });
  });

  it('should have all changeTypes as neutral', () => {
    const stats = service.statistics();
    stats.forEach((stat) => {
      expect(stat.changeType).toBe('neutral');
    });
  });

  it('should expose correct loading state', () => {
    isLoadingSignal.set(false);
    expect(service.isLoading()).toBe(false);

    isLoadingSignal.set(true);
    expect(service.isLoading()).toBeTrue();
  });

  it('should have correct colors for each stat card', () => {
    const stats = service.statistics();
    expect(stats[0].color).toBe('#1976D2'); // Total Tasks
    expect(stats[1].color).toBe('#388E3C'); // Completed
    expect(stats[2].color).toBe('#FF6F00'); // In Progress
    expect(stats[3].color).toBe('#D32F2F'); // Overdue
  });
});
