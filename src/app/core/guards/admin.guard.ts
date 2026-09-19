import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

/**
 * Role guard for administrative routes.
 * Unauthenticated visitors go to /login.
 * Authenticated non-admin users are redirected to the dashboard.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  if (user.role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
