import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { type ChartConfiguration, type TooltipItem } from 'chart.js/auto';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import {
  DAILY_ACTIVE_GOAL,
  DAILY_CALORIE_GOAL,
  DAILY_STEPS_GOAL,
  formatDuration,
  offsetDays,
  toISODate,
  type WeeklyStat,
  type Workout,
  type WorkoutIntensity,
  type WorkoutType,
} from '../models/sport.models';

type BackendActivityType =
  | 'WALKING'
  | 'RUNNING'
  | 'CYCLING'
  | 'SWIMMING'
  | 'GYM'
  | 'STRENGTH_TRAINING'
  | 'YOGA'
  | 'FOOTBALL'
  | 'OTHER';
type BackendIntensity = 'LOW' | 'MODERATE' | 'HIGH';

interface WorkoutResponse {
  id: string;
  userId: string;
  activityType: BackendActivityType;
  startedAt: string;
  durationMinutes: number;
  intensity: BackendIntensity;
  caloriesBurned: number | null;
  averageHeartRate: number | null;
  distanceKm: number | null;
  completed: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const TYPE_TO_BACKEND: Record<WorkoutType, BackendActivityType> = {
  running: 'RUNNING',
  walking: 'WALKING',
  cycling: 'CYCLING',
  gym: 'GYM',
  stretching: 'YOGA',
};

// wellness-service supports more activity types than this UI exposes a dedicated icon/chip
// for; anything without a 1:1 match collapses into the closest visual bucket ('gym').
const TYPE_FROM_BACKEND: Record<BackendActivityType, WorkoutType> = {
  RUNNING: 'running',
  WALKING: 'walking',
  CYCLING: 'cycling',
  GYM: 'gym',
  YOGA: 'stretching',
  SWIMMING: 'gym',
  STRENGTH_TRAINING: 'gym',
  FOOTBALL: 'gym',
  OTHER: 'gym',
};

const INTENSITY_TO_BACKEND: Record<WorkoutIntensity, BackendIntensity> = {
  low: 'LOW',
  medium: 'MODERATE',
  high: 'HIGH',
};

const INTENSITY_FROM_BACKEND: Record<BackendIntensity, WorkoutIntensity> = {
  LOW: 'low',
  MODERATE: 'medium',
  HIGH: 'high',
};

const FALLBACK_TITLE: Record<WorkoutType, string> = {
  running: 'Running',
  walking: 'Walking',
  cycling: 'Cycling',
  gym: 'Workout',
  stretching: 'Stretching',
};

// wellness-service's Workout entity only has a single free-text `notes` column, but this UI
// keeps a distinct short "title" and a longer "notes" field. We pack both into that one
// column (title on the first line, notes after a blank line) and unpack them on read.
const TITLE_NOTES_SEPARATOR = '\n\n';

function packNotes(title: string, notes: string): string {
  const cleanTitle = title.trim();
  return notes.trim() ? `${cleanTitle}${TITLE_NOTES_SEPARATOR}${notes.trim()}` : cleanTitle;
}

function unpackNotes(raw: string | null, fallbackTitle: string): { title: string; notes: string } {
  if (!raw) {
    return { title: fallbackTitle, notes: '' };
  }
  const idx = raw.indexOf(TITLE_NOTES_SEPARATOR);
  if (idx === -1) {
    return { title: raw, notes: '' };
  }
  return { title: raw.slice(0, idx), notes: raw.slice(idx + TITLE_NOTES_SEPARATOR.length) };
}

const pad2 = (value: number): string => String(value).padStart(2, '0');

function toInstant(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

function fromInstant(iso: string): { date: string; time: string } {
  const dt = new Date(iso);
  return {
    date: `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`,
    time: `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`,
  };
}

function fromResponse(res: WorkoutResponse): Workout {
  const type = TYPE_FROM_BACKEND[res.activityType];
  const { date, time } = fromInstant(res.startedAt);
  const { title, notes } = unpackNotes(res.notes, FALLBACK_TITLE[type]);
  return {
    id: res.id,
    type,
    title,
    date,
    startTime: time,
    duration: res.durationMinutes,
    distance: res.distanceKm ?? 0,
    calories: Math.round(res.caloriesBurned ?? 0),
    intensity: INTENSITY_FROM_BACKEND[res.intensity],
    notes,
  };
}

function toRequest(workout: Omit<Workout, 'id'>): Record<string, unknown> {
  return {
    activityType: TYPE_TO_BACKEND[workout.type],
    startedAt: toInstant(workout.date, workout.startTime),
    durationMinutes: Math.max(1, Math.round(workout.duration)),
    intensity: INTENSITY_TO_BACKEND[workout.intensity],
    caloriesBurned: workout.calories,
    distanceKm: workout.distance,
    completed: true,
    notes: packNotes(workout.title, workout.notes),
  };
}

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
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.wellnessApiUrl}/wellness/workouts`;

  private readonly workoutsSignal = signal<Workout[]>([]);
  readonly workouts = this.workoutsSignal.asReadonly();

  readonly selectedWorkoutId = signal<string | null>(null);
  readonly selectedWorkout = computed(
    () => this.workoutsSignal().find((workout) => workout.id === this.selectedWorkoutId()) ?? null,
  );

  readonly today = toISODate(offsetDays(0));

  constructor() {
    this.http
      .get<PageResponse<WorkoutResponse>>(this.baseUrl, {
        params: new HttpParams().set('page', '0').set('size', '100').set('sort', 'startedAt,desc'),
      })
      .subscribe({
        next: (page) => this.workoutsSignal.set(page.content.map(fromResponse)),
        error: (err) => {
          console.error('Failed to load workouts', err);
          this.workoutsSignal.set([]);
        },
      });
  }

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

  // wellness-service has no dedicated step-count entity yet; estimate from logged distance
  // as a reasonable placeholder until a real pedometer/steps source is wired in.
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
    const tempId = `temp-${Date.now()}`;
    this.workoutsSignal.update((list) => [{ ...workout, id: tempId }, ...list]);

    this.http.post<WorkoutResponse>(this.baseUrl, toRequest(workout)).subscribe({
      next: (res) => {
        const created = fromResponse(res);
        this.workoutsSignal.update((list) =>
          list.map((item) => (item.id === tempId ? created : item)),
        );
      },
      error: (err) => {
        console.error('Failed to create workout', err);
        this.workoutsSignal.update((list) => list.filter((item) => item.id !== tempId));
      },
    });
  }

  updateWorkout(workout: Workout): void {
    this.workoutsSignal.update((list) =>
      list.map((item) => (item.id === workout.id ? { ...workout } : item)),
    );
    this.http.put<WorkoutResponse>(`${this.baseUrl}/${workout.id}`, toRequest(workout)).subscribe({
      next: (res) => {
        const updated = fromResponse(res);
        this.workoutsSignal.update((list) =>
          list.map((item) => (item.id === workout.id ? updated : item)),
        );
      },
      error: (err) => console.error('Failed to update workout', err),
    });
  }

  deleteWorkout(id: string): void {
    this.workoutsSignal.update((list) => list.filter((item) => item.id !== id));
    if (this.selectedWorkoutId() === id) {
      this.selectedWorkoutId.set(null);
    }
    this.http.delete(`${this.baseUrl}/${id}`).subscribe({
      error: (err) => console.error('Failed to delete workout', err),
    });
  }
}
