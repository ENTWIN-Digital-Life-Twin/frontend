import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { BrandLogo } from '../../../../shared/components/brand-logo/brand-logo';
import { LanguageSelector } from '../../../../shared/components/language-selector/language-selector';
import { AuthBrandPanel } from '../auth-brand-panel/auth-brand-panel';
import { AuthFooter } from '../auth-footer/auth-footer';

@Component({
  selector: 'app-auth-shell',
  template: `
    <div class="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div class="relative flex min-h-dvh flex-col">
        <div
          class="pointer-events-none absolute inset-0 hidden bg-grid lg:block"
          aria-hidden="true"
        ></div>

        <header class="relative z-10 flex h-16 items-center justify-between gap-2 px-5 sm:px-8 lg:px-12">
          <a
            routerLink="/"
            class="group inline-flex shrink-0 items-center gap-1.5 rounded-panel px-1.5 py-1 text-sm font-medium text-ink-muted transition-colors duration-200 hover:text-primary"
            [attr.aria-label]="backHome()"
          >
            <svg
              lucideArrowLeft
              class="mirror-rtl h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
              aria-hidden="true"
            ></svg>
            <span class="hidden sm:inline">{{ backHome() }}</span>
          </a>

          <span
            class="pointer-events-none absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden"
            aria-hidden="true"
          >
            <app-brand-logo tone="dark" size="sm" [subtitleHidden]="true" />
          </span>

          <div class="shrink-0">
            <app-language-selector />
          </div>
        </header>

        <main class="relative flex flex-1 items-center justify-center px-4 py-6 sm:px-8 lg:px-12">
          <ng-content />
        </main>

        <div class="relative z-10 px-4 pb-6 pt-2 sm:px-8 lg:px-12">
          <app-auth-footer />
        </div>
      </div>

      <app-auth-brand-panel />
    </div>
  `,
  imports: [
    RouterLink,
    BrandLogo,
    LanguageSelector,
    AuthBrandPanel,
    AuthFooter,
    LucideArrowLeft,
  ],
})
export class AuthShell {
  private readonly languageService = inject(LanguageService);

  protected readonly backHome = this.languageService.translateSignal('auth.shell.backHome');
}
