import { Injectable, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import type { ChartConfiguration } from 'chart.js/auto';
import {
  FATIGUE_LABEL_KEYS,
  HYDRATION_GOAL_ML,
  MOOD_LABEL_KEYS,
  MOCK_GOALS,
  MOCK_HYDRATION_ENTRIES,
  MOCK_METRICS_30,
  MOCK_SLEEP_NIGHTS,
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

const BREAKDOWN: Record<WellnessPeriod, ScorePart[]> = {
  today: [
    { labelKey: 'wellness.sleep', score: 78 },
    { labelKey: 'wellness.hydration', score: 68 },
    { labelKey: 'wellness.mood', score: 88 },
    { labelKey: 'wellness.stress', score: 90 },
  ],
  '7d': [
    { labelKey: 'wellness.sleep', score: 81 },
    { labelKey: 'wellness.hydration', score: 72 },
    { labelKey: 'wellness.mood', score: 85 },
    { labelKey: 'wellness.stress', score: 86 },
  ],
  '30d': [
    { labelKey: 'wellness.sleep', score: 76 },
    { labelKey: 'wellness.hydration', score: 70 },
    { labelKey: 'wellness.mood', score: 82 },
    { labelKey: 'wellness.stress', score: 84 },
  ],
};

const INSIGHTS: Record<WellnessPeriod, Omit<WellnessInsight, 'factors'>> = {
  today: {
    titleKey: 'wellness.insight.today.title',
    messageKey: 'wellness.insight.today.message',
    recommendationKey: 'wellness.insight.today.recommendation',
    confidence: 86,
  },
  '7d': {
    titleKey: 'wellness.insight.week.title',
    messageKey: 'wellness.insight.week.message',
    recommendationKey: 'wellness.insight.week.recommendation',
    confidence: 84,
  },
  '30d': {
    titleKey: 'wellness.insight.month.title',
    messageKey: 'wellness.insight.month.message',
    recommendationKey: 'wellness.insight.month.recommendation',
    confidence: 82,
  },
};

@Injectable({ providedIn: 'root' })
export class WellnessService {
  private readonly languageService = inject(LanguageService);

  readonly period = signal<WellnessPeriod>('7d');

  readonly hydrationEntries = signal<HydrationEntry[]>([...MOCK_HYDRATION_ENTRIES]);
  readonly sleepToday = signal<SleepNight>({ ...MOCK_SLEEP_NIGHTS[MOCK_SLEEP_NIGHTS.length - 1] });
  readonly sleepNights = signal<SleepNight[]>(MOCK_SLEEP_NIGHTS.map((n) => ({ ...n })));
  readonly mood = signal<number>(4);
  readonly stress = signal<StressLevel>('low');
  readonly fatigue = signal<FatigueLevel>('moderate');
  private readonly goalsInput = signal<WellnessGoal[]>([...MOCK_GOALS]);

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
  readonly sleepDeltaMinutes = computed(
    () =>
      this.sleepToday().sleepMinutes -
      this.sleepNights()[Math.max(0, this.sleepNights().length - 2)].sleepMinutes,
  );
  readonly sleepDeltaLabel = computed(() =>
    this.sleepDeltaMinutes() >= 0
      ? `+${this.sleepDeltaMinutes()} min`
      : `${this.sleepDeltaMinutes()} min`,
  );

  readonly goals = computed(() =>
    this.goalsInput().map((goal) => ({
      id: goal.id,
      labelKey: goal.labelKey,
      unitKey: goal.unitKey,
      progress: goal.progress,
      current: this.formatGoalValue(goal.kind, goal.value),
      target: this.formatGoalValue(goal.kind, goal.target),
    })),
  );

  readonly metricsFor = computed<DayMetrics[]>(() => {
    switch (this.period()) {
      case 'today':
        return [MOCK_METRICS_30[MOCK_METRICS_30.length - 1]];
      case '7d':
        return MOCK_METRICS_30.slice(-7);
      default:
        return MOCK_METRICS_30;
    }
  });

  readonly balance = computed(() => {
    const metrics = this.metricsFor();
    return Math.round(metrics.reduce((sum, m) => sum + m.balance, 0) / metrics.length);
  });

  readonly balanceDelta = computed(() => {
    if (this.period() === 'today') {
      const today = MOCK_METRICS_30[MOCK_METRICS_30.length - 1];
      const yesterday = MOCK_METRICS_30[MOCK_METRICS_30.length - 2];
      return today.balance - yesterday.balance;
    }
    const current = this.metricsFor();
    const window = current.length;
    const previous = MOCK_METRICS_30.slice(-window * 2, -window);
    if (!previous.length) {
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
    const base = INSIGHTS[this.period()];
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
            { labelKey: 'wellness.insight.avgSleep', value: formatMinutes(432, this.locale()) },
            {
              labelKey: 'wellness.hydration',
              valueKey: 'wellness.insight.perDay',
              valueArgs: { value: formatLiters(1700, this.locale()) },
            },
            {
              labelKey: 'wellness.mood',
              valueKey: period === '7d' ? 'wellness.insight.stable' : 'wellness.insight.positive',
            },
            { labelKey: 'wellness.stress', valueKey: 'wellness.insight.lowToModerate' },
          ];
    return { ...base, factors };
  });

  readonly breakdown = computed<ScorePart[]>(() => BREAKDOWN[this.period()]);
  readonly breakdownTotal = computed(() => this.balance());

  setPeriod(period: WellnessPeriod): void {
    this.period.set(period);
  }

  addHydration(ml: number): void {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.hydrationEntries.update((entries) => [...entries, { id: crypto.randomUUID(), time, ml }]);
  }

  setMood(mood: number): void {
    this.mood.set(mood);
  }

  setStress(stress: StressLevel): void {
    this.stress.set(stress);
  }

  setSleep(bedTime: string, wakeTime: string): void {
    const [bh, bm] = bedTime.split(':').map(Number);
    const [wh, wm] = wakeTime.split(':').map(Number);
    let minutes = wh * 60 + wm - (bh * 60 + bm);
    if (minutes < 0) {
      minutes += 24 * 60;
    }
    if (minutes <= 0) {
      minutes = this.sleepToday().sleepMinutes;
    }
    const night: SleepNight = {
      date: dayKey(offsetDays(0)),
      bedTime,
      wakeTime,
      sleepMinutes: minutes,
      consistency: this.sleepToday().consistency,
    };
    this.sleepToday.set(night);
    this.sleepNights.update((nights) => {
      const next = nights.map((n) => ({ ...n }));
      next[next.length - 1] = night;
      return next;
    });
    MOCK_METRICS_30[MOCK_METRICS_30.length - 1].sleepMinutes = minutes;
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
    return {
      type: 'line',
      data: {
        labels: this.todayHourLabels(),
        datasets: [
          {
            label: this.languageService.translate('wellness.balance'),
            data: [84, 86, 83, 81, 80, 82, 82],
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
    const metrics = MOCK_METRICS_30.slice(-7);
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
    return {
      type: 'line',
      data: {
        labels: MOCK_METRICS_30.map((m) => this.dayShort().format(new Date(`${m.date}T12:00:00`))),
        datasets: [
          {
            label: this.languageService.translate('wellness.balance'),
            data: MOCK_METRICS_30.map((m) => m.balance),
            borderColor: NAVY,
            backgroundColor: 'rgba(27,58,87,0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            label: this.languageService.translate('wellness.hydration'),
            data: MOCK_METRICS_30.map((m) => this.hydrationPct(m)),
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
