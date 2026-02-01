import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { routes } from './app.routes';
import { CustomDateAdapter, DD_MM_YYYY_FORMAT } from './shared/utils/custom-date-adapter';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { LoadingInterceptor } from './shared/interceptors/loading.interceptor';
import { CachingInterceptor } from './shared/interceptors/caching.interceptor';
import { MockDelayInterceptor } from './shared/interceptors/mock-delay.interceptor';

/**
 * Flag to enable mock HTTP delay for development/testing
 * Set to true to add 200ms delay to all HTTP requests
 */
const ENABLE_MOCK_DELAY = true;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        LoadingInterceptor,
        ...(ENABLE_MOCK_DELAY ? [MockDelayInterceptor] : []),
        CachingInterceptor,
      ]),
    ),
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_FORMAT },
    provideCharts(withDefaultRegisterables()),
  ],
};
