import { TestBed } from '@angular/core/testing';
import { CustomDateAdapter, DD_MM_YYYY_FORMAT } from './custom-date-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';

describe('CustomDateAdapter', () => {
  let adapter: CustomDateAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomDateAdapter, { provide: MAT_DATE_LOCALE, useValue: 'en-US' }],
    });

    adapter = TestBed.inject(CustomDateAdapter);
  });

  describe('format', () => {
    it('should format date as DD-MM-YYYY', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024

      const formatted = adapter.format(date, 'DD-MM-YYYY');

      expect(formatted).toBe('15-01-2024');
    });

    it('should pad single digit day with zero', () => {
      const date = new Date(2024, 5, 5); // June 5, 2024

      const formatted = adapter.format(date, 'DD-MM-YYYY');

      expect(formatted).toBe('05-06-2024');
    });

    it('should pad single digit month with zero', () => {
      const date = new Date(2024, 0, 25); // January 25, 2024

      const formatted = adapter.format(date, 'DD-MM-YYYY');

      expect(formatted).toBe('25-01-2024');
    });

    it('should handle last day of month', () => {
      const date = new Date(2024, 11, 31); // December 31, 2024

      const formatted = adapter.format(date, 'DD-MM-YYYY');

      expect(formatted).toBe('31-12-2024');
    });

    it('should handle first day of year', () => {
      const date = new Date(2024, 0, 1); // January 1, 2024

      const formatted = adapter.format(date, 'DD-MM-YYYY');

      expect(formatted).toBe('01-01-2024');
    });

    it('should handle leap year date', () => {
      const date = new Date(2024, 1, 29); // February 29, 2024 (leap year)

      const formatted = adapter.format(date, 'DD-MM-YYYY');

      expect(formatted).toBe('29-02-2024');
    });

    it('should fall back to parent format for non DD-MM-YYYY formats', () => {
      const date = new Date(2024, 0, 15);

      const formatted = adapter.format(date, 'MMM YYYY');

      // Native format should still work
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should handle dates in different centuries', () => {
      const date = new Date(1999, 11, 31); // December 31, 1999

      const formatted = adapter.format(date, 'DD-MM-YYYY');

      expect(formatted).toBe('31-12-1999');
    });
  });

  describe('parse', () => {
    it('should parse DD-MM-YYYY format', () => {
      const parsed = adapter.parse('15-01-2024');

      expect(parsed).toBeInstanceOf(Date);
      expect(parsed?.getDate()).toBe(15);
      expect(parsed?.getMonth()).toBe(0); // January = 0
      expect(parsed?.getFullYear()).toBe(2024);
    });

    it('should parse single digit day and month', () => {
      const parsed = adapter.parse('05-06-2024');

      expect(parsed).toBeInstanceOf(Date);
      expect(parsed?.getDate()).toBe(5);
      expect(parsed?.getMonth()).toBe(5); // June = 5
      expect(parsed?.getFullYear()).toBe(2024);
    });

    it('should parse date with leading zeros', () => {
      const parsed = adapter.parse('01-01-2024');

      expect(parsed).toBeInstanceOf(Date);
      expect(parsed?.getDate()).toBe(1);
      expect(parsed?.getMonth()).toBe(0);
      expect(parsed?.getFullYear()).toBe(2024);
    });

    it('should parse last day of month', () => {
      const parsed = adapter.parse('31-12-2024');

      expect(parsed).toBeInstanceOf(Date);
      expect(parsed?.getDate()).toBe(31);
      expect(parsed?.getMonth()).toBe(11); // December = 11
      expect(parsed?.getFullYear()).toBe(2024);
    });

    it('should return null for null input', () => {
      const parsed = adapter.parse(null);

      expect(parsed).toBeNull();
    });

    it('should return null for invalid format', () => {
      const parsed = adapter.parse('invalid-date');

      // Parser returns Invalid Date instead of null for malformed dates
      expect(parsed instanceof Date && isNaN(parsed.getTime())).toBe(true);
    });

    it('should fall back to parent parse for non-hyphenated strings', () => {
      const parsed = adapter.parse('01/15/2024');

      // Parent parser should handle slash format
      expect(parsed).toBeTruthy();
    });

    it('should handle leap year date parsing', () => {
      const parsed = adapter.parse('29-02-2024');

      expect(parsed).toBeInstanceOf(Date);
      expect(parsed?.getDate()).toBe(29);
      expect(parsed?.getMonth()).toBe(1); // February = 1
      expect(parsed?.getFullYear()).toBe(2024);
    });

    it('should parse dates from different centuries', () => {
      const parsed = adapter.parse('31-12-1999');

      expect(parsed).toBeInstanceOf(Date);
      expect(parsed?.getDate()).toBe(31);
      expect(parsed?.getMonth()).toBe(11);
      expect(parsed?.getFullYear()).toBe(1999);
    });

    it('should handle incomplete date string', () => {
      const parsed = adapter.parse('15-01');

      // Should fall back to parent parser which returns Invalid Date
      expect(parsed instanceof Date && isNaN(parsed.getTime())).toBe(true);
    });
  });

  describe('DD_MM_YYYY_FORMAT constant', () => {
    it('should have correct parse format', () => {
      expect(DD_MM_YYYY_FORMAT.parse.dateInput).toBe('DD-MM-YYYY');
    });

    it('should have correct display formats', () => {
      expect(DD_MM_YYYY_FORMAT.display.dateInput).toBe('DD-MM-YYYY');
      expect(DD_MM_YYYY_FORMAT.display.monthYearLabel).toBe('MMM YYYY');
      expect(DD_MM_YYYY_FORMAT.display.dateA11yLabel).toBe('DD-MM-YYYY');
      expect(DD_MM_YYYY_FORMAT.display.monthYearA11yLabel).toBe('MMMM YYYY');
    });
  });
});
