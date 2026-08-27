import { Component, computed, inject, signal, afterNextRender, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBell,
  LucideBrain,
  LucideCalendarDays,
  LucideCheck,
  LucideCircleAlert,
  LucideDroplets,
  LucideHeartPulse,
  LucideListTodo,
  LucideMoon,
  LucideMoveRight,
  LucideSparkles,
  LucideTrendingUp,
} from '@lucide/angular';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Magnetic } from '../../../../shared/directives/magnetic/magnetic';
import { MouseGlow } from '../../../../shared/directives/mouse-glow/mouse-glow';
import { Reveal } from '../../../../shared/directives/reveal/reveal';
import { LanguageService } from '../../../../core/services/language.service';

interface Pillar {
  icon: 'calendar' | 'heart' | 'brain';
  title: string;
  description: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

interface Insight {
  icon: 'moon' | 'droplets' | 'list' | 'arrow-right';
  label: string;
  level: string;
  confidence: number;
  tone: 'teal' | 'amber' | 'navy';
}

interface NotificationItem {
  icon: 'bell' | 'droplets' | 'brain';
  title: string;
  time: string;
  category: string;
}

const WEEKLY_BARS = [45, 68, 58, 82, 64, 90, 74];

@Component({
  selector: 'app-home',
  template: `
    <!-- ================= Hero ================= -->
    <section
      class="relative flex min-h-[100svh] items-center overflow-hidden bg-cover bg-center bg-no-repeat bg-primary-darker text-white max-md:bg-[center_30%]"
      [style.backgroundImage]="'url(/brand/hero-section.webp)'"
      aria-labelledby="hero-title"
    >
      <div
        class="absolute inset-0 bg-gradient-to-r from-primary-darker/80 via-primary-darker/40 to-transparent max-md:from-primary-darker/85 max-md:via-primary-darker/60 max-md:to-primary-darker/20"
        aria-hidden="true"
      ></div>
      <div class="pointer-events-none absolute inset-0 bg-grid-light opacity-20" aria-hidden="true"></div>
      <div
        class="animate-glow-pulse pointer-events-none absolute -left-44 -top-40 h-[34rem] w-[34rem] rounded-full bg-accent/20 blur-[130px]"
        aria-hidden="true"
      ></div>
      <div
        class="animate-glow-pulse pointer-events-none absolute -bottom-48 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary-light/40 blur-[130px]"
        style="animation-delay: -3s"
        aria-hidden="true"
      ></div>
      <div
        appMouseGlow
        class="pointer-events-none absolute inset-0"
        [style.background]="
          'radial-gradient(620px circle at var(--glow-x, 50%) var(--glow-y, 40%), rgb(42 157 157 / 0.12), transparent 65%)'
        "
        aria-hidden="true"
      ></div>

      <div
        class="relative mx-auto grid w-full max-w-7xl gap-8 px-5 pb-10 pt-24 sm:px-6 sm:gap-10 sm:pb-16 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-16 lg:pt-36"
      >
        <div>
          <span
            class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-teal-200 backdrop-blur"
          >
            <svg lucideSparkles class="h-3.5 w-3.5 text-accent-lighter" aria-hidden="true"></svg>
            {{ heroBadge() }}
          </span>

          <h1
            id="hero-title"
            class="mt-5 font-display text-[2.25rem] leading-[1.08] tracking-tight text-white sm:text-display"
          >
            {{ heroTitleA() }}
            <span class="text-gradient-light">{{ heroTitleB() }}</span>
          </h1>

          <p class="mt-4 max-w-md text-[15px] leading-[1.65] text-white/70 sm:mt-5 sm:max-w-xl sm:text-body-lg sm:leading-relaxed">
            {{ heroDescription() }}
          </p>

          <div class="mt-8 flex max-w-[340px] flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row">
            <a
              appMagnetic
              routerLink="/register"
              class="group inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-accent-dark px-6 text-[15px] font-semibold text-white shadow-glow transition-all duration-200 hover:bg-accent-darker active:scale-[0.98] sm:h-12 sm:w-auto"
            >
              {{ heroPrimaryCta() }}
              <svg
                lucideArrowRight
                class="mirror-rtl h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                aria-hidden="true"
              ></svg>
            </a>
            <a
              routerLink="/features"
              class="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-[15px] font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/10 sm:h-12 sm:w-auto"
            >
              {{ heroSecondaryCta() }}
            </a>
          </div>

          <div class="mt-8 grid max-w-md grid-cols-3 gap-3 border-t border-white/10 pt-5 sm:mt-10 sm:gap-4 sm:pt-6">
            @for (value of animatedStats(); track $index) {
              <div>
                <p class="font-display text-2xl font-semibold tracking-tight text-white tabular-nums">
                  {{ value }}
                </p>
                <p class="mt-1 text-xs leading-relaxed text-white/65">{{ stats()[$index].label }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Hero preview (decorative) -->
        <div class="relative mx-auto hidden w-full max-w-lg lg:block" aria-hidden="true">
          <div
            class="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-accent/20 via-transparent to-primary/30 blur-2xl"
          ></div>
          <div
            class="animate-float relative rounded-2xl border border-white/10 bg-[#0e2236]/90 p-4 shadow-popover backdrop-blur-sm"
          >
            <div class="flex items-center gap-1.5 px-2 pb-3 pt-1">
              <span class="h-2.5 w-2.5 rounded-full bg-white/15"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-white/15"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-white/15"></span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-white/5 p-4">
                <p class="text-[10px] font-medium uppercase tracking-wider text-white/65">
                  {{ previewProductivity() }}
                </p>
                <p class="mt-2 font-display text-2xl font-semibold text-white tabular-nums">{{ animatedProductivity() }}%</p>
                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div class="h-full w-[78%] rounded-full bg-accent"></div>
                </div>
              </div>
              <div class="rounded-xl bg-white/5 p-4">
                <p class="text-[10px] font-medium uppercase tracking-wider text-white/65">{{
                  previewTasks()
                }}</p>
                <p class="mt-2 font-display text-2xl font-semibold text-white tabular-nums">
                  {{ animatedTasks() }}<span class="text-sm font-normal text-white/65">/8</span>
                </p>
                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div class="h-full w-[75%] rounded-full bg-teal-300"></div>
                </div>
              </div>
              <div class="rounded-xl bg-white/5 p-4">
                <p class="text-[10px] font-medium uppercase tracking-wider text-white/65">
                  {{ previewHydration() }}
                </p>
                <p class="mt-2 font-display text-2xl font-semibold text-white tabular-nums">
                  {{ formattedHydration() }}<span class="text-sm font-normal text-white/65">L</span>
                </p>
                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div class="h-full w-[68%] rounded-full bg-sky-300"></div>
                </div>
              </div>
              <div class="rounded-xl bg-white/5 p-4">
                <p class="text-[10px] font-medium uppercase tracking-wider text-white/65">
                  {{ previewSleep() }}
                </p>
                <p class="mt-2 font-display text-2xl font-semibold text-white">
                  7h20<span class="text-sm font-normal text-white/65"></span>
                </p>
                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div class="h-full w-[82%] rounded-full bg-indigo-300"></div>
                </div>
              </div>
            </div>

            <div class="mt-3 rounded-xl bg-white/5 p-4">
              <div class="flex items-center justify-between">
                <p class="text-[10px] font-medium uppercase tracking-wider text-white/65">
                  {{ previewWeeklyActivity() }}
                </p>
                <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-300">
                  <svg lucideTrendingUp class="h-3 w-3" aria-hidden="true"></svg>
                  +12%
                </span>
              </div>
              <div class="mt-3 flex h-24 items-end gap-2">
                @for (height of weeklyBars; track $index) {
                  <div
                    class="flex-1 rounded-t-md bg-gradient-to-t from-accent/35 to-accent"
                    [style.height.%]="height"
                  ></div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile preview (compact) -->
        <div class="relative mx-auto w-full max-w-[320px] sm:max-w-sm lg:hidden" aria-hidden="true">
          <div
            class="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-accent/20 via-transparent to-primary/30 blur-2xl"
          ></div>
          <div
            class="animate-float relative rounded-2xl border border-white/10 bg-[#0e2236]/90 p-3 shadow-popover backdrop-blur-sm sm:p-4"
          >
            <div class="flex items-center gap-1.5 px-2 pb-2 pt-1">
              <span class="h-2 w-2 rounded-full bg-white/15"></span>
              <span class="h-2 w-2 rounded-full bg-white/15"></span>
              <span class="h-2 w-2 rounded-full bg-white/15"></span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="rounded-lg bg-white/5 p-3">
                <p class="text-[9px] font-medium uppercase tracking-wider text-white/65">
                  {{ previewProductivity() }}
                </p>
                <p class="mt-1 font-display text-xl font-semibold text-white tabular-nums">{{ animatedProductivity() }}%</p>
                <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div class="h-full w-[78%] rounded-full bg-accent"></div>
                </div>
              </div>
              <div class="rounded-lg bg-white/5 p-3">
                <p class="text-[9px] font-medium uppercase tracking-wider text-white/65">{{
                  previewTasks()
                }}</p>
                <p class="mt-1 font-display text-xl font-semibold text-white tabular-nums">
                  {{ animatedTasks() }}<span class="text-xs font-normal text-white/65">/8</span>
                </p>
                <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div class="h-full w-[75%] rounded-full bg-teal-300"></div>
                </div>
              </div>
              <div class="rounded-lg bg-white/5 p-3">
                <p class="text-[9px] font-medium uppercase tracking-wider text-white/65">
                  {{ previewHydration() }}
                </p>
                <p class="mt-1 font-display text-xl font-semibold text-white tabular-nums">
                  {{ formattedHydration() }}<span class="text-xs font-normal text-white/65">L</span>
                </p>
                <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div class="h-full w-[68%] rounded-full bg-sky-300"></div>
                </div>
              </div>
              <div class="rounded-lg bg-white/5 p-3">
                <p class="text-[9px] font-medium uppercase tracking-wider text-white/65">
                  {{ previewSleep() }}
                </p>
                <p class="mt-1 font-display text-xl font-semibold text-white">
                  7h20<span class="text-xs font-normal text-white/65"></span>
                </p>
                <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div class="h-full w-[82%] rounded-full bg-indigo-300"></div>
                </div>
              </div>
            </div>

            <div class="mt-2 rounded-lg bg-white/5 p-3">
              <div class="flex items-center justify-between">
                <p class="text-[9px] font-medium uppercase tracking-wider text-white/65">
                  {{ previewWeeklyActivity() }}
                </p>
                <span class="inline-flex items-center gap-1 text-[9px] font-semibold text-teal-300">
                  <svg lucideTrendingUp class="h-3 w-3" aria-hidden="true"></svg>
                  +12%
                </span>
              </div>
              <div class="mt-2 flex h-16 items-end gap-1.5">
                @for (height of weeklyBars; track $index) {
                  <div
                    class="flex-1 rounded-t-sm bg-gradient-to-t from-accent/35 to-accent"
                    [style.height.%]="height"
                  ></div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= Pillars ================= -->
    <section id="plateforme" class="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-20" aria-labelledby="pillars-title">
      <div class="mx-auto max-w-2xl text-center" appReveal>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ pillarsEyebrow() }}</p>
        <h2 id="pillars-title" class="mt-3 font-display text-h1 tracking-tight text-primary">
          {{ pillarsTitle() }}
        </h2>
        <p class="mt-4 text-body-lg leading-relaxed text-ink-muted">
          {{ pillarsSubtitle() }}
        </p>
      </div>

      <div appReveal revealStagger=".pillar-card" class="mt-14 grid gap-6 md:grid-cols-3">
        @for (pillar of pillars(); track pillar.title) {
          <article class="pillar-card group rounded-2xl border border-line bg-surface p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
            <span
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
            >
              @if (pillar.icon === 'calendar') {
                <svg lucideCalendarDays class="h-6 w-6" aria-hidden="true"></svg>
              } @else if (pillar.icon === 'heart') {
                <svg lucideHeartPulse class="h-6 w-6" aria-hidden="true"></svg>
              } @else {
                <svg lucideBrain class="h-6 w-6" aria-hidden="true"></svg>
              }
            </span>
            <h3 class="mt-5 font-display text-h3 text-primary">{{ pillar.title }}</h3>
            <p class="mt-2.5 text-sm leading-relaxed text-ink-muted">{{ pillar.description }}</p>
          </article>
        }
      </div>
    </section>

    <!-- ================= How it works ================= -->
    <section class="border-y border-line bg-surface-muted/60" aria-labelledby="how-title">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div class="mx-auto max-w-2xl text-center" appReveal>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ howEyebrow() }}</p>
          <h2 id="how-title" class="mt-3 font-display text-h1 tracking-tight text-primary">
            {{ howTitle() }}
          </h2>
        </div>

        <div appReveal revealStagger=".step-item" class="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          @for (step of steps(); track step.number) {
            <div class="step-item relative">
              <div class="flex items-center gap-3">
                <span class="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-teal-50 font-display text-sm font-semibold text-accent-dark">
                  {{ step.number }}
                </span>
                <span class="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent"></span>
              </div>
              <h3 class="mt-5 font-display text-h3 text-primary">{{ step.title }}</h3>
              <p class="mt-2.5 text-sm leading-relaxed text-ink-muted">{{ step.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ================= Planning ================= -->
    <section class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32" aria-labelledby="planning-title">
      <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div appReveal>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ planningEyebrow() }}</p>
          <h2 id="planning-title" class="mt-3 font-display text-h1 tracking-tight text-primary">
            {{ planningTitle() }}
          </h2>
          <p class="mt-4 text-body-lg leading-relaxed text-ink-muted">
            {{ planningDescription() }}
          </p>
          <ul class="mt-8 space-y-4">
            @for (item of planningPoints(); track item) {
              <li class="flex items-start gap-3">
                <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-accent-dark">
                  <svg lucideCheck class="h-3.5 w-3.5" stroke-width="3" aria-hidden="true"></svg>
                </span>
                <span class="text-sm leading-relaxed text-ink">{{ item }}</span>
              </li>
            }
          </ul>
          <a routerLink="/features" class="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-accent-dark transition-colors hover:text-accent">
            {{ planningLink() }}
            <svg lucideArrowRight class="mirror-rtl h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden="true"></svg>
          </a>
        </div>

        <div appReveal revealStagger=".tl-item" class="min-w-0 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8" aria-hidden="true">
          <p class="mb-6 text-xs font-semibold uppercase tracking-wider text-ink-faint">{{ planningToday() }}</p>
          <div class="space-y-1">
            @for (block of timeline(); track block.time) {
              <div class="tl-item flex items-center gap-4 rounded-panel p-3 transition-colors hover:bg-surface-muted">
                <span class="w-12 shrink-0 text-xs font-semibold text-ink-faint">{{ block.time }}</span>
                <span class="relative flex items-center justify-center">
                  <span class="h-2.5 w-2.5 rounded-full" [class.bg-accent]="block.type === 'focus'" [class.bg-primary]="block.type === 'event'" [class.bg-teal-300]="block.type === 'wellness'"></span>
                </span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-ink">{{ block.label }}</p>
                  <p class="text-xs text-ink-faint">{{ block.meta }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- ================= Wellness ================= -->
    <section class="border-y border-line bg-surface-muted/60" aria-labelledby="wellness-title">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div class="order-2 lg:order-1" appReveal revealStagger=".w-card" aria-hidden="true">
            <div class="grid grid-cols-2 gap-4">
              @for (metric of wellnessMetrics(); track metric.label) {
                <div class="w-card rounded-2xl border border-line bg-surface p-5 shadow-soft">
                  <div class="flex items-center justify-between">
                    <p class="text-xs font-medium text-ink-muted">{{ metric.label }}</p>
                    <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-accent-dark">
                      @if (metric.icon === 'moon') {
                        <svg lucideMoon class="h-4 w-4" aria-hidden="true"></svg>
                      } @else if (metric.icon === 'droplets') {
                        <svg lucideDroplets class="h-4 w-4" aria-hidden="true"></svg>
                      } @else if (metric.icon === 'heart') {
                        <svg lucideHeartPulse class="h-4 w-4" aria-hidden="true"></svg>
                      } @else {
                        <svg lucideCircleAlert class="h-4 w-4" aria-hidden="true"></svg>
                      }
                    </span>
                  </div>
                  <p class="mt-3 font-display text-2xl font-semibold tracking-tight text-primary">
                    {{ metric.value }}
                  </p>
                  <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-strong">
                    <div
                      class="h-full rounded-full"
                      [style.width.%]="metric.progress"
                      [class.bg-accent]="metric.tone === 'teal'"
                      [class.bg-primary]="metric.tone === 'navy'"
                      [class.bg-success]="metric.tone === 'green'"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="order-1 lg:order-2" appReveal>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ wellnessEyebrow() }}</p>
            <h2 id="wellness-title" class="mt-3 font-display text-h1 tracking-tight text-primary">
              {{ wellnessTitle() }}
            </h2>
            <p class="mt-4 text-body-lg leading-relaxed text-ink-muted">
              {{ wellnessDescription() }}
            </p>
            <div class="mt-8 flex flex-wrap gap-2.5">
              @for (tag of wellnessTags(); track tag) {
                <span class="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-muted">{{ tag }}</span>
              }
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= AI insights ================= -->
    <section class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32" aria-labelledby="ai-title">
      <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div appReveal>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ aiEyebrow() }}</p>
          <h2 id="ai-title" class="mt-3 font-display text-h1 tracking-tight text-primary">
            {{ aiTitle() }}
          </h2>
          <p class="mt-4 text-body-lg leading-relaxed text-ink-muted">
            {{ aiDescription() }}
          </p>
        </div>

        <div appReveal revealStagger=".insight-card" class="space-y-3">
          @for (insight of insights(); track insight.label) {
            <div class="insight-card flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-soft transition-all duration-300 hover:border-accent/30 hover:shadow-card-hover">
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                [class.bg-teal-50]="insight.tone === 'teal'"
                [class.bg-primary/5]="insight.tone === 'navy'"
                [class.bg-amber-50]="insight.tone === 'amber'"
                [class.text-accent-dark]="insight.tone === 'teal'"
                [class.text-primary]="insight.tone === 'navy'"
                [class.text-amber-600]="insight.tone === 'amber'"
              >
                @if (insight.icon === 'moon') {
                  <svg lucideMoon class="h-5 w-5" aria-hidden="true"></svg>
                } @else if (insight.icon === 'droplets') {
                  <svg lucideDroplets class="h-5 w-5" aria-hidden="true"></svg>
                } @else if (insight.icon === 'list') {
                  <svg lucideListTodo class="h-5 w-5" aria-hidden="true"></svg>
                } @else {
                  <svg lucideMoveRight class="h-5 w-5" aria-hidden="true"></svg>
                }
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-ink">{{ insight.label }}</p>
                  <span class="shrink-0 text-xs font-semibold text-ink-faint">{{ insight.level }}</span>
                </div>
                <div class="mt-2.5 flex items-center gap-3">
                  <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-strong">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      [style.width.%]="insight.confidence"
                    ></div>
                  </div>
                  <span class="shrink-0 text-xs font-medium text-ink-faint">{{ insight.confidence }}%</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ================= Smart notifications ================= -->
    <section class="border-y border-line bg-surface-muted/60" aria-labelledby="notif-title">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div appReveal class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ notificationsEyebrow() }}</p>
            <h2 id="notif-title" class="mt-3 font-display text-h1 tracking-tight text-primary">
              {{ notificationsTitle() }}
            </h2>
            <p class="mt-4 text-body-lg leading-relaxed text-ink-muted">
              {{ notificationsDescription() }}
            </p>
          </div>

          <div appReveal revealStagger=".notif-item" class="space-y-3" aria-hidden="true">
            @for (notif of notifications(); track notif.title) {
              <div class="notif-item flex items-start gap-4 rounded-2xl border border-line bg-surface p-4 shadow-soft">
                <span class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  @if (notif.icon === 'bell') {
                    <svg lucideBell class="h-5 w-5" aria-hidden="true"></svg>
                  } @else if (notif.icon === 'droplets') {
                    <svg lucideDroplets class="h-5 w-5" aria-hidden="true"></svg>
                  } @else {
                    <svg lucideBrain class="h-5 w-5" aria-hidden="true"></svg>
                  }
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium leading-relaxed text-ink">{{ notif.title }}</p>
                  <p class="mt-1 text-xs text-ink-faint">{{ notif.time }}</p>
                </div>
                <app-badge variant="outline">{{ notif.category }}</app-badge>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- ================= Dashboard preview ================= -->
    <section id="apercu" class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32" aria-labelledby="preview-title">
      <div class="mx-auto max-w-2xl text-center" appReveal>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ dashboardEyebrow() }}</p>
        <h2 id="preview-title" class="mt-3 font-display text-h1 tracking-tight text-primary">
          {{ dashboardTitle() }}
        </h2>
        <p class="mt-4 text-body-lg leading-relaxed text-ink-muted">
          {{ dashboardSubtitle() }}
        </p>
      </div>

      <div appReveal class="relative mt-14 overflow-x-clip" aria-hidden="true">
        <div
          class="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-2xl"
        ></div>
        <div
          class="pointer-events-none absolute inset-0 hidden rounded-[2rem] lg:block"
          [style.background]="
            'radial-gradient(560px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgb(42 157 157 / 0.08), transparent 60%)'
          "
        ></div>
        <div class="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-card-hover">
          <div class="flex items-center gap-2 border-b border-line bg-surface-muted/60 px-5 py-3">
            <span class="h-3 w-3 rounded-full bg-danger/60"></span>
            <span class="h-3 w-3 rounded-full bg-warning/60"></span>
            <span class="h-3 w-3 rounded-full bg-success/60"></span>
            <span class="ml-3 hidden text-xs text-ink-faint sm:block">{{ dashboardWindowLabel() }}</span>
          </div>
          <div class="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-7">
            <div class="rounded-xl border border-line bg-surface p-5">
              <p class="text-xs font-medium text-ink-muted">{{ dashboardTasksTitle() }}</p>
              <p class="mt-2 font-display text-3xl font-semibold tracking-tight text-primary">{{ dashboardTasksValue() }}</p>
              <p class="mt-1 text-xs text-ink-faint">{{ dashboardTasksHint() }}</p>
            </div>
            <div class="rounded-xl border border-line bg-surface p-5">
              <p class="text-xs font-medium text-ink-muted">{{ dashboardFreeTimeTitle() }}</p>
              <p class="mt-2 font-display text-3xl font-semibold tracking-tight text-primary">{{ dashboardFreeTimeValue() }}</p>
              <p class="mt-1 text-xs text-ink-faint">{{ dashboardFreeTimeHint() }}</p>
            </div>
            <div class="rounded-xl border border-line bg-surface p-5">
              <p class="text-xs font-medium text-ink-muted">{{ dashboardStressTitle() }}</p>
              <p class="mt-2 font-display text-3xl font-semibold tracking-tight text-primary">{{ dashboardStressValue() }}</p>
              <p class="mt-1 text-xs text-ink-faint">{{ dashboardStressHint() }}</p>
            </div>
            <div class="rounded-xl border border-line bg-surface p-5">
              <p class="text-xs font-medium text-ink-muted">{{ dashboardFatigueTitle() }}</p>
              <p class="mt-2 font-display text-3xl font-semibold tracking-tight text-primary">{{ dashboardFatigueValue() }}</p>
              <p class="mt-1 text-xs text-ink-faint">{{ dashboardFatigueHint() }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= Benefits ================= -->
    <section id="benefices" class="border-y border-line bg-surface-muted/60" aria-labelledby="benefits-title">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div class="mx-auto max-w-2xl text-center" appReveal>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ benefitsEyebrow() }}</p>
          <h2 id="benefits-title" class="mt-3 font-display text-h1 tracking-tight text-primary">
            {{ benefitsTitle() }}
          </h2>
        </div>

        <div appReveal revealStagger=".benefit-item" class="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2">
          @for (benefit of benefits(); track benefit) {
            <div class="benefit-item flex items-start gap-3 rounded-panel border border-line bg-surface p-4">
              <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-accent-dark">
                <svg lucideCheck class="h-3.5 w-3.5" stroke-width="3" aria-hidden="true"></svg>
              </span>
              <span class="text-sm leading-relaxed text-ink">{{ benefit }}</span>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ================= CTA ================= -->
    <section id="cta" class="relative overflow-hidden" aria-labelledby="cta-title">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div appReveal class="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-darker via-primary to-primary-dark px-6 py-16 text-center shadow-card-hover sm:px-12 lg:py-20">
          <div class="absolute inset-0 bg-grid-light opacity-40" aria-hidden="true"></div>
          <div class="animate-glow-pulse pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-[100px]" aria-hidden="true"></div>
          <div class="relative mx-auto max-w-2xl">
            <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-teal-200">
              <svg lucideSparkles class="h-3.5 w-3.5 text-accent-lighter" aria-hidden="true"></svg>
              {{ ctaBadge() }}
            </span>
            <h2 id="cta-title" class="mt-6 font-display text-h1 tracking-tight text-white sm:text-[2.5rem]">
              {{ ctaTitle() }}
            </h2>
            <p class="mx-auto mt-4 max-w-xl text-body-lg leading-relaxed text-white/70">
              {{ ctaDescription() }}
            </p>
            <div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a appMagnetic routerLink="/register" class="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-panel bg-accent-dark px-7 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:bg-accent-darker active:scale-[0.98] sm:w-auto">
                {{ ctaPrimary() }}
                <svg lucideArrowRight class="mirror-rtl h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden="true"></svg>
              </a>
              <a routerLink="/contact" class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-panel border border-white/15 bg-white/5 px-7 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 sm:w-auto">
                {{ ctaSecondary() }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  imports: [
    RouterLink,
    Badge,
    Magnetic,
    MouseGlow,
    Reveal,
    LucideArrowRight,
    LucideSparkles,
    LucideTrendingUp,
    LucideCheck,
    LucideBell,
    LucideBrain,
    LucideCalendarDays,
    LucideCircleAlert,
    LucideDroplets,
    LucideHeartPulse,
    LucideListTodo,
    LucideMoon,
    LucideMoveRight,
  ],
})
export class HomeComponent {
  private readonly languageService = inject(LanguageService);

  protected readonly weeklyBars = WEEKLY_BARS;

  private readonly tr = <T = string>(key: string): T => this.languageService.translate<T>(key);
  private readonly trSignal = (key: string) => this.languageService.translateSignal(key);

  /* ----------------------------- Hero ----------------------------- */
  protected readonly heroBadge = this.trSignal('public.home.hero.badge');
  protected readonly heroTitleA = this.trSignal('public.home.hero.titleA');
  protected readonly heroTitleB = this.trSignal('public.home.hero.titleB');
  protected readonly heroDescription = this.trSignal('public.home.hero.description');
  protected readonly heroPrimaryCta = this.trSignal('public.home.hero.primaryCta');
  protected readonly heroSecondaryCta = this.trSignal('public.home.hero.secondaryCta');

  protected readonly stats = computed(() => [
    { value: '1', label: this.tr('public.home.hero.stats.unified') },
    { value: '13', label: this.tr('public.home.hero.stats.modules') },
    { value: '0', label: this.tr('public.home.hero.stats.diagnosis') },
  ]);

  /* ----------------------------- Count-up animation ----------------------------- */
  private static readonly STAT_TARGETS = [1, 13, 0];
  private static readonly PREVIEW_PRODUCTIVITY = 78;
  private static readonly PREVIEW_TASKS = 6;
  private static readonly PREVIEW_HYDRATION = 1.7;
  private static readonly ANIMATION_DURATION = 1400;

  protected readonly animatedStats = signal<number[]>([0, 0, 0]);
  protected readonly animatedProductivity = signal(0);
  protected readonly animatedTasks = signal(0);
  protected readonly animatedHydration = signal(0);

  protected readonly formattedHydration = computed(() => {
    const v = this.animatedHydration();
    return v < 0.05 ? '0' : v.toFixed(1).replace('.', ',');
  });

  private animationStarted = false;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.scheduleCountUpAnimation();
            observer.disconnect();
          }
        },
        { threshold: 0.2 },
      );

      const heroSection = document.querySelector('[aria-labelledby="hero-title"]');
      if (heroSection) observer.observe(heroSection);

      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private scheduleCountUpAnimation(): void {
    if (this.animationStarted) return;
    this.animationStarted = true;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      this.animatedStats.set([...HomeComponent.STAT_TARGETS]);
      this.animatedProductivity.set(HomeComponent.PREVIEW_PRODUCTIVITY);
      this.animatedTasks.set(HomeComponent.PREVIEW_TASKS);
      this.animatedHydration.set(HomeComponent.PREVIEW_HYDRATION);
      return;
    }

    const schedule = (window as Window & { requestIdleCallback?: (cb: IdleRequestCallback) => number }).requestIdleCallback
      ? (window as Window & { requestIdleCallback: (cb: IdleRequestCallback) => number }).requestIdleCallback
      : ((cb: () => void) => setTimeout(cb, 50));

    schedule(() => this.startCountUpAnimation());
  }

  private startCountUpAnimation(): void {
    const duration = HomeComponent.ANIMATION_DURATION;
    const start = performance.now();

    const step = (now: number): void => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);

      this.animatedStats.set(HomeComponent.STAT_TARGETS.map((v) => Math.round(ease * v)));
      this.animatedProductivity.set(Math.round(ease * HomeComponent.PREVIEW_PRODUCTIVITY));
      this.animatedTasks.set(Math.round(ease * HomeComponent.PREVIEW_TASKS));
      this.animatedHydration.set(parseFloat((ease * HomeComponent.PREVIEW_HYDRATION).toFixed(1)));

      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  protected readonly previewProductivity = this.trSignal('public.home.preview.productivity');
  protected readonly previewTasks = this.trSignal('public.home.preview.tasks');
  protected readonly previewHydration = this.trSignal('public.home.preview.hydration');
  protected readonly previewSleep = this.trSignal('public.home.preview.sleep');
  protected readonly previewWeeklyActivity = this.trSignal('public.home.preview.weeklyActivity');

  /* ----------------------------- Pillars ----------------------------- */
  protected readonly pillarsEyebrow = this.trSignal('public.home.pillars.eyebrow');
  protected readonly pillarsTitle = this.trSignal('public.home.pillars.title');
  protected readonly pillarsSubtitle = this.trSignal('public.home.pillars.subtitle');

  protected readonly pillars = computed<Pillar[]>(() => [
    {
      icon: 'calendar',
      title: this.tr('public.home.pillars.planning.title'),
      description: this.tr('public.home.pillars.planning.description'),
    },
    {
      icon: 'heart',
      title: this.tr('public.home.pillars.wellness.title'),
      description: this.tr('public.home.pillars.wellness.description'),
    },
    {
      icon: 'brain',
      title: this.tr('public.home.pillars.ai.title'),
      description: this.tr('public.home.pillars.ai.description'),
    },
  ]);

  /* ----------------------------- How it works ----------------------------- */
  protected readonly howEyebrow = this.trSignal('public.home.how.eyebrow');
  protected readonly howTitle = this.trSignal('public.home.how.title');

  protected readonly steps = computed<Step[]>(() => [
    {
      number: '01',
      title: this.tr('public.home.how.centralize.title'),
      description: this.tr('public.home.how.centralize.description'),
    },
    {
      number: '02',
      title: this.tr('public.home.how.analyze.title'),
      description: this.tr('public.home.how.analyze.description'),
    },
    {
      number: '03',
      title: this.tr('public.home.how.act.title'),
      description: this.tr('public.home.how.act.description'),
    },
  ]);

  /* ----------------------------- Planning ----------------------------- */
  protected readonly planningEyebrow = this.trSignal('public.home.planning.eyebrow');
  protected readonly planningTitle = this.trSignal('public.home.planning.title');
  protected readonly planningDescription = this.trSignal('public.home.planning.description');
  protected readonly planningLink = this.trSignal('public.home.planning.link');
  protected readonly planningToday = this.trSignal('public.home.planning.today');
  protected readonly planningPoints = computed(() => this.tr<string[]>('public.home.planning.points'));

  protected readonly timeline = computed(() => [
    {
      time: '09:00',
      label: this.tr('public.home.planning.items.focus'),
      meta: this.tr('public.home.planning.items.focusMeta'),
      type: 'focus',
    },
    {
      time: '11:30',
      label: this.tr('public.home.planning.items.team'),
      meta: this.tr('public.home.planning.items.teamMeta'),
      type: 'event',
    },
    {
      time: '14:00',
      label: this.tr('public.home.planning.items.sport'),
      meta: this.tr('public.home.planning.items.sportMeta'),
      type: 'wellness',
    },
    {
      time: '16:30',
      label: this.tr('public.home.planning.items.dev'),
      meta: this.tr('public.home.planning.items.devMeta'),
      type: 'focus',
    },
  ]);

  /* ----------------------------- Wellness ----------------------------- */
  protected readonly wellnessEyebrow = this.trSignal('public.home.wellness.eyebrow');
  protected readonly wellnessTitle = this.trSignal('public.home.wellness.title');
  protected readonly wellnessDescription = this.trSignal('public.home.wellness.description');
  protected readonly wellnessTags = computed(() => this.tr<string[]>('public.home.wellness.tags'));

  protected readonly wellnessMetrics = computed(() => [
    {
      label: this.tr('public.home.wellness.sleep'),
      value: '7h20',
      progress: 82,
      icon: 'moon' as const,
      tone: 'navy' as const,
    },
    {
      label: this.tr('public.home.wellness.hydration'),
      value: '1,7 L',
      progress: 68,
      icon: 'droplets' as const,
      tone: 'teal' as const,
    },
    {
      label: this.tr('public.home.wellness.mood'),
      value: this.tr('public.home.wellness.moodValue'),
      progress: 78,
      icon: 'heart' as const,
      tone: 'green' as const,
    },
    {
      label: this.tr('public.home.wellness.stress'),
      value: this.tr('public.home.wellness.stressValue'),
      progress: 34,
      icon: 'alert' as const,
      tone: 'teal' as const,
    },
  ]);

  /* ----------------------------- AI ----------------------------- */
  protected readonly aiEyebrow = this.trSignal('public.home.ai.eyebrow');
  protected readonly aiTitle = this.trSignal('public.home.ai.title');
  protected readonly aiDescription = this.trSignal('public.home.ai.description');

  protected readonly insights = computed<Insight[]>(() => [
    {
      icon: 'moon',
      label: this.tr('public.home.ai.insights.fatigue'),
      level: this.tr('public.home.ai.levels.moderate'),
      confidence: 82,
      tone: 'amber',
    },
    {
      icon: 'droplets',
      label: this.tr('public.home.ai.insights.hydration'),
      level: this.tr('public.home.ai.levels.follow'),
      confidence: 74,
      tone: 'teal',
    },
    {
      icon: 'list',
      label: this.tr('public.home.ai.insights.overload'),
      level: this.tr('public.home.ai.levels.high'),
      confidence: 88,
      tone: 'navy',
    },
    {
      icon: 'arrow-right',
      label: this.tr('public.home.ai.insights.sedentary'),
      level: this.tr('public.home.ai.levels.moderate'),
      confidence: 69,
      tone: 'amber',
    },
  ]);

  /* ----------------------------- Notifications ----------------------------- */
  protected readonly notificationsEyebrow = this.trSignal('public.home.notifications.eyebrow');
  protected readonly notificationsTitle = this.trSignal('public.home.notifications.title');
  protected readonly notificationsDescription = this.trSignal(
    'public.home.notifications.description',
  );

  protected readonly notifications = computed<NotificationItem[]>(() => [
    {
      icon: 'bell',
      title: this.tr('public.home.notifications.items.team'),
      time: this.tr('public.home.notifications.items.teamTime'),
      category: this.tr('public.home.notifications.items.teamCategory'),
    },
    {
      icon: 'droplets',
      title: this.tr('public.home.notifications.items.water'),
      time: this.tr('public.home.notifications.items.waterTime'),
      category: this.tr('public.home.notifications.items.waterCategory'),
    },
    {
      icon: 'brain',
      title: this.tr('public.home.notifications.items.morning'),
      time: this.tr('public.home.notifications.items.morningTime'),
      category: this.tr('public.home.notifications.items.morningCategory'),
    },
  ]);

  /* ----------------------------- Dashboard preview ----------------------------- */
  protected readonly dashboardEyebrow = this.trSignal('public.home.dashboard.eyebrow');
  protected readonly dashboardTitle = this.trSignal('public.home.dashboard.title');
  protected readonly dashboardSubtitle = this.trSignal('public.home.dashboard.subtitle');
  protected readonly dashboardWindowLabel = this.trSignal('public.home.dashboard.windowLabel');
  protected readonly dashboardTasksTitle = this.trSignal('public.home.dashboard.tasksTitle');
  protected readonly dashboardTasksValue = this.trSignal('public.home.dashboard.tasksValue');
  protected readonly dashboardTasksHint = this.trSignal('public.home.dashboard.tasksHint');
  protected readonly dashboardFreeTimeTitle = this.trSignal('public.home.dashboard.freeTimeTitle');
  protected readonly dashboardFreeTimeValue = this.trSignal('public.home.dashboard.freeTimeValue');
  protected readonly dashboardFreeTimeHint = this.trSignal('public.home.dashboard.freeTimeHint');
  protected readonly dashboardStressTitle = this.trSignal('public.home.dashboard.stressTitle');
  protected readonly dashboardStressValue = this.trSignal('public.home.dashboard.stressValue');
  protected readonly dashboardStressHint = this.trSignal('public.home.dashboard.stressHint');
  protected readonly dashboardFatigueTitle = this.trSignal('public.home.dashboard.fatigueTitle');
  protected readonly dashboardFatigueValue = this.trSignal('public.home.dashboard.fatigueValue');
  protected readonly dashboardFatigueHint = this.trSignal('public.home.dashboard.fatigueHint');

  /* ----------------------------- Benefits ----------------------------- */
  protected readonly benefitsEyebrow = this.trSignal('public.home.benefits.eyebrow');
  protected readonly benefitsTitle = this.trSignal('public.home.benefits.title');
  protected readonly benefits = computed(() => this.tr<string[]>('public.home.benefits.items'));

  /* ----------------------------- CTA ----------------------------- */
  protected readonly ctaBadge = this.trSignal('public.home.cta.badge');
  protected readonly ctaTitle = this.trSignal('public.home.cta.title');
  protected readonly ctaDescription = this.trSignal('public.home.cta.description');
  protected readonly ctaPrimary = this.trSignal('public.home.cta.primary');
  protected readonly ctaSecondary = this.trSignal('public.home.cta.secondary');
}
