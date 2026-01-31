import {
  buildNewTask,
  createTimestamp,
  formatDateForBackend,
  generateTaskId,
  getStatusTransitionUpdates,
  parseDateFromBackend,
  withUpdatedTimestamp,
} from './tasks.utils';

describe('tasks.utils', () => {
  describe('getStatusTransitionUpdates', () => {
    it('should return completedAt and isOverdue:false for "done" status', () => {
      const result = getStatusTransitionUpdates('done');
      expect(result.completedAt).toBeDefined();
      expect(result.isOverdue).toBe(false);
    });

    it('should return completedAt as ISO string for "done" status', () => {
      const result = getStatusTransitionUpdates('done');
      expect(() => new Date(result.completedAt!)).not.toThrow();
      expect(result.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should return empty object for "todo" status', () => {
      expect(getStatusTransitionUpdates('todo')).toEqual({});
    });

    it('should return empty object for "in_progress" status', () => {
      expect(getStatusTransitionUpdates('in_progress')).toEqual({});
    });
  });

  describe('generateTaskId', () => {
    it('should return string starting with "task-"', () => {
      const id = generateTaskId();
      expect(id.startsWith('task-')).toBeTrue();
    });

    it('should generate unique ids', () => {
      const ids = new Set([generateTaskId(), generateTaskId(), generateTaskId()]);
      expect(ids.size).toBe(3);
    });

    it('should include timestamp in id', () => {
      const id = generateTaskId();
      const parts = id.split('-');
      expect(parts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('createTimestamp', () => {
    it('should return ISO formatted string', () => {
      const timestamp = createTimestamp();
      expect(() => new Date(timestamp)).not.toThrow();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should return current time', () => {
      const before = new Date().getTime();
      const timestamp = createTimestamp();
      const after = new Date().getTime();
      const timestampMs = new Date(timestamp).getTime();

      expect(timestampMs).toBeGreaterThanOrEqual(before);
      expect(timestampMs).toBeLessThanOrEqual(after);
    });
  });

  describe('formatDateForBackend', () => {
    it('should format Date object to YYYY-MM-DD', () => {
      const date = new Date(2026, 1, 15); // Feb 15, 2026
      expect(formatDateForBackend(date)).toBe('2026-02-15');
    });

    it('should format date string to YYYY-MM-DD', () => {
      expect(formatDateForBackend('2026-03-20T10:00:00Z')).toBe('2026-03-20');
    });

    it('should handle single digit months with padding', () => {
      const date = new Date(2026, 0, 5); // Jan 5, 2026
      expect(formatDateForBackend(date)).toBe('2026-01-05');
    });

    it('should handle single digit days with padding', () => {
      const date = new Date(2026, 11, 1); // Dec 1, 2026
      expect(formatDateForBackend(date)).toBe('2026-12-01');
    });

    it('should return empty string for null', () => {
      expect(formatDateForBackend(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(formatDateForBackend(undefined)).toBe('');
    });

    it('should return empty string for invalid date string', () => {
      expect(formatDateForBackend('invalid')).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(formatDateForBackend('')).toBe('');
    });
  });

  describe('parseDateFromBackend', () => {
    it('should parse valid YYYY-MM-DD string', () => {
      const result = parseDateFromBackend('2026-02-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2026);
      expect(result?.getMonth()).toBe(1); // 0-indexed
      expect(result?.getDate()).toBe(15);
    });

    it('should return null for null', () => {
      expect(parseDateFromBackend(null)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(parseDateFromBackend(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseDateFromBackend('')).toBeNull();
    });

    it('should return null for invalid format MM-DD-YYYY', () => {
      expect(parseDateFromBackend('02-15-2026')).toBeNull();
    });

    it('should return null for invalid format YYYY/MM/DD', () => {
      expect(parseDateFromBackend('2026/02/15')).toBeNull();
    });

    it('should return null for invalid date Feb 30', () => {
      expect(parseDateFromBackend('2026-02-30')).toBeNull();
    });

    it('should return null for invalid month 13', () => {
      expect(parseDateFromBackend('2026-13-01')).toBeNull();
    });

    it('should return null for invalid day 32', () => {
      expect(parseDateFromBackend('2026-01-32')).toBeNull();
    });

    it('should handle leap year Feb 29', () => {
      const result = parseDateFromBackend('2024-02-29'); // 2024 is leap year
      expect(result).toBeInstanceOf(Date);
      expect(result?.getDate()).toBe(29);
    });

    it('should return null for non-leap year Feb 29', () => {
      expect(parseDateFromBackend('2025-02-29')).toBeNull();
    });
  });

  describe('buildNewTask', () => {
    it('should create complete task with generated id and timestamps', () => {
      const dto = {
        title: 'Test Task',
        description: 'Test description',
        status: 'todo' as const,
        priority: 'medium' as const,
        dueDate: '2026-02-15',
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: ['test'],
      };
      const task = buildNewTask(dto);

      expect(task.id).toMatch(/^task-/);
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test description');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
      expect(task.order).toBe(0);
    });

    it('should set order to 0 for new tasks', () => {
      const dto = {
        title: 'Test',
        description: '',
        status: 'todo' as const,
        priority: 'low' as const,
        dueDate: '',
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: [],
      };
      const task = buildNewTask(dto);
      expect(task.order).toBe(0);
    });

    it('should set same createdAt and updatedAt for new tasks', () => {
      const dto = {
        title: 'Test',
        description: '',
        status: 'todo' as const,
        priority: 'low' as const,
        dueDate: '',
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: [],
      };
      const task = buildNewTask(dto);
      expect(task.createdAt).toBe(task.updatedAt);
    });
  });

  describe('withUpdatedTimestamp', () => {
    it('should add updatedAt to object', () => {
      const updates = { title: 'Updated' };
      const result = withUpdatedTimestamp(updates);

      expect(result.title).toBe('Updated');
      expect(result.updatedAt).toBeDefined();
      expect(() => new Date(result.updatedAt)).not.toThrow();
    });

    it('should preserve all original properties', () => {
      const updates = { title: 'Updated', description: 'New desc', priority: 'high' };
      const result = withUpdatedTimestamp(updates);

      expect(result.title).toBe('Updated');
      expect(result.description).toBe('New desc');
      expect(result.priority).toBe('high');
    });

    it('should override existing updatedAt', () => {
      const updates = { title: 'Updated', updatedAt: '2020-01-01' };
      const result = withUpdatedTimestamp(updates);

      expect(result.updatedAt).not.toBe('2020-01-01');
      expect(new Date(result.updatedAt).getFullYear()).toBeGreaterThanOrEqual(2026);
    });

    it('should return updatedAt as ISO string', () => {
      const result = withUpdatedTimestamp({ title: 'Test' });
      expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
