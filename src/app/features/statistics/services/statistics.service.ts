import { computed, Injectable, Signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

import { API_URL } from '../../../shared/constants/api.constants';
import { Statistic } from '../models/statistics.model';

/**
 * Service responsible for fetching and providing access to statistics data.
 * Uses Angular's httpResource for automatic loading state management and signal-based reactivity.
 */
@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  /**
   * HTTP resource for fetching statistics.
   */
  private readonly statisticsResource = httpResource<Statistic[]>(() => ({
    url: API_URL.STATISTICS,
    method: 'GET',
  }));

  /**
   * Computed signal providing the statistics array.
   * Returns empty array when data is not yet loaded.
   */
  readonly statistics: Signal<Statistic[]> = computed(() => this.statisticsResource.value() ?? []);
}
