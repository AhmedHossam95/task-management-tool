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
 * Formats a date to YYYY-MM-DD format for backend compatibility
 * @param date - Date object or string to format
 * @returns Date string in YYYY-MM-DD format, or empty string if invalid
 */
export function formatDateForBackend(date: Date | string | null | undefined): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD formatted string from backend to a Date object
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object, or null if invalid
 */
export function parseDateFromBackend(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;

  // Validate format (YYYY-MM-DD)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateString)) return null;

  const [year, month, day] = dateString.split('-').map(Number);

  // Create date object (month is 0-indexed in JavaScript)
  const dateObj = new Date(year, month - 1, day);

  // Validate that the date is valid (e.g., not 2024-02-30)
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return null;
  }

  return dateObj;
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
