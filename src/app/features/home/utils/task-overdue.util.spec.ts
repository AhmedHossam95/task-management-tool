import {
  calculateIsOverdue,
  formatDateForBackend,
  updateTaskOverdue,
  updateTasksOverdue,
} from './tasks.utils';

describe('Task Overdue Utilities', () => {
  describe('calculateIsOverdue', () => {
    it('should return true when dueDate is before today and status is not done', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForBackend(yesterday);

      const task = {
        id: 'task-1',
        title: 'Test',
        description: '',
        status: 'todo' as const,
        priority: 'medium' as const,
        dueDate: yesterdayStr,
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: [],
        createdAt: '',
        updatedAt: '',
        order: 0,
        isOverdue: false,
      };

      expect(calculateIsOverdue(task)).toBe(true);
    });

    it('should return false when dueDate is today and status is not done', () => {
      const today = new Date();
      const todayStr = formatDateForBackend(today);

      const task = {
        id: 'task-1',
        title: 'Test',
        description: '',
        status: 'todo' as const,
        priority: 'medium' as const,
        dueDate: todayStr,
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: [],
        createdAt: '',
        updatedAt: '',
        order: 0,
        isOverdue: false,
      };

      expect(calculateIsOverdue(task)).toBe(false);
    });

    it('should return false when dueDate is in the future and status is not done', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateForBackend(tomorrow);

      const task = {
        id: 'task-1',
        title: 'Test',
        description: '',
        status: 'todo' as const,
        priority: 'medium' as const,
        dueDate: tomorrowStr,
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: [],
        createdAt: '',
        updatedAt: '',
        order: 0,
        isOverdue: false,
      };

      expect(calculateIsOverdue(task)).toBe(false);
    });

    it('should preserve isOverdue for done status even if dueDate is in the future', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateForBackend(tomorrow);

      const task = {
        id: 'task-1',
        title: 'Test',
        description: '',
        status: 'done' as const,
        priority: 'medium' as const,
        dueDate: tomorrowStr,
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: [],
        createdAt: '',
        updatedAt: '',
        order: 0,
        isOverdue: true,
      };

      expect(calculateIsOverdue(task)).toBe(true);
    });

    it('should preserve false isOverdue for done status', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForBackend(yesterday);

      const task = {
        id: 'task-1',
        title: 'Test',
        description: '',
        status: 'done' as const,
        priority: 'medium' as const,
        dueDate: yesterdayStr,
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: [],
        createdAt: '',
        updatedAt: '',
        order: 0,
        isOverdue: false,
      };

      expect(calculateIsOverdue(task)).toBe(false);
    });

    it('should return false for done status when isOverdue is undefined', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForBackend(yesterday);

      const task = {
        id: 'task-1',
        title: 'Test',
        description: '',
        status: 'done' as const,
        priority: 'medium' as const,
        dueDate: yesterdayStr,
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: [],
        createdAt: '',
        updatedAt: '',
        order: 0,
      };

      expect(calculateIsOverdue(task)).toBe(false);
    });

    it('should return true for in_progress status when dueDate is before today', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForBackend(yesterday);

      const task = {
        id: 'task-1',
        title: 'Test',
        description: '',
        status: 'in_progress' as const,
        priority: 'medium' as const,
        dueDate: yesterdayStr,
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: [],
        createdAt: '',
        updatedAt: '',
        order: 0,
        isOverdue: false,
      };

      expect(calculateIsOverdue(task)).toBe(true);
    });
  });

  describe('updateTaskOverdue', () => {
    it('should update task with calculated isOverdue', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForBackend(yesterday);

      const task = {
        id: 'task-1',
        title: 'Test',
        description: '',
        status: 'todo' as const,
        priority: 'medium' as const,
        dueDate: yesterdayStr,
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: [],
        createdAt: '',
        updatedAt: '',
        order: 0,
        isOverdue: false,
      };

      const updated = updateTaskOverdue(task);
      expect(updated.isOverdue).toBe(true);
    });

    it('should preserve other task properties', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForBackend(yesterday);

      const task = {
        id: 'task-1',
        title: 'Test',
        description: 'Description',
        status: 'todo' as const,
        priority: 'high' as const,
        dueDate: yesterdayStr,
        assignee: { id: 'u1', name: 'User', avatar: 'JD', email: 'user@test.com' },
        tags: ['tag1'],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-02',
        order: 5,
        isOverdue: false,
      };

      const updated = updateTaskOverdue(task);
      expect(updated.title).toBe('Test');
      expect(updated.description).toBe('Description');
      expect(updated.status).toBe('todo');
      expect(updated.priority).toBe('high');
      expect(updated.order).toBe(5);
      expect(updated.tags).toEqual(['tag1']);
    });

    it('should not mutate original task', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForBackend(yesterday);

      const task = {
        id: 'task-1',
        title: 'Test',
        description: '',
        status: 'todo' as const,
        priority: 'medium' as const,
        dueDate: yesterdayStr,
        assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
        tags: [],
        createdAt: '',
        updatedAt: '',
        order: 0,
        isOverdue: false,
      };

      updateTaskOverdue(task);
      expect(task.isOverdue).toBe(false);
    });
  });

  describe('updateTasksOverdue', () => {
    it('should update all tasks with calculated isOverdue', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForBackend(yesterday);

      const tasks = [
        {
          id: 'task-1',
          title: 'Test 1',
          description: '',
          status: 'todo' as const,
          priority: 'medium' as const,
          dueDate: yesterdayStr,
          assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
          tags: [],
          createdAt: '',
          updatedAt: '',
          order: 0,
          isOverdue: false,
        },
        {
          id: 'task-2',
          title: 'Test 2',
          description: '',
          status: 'in_progress' as const,
          priority: 'medium' as const,
          dueDate: yesterdayStr,
          assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
          tags: [],
          createdAt: '',
          updatedAt: '',
          order: 1,
          isOverdue: false,
        },
      ];

      const updated = updateTasksOverdue(tasks);
      expect(updated[0].isOverdue).toBe(true);
      expect(updated[1].isOverdue).toBe(true);
    });

    it('should return new array without mutating original', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForBackend(yesterday);

      const tasks = [
        {
          id: 'task-1',
          title: 'Test 1',
          description: '',
          status: 'todo' as const,
          priority: 'medium' as const,
          dueDate: yesterdayStr,
          assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
          tags: [],
          createdAt: '',
          updatedAt: '',
          order: 0,
          isOverdue: false,
        },
      ];

      const updated = updateTasksOverdue(tasks);
      expect(updated).not.toBe(tasks);
      expect(tasks[0].isOverdue).toBe(false);
      expect(updated[0].isOverdue).toBe(true);
    });

    it('should preserve done task isOverdue status', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateForBackend(yesterday);

      const tasks = [
        {
          id: 'task-1',
          title: 'Test 1',
          description: '',
          status: 'done' as const,
          priority: 'medium' as const,
          dueDate: yesterdayStr,
          assignee: { id: 'u1', name: 'User', avatar: '', email: 'user@test.com' },
          tags: [],
          createdAt: '',
          updatedAt: '',
          order: 0,
          isOverdue: true,
        },
      ];

      const updated = updateTasksOverdue(tasks);
      expect(updated[0].isOverdue).toBe(true);
    });

    it('should handle empty array', () => {
      const updated = updateTasksOverdue([]);
      expect(updated).toEqual([]);
    });
  });
});
