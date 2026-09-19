import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { BrandLogo } from '../../../../shared/components/brand-logo/brand-logo';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-public-footer',
  template: `
    <footer class="border-t border-white/10 bg-primary-darker text-white">
      <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div class="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <app-brand-logo tone="light" />
            <p class="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              {{ description() }}
            </p>
          </div>

          <nav [attr.aria-label]="platformLabel()">
            <h3 class="text-sm font-semibold tracking-wide text-white">{{ platformLabel() }}</h3>
            <ul class="mt-4 space-y-2.5">
              @for (link of platformLinks(); track link.path) {
                <li>
                  <a
                    [routerLink]="link.path"
                    class="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </nav>

          <nav [attr.aria-label]="getStartedLabel()">
            <h3 class="text-sm font-semibold tracking-wide text-white">{{ getStartedLabel() }}</h3>
            <ul class="mt-4 space-y-2.5">
              @for (link of startLinks(); track link.path) {
                <li>
                  <a
                    [routerLink]="link.path"
                    class="group inline-flex items-center gap-1 text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {{ link.label }}
                    <svg
                      lucideArrowRight
                      class="mirror-rtl h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0 rtl:group-hover:-translate-x-0 group-hover:opacity-100"
                      aria-hidden="true"
                    ></svg>
                  </a>
                </li>
              }
            </ul>
          </nav>
        </div>

        <div
          class="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-xs text-white/60">{{ copyright() }}</p>
          <p class="max-w-md text-xs leading-relaxed text-white/60">
            {{ disclaimer() }}
          </p>
        </div>
      </div>
    </footer>
  `,
  imports: [RouterLink, BrandLogo, LucideArrowRight],
})
export class PublicFooter {
  private readonly languageService = inject(LanguageService);

  protected readonly description = this.languageService.translateSignal('public.footer.description');
  protected readonly platformLabel = this.languageService.translateSignal('public.footer.platform');
  protected readonly getStartedLabel = this.languageService.translateSignal('public.footer.getStarted');
  protected readonly disclaimer = this.languageService.translateSignal('public.footer.disclaimer');

  protected readonly platformLinks = this.languageService.translateArray([
    { labelKey: 'public.nav.features', path: '/features' },
    { labelKey: 'public.nav.about', path: '/about' },
    { labelKey: 'public.nav.contact', path: '/contact' },
  ]);

  protected readonly startLinks = this.languageService.translateArray([
    { labelKey: 'public.footer.login', path: '/login' },
    { labelKey: 'public.footer.createAccount', path: '/register' },
    { labelKey: 'public.footer.home', path: '/' },
  ]);

  protected readonly copyright = this.languageService.translateSignal('public.footer.copyright', {
    year: String(new Date().getFullYear()),
  });
}
