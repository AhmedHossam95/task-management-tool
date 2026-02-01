import { TestBed } from '@angular/core/testing';
import { CacheEntry, CacheService } from './cache.service';
import { CACHE_CONFIG } from '../constants/http.constants';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve cached data', () => {
      const testKey = 'test-key';
      const testData = { message: 'test data' };

      service.set(testKey, testData);
      const retrieved = service.get<typeof testData>(testKey);

      expect(retrieved).toEqual(testData);
    });

    it('should store and retrieve arrays', () => {
      const testKey = 'tasks';
      const testData = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' },
      ];

      service.set(testKey, testData);
      const retrieved = service.get<typeof testData>(testKey);

      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = service.get('non-existent-key');
      expect(retrieved).toBeNull();
    });

    it('should prefix cache keys with STORAGE_PREFIX', () => {
      const testKey = 'test-key';
      const testData = { value: 'test' };

      service.set(testKey, testData);

      const storageKey = `${CACHE_CONFIG.STORAGE_PREFIX}${testKey}`;
      const storedItem = localStorage.getItem(storageKey);

      expect(storedItem).toBeTruthy();
      const parsed = JSON.parse(storedItem!);
      expect(parsed.data).toEqual(testData);
    });

    it('should handle errors when localStorage is unavailable', () => {
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
      spyOn(console, 'error');

      service.set('test-key', { value: 'test' });

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle corrupt cached data gracefully', () => {
      const testKey = 'test-key';
      const storageKey = `${CACHE_CONFIG.STORAGE_PREFIX}${testKey}`;
      localStorage.setItem(storageKey, 'invalid json');

      spyOn(console, 'error');
      const retrieved = service.get(testKey);

      expect(retrieved).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('isExpired', () => {
    it('should return true for non-existent cache entries', () => {
      const isExpired = service.isExpired('non-existent', CACHE_CONFIG.TTL_MS);
      expect(isExpired).toBe(true);
    });

    it('should return false for fresh cache entries', () => {
      const testKey = 'fresh-cache';
      const testData = { value: 'fresh' };

      service.set(testKey, testData);
      const isExpired = service.isExpired(testKey, CACHE_CONFIG.TTL_MS);

      expect(isExpired).toBe(false);
    });

    it('should return true for expired cache entries', (done) => {
      const testKey = 'expired-cache';
      const testData = { value: 'expired' };
      const ttlMs = 100; // 100ms TTL

      service.set(testKey, testData);

      // Wait for cache to expire
      setTimeout(() => {
        const isExpired = service.isExpired(testKey, ttlMs);
        expect(isExpired).toBe(true);
        done();
      }, 150);
    });

    it('should handle corrupt cached data when checking expiration', () => {
      const testKey = 'corrupt';
      const storageKey = `${CACHE_CONFIG.STORAGE_PREFIX}${testKey}`;
      localStorage.setItem(storageKey, 'invalid json');

      spyOn(console, 'error');
      const isExpired = service.isExpired(testKey, CACHE_CONFIG.TTL_MS);

      expect(isExpired).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should remove all cached items with prefix', () => {
      // Add some cached items
      service.set('key1', { data: 'value1' });
      service.set('key2', { data: 'value2' });
      service.set('key3', { data: 'value3' });

      // Add item without prefix (should not be removed)
      localStorage.setItem('other-key', 'other-value');

      service.clear();

      // Verify cached items are removed
      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBeNull();
      expect(service.get('key3')).toBeNull();

      // Verify non-prefixed item still exists
      expect(localStorage.getItem('other-key')).toBe('other-value');
    });

    it('should handle errors during clear gracefully', () => {
      spyOn(localStorage, 'key').and.throwError('Storage error');
      spyOn(console, 'error');

      expect(() => {
        service.clear();
      }).not.toThrow();

      expect(console.error).toHaveBeenCalled();
    });

    it('should do nothing if no cached items exist', () => {
      spyOn(console, 'error');

      expect(() => {
        service.clear();
      }).not.toThrow();

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('hasDifferentData', () => {
    it('should return false if no cache exists', () => {
      const isDifferent = service.hasDifferentData('non-existent-key', { data: 'value' });
      expect(isDifferent).toBe(false);
    });

    it('should return true if data differs from cache', () => {
      const testKey = 'test-key';
      const cachedData = { id: 1, name: 'Old' };
      const newData = { id: 1, name: 'New' };

      service.set(testKey, cachedData);
      const isDifferent = service.hasDifferentData(testKey, newData);

      expect(isDifferent).toBe(true);
    });

    it('should return false if data is same as cache', () => {
      const testKey = 'test-key';
      const data = { id: 1, name: 'Same' };

      service.set(testKey, data);
      const isDifferent = service.hasDifferentData(testKey, data);

      expect(isDifferent).toBe(false);
    });

    it('should compare array data correctly', () => {
      const testKey = 'tasks';
      const cachedTasks = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' },
      ];
      const newTasks = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2 Updated' },
      ];

      service.set(testKey, cachedTasks);
      expect(service.hasDifferentData(testKey, cachedTasks)).toBe(false);
      expect(service.hasDifferentData(testKey, newTasks)).toBe(true);
    });
  });

  describe('pending updates', () => {
    it('should initialize with empty pending updates', () => {
      expect(service.pendingUpdates().size).toBe(0);
      expect(service.hasNewData()).toBe(false);
    });

    it('should store pending updates', () => {
      const testKey = 'test-key';
      const pendingData = { id: 1, data: 'pending' };

      service.setPending(testKey, pendingData);

      expect(service.pendingUpdates().size).toBe(1);
      expect(service.pendingUpdates().get(testKey)).toEqual(pendingData);
      expect(service.hasNewData()).toBe(true);
    });

    it('should store multiple pending updates', () => {
      service.setPending('key1', { data: 'data1' });
      service.setPending('key2', { data: 'data2' });
      service.setPending('key3', { data: 'data3' });

      expect(service.pendingUpdates().size).toBe(3);
      expect(service.hasNewData()).toBe(true);
    });

    it('should apply pending updates to cache', () => {
      const key1 = 'tasks';
      const key2 = 'users';
      const data1 = [{ id: 1 }];
      const data2 = [{ id: 1, name: 'User' }];

      service.setPending(key1, data1);
      service.setPending(key2, data2);

      service.applyPendingUpdates();

      expect(service.get(key1)).toEqual(data1);
      expect(service.get(key2)).toEqual(data2);
      expect(service.pendingUpdates().size).toBe(0);
      expect(service.hasNewData()).toBe(false);
    });

    it('should increment refreshTriggered on apply', () => {
      service.setPending('key1', { data: 'value' });

      const initialValue = service.refreshTriggered();
      service.applyPendingUpdates();

      expect(service.refreshTriggered()).toBe(initialValue + 1);
    });

    it('should clear pending updates without applying', () => {
      const testKey = 'test-key';
      const pendingData = { id: 1 };

      service.setPending(testKey, pendingData);
      expect(service.hasNewData()).toBe(true);

      service.clearPendingUpdates();

      expect(service.pendingUpdates().size).toBe(0);
      expect(service.hasNewData()).toBe(false);
      // Pending data should not be in cache
      expect(service.get(testKey)).toBeNull();
    });

    it('should overwrite pending data for same key', () => {
      const testKey = 'test-key';
      const data1 = { version: 1 };
      const data2 = { version: 2 };

      service.setPending(testKey, data1);
      expect(service.pendingUpdates().get(testKey)).toEqual(data1);

      service.setPending(testKey, data2);
      expect(service.pendingUpdates().size).toBe(1);
      expect(service.pendingUpdates().get(testKey)).toEqual(data2);
    });
  });
});
