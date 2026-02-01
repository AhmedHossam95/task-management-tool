import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';
import { SKIP_LOADING } from '../constants/http.constants';

export function LoadingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  console.log('LoadingInterceptor', req.context.get(SKIP_LOADING));
  // Skip loading state for background requests (stale-while-revalidate background fetches)
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  loadingService.startRequest();
  return next(req).pipe(
    finalize(() => {
      loadingService.finishRequest();
    }),
  );
}
