import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { isNativeApp } from '../platform';

const PUBLIC_ON_MOBILE = new Set(['/terms', '/privacy']);

/** On the phone, skip the marketing site and open the app start screen. */
export const nativeMarketingGuard: CanActivateFn = (_route, state) => {
  if (!isNativeApp()) {
    return true;
  }
  const path = state.url.split('?')[0] || '/';
  if (PUBLIC_ON_MOBILE.has(path)) {
    return true;
  }
  return inject(Router).createUrlTree(['/start']);
};
