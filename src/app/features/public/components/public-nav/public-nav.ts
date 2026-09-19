import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideArrowRight, LucideMenu, LucideX } from '@lucide/angular';
import { BrandLogo } from '../../../../shared/components/brand-logo/brand-logo';
import { LanguageSelector } from '../../../../shared/components/language-selector/language-selector';
import { Button } from '../../../../shared/ui/button/button';
import { LanguageService } from '../../../../core/services/language.service';

interface PublicLink {
  labelKey: string;
  path: string;
}

const LINKS: PublicLink[] = [
  { labelKey: 'public.nav.home', path: '/' },
  { labelKey: 'public.nav.features', path: '/features' },
  { labelKey: 'public.nav.about', path: '/about' },
  { labelKey: 'public.nav.contact', path: '/contact' },
];

@Component({
  selector: 'app-public-nav',
  template: `
    <header
      class="fixed inset-x-0 top-0 z-50 border-b transition-all duration-300"
      [class.border-white/10]="scrolled()"
      [class.bg-primary-darker/90]="scrolled()"
      [class.backdrop-blur-md]="scrolled()"
      [class.shadow-soft]="scrolled()"
      [class.border-transparent]="!scrolled()"
      [class.bg-transparent]="!scrolled()"
    >
      <div class="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <div class="flex w-full items-center justify-between lg:justify-start lg:gap-x-6">
          <app-brand-logo tone="light" size="md" [subtitleHidden]="true" />

          <nav class="hidden flex-1 items-center justify-center gap-1 lg:flex" [attr.aria-label]="primaryNavLabel()">
            @for (link of links(); track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-white/10 text-white"
                [routerLinkActiveOptions]="{ exact: true }"
                class="rounded-panel px-3.5 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
              >
                {{ link.label }}
              </a>
            }
          </nav>

          <div class="hidden items-center gap-2 lg:flex">
            <app-language-selector tone="dark" />

            <a
              routerLink="/login"
              class="rounded-panel px-3 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white"
            >
              {{ loginLabel() }}
            </a>
            <a routerLink="/register" class="group inline-flex h-9 items-center gap-1.5 rounded-panel bg-accent-dark px-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-accent-darker active:scale-[0.98]">
              {{ registerLabel() }}
              <svg lucideArrowRight class="mirror-rtl h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden="true"></svg>
            </a>
          </div>

          <button
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 active:bg-white/15 lg:hidden"
            (click)="menuOpen.set(!menuOpen())"
            [attr.aria-expanded]="menuOpen()"
            [attr.aria-label]="menuOpen() ? closeMenuLabel() : openMenuLabel()"
          >
            @if (menuOpen()) {
              <svg lucideX class="h-5 w-5" aria-hidden="true"></svg>
            } @else {
              <svg lucideMenu class="h-5 w-5" aria-hidden="true"></svg>
            }
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <nav
          class="border-t border-white/10 bg-primary-darker/95 px-5 pb-6 pt-4 backdrop-blur-md lg:hidden"
          [attr.aria-label]="mobileNavLabel()"
        >
          <div class="flex flex-col gap-1">
            @for (link of links(); track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-white/10 text-white"
                [routerLinkActiveOptions]="{ exact: true }"
                class="rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                (click)="menuOpen.set(false)"
              >
                {{ link.label }}
              </a>
            }
          </div>
          <div class="mt-5">
            <p class="mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
              {{ languageLabel() }}
            </p>
            <div class="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              @for (lang of languageOptions; track lang.code) {
                <button
                  type="button"
                  class="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors duration-200"
                  [class.bg-accent]="isActive(lang.code)"
                  [class.text-white]="isActive(lang.code)"
                  [class.text-white/70]="!isActive(lang.code)"
                  [attr.aria-pressed]="isActive(lang.code)"
                  (click)="selectLanguage(lang.code)"
                >
                  <span class="text-sm leading-none" aria-hidden="true">{{ lang.flag }}</span>
                  <span class="uppercase tracking-wide">{{ lang.code }}</span>
                </button>
              }
            </div>
          </div>
          <div class="mt-5 flex flex-col gap-3">
            <button appButton variant="outline" class="h-11 w-full border-white/25 text-white hover:bg-white/10 hover:text-white" routerLink="/login">
              {{ loginLabel() }}
            </button>
            <button appButton variant="accent" class="h-11 w-full" routerLink="/register">
              {{ registerLabel() }}
            </button>
          </div>
        </nav>
      }
    </header>
  `,
  imports: [
    RouterLink,
    RouterLinkActive,
    BrandLogo,
    LanguageSelector,
    Button,
    LucideMenu,
    LucideX,
    LucideArrowRight,
  ],
})
export class PublicNav {
  private readonly languageService = inject(LanguageService);

  protected readonly links = computed(() =>
    LINKS.map((link) => ({
      path: link.path,
      label: this.languageService.translate<string>(link.labelKey),
    })),
  );

  protected readonly loginLabel = this.languageService.translateSignal('public.nav.login');
  protected readonly registerLabel = this.languageService.translateSignal('public.nav.register');
  protected readonly openMenuLabel = this.languageService.translateSignal('public.nav.openMenu');
  protected readonly closeMenuLabel = this.languageService.translateSignal('public.nav.closeMenu');
  protected readonly primaryNavLabel = this.languageService.translateSignal('public.nav.primary');
  protected readonly mobileNavLabel = this.languageService.translateSignal('public.nav.mobile');
  protected readonly languageLabel = this.languageService.translateSignal('header.language');
  protected readonly languageOptions = this.languageService.languageOptions;

  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);

  protected isActive(lang: 'fr' | 'en' | 'ar'): boolean {
    return this.languageService.activeLanguage() === lang;
  }

  protected selectLanguage(lang: 'fr' | 'en' | 'ar'): void {
    this.languageService.setLanguage(lang);
    this.menuOpen.set(false);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }
}
