import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, type ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService, type SeoConfig } from './core/services/seo/seo.service';
import { LanguageService } from './core/services/language.service';
import { requestNotificationPermission } from './core/services/notifications/notification-permission';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly languageService = inject(LanguageService);

  readonly routeLoading = signal(!this.router.navigated);

  protected readonly loadingTitle = computed(() => {
    const value = this.languageService.translate<string>('app.loadingTitle');
    return value === 'app.loadingTitle' ? 'Digital Life Twin' : value;
  });

  protected readonly loadingLabel = computed(() => {
    const value = this.languageService.translate<string>('app.loadingLabel');
    return value === 'app.loadingLabel' ? 'Chargement de votre espace…' : value;
  });

  constructor() {
    void requestNotificationPermission();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.routeLoading.set(false);
        this.applySeo();
      });
  }

  /**
   * Merges `data.seo` from the root route down to the leaf, then applies it.
   * Parent-level settings (e.g. noindex on the authenticated shell) therefore
   * propagate to every child route.
   */
  private applySeo(): void {
    let route: ActivatedRoute | null = this.router.routerState.root;
    const merged: Record<string, unknown> = {};
    while (route) {
      Object.assign(merged, route.snapshot.data['seo'] ?? {});
      route = route.firstChild;
    }
    this.seo.apply(merged as SeoConfig);
  }
}
