import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import type { ChartConfiguration } from 'chart.js/auto';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import { AiService } from '../../ai/services/ai.service';
import {
  FATIGUE_LABEL_KEYS,
  HYDRATION_GOAL_ML,
  MOOD_LABEL_KEYS,
  PERIOD_LABEL_KEYS,
  SLEEP_GOAL_MINUTES,
  STRESS_LABEL_KEYS,
  dayKey,
  formatLiters,
  formatMinutes,
  offsetDays,
  type DayMetrics,
  type FatigueLevel,
  type GoalKind,
  type HydrationEntry,
  type ScorePart,
  type SleepNight,
  type StressLevel,
  type TimelineItem,
  type WellnessGoal,
  type WellnessInsight,
  type WellnessPeriod,
} from '../models/wellness.models';

const NAVY = '#1B3A57';
const TEAL = '#2A9D9D';
const TEAL_LIGHT = '#7FD1D1';
const INK_FAINT = '#8494A3';
const INK_MUTED = '#52616F';

const CHART_TITLE_KEYS: Record<WellnessPeriod, string> = {
  today: 'wellness.chart.titleToday',
  '7d': 'wellness.chart.titleWeek',
  '30d': 'wellness.chart.titleMonth',
};

const BALANCE_SUBTITLE_KEYS: Record<WellnessPeriod, string> = {
  today: 'wellness.overview.subtitleDaily',
  '7d': 'wellness.overview.subtitleWeekly',
  '30d': 'wellness.overview.subtitleMonthly',
};

interface PageResponse<T> {
  content: T[];
}

interface SleepResponse {
  id: string;
  sleepStart: string;
  wakeTime: string;
  durationMinutes: number | null;
  qualityScore: number | null;
}

interface WaterResponse {
  id: string;
  quantityMl: number;
  consumedAt: string;
}

interface MoodResponse {
  id: string;
  recordedAt: string;
  moodLevel: number;
  stressLevel: number;
  fatigueLevel: number;
}

interface WorkoutResponse {
  id: string;
  startedAt: string;
  durationMinutes: number;
  activityType: string;
}

interface MealResponse {
  id: string;
  mealType: string;
  description: string;
  mealTime: string;
}

interface GoalResponse {
  id: string;
  goalType: string;
  targetValue: number;
  currentValue: number | null;
  unit: string;
  status: string;
}

const pad2 = (value: number): string => String(value).padStart(2, '0');

function timeOf(iso: string): string {
  const dt = new Date(iso);
  return `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
}

function startOfDayIso(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfDayIso(date: Date): string {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function moodFromBackend(level: number): number {
  return Math.max(1, Math.min(5, Math.round(level / 2)));
}

function moodToBackend(mood: number): number {
  return Math.max(1, Math.min(10, mood * 2));
}

function stressFromBackend(level: number): StressLevel {
  if (level <= 3) return 'low';
  if (level <= 6) return 'moderate';
  return 'high';
}

function stressToBackend(stress: StressLevel): number {
  if (stress === 'low') return 2;
  if (stress === 'moderate') return 5;
  return 8;
}

function fatigueFromBackend(level: number): FatigueLevel {
  if (level <= 3) return 'low';
  if (level <= 6) return 'moderate';
  return 'high';
}

function fatigueToBackend(fatigue: FatigueLevel): number {
  if (fatigue === 'low') return 2;
  if (fatigue === 'moderate') return 5;
  return 8;
}

function toSleepNight(res: SleepResponse): SleepNight {
  const minutes =
    res.durationMinutes ??
    Math.max(0, Math.round((new Date(res.wakeTime).getTime() - new Date(res.sleepStart).getTime()) / 60_000));
  return {
    id: res.id,
    date: dayKey(new Date(res.wakeTime)),
    bedTime: timeOf(res.sleepStart),
    wakeTime: timeOf(res.wakeTime),
    sleepMinutes: minutes,
    consistency: res.qualityScore ? Math.round((res.qualityScore / 10) * 100) : 75,
  };
}

function emptyNight(date: string): SleepNight {
  return { date, bedTime: '23:00', wakeTime: '07:00', sleepMinutes: 0, consistency: 0 };
}

function sleepInstants(bedTime: string, wakeTime: string): { sleepStart: string; wakeTime: string } {
  const [bh, bm] = bedTime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  const wake = new Date();
  wake.setHours(wh, wm, 0, 0);
  const start = new Date(wake);
  start.setHours(bh, bm, 0, 0);
  if (start.getTime() >= wake.getTime()) {
    start.setDate(start.getDate() - 1);
  }
  return { sleepStart: start.toISOString(), wakeTime: wake.toISOString() };
}

function rangeParams(from: Date, to: Date, size = 500): HttpParams {
  return new HttpParams()
    .set('from', startOfDayIso(from))
    .set('to', endOfDayIso(to))
    .set('page', '0')
    .set('size', String(size));
}

function computeBalance(metrics: Pick<DayMetrics, 'sleepMinutes' | 'hydrationMl' | 'mood' | 'stress'>): number {
  return Math.round(
    (metrics.sleepMinutes / SLEEP_GOAL_MINUTES) * 30 +
      (metrics.hydrationMl / HYDRATION_GOAL_ML) * 25 +
      metrics.mood * 5 +
      (metrics.stress === 'low' ? 18 : metrics.stress === 'moderate' ? 14 : 9),
  );
}

@Injectable({ providedIn: 'root' })
export class WellnessService {
  private readonly languageService = inject(LanguageService);
  private readonly http = inject(HttpClient);
  private readonly ai = inject(AiService);
  private readonly baseUrl = `${environment.wellnessApiUrl}/wellness`;

  readonly period = signal<WellnessPeriod>('7d');
  readonly loading = signal(false);

  readonly hydrationEntries = signal<HydrationEntry[]>([]);
  readonly sleepToday = signal<SleepNight>(emptyNight(dayKey(offsetDays(0))));
  readonly sleepNights = signal<SleepNight[]>([]);
  readonly mood = signal<number>(3);
  readonly stress = signal<StressLevel>('moderate');
  readonly fatigue = signal<FatigueLevel>('moderate');
  private readonly goalsInput = signal<WellnessGoal[]>([]);
  private readonly dailyMetrics = signal<DayMetrics[]>([]);
  private readonly mealsToday = signal<MealResponse[]>([]);
  private readonly workoutsToday = signal<WorkoutResponse[]>([]);
  private readonly liveRecommendation = signal<string | null>(null);

  readonly periodLabel = computed(() => this.languageService.translate(PERIOD_LABEL_KEYS[this.period()]));
  readonly moodLabel = computed(() => this.languageService.translate(MOOD_LABEL_KEYS[this.mood()]));
  readonly stressLabel = computed(() => this.languageService.translate(STRESS_LABEL_KEYS[this.stress()]));
  readonly fatigueLabel = computed(() => this.languageService.translate(FATIGUE_LABEL_KEYS[this.fatigue()]));

  private readonly locale = computed(() =>
    this.languageService.activeLanguage() === 'fr'
      ? 'fr-FR'
      : this.languageService.activeLanguage() === 'en'
        ? 'en-US'
        : 'ar-EG',
  );

  private readonly weekdayShort = computed(() =>
    new Intl.DateTimeFormat(this.locale(), { weekday: 'short' }),
  );

  private readonly dayShort = computed(() =>
    new Intl.DateTimeFormat(this.locale(), { day: 'numeric', month: 'short' }),
  );

  private readonly todayHourLabels = computed(() =>
    ['08', '10', '12', '14', '16', '18', '20'].map((hour) =>
      this.languageService.activeLanguage() === 'fr' ? `${hour}h` : `${hour}:00`,
    ),
  );

  readonly hydrationTotal = computed(() =>
    this.hydrationEntries().reduce((sum, entry) => sum + entry.ml, 0),
  );
  readonly hydrationPercent = computed(() =>
    Math.min(100, Math.round((this.hydrationTotal() / HYDRATION_GOAL_ML) * 100)),
  );
  readonly hydrationLabel = computed(() => formatLiters(this.hydrationTotal(), this.locale()));
  readonly hydrationGoalLabel = computed(() => formatLiters(HYDRATION_GOAL_ML, this.locale()));

  readonly sleepPercent = computed(() =>
    Math.min(100, Math.round((this.sleepToday().sleepMinutes / SLEEP_GOAL_MINUTES) * 100)),
  );
  readonly sleepDuration = computed(() => formatMinutes(this.sleepToday().sleepMinutes, this.locale()));
  readonly sleepDeltaMinutes = computed(() => {
    const nights = this.sleepNights();
    if (nights.length < 2) {
      return 0;
    }
    return nights[nights.length - 1].sleepMinutes - nights[nights.length - 2].sleepMinutes;
  });
  readonly sleepDeltaLabel = computed(() =>
    this.sleepDeltaMinutes() >= 0
      ? `+${this.sleepDeltaMinutes()} min`
      : `${this.sleepDeltaMinutes()} min`,
  );

  readonly goals = computed(() =>
    this.goalsInput().map((goal) => ({
      id: goal.id,
      kind: goal.kind,
      labelKey: goal.labelKey,
      unitKey: goal.unitKey,
      progress: goal.progress,
      current: this.formatGoalValue(goal.kind, goal.value),
      target: this.formatGoalValue(goal.kind, goal.target),
    })),
  );

  readonly metricsFor = computed<DayMetrics[]>(() => {
    const all = this.dailyMetrics();
    switch (this.period()) {
      case 'today':
        return all.slice(-1);
      case '7d':
        return all.slice(-7);
      default:
        return all;
    }
  });

  readonly last7Days = computed(() => this.dailyMetrics().slice(-7));

  readonly balance = computed(() => {
    const metrics = this.metricsFor();
    if (!metrics.length) {
      return 0;
    }
    return Math.round(metrics.reduce((sum, m) => sum + m.balance, 0) / metrics.length);
  });

  readonly balanceDelta = computed(() => {
    const all = this.dailyMetrics();
    if (this.period() === 'today') {
      if (all.length < 2) {
        return 0;
      }
      return all[all.length - 1].balance - all[all.length - 2].balance;
    }
    const current = this.metricsFor();
    const window = current.length;
    const previous = all.slice(-window * 2, -window);
    if (!previous.length || !window) {
      return 0;
    }
    const avgCurrent = current.reduce((s, m) => s + m.balance, 0) / window;
    const avgPrevious = previous.reduce((s, m) => s + m.balance, 0) / window;
    return Math.round(avgCurrent - avgPrevious);
  });

  readonly balanceSubtitle = computed(() =>
    this.languageService.translate(BALANCE_SUBTITLE_KEYS[this.period()]),
  );

  readonly chartConfig = computed<ChartConfiguration>(() => {
    switch (this.period()) {
      case 'today':
        return this.buildTodayChart();
      case '7d':
        return this.buildWeekChart();
      default:
        return this.buildMonthChart();
    }
  });

  readonly chartTitle = computed(() =>
    this.languageService.translate(CHART_TITLE_KEYS[this.period()]),
  );

  readonly insight = computed<WellnessInsight>(() => {
    const aiInsight = this.ai.insights().find((item) => item.category === 'wellness');
    const recommendation = this.liveRecommendation() ?? aiInsight?.recommendation;
    const period = this.period();
    const factors =
      period === 'today'
        ? [
            { labelKey: 'wellness.sleep', value: this.sleepDuration() },
            { labelKey: 'wellness.hydration', value: this.hydrationLabel() },
            { labelKey: 'wellness.mood', value: this.moodLabel() },
            { labelKey: 'wellness.stress', value: this.stressLabel() },
          ]
        : [
            {
              labelKey: 'wellness.insight.avgSleep',
              value: formatMinutes(this.averageSleepMinutes(), this.locale()),
            },
            {
              labelKey: 'wellness.hydration',
              valueKey: 'wellness.insight.perDay',
              valueArgs: { value: formatLiters(this.averageHydrationMl(), this.locale()) },
            },
            { labelKey: 'wellness.mood', value: this.moodLabel() },
            { labelKey: 'wellness.stress', value: this.stressLabel() },
          ];
    return {
      titleKey:
        period === 'today'
          ? 'wellness.insight.today.title'
          : period === '7d'
            ? 'wellness.insight.week.title'
            : 'wellness.insight.month.title',
      messageKey:
        period === 'today'
          ? 'wellness.insight.today.message'
          : period === '7d'
            ? 'wellness.insight.week.message'
            : 'wellness.insight.month.message',
      recommendationKey:
        period === 'today'
          ? 'wellness.insight.today.recommendation'
          : period === '7d'
            ? 'wellness.insight.week.recommendation'
            : 'wellness.insight.month.recommendation',
      title: aiInsight?.title,
      message: aiInsight?.explanation,
      recommendation,
      confidence: aiInsight?.confidence ?? 80,
      factors,
    };
  });

  readonly breakdown = computed<ScorePart[]>(() => {
    const metrics = this.metricsFor();
    if (!metrics.length) {
      return [
        { labelKey: 'wellness.sleep', score: 0 },
        { labelKey: 'wellness.hydration', score: 0 },
        { labelKey: 'wellness.mood', score: 0 },
        { labelKey: 'wellness.stress', score: 0 },
      ];
    }
    const avg = (pick: (m: DayMetrics) => number) =>
      Math.round(metrics.reduce((sum, m) => sum + pick(m), 0) / metrics.length);
    return [
      { labelKey: 'wellness.sleep', score: avg((m) => this.sleepPctOf(m)) },
      { labelKey: 'wellness.hydration', score: avg((m) => this.hydrationPct(m)) },
      { labelKey: 'wellness.mood', score: avg((m) => m.mood * 20) },
      {
        labelKey: 'wellness.stress',
        score: avg((m) => (m.stress === 'low' ? 90 : m.stress === 'moderate' ? 65 : 35)),
      },
    ];
  });
  readonly breakdownTotal = computed(() => this.balance());

  readonly timelineItems = computed<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    const night = this.sleepToday();
    if (night.sleepMinutes > 0) {
      items.push({
        id: `wake-${night.id ?? night.date}`,
        time: night.wakeTime,
        titleKey: 'wellness.timeline.wake',
        detailKey: 'wellness.timeline.wakeDetail',
        kind: 'wake',
      });
    }
    for (const meal of this.mealsToday()) {
      items.push({
        id: meal.id,
        time: timeOf(meal.mealTime),
        title: meal.description || meal.mealType,
        detail: meal.mealType,
        kind: 'meal',
      });
    }
    for (const water of this.hydrationEntries()) {
      items.push({
        id: water.id,
        time: water.time,
        titleKey: 'wellness.hydration',
        detailKey: 'wellness.timeline.hydrationDetail',
        detailVars: { value: String(water.ml) },
        kind: 'hydration',
      });
    }
    for (const workout of this.workoutsToday()) {
      items.push({
        id: workout.id,
        time: timeOf(workout.startedAt),
        titleKey: 'wellness.timeline.activity',
        detailKey: 'wellness.timeline.activityDetail',
        detailVars: { value: String(workout.durationMinutes) },
        kind: 'activity',
      });
    }
    if (night.sleepMinutes > 0) {
      items.push({
        id: `sleep-${night.id ?? night.date}`,
        time: night.bedTime,
        titleKey: 'wellness.timeline.bedtime',
        detailKey: 'wellness.timeline.sleepDetail',
        kind: 'sleep',
      });
    }
    return items.sort((a, b) => a.time.localeCompare(b.time));
  });

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    const from = offsetDays(-29);
    const to = offsetDays(0);
    const params = rangeParams(from, to);
    const todayParams = rangeParams(offsetDays(0), offsetDays(0), 50);

    forkJoin({
      sleep: this.http
        .get<PageResponse<SleepResponse>>(`${this.baseUrl}/sleep`, { params })
        .pipe(catchError(() => of({ content: [] }))),
      water: this.http
        .get<PageResponse<WaterResponse>>(`${this.baseUrl}/water`, { params })
        .pipe(catchError(() => of({ content: [] }))),
      mood: this.http
        .get<PageResponse<MoodResponse>>(`${this.baseUrl}/mood`, { params })
        .pipe(catchError(() => of({ content: [] }))),
      workouts: this.http
        .get<PageResponse<WorkoutResponse>>(`${this.baseUrl}/workouts`, { params })
        .pipe(catchError(() => of({ content: [] }))),
      meals: this.http
        .get<PageResponse<MealResponse>>(`${this.baseUrl}/meals`, { params: todayParams })
        .pipe(catchError(() => of({ content: [] }))),
      goals: this.http
        .get<PageResponse<GoalResponse>>(`${this.baseUrl}/goals`, {
          params: new HttpParams().set('page', '0').set('size', '20'),
        })
        .pipe(catchError(() => of({ content: [] }))),
      dashboard: this.http
        .get<{ recommendations?: string[] }>(`${this.baseUrl}/dashboard`)
        .pipe(catchError(() => of({ recommendations: [] as string[] }))),
    }).subscribe({
      next: (data) => {
        this.applyPayload(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setPeriod(period: WellnessPeriod): void {
    this.period.set(period);
  }

  addHydration(ml: number): void {
    const now = new Date();
    const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    const optimistic: HydrationEntry = { id: crypto.randomUUID(), time, ml };
    this.hydrationEntries.update((entries) => [...entries, optimistic]);
    this.http
      .post<WaterResponse>(`${this.baseUrl}/water`, {
        quantityMl: ml,
        consumedAt: now.toISOString(),
        beverageType: 'WATER',
      })
      .subscribe({
        next: (res) => {
          this.hydrationEntries.update((entries) =>
            entries.map((entry) =>
              entry.id === optimistic.id ? { id: res.id, time: timeOf(res.consumedAt), ml: res.quantityMl } : entry,
            ),
          );
          this.refreshMetricsFromState();
        },
        error: () => {
          this.hydrationEntries.update((entries) => entries.filter((entry) => entry.id !== optimistic.id));
        },
      });
  }

  setMood(mood: number): void {
    this.mood.set(mood);
    this.persistMood();
  }

  setStress(stress: StressLevel): void {
    this.stress.set(stress);
    this.persistMood();
  }

  setSleep(bedTime: string, wakeTime: string): void {
    const instants = sleepInstants(bedTime, wakeTime);
    let minutes = Math.round(
      (new Date(instants.wakeTime).getTime() - new Date(instants.sleepStart).getTime()) / 60_000,
    );
    if (minutes <= 0) {
      minutes = this.sleepToday().sleepMinutes;
    }
    const night: SleepNight = {
      id: this.sleepToday().id,
      date: dayKey(offsetDays(0)),
      bedTime,
      wakeTime,
      sleepMinutes: minutes,
      consistency: this.sleepToday().consistency || 80,
    };
    this.sleepToday.set(night);
    this.sleepNights.update((nights) => {
      const next = nights.map((item) => ({ ...item }));
      const todayIndex = next.findIndex((item) => item.date === night.date);
      if (todayIndex >= 0) {
        next[todayIndex] = night;
      } else {
        next.push(night);
      }
      return next;
    });

    const body = {
      sleepStart: instants.sleepStart,
      wakeTime: instants.wakeTime,
      qualityScore: 8,
      interruptions: 0,
    };
    const request = night.id
      ? this.http.put<SleepResponse>(`${this.baseUrl}/sleep/${night.id}`, body)
      : this.http.post<SleepResponse>(`${this.baseUrl}/sleep`, body);
    request.subscribe({
      next: (res) => {
        const saved = toSleepNight(res);
        this.sleepToday.set(saved);
        this.refreshMetricsFromState();
      },
      error: () => void 0,
    });
  }

  setActivity(minutes: number): void {
    this.goalsInput.update((goals) =>
      goals.map((goal) =>
        goal.id === 'goal-pause'
          ? {
              ...goal,
              value: minutes,
              progress: Math.min(100, Math.round((minutes / 30) * 100)),
            }
          : goal,
      ),
    );
    this.http
      .post<WorkoutResponse>(`${this.baseUrl}/workouts`, {
        activityType: 'OTHER',
        startedAt: new Date().toISOString(),
        durationMinutes: minutes,
        intensity: 'MODERATE',
        completed: true,
        notes: 'Active break',
      })
      .subscribe({
        next: (res) => {
          this.workoutsToday.update((items) => [...items, res]);
          this.refreshMetricsFromState();
        },
        error: () => void 0,
      });
  }

  sleepPct(night: SleepNight): number {
    return Math.round((night.sleepMinutes / SLEEP_GOAL_MINUTES) * 100);
  }

  hydrationPct(metrics: DayMetrics): number {
    return Math.round((metrics.hydrationMl / HYDRATION_GOAL_ML) * 100);
  }

  sleepPctOf(metrics: DayMetrics): number {
    return Math.round((metrics.sleepMinutes / SLEEP_GOAL_MINUTES) * 100);
  }

  private persistMood(): void {
    this.http
      .post<MoodResponse>(`${this.baseUrl}/mood`, {
        recordedAt: new Date().toISOString(),
        moodLevel: moodToBackend(this.mood()),
        stressLevel: stressToBackend(this.stress()),
        fatigueLevel: fatigueToBackend(this.fatigue()),
      })
      .subscribe({
        next: () => this.refreshMetricsFromState(),
        error: () => void 0,
      });
  }

  private applyPayload(data: {
    sleep: PageResponse<SleepResponse>;
    water: PageResponse<WaterResponse>;
    mood: PageResponse<MoodResponse>;
    workouts: PageResponse<WorkoutResponse>;
    meals: PageResponse<MealResponse>;
    goals: PageResponse<GoalResponse>;
    dashboard: { recommendations?: string[] };
  }): void {
    const today = dayKey(offsetDays(0));
    const nights = data.sleep.content.map(toSleepNight).sort((a, b) => a.date.localeCompare(b.date));
    const todayNight = [...nights].reverse().find((night) => night.date === today) ?? nights.at(-1);
    this.sleepNights.set(nights.slice(-7));
    this.sleepToday.set(todayNight ?? emptyNight(today));

    const todayWater = data.water.content.filter((item) => dayKey(new Date(item.consumedAt)) === today);
    this.hydrationEntries.set(
      todayWater.map((item) => ({ id: item.id, time: timeOf(item.consumedAt), ml: item.quantityMl })),
    );

    const latestMood = [...data.mood.content].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    )[0];
    if (latestMood) {
      this.mood.set(moodFromBackend(latestMood.moodLevel));
      this.stress.set(stressFromBackend(latestMood.stressLevel));
      this.fatigue.set(fatigueFromBackend(latestMood.fatigueLevel));
    }

    this.mealsToday.set(data.meals.content);
    this.workoutsToday.set(
      data.workouts.content.filter((item) => dayKey(new Date(item.startedAt)) === today),
    );
    this.liveRecommendation.set(data.dashboard.recommendations?.[0] ?? null);

    this.dailyMetrics.set(
      this.buildDailyMetrics(data.sleep.content, data.water.content, data.mood.content, data.workouts.content),
    );
    this.goalsInput.set(
      this.buildGoals(data.goals.content, this.workoutsToday().reduce((sum, item) => sum + item.durationMinutes, 0)),
    );
  }

  private refreshMetricsFromState(): void {
    const today = dayKey(offsetDays(0));
    this.dailyMetrics.update((days) =>
      days.map((day) => {
        if (day.date !== today) {
          return day;
        }
        const next = {
          ...day,
          sleepMinutes: this.sleepToday().sleepMinutes,
          hydrationMl: this.hydrationTotal(),
          mood: this.mood(),
          stress: this.stress(),
          fatigue: this.fatigue(),
        };
        return { ...next, balance: computeBalance(next) };
      }),
    );
    this.goalsInput.set(
      this.buildGoals([], this.workoutsToday().reduce((sum, item) => sum + item.durationMinutes, 0)),
    );
  }

  private buildDailyMetrics(
    sleep: SleepResponse[],
    water: WaterResponse[],
    moods: MoodResponse[],
    workouts: WorkoutResponse[],
  ): DayMetrics[] {
    const days: DayMetrics[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = dayKey(offsetDays(-i));
      const night = sleep
        .map(toSleepNight)
        .filter((item) => item.date === date)
        .at(-1);
      const hydrationMl = water
        .filter((item) => dayKey(new Date(item.consumedAt)) === date)
        .reduce((sum, item) => sum + item.quantityMl, 0);
      const moodRecord = moods
        .filter((item) => dayKey(new Date(item.recordedAt)) === date)
        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
      const sleepMinutes = night?.sleepMinutes ?? 0;
      const mood = moodRecord ? moodFromBackend(moodRecord.moodLevel) : 3;
      const stress = moodRecord ? stressFromBackend(moodRecord.stressLevel) : 'moderate';
      const fatigue = moodRecord
        ? fatigueFromBackend(moodRecord.fatigueLevel)
        : sleepMinutes && sleepMinutes < 400
          ? 'high'
          : 'moderate';
      const metrics = { sleepMinutes, hydrationMl, mood, stress };
      days.push({
        date,
        balance: computeBalance(metrics),
        sleepMinutes,
        hydrationMl,
        mood,
        stress,
        fatigue,
      });
    }
    void workouts;
    return days;
  }

  private buildGoals(remote: GoalResponse[], activityMinutes: number): WellnessGoal[] {
    const sleepGoal = remote.find((goal) => goal.goalType === 'SLEEP_DURATION' && goal.status !== 'CANCELLED');
    const waterGoal = remote.find((goal) => goal.goalType === 'DAILY_WATER' && goal.status !== 'CANCELLED');
    const sleepTarget = sleepGoal?.targetValue ?? SLEEP_GOAL_MINUTES;
    const waterTarget = waterGoal?.targetValue ?? HYDRATION_GOAL_ML;
    const sleepValue = this.sleepToday().sleepMinutes;
    const waterValue = this.hydrationTotal();
    return [
      {
        id: sleepGoal?.id ?? 'goal-sleep',
        labelKey: 'wellness.sleep',
        unitKey: 'wellness.goals.perNight',
        kind: 'sleep',
        value: sleepValue,
        target: sleepTarget,
        progress: Math.min(100, Math.round((sleepValue / sleepTarget) * 100)),
      },
      {
        id: waterGoal?.id ?? 'goal-hydra',
        labelKey: 'wellness.hydration',
        unitKey: 'wellness.goals.perDay',
        kind: 'hydration',
        value: waterValue,
        target: waterTarget,
        progress: Math.min(100, Math.round((waterValue / waterTarget) * 100)),
      },
      {
        id: 'goal-pause',
        labelKey: 'wellness.activeBreak',
        unitKey: 'wellness.goals.perDay',
        kind: 'minutes',
        value: activityMinutes,
        target: 30,
        progress: Math.min(100, Math.round((activityMinutes / 30) * 100)),
      },
    ];
  }

  private averageSleepMinutes(): number {
    const metrics = this.metricsFor();
    if (!metrics.length) {
      return 0;
    }
    return Math.round(metrics.reduce((sum, item) => sum + item.sleepMinutes, 0) / metrics.length);
  }

  private averageHydrationMl(): number {
    const metrics = this.metricsFor();
    if (!metrics.length) {
      return 0;
    }
    return Math.round(metrics.reduce((sum, item) => sum + item.hydrationMl, 0) / metrics.length);
  }

  private formatGoalValue(kind: GoalKind, value: number): string {
    switch (kind) {
      case 'sleep':
        return formatMinutes(value, this.locale());
      case 'hydration':
        return formatLiters(value, this.locale());
      default:
        return `${value} min`;
    }
  }

  private readonly baseOptions = (showLegend: boolean): ChartConfiguration['options'] => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: showLegend,
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
        bodyColor: 'rgba(255,255,255,0.8)',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: INK_FAINT, font: { size: 10 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(27,58,87,0.06)' },
        border: { display: false },
        ticks: { color: INK_FAINT, font: { size: 10 }, callback: (value) => `${value}%` },
      },
    },
  });

  private buildTodayChart(): ChartConfiguration {
    const entries = this.hydrationEntries();
    const points = this.todayHourLabels().map((label, index) => {
      const hour = 8 + index * 2;
      const consumed = entries
        .filter((entry) => Number(entry.time.slice(0, 2)) <= hour)
        .reduce((sum, entry) => sum + entry.ml, 0);
      return Math.min(100, Math.round((consumed / HYDRATION_GOAL_ML) * 100) || this.balance());
    });
    return {
      type: 'line',
      data: {
        labels: this.todayHourLabels(),
        datasets: [
          {
            label: this.languageService.translate('wellness.balance'),
            data: points,
            borderColor: TEAL,
            backgroundColor: 'rgba(42,157,157,0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: TEAL,
          },
        ],
      },
      options: this.baseOptions(false),
    };
  }

  private buildWeekChart(): ChartConfiguration {
    const metrics = this.dailyMetrics().slice(-7);
    return {
      type: 'line',
      data: {
        labels: metrics.map((m) => this.weekdayShort().format(new Date(`${m.date}T12:00:00`))),
        datasets: [
          {
            label: this.languageService.translate('wellness.balance'),
            data: metrics.map((m) => m.balance),
            borderColor: NAVY,
            backgroundColor: 'rgba(27,58,87,0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: NAVY,
          },
          {
            label: this.languageService.translate('wellness.sleep'),
            data: metrics.map((m) => this.sleepPctOf(m)),
            borderColor: TEAL,
            backgroundColor: TEAL,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            label: this.languageService.translate('wellness.hydration'),
            data: metrics.map((m) => this.hydrationPct(m)),
            borderColor: TEAL_LIGHT,
            backgroundColor: TEAL_LIGHT,
            tension: 0.35,
            borderWidth: 2,
            borderDash: [4, 4],
            pointRadius: 0,
          },
        ],
      },
      options: this.baseOptions(true),
    };
  }

  private buildMonthChart(): ChartConfiguration {
    const metrics = this.dailyMetrics();
    return {
      type: 'line',
      data: {
        labels: metrics.map((m) => this.dayShort().format(new Date(`${m.date}T12:00:00`))),
        datasets: [
          {
            label: this.languageService.translate('wellness.balance'),
            data: metrics.map((m) => m.balance),
            borderColor: NAVY,
            backgroundColor: 'rgba(27,58,87,0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            label: this.languageService.translate('wellness.hydration'),
            data: metrics.map((m) => this.hydrationPct(m)),
            borderColor: TEAL,
            backgroundColor: TEAL,
            tension: 0.35,
            borderWidth: 2,
            borderDash: [4, 4],
            pointRadius: 0,
          },
        ],
      },
      options: this.baseOptions(true),
    };
  }
}
