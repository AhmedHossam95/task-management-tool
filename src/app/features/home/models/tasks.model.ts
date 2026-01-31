export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskPriority = 'high' | 'medium' | 'low';

export type Assignee = {
  id: string;
  name: string;
  avatar: string;
  email: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue?: boolean;
  completedAt?: string;
  assignee: Assignee;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  order: number; // Position within status column (0 = top)
};

export type TasksResponse = {
  tasks: Task[];
  meta: {
    totalCount: number;
    lastUpdated: string;
  };
};

/** DTO for creating a new task (without id, createdAt, updatedAt, order) */
export type CreateTaskDto = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>;

/** DTO for updating a task (all fields optional except id) */
export type UpdateTaskDto = Partial<Omit<Task, 'id'>> & { id: string };
