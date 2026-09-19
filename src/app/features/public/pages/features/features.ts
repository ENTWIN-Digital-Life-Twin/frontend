import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBell,
  LucideBrain,
  LucideCalendarDays,
  LucideCheck,
  LucideDumbbell,
  LucideHeartPulse,
  LucideLayoutDashboard,
  LucideSparkles,
  LucideTrendingUp,
  LucideUtensils,
} from '@lucide/angular';
import { Reveal } from '../../../../shared/directives/reveal/reveal';
import { LanguageService } from '../../../../core/services/language.service';

interface Feature {
  id: string;
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
}

const WEEKLY_BARS = [45, 68, 58, 82, 64, 90, 74];

@Component({
  selector: 'app-features',
  template: `
    <section class="relative overflow-hidden bg-primary-darker text-white">
      <div class="absolute inset-0 bg-grid-light opacity-40" aria-hidden="true"></div>
      <div
        class="animate-glow-pulse pointer-events-none absolute -left-32 top-[-8rem] h-96 w-96 rounded-full bg-accent/25 blur-[120px]"
        aria-hidden="true"
      ></div>
      <div class="relative mx-auto max-w-7xl px-4 pb-20 pt-36 sm:px-6 lg:px-8 lg:pb-24 lg:pt-44">
        <div class="mx-auto max-w-3xl text-center" appReveal>
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-teal-200">
            <svg lucideSparkles class="h-3.5 w-3.5 text-accent-lighter" aria-hidden="true"></svg>
            {{ badge() }}
          </span>
          <h1 class="mt-6 font-display text-display leading-[1.05] tracking-tight text-white">
            {{ titleA() }} <span class="text-gradient-light">{{ titleB() }}</span>
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-white/70">
            {{ description() }}
          </p>
        </div>

        <nav class="mt-12 flex justify-center gap-2.5 overflow-x-auto pb-2 no-scrollbar" [attr.aria-label]="navAria()">
          @for (feature of features(); track feature.id) {
            <a
              href="#{{ feature.id }}"
              class="shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur transition-colors duration-200 hover:bg-white/10 hover:text-white"
            >
              {{ feature.title }}
            </a>
          }
        </nav>
      </div>
    </section>

    <section class="mx-auto max-w-7xl space-y-24 px-4 py-24 sm:px-6 lg:px-8 lg:space-y-32 lg:py-32">
      @for (feature of features(); track feature.id; let index = $index) {
        <article
          id="{{ feature.id }}"
          class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
          aria-labelledby="feature-title-{{ feature.id }}"
        >
          <div appReveal [class.lg:order-2]="index % 2 === 1">
            <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-sm">
              @switch (feature.icon) {
                @case ('calendarDays') {
                  <svg lucideCalendarDays class="h-6 w-6" aria-hidden="true"></svg>
                }
                @case ('layoutDashboard') {
                  <svg lucideLayoutDashboard class="h-6 w-6" aria-hidden="true"></svg>
                }
                @case ('heartPulse') {
                  <svg lucideHeartPulse class="h-6 w-6" aria-hidden="true"></svg>
                }
                @case ('utensils') {
                  <svg lucideUtensils class="h-6 w-6" aria-hidden="true"></svg>
                }
                @case ('dumbbell') {
                  <svg lucideDumbbell class="h-6 w-6" aria-hidden="true"></svg>
                }
                @case ('bell') {
                  <svg lucideBell class="h-6 w-6" aria-hidden="true"></svg>
                }
                @case ('brain') {
                  <svg lucideBrain class="h-6 w-6" aria-hidden="true"></svg>
                }
              }
            </span>
            <p class="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">
              {{ feature.eyebrow }}
            </p>
            <h2 id="feature-title-{{ feature.id }}" class="mt-2 font-display text-h1 tracking-tight text-primary">
              {{ feature.title }}
            </h2>
            <p class="mt-4 text-body-lg leading-relaxed text-ink-muted">{{ feature.description }}</p>
            <ul class="mt-7 space-y-3">
              @for (point of feature.points; track point) {
                <li class="flex items-start gap-3">
                  <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-accent-dark">
                    <svg lucideCheck class="h-3.5 w-3.5" stroke-width="3" aria-hidden="true"></svg>
                  </span>
                  <span class="text-sm leading-relaxed text-ink">{{ point }}</span>
                </li>
              }
            </ul>
          </div>

          <div appReveal class="relative overflow-x-clip" [class.lg:order-1]="index % 2 === 1" aria-hidden="true">
            <div class="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/5 to-accent/10 blur-2xl"></div>
            <div class="relative rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
              <div class="flex items-center justify-between">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  @switch (feature.icon) {
                    @case ('calendarDays') {
                      <svg lucideCalendarDays class="h-5 w-5" aria-hidden="true"></svg>
                    }
                    @case ('layoutDashboard') {
                      <svg lucideLayoutDashboard class="h-5 w-5" aria-hidden="true"></svg>
                    }
                    @case ('heartPulse') {
                      <svg lucideHeartPulse class="h-5 w-5" aria-hidden="true"></svg>
                    }
                    @case ('utensils') {
                      <svg lucideUtensils class="h-5 w-5" aria-hidden="true"></svg>
                    }
                    @case ('dumbbell') {
                      <svg lucideDumbbell class="h-5 w-5" aria-hidden="true"></svg>
                    }
                    @case ('bell') {
                      <svg lucideBell class="h-5 w-5" aria-hidden="true"></svg>
                    }
                    @case ('brain') {
                      <svg lucideBrain class="h-5 w-5" aria-hidden="true"></svg>
                    }
                  }
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-accent-dark">
                  <svg lucideTrendingUp class="h-3.5 w-3.5" aria-hidden="true"></svg>
                  {{ preview() }}
                </span>
              </div>
              <p class="mt-5 font-display text-lg font-semibold tracking-tight text-primary">
                {{ feature.title }}
              </p>
              <div class="mt-5 flex h-28 items-end gap-2">
                @for (height of weeklyBars; track $index) {
                  <div
                    class="flex-1 rounded-t-md bg-gradient-to-t from-primary/15 to-accent/70"
                    [style.height.%]="height"
                  ></div>
                }
              </div>
              <div class="mt-5 space-y-2.5">
                @for (point of feature.points; track point) {
                  <div class="flex items-center gap-2.5">
                    <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
                    <span class="h-2 flex-1 rounded-full bg-surface-strong"></span>
                  </div>
                }
              </div>
            </div>
          </div>
        </article>
      }
    </section>

    <section class="relative overflow-hidden" aria-labelledby="features-cta-title">
      <div class="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div appReveal class="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-darker via-primary to-primary-dark px-6 py-16 text-center shadow-card-hover sm:px-12">
          <div class="absolute inset-0 bg-grid-light opacity-40" aria-hidden="true"></div>
          <div class="animate-glow-pulse pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-[100px]" aria-hidden="true"></div>
          <div class="relative mx-auto max-w-xl">
            <h2 id="features-cta-title" class="font-display text-h1 tracking-tight text-white">
              {{ ctaTitle() }}
            </h2>
            <p class="mx-auto mt-4 max-w-lg text-body-lg leading-relaxed text-white/70">
              {{ ctaDescription() }}
            </p>
            <a routerLink="/register" class="group mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-panel bg-accent-dark px-7 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:bg-accent-darker active:scale-[0.98]">
              {{ ctaPrimary() }}
              <svg lucideArrowRight class="mirror-rtl h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden="true"></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  imports: [
    RouterLink,
    Reveal,
    LucideArrowRight,
    LucideBell,
    LucideBrain,
    LucideCalendarDays,
    LucideCheck,
    LucideDumbbell,
    LucideHeartPulse,
    LucideLayoutDashboard,
    LucideSparkles,
    LucideTrendingUp,
    LucideUtensils,
  ],
})
export class FeaturesComponent {
  private readonly languageService = inject(LanguageService);

  private readonly tr = <T = string>(key: string): T => this.languageService.translate<T>(key);
  private readonly trSignal = (key: string) => this.languageService.translateSignal(key);

  protected readonly badge = this.trSignal('public.features.badge');
  protected readonly titleA = this.trSignal('public.features.titleA');
  protected readonly titleB = this.trSignal('public.features.titleB');
  protected readonly description = this.trSignal('public.features.description');
  protected readonly navAria = this.trSignal('public.features.navAria');
  protected readonly preview = this.trSignal('public.features.preview');

  protected readonly features = computed<Feature[]>(() => [
    {
      id: 'planning',
      icon: 'calendarDays',
      eyebrow: this.tr('public.features.items.planning.eyebrow'),
      title: this.tr('public.features.items.planning.title'),
      description: this.tr('public.features.items.planning.description'),
      points: this.tr<string[]>('public.features.items.planning.points'),
    },
    {
      id: 'dashboard',
      icon: 'layoutDashboard',
      eyebrow: this.tr('public.features.items.dashboard.eyebrow'),
      title: this.tr('public.features.items.dashboard.title'),
      description: this.tr('public.features.items.dashboard.description'),
      points: this.tr<string[]>('public.features.items.dashboard.points'),
    },
    {
      id: 'wellness',
      icon: 'heartPulse',
      eyebrow: this.tr('public.features.items.wellness.eyebrow'),
      title: this.tr('public.features.items.wellness.title'),
      description: this.tr('public.features.items.wellness.description'),
      points: this.tr<string[]>('public.features.items.wellness.points'),
    },
    {
      id: 'nutrition',
      icon: 'utensils',
      eyebrow: this.tr('public.features.items.nutrition.eyebrow'),
      title: this.tr('public.features.items.nutrition.title'),
      description: this.tr('public.features.items.nutrition.description'),
      points: this.tr<string[]>('public.features.items.nutrition.points'),
    },
    {
      id: 'sport',
      icon: 'dumbbell',
      eyebrow: this.tr('public.features.items.sport.eyebrow'),
      title: this.tr('public.features.items.sport.title'),
      description: this.tr('public.features.items.sport.description'),
      points: this.tr<string[]>('public.features.items.sport.points'),
    },
    {
      id: 'notifications',
      icon: 'bell',
      eyebrow: this.tr('public.features.items.notifications.eyebrow'),
      title: this.tr('public.features.items.notifications.title'),
      description: this.tr('public.features.items.notifications.description'),
      points: this.tr<string[]>('public.features.items.notifications.points'),
    },
    {
      id: 'ia',
      icon: 'brain',
      eyebrow: this.tr('public.features.items.ai.eyebrow'),
      title: this.tr('public.features.items.ai.title'),
      description: this.tr('public.features.items.ai.description'),
      points: this.tr<string[]>('public.features.items.ai.points'),
    },
  ]);

  protected readonly ctaTitle = this.trSignal('public.features.cta.title');
  protected readonly ctaDescription = this.trSignal('public.features.cta.description');
  protected readonly ctaPrimary = this.trSignal('public.features.cta.primary');

  protected readonly weeklyBars = WEEKLY_BARS;
}
