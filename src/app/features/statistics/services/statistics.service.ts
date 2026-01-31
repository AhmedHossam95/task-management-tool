import { computed, effect, Injectable, linkedSignal, Signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

import { API_URL } from '../../../shared/constants/api.constants';
import { Statistic } from '../models/statistics.model';

/**
 * Service responsible for fetching and providing access to statistics data.
 * Follows Single Responsibility Principle - only handles statistics data access.
 *
 * Uses Angular's httpResource for:
 * - Automatic loading state management
 * - Built-in error handling
 * - Signal-based reactivity
 */
@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  /**
   * HTTP resource for fetching statistics with automatic loading states.
   * Provides: value(), isLoading(), error(), reload()
   */
  readonly statisticsResource = httpResource<Statistic[]>(() => ({
    url: API_URL.STATISTICS,
    method: 'GET',
  }));

  /**
   * Computed signal providing the statistics array.
   * Returns empty array when data is not yet loaded.
   */
  readonly statistics: Signal<Statistic[]> = computed(() => this.statisticsResource.value() ?? []);

  /**
   * Signal indicating whether statistics are currently being loaded.
   */
  readonly isLoading: Signal<boolean> = computed(() => this.statisticsResource.isLoading());

  /**
   * Signal containing any error that occurred during fetch.
   */
  readonly error: Signal<Error | undefined> = computed(() => this.statisticsResource.error());

  constructor() {
    effect(() => {
      console.log(this.statisticsResource.value(), 'statistics');
    });
  }

  /**
   * Creates a computed signal that finds a statistic by its ID.
   *
   * @param id - The unique identifier of the statistic
   * @returns A signal that emits the found statistic or undefined
   */
  selectById(id: string): Signal<Statistic | undefined> {
    return computed(() => this.statistics().find((stat) => stat.id === id));
  }

  /**
   * Creates a computed signal that finds a statistic by its title.
   *
   * @param title - The title of the statistic to find
   * @returns A signal that emits the found statistic or undefined
   */
  selectByTitle(title: string): Signal<Statistic | undefined> {
    return computed(() => this.statistics().find((stat) => stat.title === title));
  }

  /**
   * Creates a computed signal that finds statistics matching a predicate.
   *
   * @param predicate - Function to test each statistic
   * @returns A signal that emits the filtered statistics array
   */
  selectWhere(predicate: (stat: Statistic) => boolean): Signal<Statistic[]> {
    return computed(() => this.statistics().filter(predicate));
  }

  /**
   * Triggers a reload of the statistics data.
   */
  reload(): void {
    this.statisticsResource.reload();
  }
}
