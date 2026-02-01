import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { CachingInterceptor } from './caching.interceptor';
import { CacheService } from '../services/cache.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SKIP_LOADING } from '../constants/http.constants';

describe('CachingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let cacheService: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CacheService, provideHttpClient(withInterceptors([CachingInterceptor]))],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    cacheService = TestBed.inject(CacheService);

    // Clear cache before each test
    cacheService.clear();
    cacheService.clearPendingUpdates();
  });

  afterEach(() => {
    httpTestingController.verify();
    cacheService.clear();
    cacheService.clearPendingUpdates();
  });

  describe('stale-while-revalidate behavior', () => {
    it('should return cached data immediately and fetch fresh data in background', fakeAsync(() => {
      const testUrl = '/api/tasks';
      const cachedData = [{ id: 1, title: 'Cached Task' }];
      const freshData = [{ id: 1, title: 'Fresh Task' }];

      // Pre-populate cache
      cacheService.set(testUrl, cachedData);

      let firstResponse: any;
      httpClient.get(testUrl).subscribe((response) => {
        firstResponse = response;
      });

      // Immediate response should be from cache
      expect(firstResponse).toEqual(cachedData);

      // Background request should be made
      const req = httpTestingController.expectOne(testUrl);
      req.flush(freshData);

      tick(); // Allow promises to resolve

      // New data should be in pending updates
      expect(cacheService.pendingUpdates().get(testUrl)).toEqual(freshData);
      expect(cacheService.hasNewData()).toBe(true);
    }));

    it('should wait for network response if no cache exists', fakeAsync(() => {
      const testUrl = '/api/tasks';
      const testData = [{ id: 1, title: 'Task' }];

      let response: any;
      httpClient.get(testUrl).subscribe((res) => {
        response = res;
      });

      // No immediate response - waiting for network
      expect(response).toBeUndefined();

      const req = httpTestingController.expectOne(testUrl);
      req.flush(testData);

      tick();

      // Should have received network response
      expect(response).toEqual(testData);

      // Should be cached
      expect(cacheService.get(testUrl)).toEqual(testData);
    }));

    it('should not update cache if fresh data is identical to cached data', fakeAsync(() => {
      const testUrl = '/api/tasks';
      const data = [{ id: 1, title: 'Task' }];

      cacheService.set(testUrl, data);
      cacheService.clearPendingUpdates();

      httpClient.get(testUrl).subscribe();

      const req = httpTestingController.expectOne(testUrl);
      req.flush(data);

      tick();

      // No pending updates should be created for identical data
      expect(cacheService.pendingUpdates().size).toBe(0);
      expect(cacheService.hasNewData()).toBe(false);
    }));

    it('should store fresh data as pending if it differs from cache', fakeAsync(() => {
      const testUrl = '/api/tasks';
      const cachedData = [{ id: 1, title: 'Old' }];
      const freshData = [{ id: 1, title: 'New' }];

      cacheService.set(testUrl, cachedData);

      httpClient.get(testUrl).subscribe();

      const req = httpTestingController.expectOne(testUrl);
      req.flush(freshData);

      tick();

      // Different data should be in pending
      expect(cacheService.pendingUpdates().get(testUrl)).toEqual(freshData);
      expect(cacheService.hasNewData()).toBe(true);
    }));

    it('should silently handle background request errors', fakeAsync(() => {
      const testUrl = '/api/tasks';
      const cachedData = [{ id: 1, title: 'Cached' }];

      cacheService.set(testUrl, cachedData);

      let response: any;
      httpClient.get(testUrl).subscribe((res) => {
        response = res;
      });

      // Immediate cached response
      expect(response).toEqual(cachedData);

      // Background request fails
      const req = httpTestingController.expectOne(testUrl);
      req.error(new ErrorEvent('Network error'));

      tick();

      // Should still have cached response, no error thrown
      expect(response).toEqual(cachedData);
    }));
  });

  describe('GET requests without cache', () => {
    it('should cache successful GET responses', () => {
      const testUrl = '/api/tasks';
      const testData = [{ id: 1, title: 'Task 1' }];

      spyOn(cacheService, 'set').and.callThrough();

      httpClient.get(testUrl).subscribe((response) => {
        expect(response).toEqual(testData);
      });

      const req = httpTestingController.expectOne(testUrl);
      expect(req.request.method).toBe('GET');
      req.flush(testData);

      expect(cacheService.set).toHaveBeenCalledWith(testUrl, testData);
    });

    it('should handle network errors without cache', () => {
      const testUrl = '/api/tasks';

      let errorOccurred = false;
      httpClient.get(testUrl).subscribe(
        () => fail('Should have errored'),
        () => {
          errorOccurred = true;
        },
      );

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ErrorEvent('Network error'));

      expect(errorOccurred).toBe(true);
    });
  });

  describe('non-GET requests', () => {
    it('should not cache non-GET requests', () => {
      const testUrl = '/api/tasks';
      const testData = { id: 1, title: 'New Task' };

      spyOn(cacheService, 'set').and.callThrough();

      httpClient.post(testUrl, testData).subscribe();

      const req = httpTestingController.expectOne(testUrl);
      expect(req.request.method).toBe('POST');
      req.flush({});

      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('should pass through PUT requests', () => {
      const testUrl = '/api/tasks/1';
      const updateData = { title: 'Updated' };

      spyOn(cacheService, 'set').and.callThrough();

      httpClient.put(testUrl, updateData).subscribe();

      const req = httpTestingController.expectOne(testUrl);
      expect(req.request.method).toBe('PUT');
      req.flush({});

      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('should pass through DELETE requests', () => {
      const testUrl = '/api/tasks/1';

      spyOn(cacheService, 'set').and.callThrough();

      httpClient.delete(testUrl).subscribe();

      const req = httpTestingController.expectOne(testUrl);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });

  describe('multiple URLs', () => {
    it('should cache different URLs separately', fakeAsync(() => {
      const tasksUrl = '/api/tasks';
      const usersUrl = '/api/users';
      const tasksData = [{ id: 1, title: 'Task' }];
      const usersData = [{ id: 1, name: 'User' }];

      cacheService.set(tasksUrl, tasksData);
      cacheService.set(usersUrl, usersData);

      // Request tasks
      let tasksResponse: any;
      httpClient.get(tasksUrl).subscribe((res) => {
        tasksResponse = res;
      });

      // Request users
      let usersResponse: any;
      httpClient.get(usersUrl).subscribe((res) => {
        usersResponse = res;
      });

      // Both should get cached responses
      expect(tasksResponse).toEqual(tasksData);
      expect(usersResponse).toEqual(usersData);

      // Simulate background requests with different fresh data
      const tasksReq = httpTestingController.expectOne(tasksUrl);
      const usersReq = httpTestingController.expectOne(usersUrl);

      tasksReq.flush([{ id: 1, title: 'Updated Task' }]);
      usersReq.flush([{ id: 1, name: 'Updated User' }]);

      tick();

      // Both should have pending updates
      expect(cacheService.pendingUpdates().size).toBe(2);
      expect(cacheService.hasNewData()).toBe(true);
    }));
  });

  describe('query parameters', () => {
    it('should treat different query parameters as different cache keys', fakeAsync(() => {
      const urlWithParam1 = '/api/tasks?status=todo';
      const urlWithParam2 = '/api/tasks?status=done';
      const data1 = [{ id: 1, status: 'todo' }];
      const data2 = [{ id: 2, status: 'done' }];

      cacheService.set(urlWithParam1, data1);
      cacheService.set(urlWithParam2, data2);

      let response1: any;
      httpClient.get(urlWithParam1).subscribe((res) => {
        response1 = res;
      });

      let response2: any;
      httpClient.get(urlWithParam2).subscribe((res) => {
        response2 = res;
      });

      expect(response1).toEqual(data1);
      expect(response2).toEqual(data2);

      // Verify separate requests were made
      const req1 = httpTestingController.expectOne(urlWithParam1);
      const req2 = httpTestingController.expectOne(urlWithParam2);

      req1.flush(data1);
      req2.flush(data2);

      tick();
    }));
  });

  describe('error handling', () => {
    it('should use pending data if available on network error', fakeAsync(() => {
      const testUrl = '/api/tasks';
      const pendingData = [{ id: 1, title: 'Pending' }];

      cacheService.setPending(testUrl, pendingData);

      let response: any;
      httpClient.get(testUrl).subscribe((res) => {
        response = res;
      });

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ErrorEvent('Network error'));

      tick();

      // Should return pending data
      expect(response).toEqual(pendingData);
    }));

    it('should fail if no cache or pending data available on error', () => {
      const testUrl = '/api/tasks';

      let errorOccurred = false;
      httpClient.get(testUrl).subscribe(
        () => fail('Should have errored'),
        () => {
          errorOccurred = true;
        },
      );

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ErrorEvent('Network error'));

      expect(errorOccurred).toBe(true);
    });
  });

  describe('SKIP_LOADING context for background requests', () => {
    it('should set SKIP_LOADING context on background requests with cached data', fakeAsync(() => {
      const testUrl = '/api/tasks';
      const cachedData = [{ id: 1, title: 'Cached' }];
      const freshData = [{ id: 1, title: 'Fresh' }];

      cacheService.set(testUrl, cachedData);

      let firstResponse: any;
      httpClient.get(testUrl).subscribe((response) => {
        firstResponse = response;
      });

      // Immediate cached response
      expect(firstResponse).toEqual(cachedData);

      // Background request should have SKIP_LOADING context
      const req = httpTestingController.expectOne(testUrl);

      // Verify SKIP_LOADING is set on the background request
      expect(req.request.context.get(SKIP_LOADING)).toBe(true);

      req.flush(freshData);
      tick();
    }));

    it('should not set SKIP_LOADING for initial requests without cache', () => {
      const testUrl = '/api/tasks';
      const testData = [{ id: 1 }];

      httpClient.get(testUrl).subscribe();

      const req = httpTestingController.expectOne(testUrl);

      // Initial request without cache should NOT have SKIP_LOADING
      expect(req.request.context.get(SKIP_LOADING)).toBe(false);

      req.flush(testData);
    });
  });
});
