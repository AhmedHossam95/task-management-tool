import { CreateTaskDto, Task, TaskStatus } from '../models/tasks.model';
import { TASK_STATUS } from '../constants/tasks.constants';

/**
 * Gets additional field updates required when transitioning to a new status
 * Encapsulates business logic for status changes (e.g., marking task as completed)
 * @param newStatus - The target status
 * @returns Partial task object with required field updates
 */
export function getStatusTransitionUpdates(newStatus: TaskStatus): Partial<Task> {
  if (newStatus === TASK_STATUS.DONE) {
    return {
      completedAt: new Date().toISOString(),
      isOverdue: false,
    };
  }
  return {};
}

/**
 * Generates a unique task ID
 * @returns A unique string identifier for a task
 */
export function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Creates a timestamp in ISO format for the current moment
 * @returns ISO formatted timestamp string
 */
export function createTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Builds a complete Task object from CreateTaskDto
 * @param taskData - The DTO containing task creation data
 * @returns A complete Task object ready for persistence
 */
export function buildNewTask(taskData: CreateTaskDto): Task {
  const now = createTimestamp();
  return {
    ...taskData,
    id: generateTaskId(),
    createdAt: now,
    updatedAt: now,
    order: 0, // New tasks are placed at the top
  };
}

/**
 * Creates an update payload with updatedAt timestamp
 * @param updates - Partial task updates
 * @returns Updates with updatedAt field added
 */
export function withUpdatedTimestamp<T extends object>(updates: T): T & { updatedAt: string } {
  return {
    ...updates,
    updatedAt: createTimestamp(),
  };
}
