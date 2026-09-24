import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { AiService } from '../../features/ai/services/ai.service';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const EXCLUDED = [
  '/auth/',
  '/ai/',
  '/notifications',
  '/assistant-conversations',
];

const DATA_PATHS = [
  '/wellness',
  '/tasks',
  '/events',
  '/planning',
  '/users/me',
  '/reminders',
];

function shouldRefresh(method: string, url: string): boolean {
  if (!MUTATING.has(method.toUpperCase())) {
    return false;
  }
  if (EXCLUDED.some((path) => url.includes(path))) {
    return false;
  }
  return DATA_PATHS.some((path) => url.includes(path));
}

export const analysisRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (!shouldRefresh(req.method, req.url)) {
    return next(req);
  }
  const ai = inject(AiService);
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && event.ok) {
        ai.notifyUserDataChanged();
      }
    }),
  );
};
