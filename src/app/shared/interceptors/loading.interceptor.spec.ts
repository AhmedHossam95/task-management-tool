import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { LoadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SKIP_LOADING } from '../constants/http.constants';

describe('LoadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LoadingService, provideHttpClient(withInterceptors([LoadingInterceptor]))],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('loading state management', () => {
    it('should start and finish request tracking for normal requests', () => {
      const testUrl = '/api/tasks';
      const testData = [{ id: 1 }];

      expect(loadingService.isLoading()).toBe(false);

      httpClient.get(testUrl).subscribe();

      expect(loadingService.isLoading()).toBe(true);

      const req = httpTestingController.expectOne(testUrl);
      req.flush(testData);

      expect(loadingService.isLoading()).toBe(false);
    });

    it('should track multiple concurrent requests', () => {
      const url1 = '/api/tasks';
      const url2 = '/api/users';

      httpClient.get(url1).subscribe();
      expect(loadingService.isLoading()).toBe(true);

      httpClient.get(url2).subscribe();
      expect(loadingService.isLoading()).toBe(true);

      const req1 = httpTestingController.expectOne(url1);
      req1.flush([]);
      expect(loadingService.isLoading()).toBe(true);

      const req2 = httpTestingController.expectOne(url2);
      req2.flush([]);
      expect(loadingService.isLoading()).toBe(false);
    });

    it('should show loading state on error', () => {
      const testUrl = '/api/tasks';

      httpClient.get(testUrl).subscribe(
        () => fail('Should error'),
        () => {
          // Expect loading to be false after error
        },
      );

      expect(loadingService.isLoading()).toBe(true);

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ErrorEvent('Network error'));

      expect(loadingService.isLoading()).toBe(false);
    });
  });

  describe('SKIP_LOADING context handling', () => {
    it('should skip loading state when SKIP_LOADING context is set', () => {
      const testUrl = '/api/tasks';
      const testData = [{ id: 1 }];

      expect(loadingService.isLoading()).toBe(false);

      // Create request with SKIP_LOADING context
      httpClient
        .get(testUrl, {
          context: new Map().set(SKIP_LOADING, true) as any,
        })
        .subscribe();

      // Loading state should not change
      expect(loadingService.isLoading()).toBe(false);

      const req = httpTestingController.expectOne(testUrl);
      req.flush(testData);

      // Still should not show loading
      expect(loadingService.isLoading()).toBe(false);
    });

    it('should show loading for normal requests without SKIP_LOADING', () => {
      const testUrl = '/api/tasks';

      httpClient.get(testUrl).subscribe();

      // Should show loading when SKIP_LOADING is not set
      expect(loadingService.isLoading()).toBe(true);

      const req = httpTestingController.expectOne(testUrl);
      req.flush([]);

      expect(loadingService.isLoading()).toBe(false);
    });

    it('should not trigger loading for POST requests with SKIP_LOADING', () => {
      const testUrl = '/api/tasks';
      const postData = { title: 'New' };

      httpClient
        .post(testUrl, postData, {
          context: new Map().set(SKIP_LOADING, true) as any,
        })
        .subscribe();

      expect(loadingService.isLoading()).toBe(false);

      const req = httpTestingController.expectOne(testUrl);
      req.flush({});

      expect(loadingService.isLoading()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should finish request on error without SKIP_LOADING', () => {
      const testUrl = '/api/tasks';

      httpClient.get(testUrl).subscribe(
        () => fail('Should error'),
        () => {
          // Error occurred
        },
      );

      expect(loadingService.isLoading()).toBe(true);

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ErrorEvent('Network error'));

      expect(loadingService.isLoading()).toBe(false);
    });

    it('should not trigger loading on error for SKIP_LOADING requests', () => {
      const testUrl = '/api/tasks';

      httpClient
        .get(testUrl, {
          context: new Map().set(SKIP_LOADING, true) as any,
        })
        .subscribe(
          () => fail('Should error'),
          () => {
            // Error occurred
          },
        );

      expect(loadingService.isLoading()).toBe(false);

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ErrorEvent('Network error'));

      expect(loadingService.isLoading()).toBe(false);
    });
  });
});
