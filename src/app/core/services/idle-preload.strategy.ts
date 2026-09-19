import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Preload selected lazy routes after the browser is idle.
 * Only routes without `data.preload === false` are preloaded.
 * Uses a long delay to avoid competing with initial page load.
 */
@Injectable({ providedIn: 'root' })
export class IdlePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (route.data && 'preload' in route.data && route.data['preload'] === false) {
      return of(null);
    }

    const doLoad = () => load().subscribe();

    if (typeof requestIdleCallback !== 'undefined') {
      setTimeout(() => {
        requestIdleCallback(doLoad, { timeout: 30000 });
      }, 5000);
    } else {
      setTimeout(doLoad, 5000);
    }

    return of(null);
  }
}
