import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });

    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isLoading signal', () => {
    it('should return false initially', () => {
      expect(service.isLoading()).toBeFalse();
    });

    it('should return true when activeRequests > 0', () => {
      service.startRequest();
      expect(service.isLoading()).toBeTrue();
    });

    it('should return false when activeRequests is 0', fakeAsync(() => {
      service.startRequest();
      service.finishRequest();
      tick(500);
      expect(service.isLoading()).toBeFalse();
    }));
  });

  describe('startRequest', () => {
    it('should increment activeRequests', () => {
      expect(service.isLoading()).toBeFalse();
      service.startRequest();
      expect(service.isLoading()).toBeTrue();
    });

    it('should handle multiple startRequests', () => {
      expect(service.isLoading()).toBeFalse();
      service.startRequest();
      expect(service.isLoading()).toBeTrue();
      service.startRequest();
      expect(service.isLoading()).toBeTrue();
      service.startRequest();
      expect(service.isLoading()).toBeTrue();
    });
  });

  describe('finishRequest', () => {
    it('should decrement activeRequests after timeout', fakeAsync(() => {
      service.startRequest();
      service.startRequest();
      expect(service.isLoading()).toBeTrue();

      service.finishRequest();
      tick(500);
      expect(service.isLoading()).toBeTrue(); // Still one request active

      service.finishRequest();
      tick(500);
      expect(service.isLoading()).toBeFalse(); // All requests finished
    }));

    it('should not go below 0', fakeAsync(() => {
      expect(service.isLoading()).toBeFalse();
      service.finishRequest();
      tick(500);
      expect(service.isLoading()).toBeFalse(); // Should remain false, not negative
    }));

    it('should handle multiple finishRequests', fakeAsync(() => {
      service.startRequest();
      expect(service.isLoading()).toBeTrue();

      service.finishRequest();
      service.finishRequest();
      service.finishRequest();
      tick(500);
      expect(service.isLoading()).toBeFalse(); // Should be 0, not negative
    }));

    it('should use setTimeout with 500ms delay', fakeAsync(() => {
      service.startRequest();
      expect(service.isLoading()).toBeTrue();

      service.finishRequest();
      tick(499);
      expect(service.isLoading()).toBeTrue(); // Still loading before timeout

      tick(1);
      expect(service.isLoading()).toBeFalse(); // Finished after 500ms
    }));
  });

  describe('request lifecycle', () => {
    it('should track multiple concurrent requests correctly', fakeAsync(() => {
      expect(service.isLoading()).toBeFalse();

      service.startRequest();
      service.startRequest();
      service.startRequest();
      expect(service.isLoading()).toBeTrue();

      service.finishRequest();
      tick(500);
      expect(service.isLoading()).toBeTrue(); // 2 requests still active

      service.finishRequest();
      tick(500);
      expect(service.isLoading()).toBeTrue(); // 1 request still active

      service.finishRequest();
      tick(500);
      expect(service.isLoading()).toBeFalse(); // All finished
    }));

    it('should handle interleaved start and finish calls', fakeAsync(() => {
      expect(service.isLoading()).toBeFalse();

      service.startRequest();
      expect(service.isLoading()).toBeTrue();

      service.startRequest();
      expect(service.isLoading()).toBeTrue();

      service.finishRequest();
      tick(500);
      expect(service.isLoading()).toBeTrue(); // 1 request still active

      service.startRequest();
      expect(service.isLoading()).toBeTrue(); // 2 requests active again

      service.finishRequest();
      tick(500);
      expect(service.isLoading()).toBeTrue(); // 1 request still active

      service.finishRequest();
      tick(500);
      expect(service.isLoading()).toBeFalse(); // All finished
    }));
  });
});
