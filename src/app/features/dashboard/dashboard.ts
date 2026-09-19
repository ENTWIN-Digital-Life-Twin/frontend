import { AfterViewInit, Component, ElementRef, inject, viewChild, computed } from '@angular/core';
import { type ChartConfiguration } from 'chart.js/auto';
import {
  LucideActivity,
  LucideArrowRight,
  LucideBriefcase,
  LucideCalendar,
  LucideCalendarClock,
  LucideCalendarPlus,
  LucideCode2,
  LucideDroplets,
  LucideDumbbell,
  LucideDynamicIcon,
  LucideMapPin,
  LucideMoon,
  LucidePalette,
  LucidePlus,
  LucideSmile,
  LucideSparkles,
  LucideTarget,
  LucideTrendingUp,
  LucideUsers,
  LucideUtensils,
  LucideVideo,
  LucideWind,
  type LucideIcon,
} from '@lucide/angular';
import { ChartDirective } from '../../shared/directives/chart/chart';
import { Button } from '../../shared/ui/button/button';
import { Badge } from '../../shared/ui/badge/badge';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { AuthService } from '../../core/services/auth/auth.service';
import { LanguageService } from '../../core/services/language.service';

interface TimelineItem {
  time: string;
  titleKey: string;
  detailKey: string;
  icon: LucideIcon;
}

interface WellnessMetric {
  labelKey: string;
  valueKey: string;
  noteKey: string;
  icon: LucideIcon;
  level: number;
  chip: string;
  bar: string;
}

interface QuickAction {
  labelKey: string;
  icon: LucideIcon;
}

const FREE_RADIUS = 28;
const FREE_CIRCUMFERENCE = 2 * Math.PI * FREE_RADIUS;
const FREE_RATIO = 195 / 240; // 3h15m sur un objectif de 4h

@Component({
  selector: 'app-dashboard',
  template: `
    <div #dash class="flex flex-col gap-6">
      <!-- En-tête du tableau de bord -->
      <header class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-xl">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
            {{ todayLabel() }}
          </p>
          <h1
            class="mt-2 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl"
          >
            {{ greeting() }}
          </h1>
          <p class="mt-1.5 text-sm text-ink-muted sm:text-base">
            {{ subtitle() }}
          </p>
        </div>

        <div class="flex flex-col items-start gap-3 lg:items-end">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success-light/60 px-3 py-1.5 text-xs font-medium text-success"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60"
              ></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
            </span>
            {{ balanced() }}
          </span>
          <div class="flex flex-wrap gap-2">
            @for (action of quickActions(); track action.labelKey) {
              <button appButton variant="secondary" size="md">
                <svg [lucideIcon]="action.icon" class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
                {{ action.label }}
              </button>
            }
          </div>
        </div>
      </header>

      <!-- Grille bento -->
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12">
        <!-- A. Aperçu quotidien -->
        <section
          data-reveal
          class="relative flex h-full flex-col overflow-hidden rounded-card bg-gradient-to-br from-primary-darker via-primary to-primary-light p-5 text-white shadow-card sm:p-6 xl:col-span-7"
        >
          <div
            class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl"
            aria-hidden="true"
          ></div>

          <div class="relative flex items-start justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-100">
                {{ productivity() }}
              </p>
              <h2 class="mt-1 font-display text-lg font-semibold tracking-tight text-white">
                {{ dayOverview() }}
              </h2>
            </div>
            <span
              class="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-teal-100 ring-1 ring-white/15"
            >
              <svg lucideTrendingUp class="h-3.5 w-3.5" aria-hidden="true"></svg>
              {{ vsYesterday() }}
            </span>
          </div>

          <div class="relative mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="font-display text-5xl font-bold leading-none tracking-tight sm:text-6xl">
                <span #prodCount>0</span><span class="text-teal-200">%</span>
              </p>
              <p class="mt-3 text-sm text-white/80">{{ tasksCompleted() }}</p>
            </div>
            <div class="hidden items-center gap-2 rounded-panel bg-white/10 px-3 py-2 sm:flex ring-1 ring-white/10">
              <svg lucideTarget class="h-4 w-4 text-teal-200" aria-hidden="true"></svg>
              <span class="text-sm text-white/90">{{ dailyGoal() }}</span>
            </div>
          </div>

          <div class="relative mt-6">
            <div class="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                data-fill="78"
                class="h-full w-full origin-left rounded-full bg-gradient-to-r from-teal-200 to-accent-lighter"
                style="transform-origin: left center;"
                [style.transform]="'scaleX(0.78)'"
              ></div>
            </div>
          </div>

          <div class="relative mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            <div>
              <p class="font-display text-xl font-semibold text-white">2h 30m</p>
              <p class="mt-0.5 text-xs text-white/80">{{ focusTime() }}</p>
            </div>
            <div class="border-l border-white/10 pl-3">
              <p class="font-display text-xl font-semibold text-white">3</p>
              <p class="mt-0.5 text-xs text-white/80">{{ breaksTaken() }}</p>
            </div>
            <div class="border-l border-white/10 pl-3">
              <p class="font-display text-xl font-semibold text-white">75%</p>
              <p class="mt-0.5 text-xs text-white/80">{{ goalsMet() }}</p>
            </div>
          </div>
        </section>

        <!-- D. Insight IA -->
        <section
          data-reveal
          class="flex h-full flex-col gap-4 overflow-hidden rounded-card border border-accent/30 bg-gradient-to-br from-teal-50/70 via-surface to-surface p-5 shadow-card sm:p-6 xl:col-span-5"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-9 w-9 items-center justify-center rounded-panel bg-accent/15 text-accent-dark"
              >
                <svg lucideSparkles class="h-5 w-5" aria-hidden="true"></svg>
              </span>
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-dark">
                  {{ aiInsight() }}
                </p>
                <h2 class="font-display text-base font-semibold tracking-tight text-primary">
                  {{ recommendation() }}
                </h2>
              </div>
            </div>
            <app-badge variant="accent">{{ confidence() }}</app-badge>
          </div>

          <p class="text-sm leading-relaxed text-ink" [innerHTML]="energyText()"></p>

          <div class="mt-auto space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium text-ink-muted">{{ modelReliability() }}</span>
              <span class="font-semibold text-accent-dark">82%</span>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
              <div
                data-fill="82"
                class="h-full w-full origin-left rounded-full bg-accent"
                style="transform-origin: left center;"
                [style.transform]="'scaleX(0.82)'"
              ></div>
            </div>
          </div>

          <button appButton variant="secondary" size="md" class="mt-1 w-full justify-center">
            <svg lucideArrowRight class="h-4 w-4" aria-hidden="true"></svg>
            {{ seeAnalysis() }}
          </button>
        </section>

        <!-- B. Fil d'actualité du jour -->
        <section
          data-reveal
          class="flex h-full flex-col gap-5 rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-7"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                {{ today() }}
              </p>
              <h2 class="font-display text-lg font-semibold tracking-tight text-primary">
                {{ yourProgram() }}
              </h2>
            </div>
            @if (activeIndex >= 0) {
              <app-badge variant="accent" [dot]="true">{{ now() }}</app-badge>
            }
          </div>

          <div class="flex-1">
            @for (item of timeline(); track item.time; let i = $index; let last = $last) {
              <div class="timeline-item relative flex gap-3">
                <div class="w-12 shrink-0 pt-0.5 text-right">
                  <span class="text-xs font-semibold tabular-nums text-ink-muted">
                    {{ item.time }}
                  </span>
                </div>
                <div class="relative flex flex-col items-center">
                  <span
                    class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    [class]="
                      i === activeIndex
                        ? 'bg-accent ring-4 ring-teal-500/20'
                        : 'bg-primary/25'
                    "
                  ></span>
                  @if (!last) {
                    <span class="w-px flex-1 bg-line"></span>
                  }
                </div>
                <div class="min-w-0 flex-1 pb-5">
                  <div
                    class="flex items-center gap-3 rounded-panel border p-3 transition-colors"
                    [class]="
                      i === activeIndex
                        ? 'border-accent/40 bg-teal-50/60'
                        : 'border-line bg-surface-muted/60'
                    "
                  >
                    <span
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-white text-accent-dark shadow-sm ring-1 ring-line"
                    >
                      <svg [lucideIcon]="item.icon" class="h-4 w-4" aria-hidden="true"></svg>
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-semibold text-primary">{{ item.title }}</p>
                      <p class="truncate text-xs text-ink-muted">{{ item.detail }}</p>
                    </div>
                    @if (i === activeIndex) {
                      <span
                        class="hidden text-[11px] font-semibold uppercase tracking-wide text-accent-dark sm:block"
                      >
                        {{ inProgress() }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- E. Événement à venir -->
        <section
          data-reveal
          class="flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-5"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              {{ upcoming() }}
            </p>
            <app-badge variant="primary">{{ work() }}</app-badge>
          </div>

          <div class="flex items-center gap-3">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-panel bg-primary/10 text-primary"
            >
              <svg lucideCalendar class="h-5 w-5" aria-hidden="true"></svg>
            </span>
            <div>
              <p class="text-xs text-ink-muted">{{ eventTime() }}</p>
              <h3 class="font-display text-lg font-semibold tracking-tight text-primary">
                {{ meetingTitle() }}
              </h3>
            </div>
          </div>

          <div class="space-y-2 text-sm text-ink-muted">
            <p class="flex items-center gap-2">
              <svg lucideMapPin class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
              {{ location() }}
            </p>
            <p class="flex items-center gap-2">
              <svg lucideVideo class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
              {{ online() }}
            </p>
          </div>

          <div class="mt-auto flex items-center justify-between border-t border-line pt-4">
            <div class="flex items-center">
              <span class="flex -space-x-2">
                @for (participant of participants; track participant) {
                  <app-avatar [name]="participant" size="sm" [ring]="true" />
                }
              </span>
              <span class="ml-3 text-xs text-ink-muted">{{ others() }}</span>
            </div>
            <button appButton variant="ghost" size="sm">{{ join() }}</button>
          </div>
        </section>

        <!-- C. Résumé bien-être -->
        <section
          data-reveal
          class="flex h-full flex-col gap-5 rounded-card border border-dashed border-line-strong bg-surface-muted/50 p-5 sm:p-6 xl:col-span-8"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                {{ wellbeing() }}
              </p>
              <h2 class="font-display text-lg font-semibold tracking-tight text-primary">
                {{ dayOverview() }}
              </h2>
            </div>
            <app-badge variant="success" [dot]="true">{{ balancedBadge() }}</app-badge>
          </div>

          <div class="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
            @for (metric of wellness(); track metric.labelKey) {
              <div
                class="flex flex-col gap-2.5 rounded-panel border border-line bg-surface p-4 shadow-sm"
              >
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-panel"
                  [class]="metric.chip"
                >
                  <svg [lucideIcon]="metric.icon" class="h-4 w-4" aria-hidden="true"></svg>
                </span>
                <div>
                  <p class="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                    {{ metric.label }}
                  </p>
                  <p class="mt-0.5 font-display text-lg font-semibold text-primary">
                    {{ metric.value }}
                  </p>
                </div>
                <div class="h-1 w-full overflow-hidden rounded-full bg-surface-strong">
                  <div
                    class="h-full w-full origin-left rounded-full"
                    [class]="metric.bar"
                    style="transform-origin: left center;"
                    [style.transform]="'scaleX(' + metric.level / 100 + ')'"
                  ></div>
                </div>
                <p class="text-[11px] text-ink-muted">{{ metric.note }}</p>
              </div>
            }
          </div>
        </section>

        <!-- F. Temps libre -->
        <section
          data-reveal
          class="flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-4"
        >
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {{ freeTime() }}
          </p>

          <div class="flex flex-1 items-center justify-center py-2">
            <div class="relative">
              <svg viewBox="0 0 64 64" class="h-36 w-36 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="var(--color-surface-strong)"
                  stroke-width="7"
                />
                <circle
                  #freeRing
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#2A9D9D"
                  stroke-width="7"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="freeCircumference"
                  [style.stroke-dashoffset]="freeOffset"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="font-display text-2xl font-bold tracking-tight text-primary">
                  3h 15m
                </span>
                <span class="text-[11px] text-ink-muted">{{ freeTimeToday() }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2.5 border-t border-line pt-4 text-sm">
            <p class="flex justify-between">
              <span class="text-ink-muted">{{ endOfDay() }}</span>
              <span class="font-medium text-primary">2h 30m</span>
            </p>
            <p class="flex justify-between">
              <span class="text-ink-muted">{{ lunchBreak() }}</span>
              <span class="font-medium text-primary">45m</span>
            </p>
          </div>
        </section>

        <!-- G. Productivité hebdomadaire -->
        <section
          data-reveal
          class="flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-7"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                {{ productivity() }}
              </p>
              <h2 class="font-display text-lg font-semibold tracking-tight text-primary">
                {{ thisWeek() }}
              </h2>
            </div>
            <app-badge variant="neutral">{{ weeklyAverage() }}</app-badge>
          </div>
          <div class="relative h-56 w-full">
            <canvas appChart [config]="productivityChart()"></canvas>
          </div>
        </section>

        <!-- H. Bien-être hebdomadaire -->
        <section
          data-reveal
          class="flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-5"
        >
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              {{ wellbeing() }}
            </p>
            <h2 class="font-display text-lg font-semibold tracking-tight text-primary">
              {{ thisWeek() }}
            </h2>
          </div>
          <div class="relative h-56 w-full">
            <canvas appChart [config]="wellnessChart()"></canvas>
          </div>
        </section>
      </div>
    </div>
  `,
  imports: [
    LucideDynamicIcon,
    LucideTrendingUp,
    LucideTarget,
    LucideSparkles,
    LucideArrowRight,
    LucideCalendar,
    LucideMapPin,
    LucideVideo,
    ChartDirective,
    Button,
    Badge,
    Avatar,
  ],
})
export class DashboardComponent implements AfterViewInit {
  protected readonly freeCircumference = FREE_CIRCUMFERENCE;
  protected readonly freeOffset = FREE_CIRCUMFERENCE * (1 - FREE_RATIO);

  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly prodCount = viewChild<ElementRef<HTMLElement>>('prodCount');
  private readonly freeRing = viewChild<ElementRef<HTMLElement>>('freeRing');

  private readonly firstName = this.authService.currentUser()?.firstName ?? 'Sarah';

  protected readonly locale = computed(() =>
    this.languageService.activeLanguage() === 'fr'
      ? 'fr-FR'
      : this.languageService.activeLanguage() === 'en'
        ? 'en-US'
        : 'ar-EG',
  );

  protected readonly todayLabel = computed(() =>
    new Intl.DateTimeFormat(this.locale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
  );

  protected readonly greeting = this.languageService.translateSignal('dashboard.greeting', {
    name: this.firstName,
  });

  protected readonly subtitle = this.languageService.translateSignal('dashboard.subtitle');
  protected readonly balanced = this.languageService.translateSignal('dashboard.balanced');
  protected readonly productivity = this.languageService.translateSignal('dashboard.productivity');
  protected readonly dayOverview = this.languageService.translateSignal('dashboard.dayOverview');
  protected readonly vsYesterday = this.languageService.translateSignal('dashboard.vsYesterday');
  protected readonly tasksCompleted = this.languageService.translateSignal('dashboard.tasksCompleted', {
    done: '6',
    total: '8',
  });
  protected readonly dailyGoal = this.languageService.translateSignal('dashboard.dailyGoal');
  protected readonly focusTime = this.languageService.translateSignal('dashboard.focusTime');
  protected readonly breaksTaken = this.languageService.translateSignal('dashboard.breaksTaken');
  protected readonly goalsMet = this.languageService.translateSignal('dashboard.goalsMet');
  protected readonly aiInsight = this.languageService.translateSignal('dashboard.aiInsight');
  protected readonly recommendation = this.languageService.translateSignal('dashboard.recommendation');
  protected readonly confidence = this.languageService.translateSignal('dashboard.confidence', {
    value: '82',
  });
  protected readonly energyText = this.languageService.translateSignal('dashboard.energyText');
  protected readonly modelReliability = this.languageService.translateSignal('dashboard.modelReliability');
  protected readonly seeAnalysis = this.languageService.translateSignal('dashboard.seeAnalysis');
  protected readonly today = this.languageService.translateSignal('dashboard.today');
  protected readonly yourProgram = this.languageService.translateSignal('dashboard.yourProgram');
  protected readonly now = this.languageService.translateSignal('dashboard.now');
  protected readonly inProgress = this.languageService.translateSignal('dashboard.inProgress');
  protected readonly upcoming = this.languageService.translateSignal('dashboard.upcoming');
  protected readonly work = this.languageService.translateSignal('dashboard.work');
  protected readonly eventTime = this.languageService.translateSignal('dashboard.eventTime');
  protected readonly meetingTitle = this.languageService.translateSignal('dashboard.meetingTitle');
  protected readonly location = this.languageService.translateSignal('dashboard.location');
  protected readonly online = this.languageService.translateSignal('dashboard.online');
  protected readonly others = this.languageService.translateSignal('dashboard.others', { count: '2' });
  protected readonly join = this.languageService.translateSignal('dashboard.join');
  protected readonly wellbeing = this.languageService.translateSignal('dashboard.wellbeing');
  protected readonly balancedBadge = this.languageService.translateSignal('dashboard.balancedBadge');
  protected readonly freeTime = this.languageService.translateSignal('dashboard.freeTime');
  protected readonly freeTimeToday = this.languageService.translateSignal('dashboard.freeTimeToday');
  protected readonly endOfDay = this.languageService.translateSignal('dashboard.endOfDay');
  protected readonly lunchBreak = this.languageService.translateSignal('dashboard.lunchBreak');
  protected readonly thisWeek = this.languageService.translateSignal('dashboard.thisWeek');
  protected readonly weeklyAverage = this.languageService.translateSignal('dashboard.weeklyAverage');

  protected readonly quickActions = computed<Array<QuickAction & { label: string }>>(() => [
    {
      labelKey: 'dashboard.quickActions.newTask',
      label: this.languageService.translate('dashboard.quickActions.newTask'),
      icon: LucidePlus,
    },
    {
      labelKey: 'dashboard.quickActions.newEvent',
      label: this.languageService.translate('dashboard.quickActions.newEvent'),
      icon: LucideCalendarPlus,
    },
    {
      labelKey: 'dashboard.quickActions.planDay',
      label: this.languageService.translate('dashboard.quickActions.planDay'),
      icon: LucideCalendarClock,
    },
    {
      labelKey: 'dashboard.quickActions.askAI',
      label: this.languageService.translate('dashboard.quickActions.askAI'),
      icon: LucideSparkles,
    },
  ]);

  protected readonly timeline = computed<Array<TimelineItem & { title: string; detail: string }>>(
    () => [
      {
        time: '08:30',
        titleKey: 'dashboard.timeline.work',
        title: this.languageService.translate('dashboard.timeline.work'),
        detailKey: 'dashboard.timeline.workDetail',
        detail: this.languageService.translate('dashboard.timeline.workDetail'),
        icon: LucideBriefcase,
      },
      {
        time: '10:00',
        titleKey: 'dashboard.timeline.teamMeeting',
        title: this.languageService.translate('dashboard.timeline.teamMeeting'),
        detailKey: 'dashboard.timeline.teamMeetingDetail',
        detail: this.languageService.translate('dashboard.timeline.teamMeetingDetail'),
        icon: LucideUsers,
      },
      {
        time: '12:30',
        titleKey: 'dashboard.timeline.lunch',
        title: this.languageService.translate('dashboard.timeline.lunch'),
        detailKey: 'dashboard.timeline.lunchDetail',
        detail: this.languageService.translate('dashboard.timeline.lunchDetail'),
        icon: LucideUtensils,
      },
      {
        time: '14:00',
        titleKey: 'dashboard.timeline.dev',
        title: this.languageService.translate('dashboard.timeline.dev'),
        detailKey: 'dashboard.timeline.devDetail',
        detail: this.languageService.translate('dashboard.timeline.devDetail'),
        icon: LucideCode2,
      },
      {
        time: '16:30',
        titleKey: 'dashboard.timeline.sport',
        title: this.languageService.translate('dashboard.timeline.sport'),
        detailKey: 'dashboard.timeline.sportDetail',
        detail: this.languageService.translate('dashboard.timeline.sportDetail'),
        icon: LucideDumbbell,
      },
      {
        time: '18:00',
        titleKey: 'dashboard.timeline.free',
        title: this.languageService.translate('dashboard.timeline.free'),
        detailKey: 'dashboard.timeline.freeDetail',
        detail: this.languageService.translate('dashboard.timeline.freeDetail'),
        icon: LucidePalette,
      },
    ],
  );

  protected readonly participants = ['Sarah Martin', 'Thomas Petit', 'Léa Moreau'];

  protected readonly wellness = computed<Array<WellnessMetric & { label: string; value: string; note: string }>>(
    () => [
      {
        labelKey: 'wellness.sleep',
        label: this.languageService.translate('wellness.sleep'),
        valueKey: 'wellness.sleep',
        value: '7h 20m',
        noteKey: 'wellness.sleepTarget',
        note: this.languageService.translate('wellness.sleepTarget'),
        icon: LucideMoon,
        level: 92,
        chip: 'bg-primary/10 text-primary',
        bar: 'bg-primary',
      },
      {
        labelKey: 'wellness.hydration',
        label: this.languageService.translate('wellness.hydration'),
        valueKey: 'wellness.hydration',
        value: '1,7 L',
        noteKey: 'wellness.hydrationTarget',
        note: this.languageService.translate('wellness.hydrationTarget'),
        icon: LucideDroplets,
        level: 68,
        chip: 'bg-teal-50 text-accent-dark',
        bar: 'bg-accent',
      },
      {
        labelKey: 'wellness.mood',
        label: this.languageService.translate('wellness.mood'),
        valueKey: 'wellness.good',
        value: this.languageService.translate('wellness.good'),
        noteKey: 'wellness.moodNote',
        note: this.languageService.translate('wellness.moodNote'),
        icon: LucideSmile,
        level: 82,
        chip: 'bg-success-light text-success',
        bar: 'bg-success',
      },
      {
        labelKey: 'wellness.stress',
        label: this.languageService.translate('wellness.stress'),
        valueKey: 'wellness.low',
        value: this.languageService.translate('wellness.low'),
        noteKey: 'wellness.stressNote',
        note: this.languageService.translate('wellness.stressNote'),
        icon: LucideWind,
        level: 35,
        chip: 'bg-success-light text-success',
        bar: 'bg-success',
      },
      {
        labelKey: 'wellness.fatigue',
        label: this.languageService.translate('wellness.fatigue'),
        valueKey: 'wellness.moderate',
        value: this.languageService.translate('wellness.moderate'),
        noteKey: 'wellness.fatigueNote',
        note: this.languageService.translate('wellness.fatigueNote'),
        icon: LucideActivity,
        level: 55,
        chip: 'bg-warning-light text-warning',
        bar: 'bg-warning',
      },
    ],
  );

  protected readonly productivityChart = computed<ChartConfiguration<'bar'>>(() => ({
    type: 'bar',
    data: {
      labels: this.languageService.translate<string[]>('dashboard.chart.days'),
      datasets: [
        {
          label: this.languageService.translate('dashboard.chart.productivity'),
          data: [62, 78, 70, 84, 72, 55, 68],
          backgroundColor: ['#2A9D9D', '#1B3A57', '#2A9D9D', '#2A9D9D', '#2A9D9D', '#2A9D9D', '#2A9D9D'],
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 18,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1B3A57',
          titleColor: '#FFFFFF',
          bodyColor: 'rgba(255,255,255,0.8)',
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: 'var(--color-ink-faint)', font: { size: 11 } },
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(42,157,157,0.08)' },
          border: { display: false },
          ticks: { color: 'var(--color-ink-faint)', font: { size: 10 }, maxTicksLimit: 5 },
        },
      },
    },
  }));

  protected readonly wellnessChart = computed<ChartConfiguration<'line'>>(() => ({
    type: 'line',
    data: {
      labels: this.languageService.translate<string[]>('dashboard.chart.daysShort'),
      datasets: [
        {
          label: this.languageService.translate('dashboard.chart.sleep'),
          data: [89, 91, 85, 90, 82, 100, 92],
          borderColor: '#1B3A57',
          backgroundColor: '#1B3A57',
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: this.languageService.translate('dashboard.chart.hydration'),
          data: [72, 80, 68, 84, 76, 96, 80],
          borderColor: '#2A9D9D',
          backgroundColor: '#2A9D9D',
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: this.languageService.translate('dashboard.chart.wellbeing'),
          data: [62, 71, 65, 74, 68, 80, 72],
          borderColor: '#7FD1D1',
          backgroundColor: '#7FD1D1',
          tension: 0.35,
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 6,
            boxHeight: 6,
            padding: 14,
            color: 'var(--color-ink-muted)',
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: '#1B3A57',
          titleColor: '#FFFFFF',
          bodyColor: 'rgba(255,255,255,0.8)',
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: 'var(--color-ink-faint)', font: { size: 10 } },
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(42,157,157,0.08)' },
          border: { display: false },
          ticks: { display: false },
        },
      },
    },
  }));

  private readonly nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  protected readonly activeIndex = this.timeline().reduce(
    (active, item, index) => {
      const [hours, minutes] = item.time.split(':').map(Number);
      return hours * 60 + minutes <= this.nowMinutes ? index : active;
    },
    -1,
  );

  ngAfterViewInit(): void {
    const root = this.host.nativeElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const count = this.prodCount()?.nativeElement;
    if (count) {
      count.textContent = reduced ? '78' : '0';
    }

    if (reduced) {
      return;
    }

    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('[data-reveal]'),
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'transform',
        },
      );

      gsap.delayedCall(0.2, () => {
        root.querySelectorAll<HTMLElement>('[data-fill]').forEach((el) => {
          const target = Number(el.dataset['fill'] ?? 0) / 100;
          gsap.fromTo(
            el,
            { scaleX: 0 },
            { scaleX: target, duration: 1, ease: 'power3.out', transformOrigin: 'left center' },
          );
        });

        if (count) {
          const proxy = { value: 0 };
          gsap.to(proxy, {
            value: 78,
            duration: 1.4,
            ease: 'power3.out',
            onUpdate: () => {
              count.textContent = String(Math.round(proxy.value));
            },
          });
        }

        const ring = this.freeRing()?.nativeElement;
        if (ring) {
          gsap.fromTo(
            ring,
            { strokeDashoffset: FREE_CIRCUMFERENCE },
            {
              strokeDashoffset: FREE_CIRCUMFERENCE * (1 - FREE_RATIO),
              duration: 1.4,
              ease: 'power3.out',
            },
          );
        }
      });

      gsap.delayedCall(0.4, () => {
        gsap.fromTo(
          root.querySelectorAll<HTMLElement>('.timeline-item'),
          { opacity: 0, x: 8 },
          { opacity: 1, x: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out' },
        );
      });
    });
  }
}
