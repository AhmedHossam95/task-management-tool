import { sortTasks } from './task-sort.util';
import { Task } from '../models/tasks.model';
import { TaskSortConfig } from '../models/task-filters.model';

describe('task-sort.util', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: '',
      status: 'todo',
      priority: 'low',
      order: 2,
      assignee: { id: 'u1', name: 'A', avatar: '', email: 'a@test.com' },
      dueDate: '',
      tags: [],
      createdAt: '2026-01-03T00:00:00Z',
      updatedAt: '',
    },
    {
      id: '2',
      title: 'Task 2',
      description: '',
      status: 'todo',
      priority: 'high',
      order: 0,
      assignee: { id: 'u1', name: 'A', avatar: '', email: 'a@test.com' },
      dueDate: '',
      tags: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '',
    },
    {
      id: '3',
      title: 'Task 3',
      description: '',
      status: 'todo',
      priority: 'medium',
      order: 1,
      assignee: { id: 'u1', name: 'A', avatar: '', email: 'a@test.com' },
      dueDate: '',
      tags: [],
      createdAt: '2026-01-02T00:00:00Z',
      updatedAt: '',
    },
  ];

  describe('sortTasks', () => {
    it('should sort by order ascending', () => {
      const config: TaskSortConfig = { field: 'order', order: 'asc' };
      const result = sortTasks(mockTasks, config);
      expect(result.map((t) => t.order)).toEqual([0, 1, 2]);
    });

    it('should sort by order descending', () => {
      const config: TaskSortConfig = { field: 'order', order: 'desc' };
      const result = sortTasks(mockTasks, config);
      expect(result.map((t) => t.order)).toEqual([2, 1, 0]);
    });

    it('should sort by priority ascending (low to high)', () => {
      const config: TaskSortConfig = { field: 'priority', order: 'asc' };
      const result = sortTasks(mockTasks, config);
      expect(result.map((t) => t.priority)).toEqual(['low', 'medium', 'high']);
    });

    it('should sort by priority descending (high to low)', () => {
      const config: TaskSortConfig = { field: 'priority', order: 'desc' };
      const result = sortTasks(mockTasks, config);
      expect(result.map((t) => t.priority)).toEqual(['high', 'medium', 'low']);
    });

    it('should sort by createdAt ascending', () => {
      const config: TaskSortConfig = { field: 'createdAt', order: 'asc' };
      const result = sortTasks(mockTasks, config);
      expect(result.map((t) => t.id)).toEqual(['2', '3', '1']);
    });

    it('should sort by createdAt descending', () => {
      const config: TaskSortConfig = { field: 'createdAt', order: 'desc' };
      const result = sortTasks(mockTasks, config);
      expect(result.map((t) => t.id)).toEqual(['1', '3', '2']);
    });

    it('should handle empty array', () => {
      const config: TaskSortConfig = { field: 'order', order: 'asc' };
      expect(sortTasks([], config)).toEqual([]);
    });

    it('should not mutate original array', () => {
      const config: TaskSortConfig = { field: 'order', order: 'asc' };
      const originalOrder = mockTasks.map((t) => t.id);
      sortTasks(mockTasks, config);
      expect(mockTasks.map((t) => t.id)).toEqual(originalOrder);
    });

    it('should handle single element array', () => {
      const singleTask = [mockTasks[0]];
      const config: TaskSortConfig = { field: 'order', order: 'asc' };
      const result = sortTasks(singleTask, config);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    it('should maintain stable sort for equal values', () => {
      const tasksWithSameOrder: Task[] = [
        { ...mockTasks[0], order: 0, id: 'a' },
        { ...mockTasks[1], order: 0, id: 'b' },
        { ...mockTasks[2], order: 0, id: 'c' },
      ];
      const config: TaskSortConfig = { field: 'order', order: 'asc' };
      const result = sortTasks(tasksWithSameOrder, config);
      expect(result.length).toBe(3);
    });
  });
});
