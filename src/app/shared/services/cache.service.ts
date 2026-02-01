import { computed, Injectable, signal } from '@angular/core';
import { CACHE_CONFIG } from '../constants/http.constants';
import { isDeepEqual } from '../utils/object-compare.util';

export type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  /** Map of pending updates waiting to be applied (for stale-while-revalidate) */
  readonly pendingUpdates = signal<Map<string, unknown>>(new Map());

  /** Signal to trigger refresh in dependent services */
  readonly refreshTriggered = signal<number>(0);

  /** Computed signal indicating if new data is available */
  readonly hasNewData = computed(() => this.pendingUpdates().size > 0);
  /**
   * Store data in localStorage with a timestamp
   * @param key - Cache key
   * @param data - Data to cache
   */
  set(key: string, data: unknown): void {
    try {
      const storageKey = this.getStorageKey(key);
      const entry: CacheEntry<unknown> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.error(`Failed to cache data for key: ${key}`, error);
    }
  }

  /**
   * Retrieve data from localStorage
   * @param key - Cache key
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    try {
      const storageKey = this.getStorageKey(key);
      const item = localStorage.getItem(storageKey);

      if (!item) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);
      return entry.data;
    } catch (error) {
      console.error(`Failed to retrieve cache for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Check if cached data has expired based on TTL
   * @param key - Cache key
   * @param ttlMs - Time to live in milliseconds
   * @returns True if cache has expired, false otherwise
   */
  isExpired(key: string, ttlMs: number): boolean {
    try {
      const storageKey = this.getStorageKey(key);
      const item = localStorage.getItem(storageKey);

      if (!item) {
        return true;
      }

      const entry: CacheEntry<unknown> = JSON.parse(item);
      const age = Date.now() - entry.timestamp;
      return age > ttlMs;
    } catch (error) {
      console.error(`Failed to check expiration for key: ${key}`, error);
      return true;
    }
  }

  /**
   * Clear all cached data from localStorage
   */
  clear(): void {
    try {
      const prefix = CACHE_CONFIG.STORAGE_PREFIX;
      const keysToRemove: string[] = [];

      // Iterate through all localStorage keys and find cached items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      // Remove all cached items
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear cache', error);
    }
  }

  /**
   * Invalidate (remove) a specific cache entry
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
      // Also clear any pending updates for this key
      const updates = new Map(this.pendingUpdates());
      if (updates.has(key)) {
        updates.delete(key);
        this.pendingUpdates.set(updates);
      }
    } catch (error) {
      console.error(`Failed to invalidate cache for key: ${key}`, error);
    }
  }

  /**
   * Generate a prefixed storage key
   * @param key - Original cache key
   * @returns Prefixed storage key
   */
  private getStorageKey(key: string): string {
    return `${CACHE_CONFIG.STORAGE_PREFIX}${key}`;
  }

  /**
   * Check if new data differs from cached data
   * @param key - Cache key
   * @param newData - New data to compare
   * @returns True if data differs, false if same or no cache exists
   */
  hasDifferentData(key: string, newData: unknown): boolean {
    const cachedData = this.get(key);
    if (cachedData === null) {
      return false; // No cache to compare against
    }
    return !isDeepEqual(cachedData, newData);
  }

  /**
   * Store fresh data as pending update (not applied to cache yet)
   * Enables stale-while-revalidate pattern
   * @param key - Cache key
   * @param data - Fresh data to store as pending
   */
  setPending(key: string, data: unknown): void {
    const updates = new Map(this.pendingUpdates());
    updates.set(key, data);
    this.pendingUpdates.set(updates);
  }

  /**
   * Apply all pending updates to cache and trigger refresh
   * Called when user clicks the refresh button
   */
  applyPendingUpdates(): void {
    this.pendingUpdates().forEach((data, key) => {
      this.set(key, data);
    });
    this.pendingUpdates.set(new Map());
    // Increment to trigger refresh in services
    this.refreshTriggered.update((v) => v + 1);
  }

  /**
   * Clear pending updates without applying them
   */
  clearPendingUpdates(): void {
    this.pendingUpdates.set(new Map());
  }
}
