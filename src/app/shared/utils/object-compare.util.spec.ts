import { isDeepEqual } from './object-compare.util';

describe('object-compare.util', () => {
  describe('isDeepEqual', () => {
    it('should return true for identical primitives', () => {
      expect(isDeepEqual(5, 5)).toBe(true);
      expect(isDeepEqual('test', 'test')).toBe(true);
      expect(isDeepEqual(true, true)).toBe(true);
    });

    it('should return false for different primitives', () => {
      expect(isDeepEqual(5, 6)).toBe(false);
      expect(isDeepEqual('test', 'test2')).toBe(false);
      expect(isDeepEqual(true, false)).toBe(false);
    });

    it('should return true for identical objects', () => {
      const obj1 = { id: 1, name: 'Test', active: true };
      const obj2 = { id: 1, name: 'Test', active: true };
      expect(isDeepEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for different objects', () => {
      const obj1 = { id: 1, name: 'Test' };
      const obj2 = { id: 1, name: 'Different' };
      expect(isDeepEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for objects with different keys', () => {
      const obj1 = { id: 1, name: 'Test' };
      const obj2 = { id: 1, name: 'Test', extra: 'field' };
      expect(isDeepEqual(obj1, obj2)).toBe(false);
    });

    it('should return true for identical nested objects', () => {
      const obj1 = {
        id: 1,
        nested: { name: 'Test', value: 42 },
        array: [1, 2, 3],
      };
      const obj2 = {
        id: 1,
        nested: { name: 'Test', value: 42 },
        array: [1, 2, 3],
      };
      expect(isDeepEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for different nested objects', () => {
      const obj1 = {
        id: 1,
        nested: { name: 'Test', value: 42 },
      };
      const obj2 = {
        id: 1,
        nested: { name: 'Test', value: 43 },
      };
      expect(isDeepEqual(obj1, obj2)).toBe(false);
    });

    it('should return true for identical arrays', () => {
      expect(isDeepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isDeepEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    });

    it('should return false for different arrays', () => {
      expect(isDeepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(isDeepEqual([1, 2, 3], [1, 2])).toBe(false);
    });

    it('should handle arrays of objects', () => {
      const arr1 = [{ id: 1 }, { id: 2 }];
      const arr2 = [{ id: 1 }, { id: 2 }];
      const arr3 = [{ id: 1 }, { id: 3 }];

      expect(isDeepEqual(arr1, arr2)).toBe(true);
      expect(isDeepEqual(arr1, arr3)).toBe(false);
    });

    it('should return false when comparing null and undefined', () => {
      expect(isDeepEqual(null, undefined)).toBe(false);
    });

    it('should return true for both null or both undefined', () => {
      expect(isDeepEqual(null, null)).toBe(true);
      expect(isDeepEqual(undefined, undefined)).toBe(true);
    });

    it('should handle empty objects', () => {
      expect(isDeepEqual({}, {})).toBe(true);
      expect(isDeepEqual({}, { a: 1 })).toBe(false);
    });

    it('should handle empty arrays', () => {
      expect(isDeepEqual([], [])).toBe(true);
      expect(isDeepEqual([], [1])).toBe(false);
    });

    it('should handle JSON serialization errors gracefully', () => {
      // Create a circular reference
      const circular: any = { a: 1 };
      circular.self = circular;

      // Should not throw and use reference equality fallback
      expect(() => isDeepEqual(circular, circular)).not.toThrow();
      expect(isDeepEqual(circular, circular)).toBe(true);
    });

    it('should differentiate between 0 and false', () => {
      expect(isDeepEqual(0, false)).toBe(false);
    });

    it('should handle special floating point values', () => {
      expect(isDeepEqual(0.1 + 0.2, 0.3)).toBe(false); // Known floating point issue
      expect(isDeepEqual(Infinity, Infinity)).toBe(true);
    });
  });
});
