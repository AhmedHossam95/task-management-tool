import { effect, inject, Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Assignee } from '../models/tasks.model';
import { API_URL } from '../../../shared/constants/api.constants';
import { CacheService } from '../../../shared/services/cache.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly cacheService = inject(CacheService);

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

  /**
   * Effect to reload users when cache refresh is triggered
   * Listens to cache service refresh signal for stale-while-revalidate pattern
   */
  private readonly refreshEffect = effect(() => {
    // Trigger when refresh signal changes
    if (this.cacheService.refreshTriggered() > 0) {
      this.usersResource.reload();
    }
  });
}
