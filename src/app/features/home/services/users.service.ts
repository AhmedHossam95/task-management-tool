import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Assignee } from '../models/tasks.model';
import { API_URL } from '../../../shared/constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  /**
   * httpResource for fetching users with automatic loading states
   * Provides: value(), isLoading(), error(), reload()
   */
  readonly usersResource = httpResource<Assignee[]>(() => ({
    url: API_URL.USERS,
    method: 'GET',
  }));

  /** Computed signal for users array (read-only) */
  readonly users = this.usersResource.value.asReadonly();
}
