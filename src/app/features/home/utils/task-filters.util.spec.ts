import {
  filterByAssignee,
  filterByPriority,
  filterTasksByStatus,
  searchTasks,
} from './task-filters.util';
import { Task } from '../models/tasks.model';

describe('task-filters.util', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Fix login bug',
      description: 'Authentication issue',
      status: 'todo',
      priority: 'high',
      order: 0,
      assignee: { id: 'user1', name: 'Alice', avatar: '', email: 'alice@test.com' },
      dueDate: '2026-02-15',
      tags: [],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: '2',
      title: 'Add dark mode',
      description: 'Theme feature',
      status: 'in_progress',
      priority: 'medium',
      order: 1,
      assignee: { id: 'user2', name: 'Bob', avatar: '', email: 'bob@test.com' },
      dueDate: '2026-02-20',
      tags: [],
      createdAt: '2026-01-02',
      updatedAt: '2026-01-02',
    },
    {
      id: '3',
      title: 'Write documentation',
      description: 'API docs',
      status: 'done',
      priority: 'low',
      order: 2,
      assignee: { id: 'user1', name: 'Alice', avatar: '', email: 'alice@test.com' },
      dueDate: '2026-02-10',
      tags: [],
      createdAt: '2026-01-03',
      updatedAt: '2026-01-03',
    },
  ];

  describe('searchTasks', () => {
    it('should return all tasks when query is empty', () => {
      expect(searchTasks(mockTasks, '')).toEqual(mockTasks);
      expect(searchTasks(mockTasks, '   ')).toEqual(mockTasks);
    });

    it('should filter by title (case-insensitive)', () => {
      const result = searchTasks(mockTasks, 'login');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter by title with different case', () => {
      const result = searchTasks(mockTasks, 'LOGIN');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter by description', () => {
      const result = searchTasks(mockTasks, 'theme');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('2');
    });

    it('should return empty array when no matches', () => {
      expect(searchTasks(mockTasks, 'xyz')).toEqual([]);
    });

    it('should match partial words', () => {
      const result = searchTasks(mockTasks, 'doc');
      expect(result.length).toBe(1); // 'Write documentation' (title) and 'API docs' (description) are same task
      expect(result[0].id).toBe('3');
    });
  });

  describe('filterByPriority', () => {
    it('should return all tasks when priority is "all"', () => {
      expect(filterByPriority(mockTasks, 'all')).toEqual(mockTasks);
    });

    it('should filter by high priority', () => {
      const result = filterByPriority(mockTasks, 'high');
      expect(result.length).toBe(1);
      expect(result[0].priority).toBe('high');
    });

    it('should filter by medium priority', () => {
      const result = filterByPriority(mockTasks, 'medium');
      expect(result.length).toBe(1);
      expect(result[0].priority).toBe('medium');
    });

    it('should filter by low priority', () => {
      const result = filterByPriority(mockTasks, 'low');
      expect(result.length).toBe(1);
      expect(result[0].priority).toBe('low');
    });

    it('should return empty array when no tasks match priority', () => {
      const tasksWithoutLow = mockTasks.filter((t) => t.priority !== 'low');
      expect(filterByPriority(tasksWithoutLow, 'low')).toEqual([]);
    });
  });

  describe('filterByAssignee', () => {
    it('should return all tasks when assignee is "all"', () => {
      expect(filterByAssignee(mockTasks, 'all')).toEqual(mockTasks);
    });

    it('should filter by specific assignee id', () => {
      const aliceTasks = filterByAssignee(mockTasks, 'user1');
      expect(aliceTasks.length).toBe(2);
      aliceTasks.forEach((t) => expect(t.assignee.id).toBe('user1'));
    });

    it('should filter by another assignee id', () => {
      const bobTasks = filterByAssignee(mockTasks, 'user2');
      expect(bobTasks.length).toBe(1);
      expect(bobTasks[0].assignee.id).toBe('user2');
    });

    it('should return empty array when assignee not found', () => {
      expect(filterByAssignee(mockTasks, 'nonexistent')).toEqual([]);
    });
  });

  describe('filterTasksByStatus', () => {
    it('should filter by todo status', () => {
      const todoTasks = filterTasksByStatus(mockTasks, 'todo');
      expect(todoTasks.length).toBe(1);
      expect(todoTasks[0].status).toBe('todo');
    });

    it('should filter by in_progress status', () => {
      const inProgressTasks = filterTasksByStatus(mockTasks, 'in_progress');
      expect(inProgressTasks.length).toBe(1);
      expect(inProgressTasks[0].status).toBe('in_progress');
    });

    it('should filter by done status', () => {
      const doneTasks = filterTasksByStatus(mockTasks, 'done');
      expect(doneTasks.length).toBe(1);
      expect(doneTasks[0].status).toBe('done');
    });

    it('should return empty array when no tasks match status', () => {
      const todoOnlyTasks = mockTasks.filter((t) => t.status === 'todo');
      expect(filterTasksByStatus(todoOnlyTasks, 'done')).toEqual([]);
    });
  });
});
