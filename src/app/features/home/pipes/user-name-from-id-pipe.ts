import { Pipe, PipeTransform } from '@angular/core';
import { Assignee } from '../models/tasks.model';

@Pipe({
  name: 'userNameFromId',
})
export class UserNameFromIdPipe implements PipeTransform {
  transform(userId: string | undefined, users: Assignee[]): string {
    if (!userId || !users?.length) return '';
    const user = users.find((u) => u.id === userId);
    return user?.name ?? '';
  }
}
