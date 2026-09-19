import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Protects authenticated application routes only.
 * Unauthenticated visitors are redirected to the public login page.
 * Public routes must NOT use this guard.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
