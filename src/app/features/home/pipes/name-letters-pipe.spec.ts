import { NameLettersPipe } from './name-letters-pipe';

describe('NameLettersPipe', () => {
  let pipe: NameLettersPipe;

  beforeEach(() => {
    pipe = new NameLettersPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should extract first two letters from full name', () => {
    const result = pipe.transform('John Doe');
    expect(result).toBe('JD');
  });

  it('should handle single word name', () => {
    const result = pipe.transform('John');
    expect(result).toBe('J');
  });

  it('should limit to two characters for multi-word names', () => {
    const result = pipe.transform('John Michael Doe');
    expect(result).toBe('JM');
  });

  it('should handle three word names correctly', () => {
    const result = pipe.transform('John Michael Smith');
    expect(result).toBe('JM');
  });

  it('should handle four word names and only take first two', () => {
    const result = pipe.transform('John Michael Smith Anderson');
    expect(result).toBe('JM');
  });

  it('should return empty string when name is undefined', () => {
    const result = pipe.transform(undefined);
    expect(result).toBe('');
  });

  it('should return empty string when name is empty string', () => {
    const result = pipe.transform('');
    expect(result).toBe('');
  });

  it('should handle name with lowercase letters', () => {
    const result = pipe.transform('john doe');
    expect(result).toBe('jd');
  });

  it('should handle name with mixed case', () => {
    const result = pipe.transform('JoHn DoE');
    expect(result).toBe('JD');
  });

  it('should handle name with extra spaces', () => {
    const result = pipe.transform('John  Doe');
    expect(result).toBe('JD');
  });

  it('should handle name with leading space', () => {
    const result = pipe.transform(' John Doe');
    expect(result).toBe('JD');
  });

  it('should handle name with trailing space', () => {
    const result = pipe.transform('John Doe ');
    expect(result).toBe('JD');
  });

  it('should handle single character name', () => {
    const result = pipe.transform('J');
    expect(result).toBe('J');
  });

  it('should handle two single character names', () => {
    const result = pipe.transform('J D');
    expect(result).toBe('JD');
  });

  it('should handle hyphenated names', () => {
    const result = pipe.transform('Mary-Jane Watson');
    expect(result).toBe('MW');
  });

  it('should handle names with special characters', () => {
    const result = pipe.transform("O'Brien Smith");
    expect(result).toBe('OS');
  });
});
