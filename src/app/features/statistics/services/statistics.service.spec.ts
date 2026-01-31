import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StatisticsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(StatisticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
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
});
