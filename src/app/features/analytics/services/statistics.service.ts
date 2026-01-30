import { computed, inject, Injectable, Signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Statistic } from '../models/statistics.model';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { API_URL } from '../../../shared/constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private readonly http = inject(HttpClient);

  /**
   * httpResource for fetching statistics with automatic loading states
   * Provides: value(), isLoading(), error(), reload()
   */
  readonly statisticsResource = httpResource<Statistic[]>(() => ({
    url: API_URL.STATISTICS,
    method: 'GET',
  }));

  /** Computed signal for statistics array */
  readonly statistics = computed(() => this.statisticsResource.value() ?? []);

  /** Get statistic by id */
  getStatisticById(id: string): Signal<Statistic | undefined> {
    return computed(() => this.statistics().find((stat) => stat.id === id));
  }

  /** Get statistic by title */
  getStatisticByTitle(title: string): Signal<Statistic | undefined> {
    return computed(() => this.statistics().find((stat) => stat.title === title));
  }

  /** Reload statistics data */
  reload(): void {
    this.statisticsResource.reload();
  }

  /**
   * Error handler for HTTP operations
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error('StatisticsService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Fetch statistics with retry logic (alternative to httpResource)
   */
  fetchStatisticsWithRetry(): Observable<Statistic[]> {
    return this.http
      .get<Statistic[]>(API_URL.STATISTICS)
      .pipe(retry({ count: 3, delay: 1000 }), catchError(this.handleError.bind(this)));
  }
}
