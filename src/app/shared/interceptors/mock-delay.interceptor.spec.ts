import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { MockDelayInterceptor } from './mock-delay.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

describe('MockDelayInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideHttpClient(withInterceptors([MockDelayInterceptor]))],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('mock delay application', () => {
    it('should add 200ms delay to GET requests', fakeAsync(() => {
      const testUrl = '/api/tasks';
      const testData = [{ id: 1 }];

      let responseReceived = false;
      httpClient.get(testUrl).subscribe(() => {
        responseReceived = true;
      });

      // Response should not be received yet (within 200ms)
      expect(responseReceived).toBe(false);

      const req = httpTestingController.expectOne(testUrl);
      req.flush(testData);

      // Still not received due to 200ms delay
      expect(responseReceived).toBe(false);

      // Advance time by 200ms
      tick(200);

      // Now response should be received
      expect(responseReceived).toBe(true);
    }));

    it('should add 200ms delay to POST requests', fakeAsync(() => {
      const testUrl = '/api/tasks';
      const postData = { title: 'New Task' };

      let responseReceived = false;
      httpClient.post(testUrl, postData).subscribe(() => {
        responseReceived = true;
      });

      const req = httpTestingController.expectOne(testUrl);
      req.flush({ id: 1, ...postData });

      expect(responseReceived).toBe(false);

      tick(200);

      expect(responseReceived).toBe(true);
    }));

    it('should add 200ms delay to PUT requests', fakeAsync(() => {
      const testUrl = '/api/tasks/1';
      const updateData = { title: 'Updated' };

      let responseReceived = false;
      httpClient.put(testUrl, updateData).subscribe(() => {
        responseReceived = true;
      });

      const req = httpTestingController.expectOne(testUrl);
      req.flush({ id: 1, ...updateData });

      expect(responseReceived).toBe(false);

      tick(200);

      expect(responseReceived).toBe(true);
    }));

    it('should add 200ms delay to DELETE requests', fakeAsync(() => {
      const testUrl = '/api/tasks/1';

      let responseReceived = false;
      httpClient.delete(testUrl).subscribe(() => {
        responseReceived = true;
      });

      const req = httpTestingController.expectOne(testUrl);
      req.flush({});

      expect(responseReceived).toBe(false);

      tick(200);

      expect(responseReceived).toBe(true);
    }));
  });

  describe('delay timing precision', () => {
    it('should apply exactly 200ms delay', fakeAsync(() => {
      const testUrl = '/api/tasks';

      let responseReceived = false;
      httpClient.get(testUrl).subscribe(() => {
        responseReceived = true;
      });

      const req = httpTestingController.expectOne(testUrl);
      req.flush([]);

      // At 199ms, response should not be received yet
      tick(199);
      expect(responseReceived).toBe(false);

      // At 200ms, response should be received
      tick(1);
      expect(responseReceived).toBe(true);
    }));

    it('should apply delay to multiple concurrent requests independently', fakeAsync(() => {
      const url1 = '/api/tasks';
      const url2 = '/api/users';

      let response1Received = false;
      let response2Received = false;

      httpClient.get(url1).subscribe(() => {
        response1Received = true;
      });

      httpClient.get(url2).subscribe(() => {
        response2Received = true;
      });

      const req1 = httpTestingController.expectOne(url1);
      const req2 = httpTestingController.expectOne(url2);

      req1.flush([]);
      req2.flush([]);

      expect(response1Received).toBe(false);
      expect(response2Received).toBe(false);

      tick(200);

      expect(response1Received).toBe(true);
      expect(response2Received).toBe(true);
    }));
  });

  describe('error handling with delay', () => {
    it('should apply delay before emitting error', fakeAsync(() => {
      const testUrl = '/api/tasks';

      let errorReceived = false;
      httpClient.get(testUrl).subscribe(
        () => fail('Should error'),
        () => {
          errorReceived = true;
        },
      );

      const req = httpTestingController.expectOne(testUrl);
      req.error(new ErrorEvent('Network error'));

      expect(errorReceived).toBe(false);

      tick(200);

      expect(errorReceived).toBe(true);
    }));

    it('should apply delay to 404 responses', fakeAsync(() => {
      const testUrl = '/api/tasks/999';

      let errorReceived = false;
      httpClient.get(testUrl).subscribe(
        () => fail('Should error'),
        () => {
          errorReceived = true;
        },
      );

      const req = httpTestingController.expectOne(testUrl);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(errorReceived).toBe(false);

      tick(200);

      expect(errorReceived).toBe(true);
    }));
  });
});
