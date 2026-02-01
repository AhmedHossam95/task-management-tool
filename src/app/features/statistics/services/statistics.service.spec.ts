import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { signal, WritableSignal } from '@angular/core';
import { StatisticsService } from './statistics.service';
import { Statistic } from '../models/statistics.model';

const buildStatistic = (overrides: Partial<Statistic>): Statistic => ({
  id: 'stat',
  title: 'Statistic',
  icon: 'icon',
  value: 0,
  change: '0',
  changeLabel: 'change',
  changeType: 'neutral',
  color: '#000',
  ...overrides,
});

describe('StatisticsService', () => {
  let service: StatisticsService;
  let statsSignal: WritableSignal<Statistic[]>;
  let reloadUpdate: () => void;
  let statisticsResourceStub: {
    value: () => Statistic[];
    reload: () => void;
    isLoading: () => boolean;
    error: () => null;
  };

  const setStats = (payload: Statistic[]): void => statsSignal.set(payload);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StatisticsService, provideHttpClient()],
    });

    service = TestBed.inject(StatisticsService);
    statsSignal = signal<Statistic[]>([]);
    reloadUpdate = (): void => {};
    statisticsResourceStub = {
      value: (): Statistic[] => statsSignal(),
      reload: (): void => reloadUpdate(),
      isLoading: (): boolean => false,
      error: (): null => null,
    };

    Object.defineProperty(service, 'statisticsResource', {
      value: statisticsResourceStub,
      configurable: true,
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have statistics signal defined', () => {
    expect(service.statistics).toBeDefined();
    expect(typeof service.statistics).toBe('function');
  });

  it('should return empty array when no data loaded', () => {
    expect(service.statistics()).toEqual([]);
  });

  it('should have statistics as a computed signal', () => {
    // Computed signals are functions that can be called
    const stats = service.statistics();
    expect(Array.isArray(stats)).toBeTrue();
  });

  it('should update statistics signal after HTTP response', () => {
    const payload: Statistic[] = [buildStatistic({ id: 'stat-1', title: 'Tasks', value: 5 })];
    setStats(payload);

    expect(service.statistics()).toEqual(payload);
  });

  it('should refresh statistics when the resource reloads', () => {
    const initialPayload: Statistic[] = [
      buildStatistic({ id: 'stat-1', title: 'Tasks', value: 5 }),
    ];
    setStats(initialPayload);
    expect(service.statistics()).toEqual(initialPayload);

    const updatedPayload: Statistic[] = [
      buildStatistic({ id: 'stat-2', title: 'Completed', value: 10 }),
    ];
    reloadUpdate = (): void => setStats(updatedPayload);
    statisticsResourceStub.reload();

    expect(service.statistics()).toEqual(updatedPayload);
  });
});
