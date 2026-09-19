import { Injectable, computed, inject, signal } from '@angular/core';
import { type ChartConfiguration, type TooltipItem } from 'chart.js/auto';
import { LanguageService } from '../../../core/services/language.service';
import {
  DAILY_ACTIVE_GOAL,
  DAILY_CALORIE_GOAL,
  DAILY_STEPS_GOAL,
  MOCK_WORKOUTS,
  formatDuration,
  offsetDays,
  toISODate,
  type WeeklyStat,
  type Workout,
} from '../models/sport.models';

const NAVY = '#1B3A57';
const TEAL = '#2A9D9D';
const NAVY_300 = '#9BB7CD';
const INK_FAINT = '#8494A3';
const INK_MUTED = '#52616F';

export interface TodaySummary {
  duration: number;
  calories: number;
  distance: number;
  sessions: number;
  activePercent: number;
  caloriesPercent: number;
}

@Injectable({ providedIn: 'root' })
export class SportService {
  private readonly languageService = inject(LanguageService);
  private readonly workoutsSignal = signal<Workout[]>(MOCK_WORKOUTS);
  readonly workouts = this.workoutsSignal.asReadonly();

  readonly selectedWorkoutId = signal<string | null>(null);
  readonly selectedWorkout = computed(
    () => this.workoutsSignal().find((workout) => workout.id === this.selectedWorkoutId()) ?? null,
  );

  readonly today = toISODate(offsetDays(0));

  readonly todayWorkouts = computed(() =>
    this.workoutsSignal().filter((workout) => workout.date === this.today),
  );

  readonly todaySummary = computed<TodaySummary>(() => {
    const list = this.todayWorkouts();
    const duration = list.reduce((sum, w) => sum + w.duration, 0);
    const calories = list.reduce((sum, w) => sum + w.calories, 0);
    const distance = list.reduce((sum, w) => sum + w.distance, 0);
    return {
      duration,
      calories,
      distance,
      sessions: list.length,
      activePercent: Math.min(100, Math.round((duration / DAILY_ACTIVE_GOAL) * 100)),
      caloriesPercent: Math.min(100, Math.round((calories / DAILY_CALORIE_GOAL) * 100)),
    };
  });

  readonly stepsToday = computed(() => {
    const base = 6200;
    const fromDistance = this.todaySummary().distance * 1250;
    return Math.round(base + fromDistance);
  });

  readonly stepsPercent = computed(() =>
    Math.min(100, Math.round((this.stepsToday() / DAILY_STEPS_GOAL) * 100)),
  );

  readonly weekTotal = computed(() => {
    const list = this.workoutsSignal().filter(
      (workout) => workout.date >= toISODate(offsetDays(-6)) && workout.date <= this.today,
    );
    return {
      duration: list.reduce((sum, w) => sum + w.duration, 0),
      calories: list.reduce((sum, w) => sum + w.calories, 0),
      distance: list.reduce((sum, w) => sum + w.distance, 0),
      sessions: list.length,
    };
  });

  readonly weeklyChart = computed<ChartConfiguration<'bar'>>(() => {
    const stats = this.weeklyStats();
    const highlightIndex = stats.length - 1;
    return {
      type: 'bar',
      data: {
        labels: this.weekdayShort(),
        datasets: [
          {
            label: this.languageService.translate('sport.chartMinutes'),
            data: stats.map((day) => day.activeMinutes),
            backgroundColor: stats.map((_, index) =>
              index === highlightIndex ? TEAL : NAVY_300,
            ),
            borderRadius: 5,
            borderSkipped: false,
            maxBarThickness: 22,
          },
          {
            label: this.languageService.translate('sport.chartCalories'),
            data: stats.map((day) => day.calories),
            backgroundColor: stats.map((_, index) =>
              index === highlightIndex ? NAVY : 'rgba(27,58,87,0.35)',
            ),
            borderRadius: 5,
            borderSkipped: false,
            maxBarThickness: 22,
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
              color: INK_MUTED,
              font: { size: 11 },
            },
          },
          tooltip: {
            backgroundColor: NAVY,
            titleColor: '#FFFFFF',
            bodyColor: 'rgba(255,255,255,0.85)',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx: TooltipItem<'bar'>) => {
                const value = ctx.parsed.y ?? 0;
                return ctx.datasetIndex === 0
                  ? ` ${formatDuration(value)}`
                  : ` ${value} kcal`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: INK_FAINT, font: { size: 10 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(27,58,87,0.06)' },
            border: { display: false },
            ticks: { color: INK_FAINT, font: { size: 10 }, maxTicksLimit: 5 },
          },
        },
      },
    };
  });

  private weeklyStats(): WeeklyStat[] {
    const days = Array.from({ length: 7 }, (_, index) => toISODate(offsetDays(index - 6)));
    const weekdayShort = this.weekdayShort();
    return days.map((date) => {
      const list = this.workoutsSignal().filter((workout) => workout.date === date);
      return {
        day: weekdayShort[(new Date(`${date}T12:00:00`).getDay() + 6) % 7],
        activeMinutes: list.reduce((sum, workout) => sum + workout.duration, 0),
        calories: list.reduce((sum, workout) => sum + workout.calories, 0),
      };
    });
  }

  private weekdayShort(): string[] {
    return this.languageService.translate<string[]>('sport.weekdayShort');
  }

  readonly goals = computed(() => {
    const locale = this.languageService.getLocale();
    return [
      {
        label: this.languageService.translate('sport.goalSteps'),
        current: this.stepsToday().toLocaleString(locale),
        target: DAILY_STEPS_GOAL.toLocaleString(locale),
        percent: this.stepsPercent(),
        tone: 'navy' as const,
      },
      {
        label: this.languageService.translate('sport.goalMinutes'),
        current: formatDuration(this.todaySummary().duration),
        target: formatDuration(DAILY_ACTIVE_GOAL),
        percent: this.todaySummary().activePercent,
        tone: 'teal' as const,
      },
      {
        label: this.languageService.translate('sport.goalCalories'),
        current: String(this.todaySummary().calories),
        target: String(DAILY_CALORIE_GOAL),
        percent: this.todaySummary().caloriesPercent,
        tone: 'warn' as const,
      },
    ];
  });

  selectWorkout(id: string | null): void {
    this.selectedWorkoutId.set(id);
  }

  addWorkout(workout: Omit<Workout, 'id'>): void {
    this.workoutsSignal.update((list) => [
      { ...workout, id: `w-${Date.now()}` },
      ...list,
    ]);
  }

  updateWorkout(workout: Workout): void {
    this.workoutsSignal.update((list) =>
      list.map((item) => (item.id === workout.id ? { ...workout } : item)),
    );
  }

  deleteWorkout(id: string): void {
    this.workoutsSignal.update((list) => list.filter((item) => item.id !== id));
    if (this.selectedWorkoutId() === id) {
      this.selectedWorkoutId.set(null);
    }
  }
}
