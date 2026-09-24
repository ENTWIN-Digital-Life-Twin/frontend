import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth/auth.service';
import { TokenStorageService } from '../services/auth/token-storage.service';

const API_URLS = [environment.authApiUrl, environment.planningApiUrl, environment.wellnessApiUrl];
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

function isApiRequest(url: string): boolean {
  return API_URLS.some((base) => url.startsWith(base));
}

function isPublicPath(url: string): boolean {
  return PUBLIC_PATHS.some((path) => url.includes(path));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!isApiRequest(req.url) || isPublicPath(req.url)) {
    return next(req);
  }

  const accessToken = tokenStorage.getAccessToken();
  const authedReq = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && accessToken) {
        return authService.refresh().pipe(
          switchMap((newAccessToken) =>
            next(req.clone({ setHeaders: { Authorization: `Bearer ${newAccessToken}` } })),
          ),
          catchError((refreshError) => {
            authService.clearSession();
            void router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
