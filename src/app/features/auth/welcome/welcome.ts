import { Component, OnDestroy, inject, signal } from '@angular/core';
import {
  LucideBot,
  LucideCalendarDays,
  LucideHeartPulse,
} from '@lucide/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { Button } from '../../../shared/ui/button/button';

const WELCOME_SEEN_KEY = 'entwin.welcomeSeen';

const SLIDES = [
  {
    titleKey: 'welcome.slide1Title',
    bodyKey: 'welcome.slide1Body',
    icon: LucideCalendarDays,
  },
  {
    titleKey: 'welcome.slide2Title',
    bodyKey: 'welcome.slide2Body',
    icon: LucideHeartPulse,
  },
  {
    titleKey: 'welcome.slide3Title',
    bodyKey: 'welcome.slide3Body',
    icon: LucideBot,
  },
] as const;

@Component({
  selector: 'app-welcome',
  imports: [Button, LucideCalendarDays, LucideHeartPulse, LucideBot],
  template: `
    <section class="relative flex min-h-dvh flex-col overflow-hidden bg-background px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div class="pointer-events-none absolute -top-24 -end-16 h-64 w-64 rounded-full bg-teal-100/80"></div>
      <div class="pointer-events-none absolute -bottom-20 -start-16 h-56 w-56 rounded-full bg-navy-100/80"></div>

      @if (phase() === 'splash') {
        <div class="relative flex flex-1 flex-col items-center justify-center text-center">
          <span class="flex h-24 w-24 items-center justify-center rounded-[28px] bg-surface shadow-card ring-1 ring-line">
            <img src="brand/logo-mark.png" alt="" class="h-14 w-14" />
          </span>
          <h1 class="mt-7 font-display text-3xl font-semibold tracking-tight text-primary">Digital Life Twin</h1>
          <p class="mt-2 text-sm text-ink-muted">{{ splashSubtitle() }}</p>
        </div>
      } @else {
        <div class="relative flex flex-1 flex-col">
          <div class="flex justify-end pt-4">
            <button type="button" class="rounded-full px-3 py-1.5 text-sm font-semibold text-ink-muted" (click)="finish()">
              {{ skip() }}
            </button>
          </div>
          <div class="flex flex-1 flex-col items-center justify-center text-center">
            <span class="flex h-28 w-28 items-center justify-center rounded-[32px] bg-surface text-accent-dark shadow-card ring-1 ring-line">
              @switch (index()) {
                @case (0) { <svg lucideCalendarDays class="h-12 w-12" aria-hidden="true"></svg> }
                @case (1) { <svg lucideHeartPulse class="h-12 w-12" aria-hidden="true"></svg> }
                @default { <svg lucideBot class="h-12 w-12" aria-hidden="true"></svg> }
              }
            </span>
            <h2 class="mt-10 max-w-xs font-display text-3xl font-semibold tracking-tight text-primary">{{ title() }}</h2>
            <p class="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">{{ body() }}</p>
          </div>
          <div class="flex items-center justify-center gap-2 pb-6">
            @for (slide of slides; track slide.titleKey; let i = $index) {
              <span
                class="h-1.5 rounded-full transition-all duration-200"
                [class.w-7]="i === index()"
                [class.bg-accent]="i === index()"
                [class.w-1.5]="i !== index()"
                [class.bg-line-strong]="i !== index()"
              ></span>
            }
          </div>
          <button appButton variant="primary" size="lg" class="mb-6 w-full" type="button" (click)="next()">
            {{ index() === slides.length - 1 ? start() : nextLabel() }}
          </button>
        </div>
      }
    </section>
  `,
})
export class WelcomeComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  private timer = 0;

  protected readonly slides = SLIDES;
  protected readonly phase = signal<'splash' | 'slides'>('splash');
  protected readonly index = signal(0);
  protected readonly splashSubtitle = this.language.translateSignal('welcome.splashSubtitle');
  protected readonly skip = this.language.translateSignal('welcome.skip');
  protected readonly nextLabel = this.language.translateSignal('welcome.next');
  protected readonly start = this.language.translateSignal('welcome.start');

  protected readonly title = () => this.language.translate<string>(SLIDES[this.index()].titleKey);
  protected readonly body = () => this.language.translate<string>(SLIDES[this.index()].bodyKey);

  constructor() {
    this.timer = window.setTimeout(() => this.afterSplash(), 1200);
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.timer);
  }

  protected next(): void {
    if (this.index() < SLIDES.length - 1) {
      this.index.update((value) => value + 1);
      return;
    }
    this.finish();
  }

  protected finish(): void {
    localStorage.setItem(WELCOME_SEEN_KEY, '1');
    void this.router.navigateByUrl('/login');
  }

  private afterSplash(): void {
    if (this.auth.currentUser()) {
      void this.router.navigateByUrl(this.auth.afterAuthPath());
      return;
    }
    if (localStorage.getItem(WELCOME_SEEN_KEY) === '1') {
      void this.router.navigateByUrl('/login');
      return;
    }
    this.phase.set('slides');
  }
}
