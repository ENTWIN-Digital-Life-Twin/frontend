import { Injectable, computed, inject, signal } from '@angular/core';
import type { ChartConfiguration, TooltipItem } from 'chart.js/auto';
import { LanguageService } from '../../../core/services/language.service';
import {
  DAILY_CALORIE_GOAL,
  DAILY_CARB_GOAL,
  DAILY_FAT_GOAL,
  DAILY_PROTEIN_GOAL,
  DAILY_WATER_GOAL_ML,
  MEAL_SLOTS,
  MEAL_TYPES,
  MOCK_30_DAYS,
  MOCK_MEALS,
  MOCK_WATER_ENTRIES,
  dayKey,
  formatGrams,
  formatKcal,
  formatLiters,
  offsetDays,
  type DayNutrition,
  type Meal,
  type MealType,
  type NutritionGoal,
  type NutritionInsight,
  type NutritionPeriod,
  type ScorePart,
  type WaterEntry,
  type WeeklyMetric,
} from '../models/nutrition.models';

const NAVY = '#1B3A57';
const NAVY_300 = '#9BB7CD';
const TEAL = '#2A9D9D';
const TEAL_LIGHT = '#7FD1D1';
const TEAL_200 = '#B5E3E3';
const INK_FAINT = '#8494A3';
const INK_MUTED = '#52616F';

const WEEK_CALORIES = [1650, 1720, 1680, 1750, 1580, 1820, 1760];
const WEEK_PROTEIN = [78, 85, 82, 90, 72, 88, 92];
const WEEK_HYDRATION = [1500, 1800, 1700, 1600, 1900, 1400, 2000];

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private readonly languageService = inject(LanguageService);

  readonly period = signal<NutritionPeriod>('today');
  readonly weeklyMetric = signal<WeeklyMetric>('calories');
  readonly meals = signal<Meal[]>(MOCK_MEALS.map((m) => ({ ...m, foods: [...m.foods] })));
  readonly waterEntries = signal<WaterEntry[]>([...MOCK_WATER_ENTRIES]);

  readonly mealsSorted = computed(() =>
    [...this.meals()].sort((a, b) => a.time.localeCompare(b.time)),
  );

  readonly totalCalories = computed(() => this.meals().reduce((sum, meal) => sum + meal.calories, 0));
  readonly totalProtein = computed(() => this.meals().reduce((sum, meal) => sum + meal.protein, 0));
  readonly totalCarbs = computed(() => this.meals().reduce((sum, meal) => sum + meal.carbs, 0));
  readonly totalFat = computed(() => this.meals().reduce((sum, meal) => sum + meal.fat, 0));

  readonly caloriesPercent = computed(() =>
    Math.min(100, Math.round((this.totalCalories() / DAILY_CALORIE_GOAL) * 100)),
  );
  readonly proteinPercent = computed(() =>
    Math.min(100, Math.round((this.totalProtein() / DAILY_PROTEIN_GOAL) * 100)),
  );
  readonly carbsPercent = computed(() =>
    Math.min(100, Math.round((this.totalCarbs() / DAILY_CARB_GOAL) * 100)),
  );
  readonly fatPercent = computed(() =>
    Math.min(100, Math.round((this.totalFat() / DAILY_FAT_GOAL) * 100)),
  );

  readonly caloriesLabel = computed(() => formatKcal(this.totalCalories()));
  readonly calorieGoalLabel = computed(() => formatKcal(DAILY_CALORIE_GOAL));
  readonly proteinLabel = computed(() => formatGrams(this.totalProtein()));
  readonly proteinGoalLabel = computed(() => formatGrams(DAILY_PROTEIN_GOAL));
  readonly carbsLabel = computed(() => formatGrams(this.totalCarbs()));
  readonly carbsGoalLabel = computed(() => formatGrams(DAILY_CARB_GOAL));
  readonly fatLabel = computed(() => formatGrams(this.totalFat()));
  readonly fatGoalLabel = computed(() => formatGrams(DAILY_FAT_GOAL));

  readonly waterTotal = computed(() => this.waterEntries().reduce((sum, entry) => sum + entry.ml, 0));
  readonly waterPercent = computed(() =>
    Math.min(100, Math.round((this.waterTotal() / DAILY_WATER_GOAL_ML) * 100)),
  );
  readonly waterLabel = computed(() => formatLiters(this.waterTotal()));
  readonly waterGoalLabel = computed(() => formatLiters(DAILY_WATER_GOAL_ML));

  readonly caloriesDelta = computed(() => {
    const today = this.totalCalories();
    const yesterday = MOCK_30_DAYS[MOCK_30_DAYS.length - 2]?.calories ?? today;
    return today - yesterday;
  });

  readonly mealsScore = computed(() =>
    Math.round(Math.min(100, (this.meals().length / MEAL_SLOTS) * 91)),
  );

  readonly scoreParts = computed<ScorePart[]>(() => {
    const t = (key: string) => this.languageService.translate(key);
    return [
      { label: t('nutrition.scorePart.calories'), score: this.caloriesPercent() },
      { label: t('nutrition.scorePart.protein'), score: this.proteinPercent() },
      { label: t('nutrition.scorePart.hydration'), score: this.waterPercent() },
      { label: t('nutrition.scorePart.meals'), score: this.mealsScore() },
    ];
  });

  readonly score = computed(() => {
    const parts = this.scoreParts();
    const average = parts.reduce((sum, part) => sum + part.score, 0) / parts.length;
    return Math.max(0, Math.min(100, Math.round(average + 8)));
  });

  readonly insight = computed<NutritionInsight>(() => {
    const pct = this.proteinPercent();
    const reached = pct >= 100;
    const t = (key: string) => this.languageService.translate(key);
    return {
      title: t('nutrition.insight.proteinTitle'),
      message: reached
        ? t('nutrition.insight.reachedMessage')
        : pct >= 85
          ? t('nutrition.insight.closeMessage')
          : t('nutrition.insight.belowMessage'),
      recommendation: reached
        ? t('nutrition.insight.reachedRecommendation')
        : t('nutrition.insight.lowRecommendation'),
      factors: [
        {
          label: t('nutrition.scorePart.protein'),
          value: `${formatGrams(this.totalProtein())} / ${formatGrams(DAILY_PROTEIN_GOAL)}`,
        },
        {
          label: t('nutrition.scorePart.calories'),
          value: `${formatKcal(this.totalCalories())} / ${formatKcal(DAILY_CALORIE_GOAL)} kcal`,
        },
      ],
    };
  });

  readonly goals = computed<NutritionGoal[]>(() => {
    const t = (key: string) => this.languageService.translate(key);
    return [
      {
        label: t('nutrition.goal.calories'),
        current: formatKcal(this.totalCalories()),
        target: formatKcal(DAILY_CALORIE_GOAL),
        progress: this.caloriesPercent(),
        unit: 'kcal',
      },
      {
        label: t('nutrition.goal.protein'),
        current: formatGrams(this.totalProtein()),
        target: formatGrams(DAILY_PROTEIN_GOAL),
        progress: this.proteinPercent(),
        unit: '',
      },
      {
        label: t('nutrition.goal.hydration'),
        current: formatLiters(this.waterTotal()),
        target: formatLiters(DAILY_WATER_GOAL_ML),
        progress: this.waterPercent(),
        unit: '',
      },
      {
        label: t('nutrition.goal.meals'),
        current: String(this.meals().length),
        target: String(MEAL_SLOTS),
        progress: Math.min(100, Math.round((this.meals().length / MEAL_SLOTS) * 100)),
        unit: '',
      },
    ];
  });

  readonly chartTitle = computed(() => {
    switch (this.period()) {
      case 'today':
        return this.languageService.translate('nutrition.chart.today');
      case '7d':
        return this.languageService.translate('nutrition.chart.range7');
      default:
        return this.languageService.translate('nutrition.chart.range30');
    }
  });

  readonly chartSubtitle = computed(() => {
    const metric = this.weeklyMetric();
    return this.languageService.translate(`nutrition.chart.subtitle.${metric}`);
  });

  readonly chartConfig = computed<ChartConfiguration<'bar'>>(() => {
    const metric = this.weeklyMetric();
    switch (this.period()) {
      case 'today':
        return this.buildWeekChart(metric);
      case '7d':
        return this.buildRangeChart(metric, 7);
      default:
        return this.buildRangeChart(metric, 30);
    }
  });

  readonly distributionConfig = computed<ChartConfiguration<'doughnut'>>(() => {
    const byType = MEAL_TYPES.map((type) =>
      this.meals().filter((meal) => meal.type === type).reduce((sum, meal) => sum + meal.calories, 0),
    );
    return {
      type: 'doughnut',
      data: {
        labels: MEAL_TYPES.map((type) =>
          this.languageService.translate(`nutrition.mealType.${type}`),
        ),
        datasets: [
          {
            data: byType,
            backgroundColor: [NAVY, TEAL, TEAL_200, INK_FAINT],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
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
              label: (ctx: TooltipItem<'doughnut'>) => {
                const data = ctx.dataset.data as number[];
                const sum = data.reduce((a, b) => a + b, 0);
                const pct = sum ? Math.round((ctx.parsed / sum) * 100) : 0;
                return ` ${formatKcal(ctx.parsed)} kcal · ${pct}%`;
              },
            },
          },
        },
      },
    };
  });

  setPeriod(period: NutritionPeriod): void {
    this.period.set(period);
  }

  setMetric(metric: WeeklyMetric): void {
    this.weeklyMetric.set(metric);
  }

  addWater(ml: number): void {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.waterEntries.update((entries) => [
      ...entries,
      { id: crypto.randomUUID(), time, ml },
    ]);
  }

  addMeal(meal: Omit<Meal, 'id'>): void {
    this.meals.update((list) => [...list, { ...meal, id: crypto.randomUUID() }]);
  }

  updateMeal(id: string, meal: Meal): void {
    this.meals.update((list) => list.map((entry) => (entry.id === id ? { ...meal } : entry)));
  }

  deleteMeal(id: string): void {
    this.meals.update((list) => list.filter((entry) => entry.id !== id));
  }

  private todayWeekIndex(): number {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  }

  private weekValues(metric: WeeklyMetric): number[] {
    const base =
      metric === 'calories'
        ? [...WEEK_CALORIES]
        : metric === 'protein'
          ? [...WEEK_PROTEIN]
          : [...WEEK_HYDRATION];
    base[this.todayWeekIndex()] =
      metric === 'calories'
        ? this.totalCalories()
        : metric === 'protein'
          ? this.totalProtein()
          : this.waterTotal();
    return base;
  }

  private liveDays(count: number): DayNutrition[] {
    const base = MOCK_30_DAYS.slice(-count).map((day) => ({ ...day }));
    base[base.length - 1] = {
      date: dayKey(offsetDays(0)),
      calories: this.totalCalories(),
      protein: this.totalProtein(),
      hydrationMl: this.waterTotal(),
    };
    return base;
  }

  private niceMax(values: number[], step: number): number {
    const max = Math.max(...values, 0);
    return Math.ceil((max + step) / step) * step;
  }

  private buildWeekChart(metric: WeeklyMetric): ChartConfiguration<'bar'> {
    const today = this.todayWeekIndex();
    const values = this.weekValues(metric);
    const [base, highlight, step, tickLabel] = this.metricStyle(metric);
    return {
      type: 'bar',
      data: {
        labels: this.weekdayShortLabels(),
        datasets: [
          {
            label: metric,
            data: values,
            backgroundColor: values.map((_, index) => (index === today ? highlight : base)),
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 26,
          },
        ],
      },
      options: this.barOptions(step, tickLabel, values),
    };
  }

  private buildRangeChart(metric: WeeklyMetric, count: number): ChartConfiguration<'bar'> {
    const days = this.liveDays(count);
    const values = days.map((day) =>
      metric === 'calories' ? day.calories : metric === 'protein' ? day.protein : day.hydrationMl,
    );
    const [base, , step, tickLabel] = this.metricStyle(metric);
    const dayFormatter = new Intl.DateTimeFormat(this.languageService.getLocale(), {
      day: 'numeric',
      month: 'short',
    });
    return {
      type: 'bar',
      data: {
        labels: days.map((day) => dayFormatter.format(new Date(`${day.date}T12:00:00`))),
        datasets: [
          {
            label: metric,
            data: values,
            backgroundColor: base,
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: count === 7 ? 20 : 10,
          },
        ],
      },
      options: this.barOptions(step, tickLabel, values, count === 30),
    };
  }

  private metricStyle(
    metric: WeeklyMetric,
  ): [string, string, number, (value: number) => string] {
    const locale = this.languageService.getLocale();
    switch (metric) {
      case 'calories':
        return [NAVY_300, NAVY, 500, (v) => formatKcal(v)];
      case 'protein':
        return [TEAL_LIGHT, TEAL, 25, (v) => `${v} g`];
      default:
        return [
          TEAL_200,
          TEAL,
          500,
          (v) => `${(v / 1000).toLocaleString(locale, { maximumFractionDigits: 1 })} L`,
        ];
    }
  }

  private weekdayShortLabels(): string[] {
    return this.languageService.translate<string[]>('nutrition.chart.days');
  }

  private barOptions(
    step: number,
    tickLabel: (value: number) => string,
    values: number[],
    sparseLabels = false,
  ): ChartConfiguration<'bar'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: NAVY,
          titleColor: '#FFFFFF',
          bodyColor: 'rgba(255,255,255,0.85)',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx: TooltipItem<'bar'>) => ` ${tickLabel(ctx.parsed.y ?? 0)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: INK_FAINT,
            font: { size: 10 },
            autoSkip: sparseLabels,
            maxRotation: 0,
            maxTicksLimit: sparseLabels ? 6 : undefined,
          },
        },
        y: {
          min: 0,
          max: this.niceMax(values, step),
          grid: { color: 'rgba(27,58,87,0.06)' },
          border: { display: false },
          ticks: {
            color: INK_FAINT,
            font: { size: 10 },
            callback: (value: number | string) =>
              tickLabel(typeof value === 'number' ? value : Number(value)),
          },
        },
      },
    };
  }
}
