import { AfterViewInit, Component, ElementRef, computed, inject, signal } from '@angular/core';
import {
  LucideDumbbell,
  LucideFootprints,
  LucideFlame,
  LucidePlus,
  LucideTimer,
  LucideTrendingUp,
} from '@lucide/angular';
import { LanguageService } from '../../core/services/language.service';
import { ChartDirective } from '../../shared/directives/chart/chart';
import { Button } from '../../shared/ui/button/button';
import { Badge } from '../../shared/ui/badge/badge';
import { Toast, type ToastTone } from '../../shared/ui/toast/toast';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { SportService } from './services/sport.service';
import {
  WORKOUT_TYPE_BAR,
  WORKOUT_TYPE_CHIP,
  WORKOUT_TYPE_TEXT,
  formatDistance,
  formatDuration,
  type Workout,
  type WorkoutType,
} from './models/sport.models';
import { WorkoutForm } from './components/workout-form/workout-form';
import { WorkoutDetails } from './components/workout-details/workout-details';

type TypeOption = { value: WorkoutType; label: string };

@Component({
  selector: 'app-sport-page',
  imports: [
    ChartDirective,
    Button,
    Badge,
    Toast,
    EmptyState,
    WorkoutForm,
    WorkoutDetails,
    LucideFootprints,
    LucideFlame,
    LucidePlus,
    LucideTimer,
    LucideTrendingUp,
  ],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            {{ eyebrow() }}
          </p>
          <h1 class="mt-0.5 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {{ title() }}
          </h1>
          <p class="mt-1 text-sm text-ink-muted">
            {{ subtitle() }}
          </p>
        </div>
        <button appButton variant="accent" size="md" (click)="openCreate()">
          <svg lucidePlus class="h-4 w-4" aria-hidden="true"></svg>
          {{ addActivity() }}
        </button>
      </header>

      <!-- Aujourd'hui -->
      <section class="rounded-card border border-accent/30 bg-gradient-to-br from-teal-50/70 via-surface to-surface p-5 shadow-card sm:p-6">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-dark">
              {{ today() }}
            </p>
            <h2 class="mt-1 font-display text-lg font-semibold tracking-tight text-primary">
              {{ todayLabel() }}
            </h2>
          </div>
          <app-badge variant="accent" [dot]="true">
            {{ sessionsCount() }}
          </app-badge>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div class="metric-card rounded-panel border border-line bg-surface p-4 shadow-soft">
            <span class="flex h-9 w-9 items-center justify-center rounded-panel bg-teal-50 text-accent-dark">
              <svg lucideTimer class="h-4 w-4" aria-hidden="true"></svg>
            </span>
            <p class="mt-2.5 font-display text-2xl font-bold tabular-nums text-primary">
              {{ formatDuration(service.todaySummary().duration) }}
            </p>
            <p class="text-[11px] text-ink-muted">{{ activeMinutes() }}</p>
          </div>
          <div class="metric-card rounded-panel border border-line bg-surface p-4 shadow-soft">
            <span class="flex h-9 w-9 items-center justify-center rounded-panel bg-primary/10 text-primary">
              <svg lucideFlame class="h-4 w-4" aria-hidden="true"></svg>
            </span>
            <p class="mt-2.5 font-display text-2xl font-bold tabular-nums text-primary">
              {{ service.todaySummary().calories }}
            </p>
            <p class="text-[11px] text-ink-muted">{{ caloriesBurned() }}</p>
          </div>
          <div class="metric-card rounded-panel border border-line bg-surface p-4 shadow-soft">
            <span class="flex h-9 w-9 items-center justify-center rounded-panel bg-navy-50 text-primary">
              <svg lucideFootprints class="h-4 w-4" aria-hidden="true"></svg>
            </span>
            <p class="mt-2.5 font-display text-2xl font-bold tabular-nums text-primary">
              {{ stepsLabel() }}
            </p>
            <p class="text-[11px] text-ink-muted">{{ stepsToday() }}</p>
          </div>
          <div class="metric-card rounded-panel border border-line bg-surface p-4 shadow-soft">
            <span class="flex h-9 w-9 items-center justify-center rounded-panel bg-success-light text-success">
              <svg lucideTrendingUp class="h-4 w-4" aria-hidden="true"></svg>
            </span>
            <p class="mt-2.5 font-display text-2xl font-bold tabular-nums text-primary">
              {{ service.weekTotal().duration }}
            </p>
            <p class="text-[11px] text-ink-muted">{{ minutesThisWeek() }}</p>
          </div>
        </div>
      </section>

      <!-- Graphique + objectifs -->
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section data-reveal class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-8">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                {{ activity() }}
              </p>
              <h2 class="font-display text-lg font-semibold tracking-tight text-primary">
                {{ thisWeek() }}
              </h2>
            </div>
            <app-badge variant="neutral">{{ sessionsWeek() }}</app-badge>
          </div>
          <div class="relative mt-4 h-64 w-full">
            <canvas appChart [config]="service.weeklyChart()"></canvas>
          </div>
        </section>

        <section data-reveal class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-4">
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{{ goals() }}</p>
          <h2 class="font-display text-lg font-semibold tracking-tight text-primary">{{ today() }}</h2>
          <div class="mt-4 space-y-4">
            @for (goal of service.goals(); track goal.label) {
              <div>
                <div class="mb-1 flex items-center justify-between text-sm">
                  <span class="font-medium text-ink-muted">{{ goal.label }}</span>
                  <span class="font-semibold tabular-nums text-primary">{{ goal.current }} / {{ goal.target }}</span>
                </div>
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    [class.bg-primary]="goal.tone === 'navy'"
                    [class.bg-accent]="goal.tone === 'teal'"
                    [class.bg-warning]="goal.tone === 'warn'"
                    [style.width]="goal.percent + '%'"
                  ></div>
                </div>
                <p class="mt-1 text-[11px] text-ink-faint">{{ percentReached(goal.percent) }}</p>
              </div>
            }
          </div>

          <div class="mt-5 border-t border-line pt-4">
            <p class="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">{{ activityTypes() }}</p>
            <div class="flex flex-wrap gap-1.5">
              @for (option of TYPE_OPTIONS(); track option.value) {
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                  [class]="WORKOUT_TYPE_CHIP[option.value]"
                >
                  <span class="h-1.5 w-1.5 rounded-full" [class]="WORKOUT_TYPE_BAR[option.value]"></span>
                  {{ option.label }}
                </span>
              }
            </div>
          </div>
        </section>
      </div>

      <!-- Historique -->
      <section data-reveal class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{{ history() }}</p>
            <h2 class="font-display text-lg font-semibold tracking-tight text-primary">{{ yourSessions() }}</h2>
          </div>
          <app-badge variant="neutral">{{ activitiesCount() }}</app-badge>
        </div>

        <div class="mt-4 flex flex-col gap-2.5">
          @for (workout of service.workouts(); track workout.id) {
            <button
              type="button"
              (click)="openDetails(workout)"
              class="group flex w-full items-center gap-4 rounded-panel border border-line bg-surface p-4 text-left shadow-soft transition-all duration-200 hover:border-accent/40 hover:shadow-card"
            >
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-panel"
                [class]="WORKOUT_TYPE_CHIP[workout.type]"
              >
                <span class="h-4 w-4" [class]="WORKOUT_TYPE_BAR[workout.type]">
                  <span class="sr-only">{{ WORKOUT_TYPE_LABELS()[workout.type] }}</span>
                </span>
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex flex-wrap items-center gap-2">
                  <span class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    {{ WORKOUT_TYPE_LABELS()[workout.type] }}
                  </span>
                  <span class="text-[11px] tabular-nums text-ink-faint">{{ workout.date }}</span>
                </span>
                <span class="mt-0.5 block truncate text-sm font-semibold text-primary">
                  {{ t(workout.title) }}
                </span>
                <span class="mt-0.5 block truncate text-xs text-ink-muted">
                  {{ formatDuration(workout.duration) }}
                  @if (workout.distance) {
                    · {{ formatDistance(workout.distance) }}
                  }
                  · {{ workout.calories }} kcal
                </span>
              </span>
              <span class="shrink-0 text-right">
                <span class="block text-[11px] font-semibold uppercase tracking-wide" [class]="WORKOUT_TYPE_TEXT[workout.type]">
                  {{ workout.startTime }}
                </span>
              </span>
            </button>
          } @empty {
            <div class="rounded-card border border-dashed border-line-strong bg-surface/60">
              <app-empty-state
                [icon]="LucideDumbbell"
                [title]="emptyTitle()"
                [description]="emptyDescription()"
                [actionLabel]="addActivity()"
                (action)="openCreate()"
              />
            </div>
          }
        </div>
      </section>
    </div>

    @if (formOpen()) {
      <app-workout-form [workout]="editing()" (saved)="onSaved($event)" (closed)="closeForm()" />
    }

    @if (detailsOpen() && service.selectedWorkout(); as workout) {
      <app-workout-details
        [workout]="workout"
        [(open)]="detailsOpen"
        (edit)="onEdit($event)"
        (delete)="onDelete($event)"
      />
    }

    @if (toast(); as message) {
      <app-toast [message]="message" [tone]="toastTone()" (closed)="toast.set(null)" />
    }
  `,
})
export class SportPage implements AfterViewInit {
  protected readonly service = inject(SportService);
  private readonly languageService = inject(LanguageService);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected readonly todayLabel = computed(() =>
    new Intl.DateTimeFormat(this.languageService.getLocale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date()),
  );

  protected readonly stepsLabel = computed(() =>
    this.service.stepsToday().toLocaleString(this.languageService.getLocale()),
  );

  protected readonly LucideDumbbell = LucideDumbbell;
  protected readonly WORKOUT_TYPE_CHIP = WORKOUT_TYPE_CHIP;
  protected readonly WORKOUT_TYPE_BAR = WORKOUT_TYPE_BAR;
  protected readonly WORKOUT_TYPE_TEXT = WORKOUT_TYPE_TEXT;
  protected readonly formatDuration = formatDuration;
  protected readonly formatDistance = formatDistance;

  protected readonly eyebrow = this.languageService.translateSignal('sport.eyebrow');
  protected readonly title = this.languageService.translateSignal('sport.title');
  protected readonly subtitle = this.languageService.translateSignal('sport.subtitle');
  protected readonly addActivity = this.languageService.translateSignal('sport.addActivity');
  protected readonly today = this.languageService.translateSignal('sport.today');
  protected readonly activeMinutes = this.languageService.translateSignal('sport.activeMinutes');
  protected readonly caloriesBurned = this.languageService.translateSignal('sport.caloriesBurned');
  protected readonly stepsToday = this.languageService.translateSignal('sport.stepsToday');
  protected readonly minutesThisWeek = this.languageService.translateSignal('sport.minutesThisWeek');
  protected readonly activity = this.languageService.translateSignal('sport.activity');
  protected readonly thisWeek = this.languageService.translateSignal('sport.thisWeek');
  protected readonly goals = this.languageService.translateSignal('sport.goals');
  protected readonly activityTypes = this.languageService.translateSignal('sport.activityTypes');
  protected readonly history = this.languageService.translateSignal('sport.history');
  protected readonly yourSessions = this.languageService.translateSignal('sport.yourSessions');
  protected readonly emptyTitle = this.languageService.translateSignal('sport.emptyTitle');
  protected readonly emptyDescription = this.languageService.translateSignal('sport.emptyDescription');

  protected readonly sessionsCount = computed(() => {
    const count = this.service.todaySummary().sessions;
    return this.languageService.translate(
      count > 1 ? 'sport.sessionsCountMany' : 'sport.sessionsCountOne',
      { count: String(count) },
    );
  });

  protected readonly sessionsWeek = computed(() =>
    this.languageService.translate('sport.sessionsWeek', {
      count: String(this.service.weekTotal().sessions),
    }),
  );

  protected readonly activitiesCount = computed(() =>
    this.languageService.translate('sport.activitiesCount', {
      count: String(this.service.workouts().length),
    }),
  );

  protected readonly TYPE_OPTIONS = computed<TypeOption[]>(() => [
    { value: 'running', label: this.languageService.translate('sport.types.running') },
    { value: 'walking', label: this.languageService.translate('sport.types.walking') },
    { value: 'cycling', label: this.languageService.translate('sport.types.cycling') },
    { value: 'gym', label: this.languageService.translate('sport.types.gym') },
    { value: 'stretching', label: this.languageService.translate('sport.types.stretching') },
  ]);

  protected readonly WORKOUT_TYPE_LABELS = computed<Record<WorkoutType, string>>(() => ({
    running: this.languageService.translate('sport.types.running'),
    walking: this.languageService.translate('sport.types.walking'),
    cycling: this.languageService.translate('sport.types.cycling'),
    gym: this.languageService.translate('sport.types.gym'),
    stretching: this.languageService.translate('sport.types.stretching'),
  }));

  protected percentReached(percent: number): string {
    return this.languageService.translate('sport.percentReached', {
      percent: String(percent),
    });
  }

  protected t(key: string): string {
    return this.languageService.translate(key);
  }

  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Workout | null>(null);
  protected readonly detailsOpen = signal(false);
  protected readonly toast = signal<string | null>(null);
  protected readonly toastTone = signal<ToastTone>('primary');

  protected openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  protected openDetails(workout: Workout): void {
    this.service.selectWorkout(workout.id);
    this.detailsOpen.set(true);
  }

  protected onEdit(workout: Workout): void {
    this.detailsOpen.set(false);
    this.editing.set(workout);
    this.formOpen.set(true);
  }

  protected onDelete(workout: Workout): void {
    this.detailsOpen.set(false);
    this.service.deleteWorkout(workout.id);
    this.toastTone.set('success');
    this.toast.set(this.languageService.translate('sport.toast.deleted'));
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  protected onSaved(workout: Workout): void {
    if (this.editing()) {
      this.service.updateWorkout(workout);
      this.toastTone.set('success');
      this.toast.set(this.languageService.translate('sport.toast.updated'));
    } else {
      this.service.addWorkout(workout);
      this.toastTone.set('success');
      this.toast.set(this.languageService.translate('sport.toast.added'));
    }
    this.closeForm();
  }

  ngAfterViewInit(): void {
    if (this.reduced) {
      return;
    }
    const root = this.host.nativeElement;
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('.metric-card'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'transform' },
      );
      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('[data-reveal]'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'power2.out', clearProps: 'transform' },
      );
    });
  }
}
