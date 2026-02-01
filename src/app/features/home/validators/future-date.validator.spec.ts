import { FormControl } from '@angular/forms';
import { futureDateValidator } from './future-date.validator';

describe('futureDateValidator', () => {
  it('should return null for future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const control = new FormControl<string | Date>(futureDate.toISOString(), { nonNullable: true });

    expect(futureDateValidator(false, control)).toBeNull();
  });

  it('should return { pastDate: true } for past dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    const control = new FormControl<string | Date>(pastDate.toISOString(), { nonNullable: true });

    expect(futureDateValidator(false, control)).toEqual({ pastDate: true });
  });

  it('should return null for today (same day)', () => {
    const today = new Date();
    const control = new FormControl<string | Date>(today.toISOString(), { nonNullable: true });

    expect(futureDateValidator(false, control)).toBeNull();
  });

  it('should return null for empty string value', () => {
    const control = new FormControl<string | Date>('', { nonNullable: true });
    expect(futureDateValidator(false, control)).toBeNull();
  });

  it('should return null for empty value (simulating null)', () => {
    const control = new FormControl<string | Date>('', { nonNullable: true });
    expect(futureDateValidator(false, control)).toBeNull();
  });

  it('should return null when bypass is true (edit mode) even for past dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    const control = new FormControl<string | Date>(pastDate.toISOString(), { nonNullable: true });

    expect(futureDateValidator(true, control)).toBeNull();
  });

  it('should handle Date object as value', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const control = new FormControl<string | Date>(futureDate, { nonNullable: true });

    expect(futureDateValidator(false, control)).toBeNull();
  });

  it('should handle Date object for past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    const control = new FormControl<string | Date>(pastDate, { nonNullable: true });

    expect(futureDateValidator(false, control)).toEqual({ pastDate: true });
  });

  it('should compare dates ignoring time component', () => {
    // Create a date for today at 23:59
    const todayLate = new Date();
    todayLate.setHours(23, 59, 59, 999);
    const control = new FormControl<string | Date>(todayLate.toISOString(), { nonNullable: true });

    expect(futureDateValidator(false, control)).toBeNull();
  });

  it('should handle yesterday as past date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const control = new FormControl<string | Date>(yesterday.toISOString(), { nonNullable: true });

    expect(futureDateValidator(false, control)).toEqual({ pastDate: true });
  });

  it('should handle tomorrow as future date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const control = new FormControl<string | Date>(tomorrow.toISOString(), { nonNullable: true });

    expect(futureDateValidator(false, control)).toBeNull();
  });
});
