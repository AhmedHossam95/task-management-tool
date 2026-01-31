import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '../models/tasks.model';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Pipe({
  name: 'dueDateStatus',
})
export class DueDateStatusPipe implements PipeTransform {
  transform(taskDueDate: string | undefined, task: Task | undefined): string {
    if (!taskDueDate || !task) return '';

    if (task.status === 'done') {
      return this.getCompletedStatus(task.completedAt);
    }

    return this.getActiveTaskStatus(taskDueDate);
  }

  private getCompletedStatus(completedAt: string | undefined): string {
    if (!completedAt) return '';

    const daysSince = this.getDaysDifference(new Date(), new Date(completedAt));

    if (daysSince === 0) return '✅ Completed today';
    if (daysSince === 1) return '✅ Completed yesterday';
    return `✅ Completed ${daysSince} days ago`;
  }

  private getActiveTaskStatus(dueDate: string): string {
    const daysUntil = this.getDaysDifference(new Date(dueDate), new Date());

    if (daysUntil < 0) return `⚠ Overdue by ${Math.abs(daysUntil)} days`;
    if (daysUntil === 0) return '📅 Due today';
    if (daysUntil === 1) return '📅 Due tomorrow';
    return `📅 Due in ${daysUntil} days`;
  }

  private getDaysDifference(futureDate: Date, pastDate: Date): number {
    const normalizedFuture = this.normalizeToMidnight(futureDate);
    const normalizedPast = this.normalizeToMidnight(pastDate);

    return Math.floor((normalizedFuture.getTime() - normalizedPast.getTime()) / MS_PER_DAY);
  }

  private normalizeToMidnight(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }
}
