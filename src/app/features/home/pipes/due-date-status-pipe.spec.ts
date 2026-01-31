import { DueDateStatusPipe } from './due-date-status-pipe';
import { Task } from '../models/tasks.model';

describe('DueDateStatusPipe', () => {
  let pipe: DueDateStatusPipe;

  beforeEach(() => {
    pipe = new DueDateStatusPipe();
  });

  const createTask = (status: Task['status'], completedAt?: string): Task => ({
    id: '1',
    title: 'Test Task',
    description: 'Test',
    status,
    priority: 'medium',
    dueDate: '2024-12-31',
    assignee: { id: '1', name: 'John', avatar: '', email: 'john@test.com' },
    order: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    tags: [],
    completedAt,
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Completed tasks', () => {
    it('should return "Completed today" for task completed today', () => {
      const today = new Date().toISOString();
      const task = createTask('done', today);

      const result = pipe.transform(task.dueDate, task);

      expect(result).toBe('✅ Completed today');
    });

    it('should return "Completed yesterday" for task completed yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const task = createTask('done', yesterday.toISOString());

      const result = pipe.transform(task.dueDate, task);

      expect(result).toBe('✅ Completed yesterday');
    });

    it('should return "Completed N days ago" for task completed multiple days ago', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const task = createTask('done', threeDaysAgo.toISOString());

      const result = pipe.transform(task.dueDate, task);

      expect(result).toBe('✅ Completed 3 days ago');
    });

    it('should return empty string when completed task has no completedAt date', () => {
      const task = createTask('done', undefined);

      const result = pipe.transform(task.dueDate, task);

      expect(result).toBe('');
    });

    it('should handle task completed 7 days ago', () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const task = createTask('done', sevenDaysAgo.toISOString());

      const result = pipe.transform(task.dueDate, task);

      expect(result).toBe('✅ Completed 7 days ago');
    });
  });

  describe('Active tasks (todo/in_progress)', () => {
    // Helper to format date for local timezone
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    it('should return "Due today" for task due today', () => {
      const today = formatDate(new Date());
      const task = createTask('todo');

      const result = pipe.transform(today, task);

      expect(result).toBe('📅 Due today');
    });

    it('should return "Due tomorrow" for task due tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dueDate = formatDate(tomorrow);
      const task = createTask('todo');

      const result = pipe.transform(dueDate, task);

      expect(result).toBe('📅 Due tomorrow');
    });

    it('should return "Due in N days" for task due in future', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const dueDate = formatDate(future);
      const task = createTask('todo');

      const result = pipe.transform(dueDate, task);

      expect(result).toBe('📅 Due in 5 days');
    });

    it('should return "Overdue by N days" for overdue task', () => {
      const past = new Date();
      past.setDate(past.getDate() - 3);
      const dueDate = formatDate(past);
      const task = createTask('todo');

      const result = pipe.transform(dueDate, task);

      expect(result).toBe('⚠ Overdue by 3 days');
    });

    it('should handle task due in 1 day correctly', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dueDate = formatDate(tomorrow);
      const task = createTask('in_progress');

      const result = pipe.transform(dueDate, task);

      expect(result).toBe('📅 Due tomorrow');
    });

    it('should handle task overdue by 1 day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dueDate = formatDate(yesterday);
      const task = createTask('todo');

      const result = pipe.transform(dueDate, task);

      expect(result).toBe('⚠ Overdue by 1 days');
    });

    it('should handle task due in 10 days', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const dueDate = formatDate(future);
      const task = createTask('todo');

      const result = pipe.transform(dueDate, task);

      expect(result).toBe('📅 Due in 10 days');
    });

    it('should handle task overdue by 10 days', () => {
      const past = new Date();
      past.setDate(past.getDate() - 10);
      const dueDate = formatDate(past);
      const task = createTask('in_progress');

      const result = pipe.transform(dueDate, task);

      expect(result).toBe('⚠ Overdue by 10 days');
    });
  });

  describe('Edge cases', () => {
    // Helper to format date for local timezone
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    it('should return empty string when dueDate is undefined', () => {
      const task = createTask('todo');

      const result = pipe.transform(undefined, task);

      expect(result).toBe('');
    });

    it('should return empty string when task is undefined', () => {
      const result = pipe.transform('2024-12-31', undefined);

      expect(result).toBe('');
    });

    it('should return empty string when both dueDate and task are undefined', () => {
      const result = pipe.transform(undefined, undefined);

      expect(result).toBe('');
    });

    it('should handle empty dueDate string', () => {
      const task = createTask('todo');

      const result = pipe.transform('', task);

      expect(result).toBe('');
    });

    it('should work with in_progress tasks', () => {
      const today = formatDate(new Date());
      const task = createTask('in_progress');

      const result = pipe.transform(today, task);

      expect(result).toBe('📅 Due today');
    });
  });
});
