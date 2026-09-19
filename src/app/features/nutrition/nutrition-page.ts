import { AfterViewInit, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { LucideApple, LucideDroplets, LucidePlus, LucideUtensils } from '@lucide/angular';
import { LanguageService } from '../../core/services/language.service';
import { ChartDirective } from '../../shared/directives/chart/chart';
import { Button } from '../../shared/ui/button/button';
import { Badge } from '../../shared/ui/badge/badge';
import { Toast, type ToastTone } from '../../shared/ui/toast/toast';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { NutritionService } from './services/nutrition.service';
import {
  MEAL_TYPE_CHIP,
  formatGrams,
  formatKcal,
  formatLiters,
  type Meal,
  type MealType,
  type NutritionPeriod,
} from './models/nutrition.models';
import { MealForm } from './components/meal-form/meal-form';
import { MealDetails } from './components/meal-details/meal-details';
const PERIODS: NutritionPeriod[] = ['today', '7d', '30d'];

interface MacroStat {
  label: string;
  value: string;
  total: string;
  totalLabel: string;
  percent: number;
  percentLabel: string;
  bar: string;
  chip: string;
}

@Component({
  selector: 'app-nutrition-page',
  imports: [
    ChartDirective,
    Button,
    Badge,
    Toast,
    PageHeader,
    MealForm,
    MealDetails,
    LucideApple,
    LucidePlus,
    LucideDroplets,
    LucideUtensils,
  ],
  template: `
    <div class="space-y-6">
      <!-- En-tête -->
      <header class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <app-page-header
          [eyebrow]="eyebrow()"
          [title]="title()"
          [subtitle]="subtitle()"
        />
        <div class="flex flex-wrap items-center gap-3">
          <button appButton variant="secondary" size="md" (click)="addWater(250)">
            <svg lucideDroplets class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
            +250 ml
          </button>
          <button appButton variant="secondary" size="md" (click)="addWater(500)">
            <svg lucideDroplets class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
            +500 ml
          </button>
          <button appButton variant="accent" size="md" (click)="openCreate()">
            <svg lucidePlus class="h-4 w-4" aria-hidden="true"></svg>
            {{ addMeal() }}
          </button>
        </div>
      </header>

      <!-- Date + périodes -->
      <section
        class="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-panel bg-teal-50 text-accent-dark">
            <svg lucideApple class="h-5 w-5" aria-hidden="true"></svg>
          </span>
          <div>
            <p class="text-sm font-semibold capitalize text-primary">{{ dateLabel() }}</p>
            <p class="text-xs text-ink-muted">{{ todayTracking() }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-1 rounded-panel border border-line bg-background p-1" role="tablist" [attr.aria-label]="periodAria()">
          @for (period of PERIODS; track period) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="service.period() === period"
              class="rounded-panel px-3 py-1.5 text-xs font-semibold transition-all duration-200"
              [class.bg-primary]="service.period() === period"
              [class.text-white]="service.period() === period"
              [class.shadow-soft]="service.period() === period"
              [class.text-ink-muted]="service.period() !== period"
              [class.hover:text-primary]="service.period() !== period"
              (click)="service.setPeriod(period)"
            >
              {{ PERIOD_LABELS()[period] }}
            </button>
          }
        </div>
      </section>

      <!-- Apports + équilibre -->
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section data-reveal class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-8">
          @for (stat of macros(); track stat.label) {
            <div class="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-card">
              <div class="flex items-center justify-between gap-3">
                <span class="flex h-9 w-9 items-center justify-center rounded-panel" [class]="stat.chip">
                  <span class="h-3 w-3 rounded-full" [class]="stat.bar"></span>
                </span>
                <p class="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{{ stat.label }}</p>
              </div>
              <div>
                <p class="font-display text-2xl font-bold tabular-nums tracking-tight text-primary">
                  {{ stat.value }}
                </p>
                <p class="text-xs text-ink-muted">{{ stat.totalLabel }}</p>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-surface-strong">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  [class]="stat.bar"
                  [style.width]="stat.percent + '%'"
                ></div>
              </div>
              <p class="text-[11px] font-medium" [class]="stat.percent >= 90 ? 'text-success' : 'text-ink-muted'">
                {{ stat.percentLabel }}
              </p>
            </div>
          }
        </section>

        <!-- Équilibre nutritionnel -->
        <section
          data-reveal
          class="flex h-full flex-col gap-4 overflow-hidden rounded-card bg-gradient-to-br from-primary-darker via-primary to-primary-light p-6 text-white shadow-card xl:col-span-4"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200">
              {{ balanceTitle() }}
            </p>
            <app-badge variant="accent">{{ service.score() }} / 100</app-badge>
          </div>

          <div class="flex flex-1 items-center justify-center py-4">
            <div class="relative">
              <svg viewBox="0 0 64 64" class="h-36 w-36 -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="7" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#7FD1D1"
                  stroke-width="7"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="scoreCircumference"
                  [style.stroke-dashoffset]="scoreOffset()"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="font-display text-3xl font-bold tracking-tight">{{ service.score() }}</span>
                <span class="text-[11px] text-white/75">{{ outOf100() }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2 border-t border-white/10 pt-4">
            @for (part of service.scoreParts(); track part.label) {
              <div class="flex items-center justify-between text-xs">
                <span class="text-white/70">{{ part.label }}</span>
                <span class="font-semibold text-teal-200">{{ part.score }}%</span>
              </div>
            }
          </div>
        </section>
      </div>

      <!-- Repas + hydratation -->
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section data-reveal class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-7">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{{ today() }}</p>
              <h2 class="font-display text-lg font-semibold tracking-tight text-primary">{{ yourMeals() }}</h2>
            </div>
            <app-badge variant="neutral">{{ mealsCount() }}</app-badge>
          </div>

          <div class="mt-4 flex flex-col gap-3">
            @for (meal of service.mealsSorted(); track meal.id) {
              <button
                type="button"
                (click)="openDetails(meal)"
                class="group flex items-center gap-4 rounded-panel border border-line bg-surface p-4 text-left shadow-soft transition-all duration-200 hover:border-accent/40 hover:shadow-card"
              >
                <span
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-panel"
                  [class]="MEAL_TYPE_CHIP[meal.type]"
                >
                  <svg lucideUtensils class="h-5 w-5" aria-hidden="true"></svg>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex flex-wrap items-center gap-2">
                    <span class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                      {{ MEAL_TYPE_LABELS()[meal.type] }}
                    </span>
                    <span class="text-[11px] tabular-nums text-ink-faint">{{ meal.time }}</span>
                  </span>
                  <span class="mt-0.5 block truncate text-sm font-semibold text-primary">{{ t(meal.name) }}</span>
                  <span class="mt-0.5 block truncate text-xs text-ink-muted">
                    {{ meal.foods.map(f => t(f)).join(' · ') }}
                  </span>
                </span>
                <span class="shrink-0 text-right">
                  <span class="block font-display text-base font-bold tabular-nums text-primary">
                    {{ formatKcal(meal.calories) }}
                  </span>
                  <span class="text-[11px] text-ink-muted">kcal</span>
                </span>
              </button>
            }

            <button
              type="button"
              (click)="openCreate()"
              class="flex items-center justify-center gap-2 rounded-panel border border-dashed border-line-strong py-3.5 text-sm font-medium text-accent-dark transition-colors hover:border-accent/50 hover:bg-teal-50/50"
            >
              <svg lucidePlus class="h-4 w-4" aria-hidden="true"></svg>
              {{ addMeal() }}
            </button>
          </div>
        </section>

        <!-- Hydratation -->
        <section data-reveal class="flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{{ hydration() }}</p>
              <h2 class="font-display text-lg font-semibold tracking-tight text-primary">{{ waterOfDay() }}</h2>
            </div>
            <span class="flex h-10 w-10 items-center justify-center rounded-panel bg-teal-50 text-accent-dark">
              <svg lucideDroplets class="h-5 w-5" aria-hidden="true"></svg>
            </span>
          </div>

          <div class="flex items-end justify-between">
            <p class="font-display text-4xl font-bold tabular-nums tracking-tight text-primary">
              {{ service.waterLabel() }}
            </p>
            <p class="text-sm text-ink-muted">{{ waterGoal() }}</p>
          </div>

          <div class="h-2.5 w-full overflow-hidden rounded-full bg-surface-strong">
            <div
              class="h-full rounded-full bg-gradient-to-r from-teal-300 to-accent transition-all duration-500"
              [style.width]="service.waterPercent() + '%'"
            ></div>
          </div>
          <p class="text-xs text-ink-muted">
            {{ dailyGoalPercent() }}
          </p>

          <div class="flex gap-3">
            <button appButton variant="secondary" size="sm" class="flex-1" (click)="addWater(250)">
              <svg lucidePlus class="h-3.5 w-3.5" aria-hidden="true"></svg>
              +250 ml
            </button>
            <button appButton variant="accent" size="sm" class="flex-1" (click)="addWater(500)">
              <svg lucidePlus class="h-3.5 w-3.5" aria-hidden="true"></svg>
              +500 ml
            </button>
          </div>

          <div class="mt-1 space-y-2 border-t border-line pt-4">
            @for (entry of service.waterEntries().slice(-5).reverse(); track entry.id) {
              <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 text-ink-muted">
                  <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
                  {{ entry.time }}
                </span>
                <span class="font-medium tabular-nums text-primary">+{{ entry.ml }} ml</span>
              </div>
            }
          </div>
        </section>
      </div>

      <!-- Graphiques -->
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section data-reveal class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-5">
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{{ distribution() }}</p>
          <h2 class="font-display text-lg font-semibold tracking-tight text-primary">{{ caloriesByMeal() }}</h2>
          <div class="relative mt-4 h-64 w-full">
            <canvas appChart [config]="service.distributionConfig()"></canvas>
          </div>
        </section>

        <section data-reveal class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-7">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{{ evolution() }}</p>
              <h2 class="font-display text-lg font-semibold tracking-tight text-primary">
                {{ service.chartTitle() }}
              </h2>
              <p class="text-xs text-ink-muted">{{ service.chartSubtitle() }}</p>
            </div>
            <div class="flex flex-wrap gap-1 rounded-panel border border-line bg-background p-1">
              @for (metric of METRICS(); track metric.value) {
                <button
                  type="button"
                  class="rounded-panel px-2.5 py-1 text-xs font-semibold transition-all duration-200"
                  [class.bg-teal-50]="service.weeklyMetric() === metric.value"
                  [class.text-accent-dark]="service.weeklyMetric() === metric.value"
                  [class.text-ink-muted]="service.weeklyMetric() !== metric.value"
                  [class.hover:text-primary]="service.weeklyMetric() !== metric.value"
                  (click)="service.setMetric(metric.value)"
                >
                  {{ metric.label }}
                </button>
              }
            </div>
          </div>
          <div class="relative mt-4 h-64 w-full">
            <canvas appChart [config]="service.chartConfig()"></canvas>
          </div>
        </section>
      </div>

      <!-- Insight + objectifs + aliments récents -->
      <div class="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section
          data-reveal
          class="rounded-card border border-accent/30 bg-gradient-to-br from-teal-50/70 via-surface to-surface p-5 shadow-card sm:p-6 xl:col-span-4"
        >
          <div class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-panel bg-accent/15 text-accent-dark">
              <svg lucideApple class="h-5 w-5" aria-hidden="true"></svg>
            </span>
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ insightTitle() }}</p>
              <h2 class="font-display text-base font-semibold tracking-tight text-primary">{{ insight().title }}</h2>
            </div>
          </div>
          <p class="mt-3 text-sm leading-relaxed text-ink">{{ insight().message }}</p>
          <div class="mt-3 rounded-panel border border-line bg-surface p-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-accent-dark">{{ recommendation() }}</p>
            <p class="mt-1 text-sm leading-relaxed text-ink">{{ insight().recommendation }}</p>
          </div>
          <div class="mt-4 space-y-2">
            @for (factor of insight().factors; track factor.label) {
              <div class="flex items-center justify-between text-xs">
                <span class="text-ink-muted">{{ factor.label }}</span>
                <span class="font-semibold text-primary">{{ factor.value }}</span>
              </div>
            }
          </div>
        </section>

        <section data-reveal class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-4">
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{{ goalsTitle() }}</p>
          <h2 class="font-display text-lg font-semibold tracking-tight text-primary">{{ goalsOfDay() }}</h2>
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
                    [class]="goal.progress >= 90 ? 'bg-success' : goal.progress >= 50 ? 'bg-accent' : 'bg-primary/40'"
                    [style.width]="goal.progress + '%'"
                  ></div>
                </div>
              </div>
            }
          </div>
        </section>

        <section data-reveal class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 xl:col-span-4">
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{{ base() }}</p>
          <h2 class="font-display text-lg font-semibold tracking-tight text-primary">{{ frequentFoods() }}</h2>
          <ul class="mt-4 space-y-2">
            @for (food of recentFoods(); track food.name) {
              <li class="flex items-center justify-between rounded-panel border border-line bg-surface p-3">
                <span class="flex items-center gap-2.5">
                  <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
                   <span class="text-sm font-medium text-ink">{{ t(food.name) }}</span>
                </span>
                <span class="text-xs tabular-nums text-ink-muted">
                  {{ formatKcal(food.calories) }} kcal · {{ formatGrams(food.protein) }} {{ proteinShort() }}
                </span>
              </li>
            }
          </ul>
        </section>
      </div>
    </div>

    @if (formOpen()) {
      <app-meal-form [meal]="editing()" (saved)="onSaved($event)" (closed)="closeForm()" />
    }

    @if (details(); as meal) {
      <app-meal-details
        [meal]="meal"
        (closed)="details.set(null)"
        (editMeal)="onEdit($event)"
        (deleteMeal)="onDelete($event)"
      />
    }

    @if (toast(); as message) {
      <app-toast [message]="message" [tone]="toastTone()" (closed)="toast.set(null)" />
    }
  `,
})
export class NutritionPage implements AfterViewInit {
  protected readonly service = inject(NutritionService);
  private readonly languageService = inject(LanguageService);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly PERIODS = PERIODS;
  protected readonly MEAL_TYPE_CHIP = MEAL_TYPE_CHIP;
  protected readonly formatKcal = formatKcal;
  protected readonly formatGrams = formatGrams;
  protected readonly formatLiters = formatLiters;

  protected readonly dateLabel = computed(() =>
    new Intl.DateTimeFormat(this.languageService.getLocale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
  );

  protected readonly eyebrow = this.languageService.translateSignal('nutrition.eyebrow');
  protected readonly title = this.languageService.translateSignal('nutrition.title');
  protected readonly subtitle = this.languageService.translateSignal('nutrition.subtitle');
  protected readonly addMeal = this.languageService.translateSignal('nutrition.addMeal');
  protected readonly todayTracking = this.languageService.translateSignal('nutrition.todayTracking');
  protected readonly periodAria = this.languageService.translateSignal('nutrition.periodAria');
  protected readonly balanceTitle = this.languageService.translateSignal('nutrition.balanceTitle');
  protected readonly outOf100 = this.languageService.translateSignal('nutrition.outOf100');
  protected readonly today = this.languageService.translateSignal('nutrition.today');
  protected readonly yourMeals = this.languageService.translateSignal('nutrition.yourMeals');
  protected readonly hydration = this.languageService.translateSignal('nutrition.hydration');
  protected readonly waterOfDay = this.languageService.translateSignal('nutrition.waterOfDay');
  protected readonly distribution = this.languageService.translateSignal('nutrition.distribution');
  protected readonly caloriesByMeal = this.languageService.translateSignal('nutrition.caloriesByMeal');
  protected readonly evolution = this.languageService.translateSignal('nutrition.evolution');
  protected readonly insightTitle = this.languageService.translateSignal('nutrition.insightTitle');
  protected readonly recommendation = this.languageService.translateSignal(
    'nutrition.recommendation',
  );
  protected readonly goalsTitle = this.languageService.translateSignal('nutrition.goalsTitle');
  protected readonly goalsOfDay = this.languageService.translateSignal('nutrition.goalsOfDay');
  protected readonly base = this.languageService.translateSignal('nutrition.base');
  protected readonly frequentFoods = this.languageService.translateSignal('nutrition.frequentFoods');
  protected readonly proteinShort = this.languageService.translateSignal('nutrition.proteinShort');

  protected readonly PERIOD_LABELS = computed<Record<NutritionPeriod, string>>(() => ({
    today: this.languageService.translate('nutrition.period.today'),
    '7d': this.languageService.translate('nutrition.period.week7'),
    '30d': this.languageService.translate('nutrition.period.days30'),
  }));

  protected readonly MEAL_TYPE_LABELS = computed<Record<MealType, string>>(() => ({
    breakfast: this.languageService.translate('nutrition.mealType.breakfast'),
    lunch: this.languageService.translate('nutrition.mealType.lunch'),
    snack: this.languageService.translate('nutrition.mealType.snack'),
    dinner: this.languageService.translate('nutrition.mealType.dinner'),
  }));

  protected readonly mealsCount = computed(() =>
    this.languageService.translate('nutrition.mealsCount', {
      count: String(this.service.meals().length),
    }),
  );

  protected readonly waterGoal = computed(() =>
    this.languageService.translate('nutrition.outOf', {
      value: this.service.waterGoalLabel(),
    }),
  );

  protected readonly dailyGoalPercent = computed(() =>
    this.languageService.translate('nutrition.percentOfDailyGoal', {
      percent: String(this.service.waterPercent()),
    }),
  );

  protected readonly METRICS = computed(() => [
    { value: 'calories' as const, label: this.languageService.translate('nutrition.metric.calories') },
    { value: 'protein' as const, label: this.languageService.translate('nutrition.metric.protein') },
    { value: 'hydration' as const, label: this.languageService.translate('nutrition.metric.hydration') },
  ]);

  private readonly scoreRadius = 28;
  protected readonly scoreCircumference = 2 * Math.PI * this.scoreRadius;

  protected readonly scoreOffset = computed(
    () => this.scoreCircumference * (1 - this.service.score() / 100),
  );

  protected readonly macros = computed<MacroStat[]>(() => {
    const s = this.service;
    const t = (key: string, vars?: Record<string, string>) =>
      this.languageService.translate(key, vars);
    const build = (
      labelKey: string,
      value: string,
      total: string,
      percent: number,
      bar: string,
      chip: string,
    ): MacroStat => ({
      label: t(labelKey),
      value,
      total,
      totalLabel: t('nutrition.onTotal', { value: total }),
      percent,
      percentLabel: t('nutrition.percentOfGoal', { percent: String(percent) }),
      bar,
      chip,
    });
    return [
      build('nutrition.metric.calories', s.caloriesLabel(), `${s.calorieGoalLabel()} kcal`, s.caloriesPercent(), 'bg-primary', 'bg-navy-50'),
      build('nutrition.metric.protein', s.proteinLabel(), `${s.proteinGoalLabel()}`, s.proteinPercent(), 'bg-accent', 'bg-teal-50'),
      build('nutrition.metric.carbs', s.carbsLabel(), `${s.carbsGoalLabel()}`, s.carbsPercent(), 'bg-navy-400', 'bg-surface-muted'),
      build('nutrition.metric.fat', s.fatLabel(), `${s.fatGoalLabel()}`, s.fatPercent(), 'bg-warning', 'bg-warning-light'),
    ];
  });

  protected readonly insight = computed(() => this.service.insight());

  protected readonly recentFoods = computed(() => {
    const count = new Map<string, { name: string; calories: number; protein: number }>();
    for (const meal of this.service.meals()) {
      for (const food of meal.foods) {
        const existing = count.get(food);
        count.set(food, {
          name: food,
          calories: existing ? existing.calories + meal.calories : meal.calories,
          protein: existing ? existing.protein + meal.protein : meal.protein,
        });
      }
    }
    return [...count.values()].sort((a, b) => b.calories - a.calories).slice(0, 5);
  });

  protected t(key: string): string {
    return this.languageService.translate(key);
  }

  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Meal | null>(null);
  protected readonly details = signal<Meal | null>(null);
  protected readonly toast = signal<string | null>(null);
  protected readonly toastTone = signal<ToastTone>('primary');

  protected openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  protected onEdit(meal: Meal): void {
    this.details.set(null);
    this.editing.set(meal);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  protected openDetails(meal: Meal): void {
    this.details.set(meal);
  }

  protected onSaved(meal: Meal): void {
    if (this.editing()) {
      this.service.updateMeal(this.editing()!.id, meal);
      this.toastTone.set('success');
      this.toast.set(this.languageService.translate('nutrition.toast.updated'));
    } else {
      this.service.addMeal(meal);
      this.toastTone.set('success');
      this.toast.set(this.languageService.translate('nutrition.toast.added'));
    }
    this.closeForm();
  }

  protected onDelete(meal: Meal): void {
    this.details.set(null);
    this.service.deleteMeal(meal.id);
    this.toastTone.set('success');
    this.toast.set(this.languageService.translate('nutrition.toast.deleted'));
  }

  protected addWater(ml: number): void {
    this.service.addWater(ml);
    this.toastTone.set('success');
    this.toast.set(
      this.languageService.translate('nutrition.toast.waterAdded', { ml: String(ml) }),
    );
  }

  ngAfterViewInit(): void {
    const root = this.host.nativeElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('[data-reveal]'),
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: 'power2.out',
          clearProps: 'transform',
        },
      );
    });
  }
}
