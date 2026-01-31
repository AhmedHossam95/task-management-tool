import { UserNameFromIdPipe } from './user-name-from-id-pipe';
import { Assignee } from '../models/tasks.model';

describe('UserNameFromIdPipe', () => {
  let pipe: UserNameFromIdPipe;

  const mockUsers: Assignee[] = [
    { id: '1', name: 'John Doe', avatar: 'avatar1.jpg', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', avatar: 'avatar2.jpg', email: 'jane@example.com' },
    { id: '3', name: 'Bob Wilson', avatar: 'avatar3.jpg', email: 'bob@example.com' },
  ];

  beforeEach(() => {
    pipe = new UserNameFromIdPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return user name when userId is found', () => {
    const result = pipe.transform('1', mockUsers);
    expect(result).toBe('John Doe');
  });

  it('should return correct user name for different users', () => {
    expect(pipe.transform('1', mockUsers)).toBe('John Doe');
    expect(pipe.transform('2', mockUsers)).toBe('Jane Smith');
    expect(pipe.transform('3', mockUsers)).toBe('Bob Wilson');
  });

  it('should return empty string when userId is not found', () => {
    const result = pipe.transform('999', mockUsers);
    expect(result).toBe('');
  });

  it('should return empty string when userId is undefined', () => {
    const result = pipe.transform(undefined, mockUsers);
    expect(result).toBe('');
  });

  it('should return empty string when userId is empty string', () => {
    const result = pipe.transform('', mockUsers);
    expect(result).toBe('');
  });

  it('should return empty string when users array is empty', () => {
    const result = pipe.transform('1', []);
    expect(result).toBe('');
  });

  it('should return empty string when users array is undefined', () => {
    const result = pipe.transform('1', undefined as any);
    expect(result).toBe('');
  });

  it('should return empty string when users array is null', () => {
    const result = pipe.transform('1', null as any);
    expect(result).toBe('');
  });

  it('should return empty string when both userId and users are undefined', () => {
    const result = pipe.transform(undefined, undefined as any);
    expect(result).toBe('');
  });

  it('should handle users array with only one user', () => {
    const singleUser = [mockUsers[0]];
    expect(pipe.transform('1', singleUser)).toBe('John Doe');
    expect(pipe.transform('2', singleUser)).toBe('');
  });
});
