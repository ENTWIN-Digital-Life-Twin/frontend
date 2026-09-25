import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { LanguageService } from '../services/language.service';

/**
 * Protects authenticated application routes only.
 * Unauthenticated visitors are redirected to the public login page.
 * Public routes must NOT use this guard.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const languageService = inject(LanguageService);
  const router = inject(Router);

  if (!authService.currentUser()) {
    return router.createUrlTree(['/login']);
  }

  return languageService.ensureActiveLanguageLoaded().then(() => true);
};
