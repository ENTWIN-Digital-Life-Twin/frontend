import { Component, computed, inject, input, output } from '@angular/core';
import { LucidePencil, LucideTrash2, LucideUtensils } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Drawer } from '../../../../shared/ui/drawer/drawer';
import { Button } from '../../../../shared/ui/button/button';
import { Badge } from '../../../../shared/ui/badge/badge';
import {
  formatGrams,
  formatKcal,
  type Meal,
  type MealType,
} from '../../models/nutrition.models';

@Component({
  selector: 'app-meal-details',
  imports: [Drawer, Button, Badge, LucidePencil, LucideTrash2, LucideUtensils],
  template: `
    <app-drawer [open]="true" side="right" tone="surface" (closed)="closed.emit()">
      <div class="flex h-full flex-col">
        <header class="border-b border-line px-6 py-5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <app-badge [variant]="badgeVariant()" [dot]="true">{{ MEAL_TYPE_LABELS()[meal().type] }}</app-badge>
              <h2 class="mt-2 font-display text-xl font-semibold tracking-tight text-primary">
                {{ t(meal().name) }}
              </h2>
              <p class="mt-1 text-sm text-ink-muted">{{ meal().time }} · {{ formatKcal(meal().calories) }} kcal</p>
            </div>
          </div>
        </header>

        <div class="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section aria-labelledby="meal-macros">
            <h3 id="meal-macros" class="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
              {{ macrosLabel() }}
            </h3>
            <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div class="rounded-panel border border-line bg-surface-muted/50 p-3 text-center">
                <p class="font-display text-lg font-semibold text-primary">{{ formatKcal(meal().calories) }}</p>
                <p class="text-[11px] text-ink-muted">{{ caloriesLabel() }}</p>
              </div>
              <div class="rounded-panel border border-line bg-surface-muted/50 p-3 text-center">
                <p class="font-display text-lg font-semibold text-accent-dark">{{ formatGrams(meal().protein) }}</p>
                <p class="text-[11px] text-ink-muted">{{ proteinLabel() }}</p>
              </div>
              <div class="rounded-panel border border-line bg-surface-muted/50 p-3 text-center">
                <p class="font-display text-lg font-semibold text-navy-600">{{ formatGrams(meal().carbs) }}</p>
                <p class="text-[11px] text-ink-muted">{{ carbsLabel() }}</p>
              </div>
              <div class="rounded-panel border border-line bg-surface-muted/50 p-3 text-center">
                <p class="font-display text-lg font-semibold text-warning">{{ formatGrams(meal().fat) }}</p>
                <p class="text-[11px] text-ink-muted">{{ fatLabel() }}</p>
              </div>
            </div>

            <div class="mt-4 space-y-3">
              @for (macro of macros(); track macro.label) {
                <div>
                  <div class="mb-1 flex items-center justify-between text-xs">
                    <span class="font-medium text-ink-muted">{{ macro.label }}</span>
                    <span class="font-semibold text-primary">{{ macro.value }}</span>
                  </div>
                  <div class="h-1.5 w-full overflow-hidden rounded-full bg-surface-strong">
                    <div
                      class="h-full rounded-full"
                      [class]="macro.bar"
                      [style.width]="macro.percent + '%'"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </section>

          <section aria-labelledby="meal-foods">
            <h3 id="meal-foods" class="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
              {{ foodsLabel() }}
            </h3>
            <ul class="mt-3 space-y-2">
              @for (food of meal().foods; track food) {
                <li class="flex items-center gap-3 rounded-panel border border-line bg-surface p-3">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-teal-50 text-accent-dark">
                    <svg lucideUtensils class="h-4 w-4" aria-hidden="true"></svg>
                  </span>
                  <span class="text-sm font-medium text-ink">{{ t(food) }}</span>
                </li>
              }
            </ul>
          </section>

          @if (meal().notes) {
            <section aria-labelledby="meal-notes">
              <h3 id="meal-notes" class="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                {{ notesLabel() }}
              </h3>
              <p class="mt-2 rounded-panel border border-line bg-surface-muted/50 p-3 text-sm leading-relaxed text-ink">
                {{ t(meal().notes ?? '') }}
              </p>
            </section>
          }
        </div>

        <footer class="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
          <button appButton variant="danger" (click)="deleteMeal.emit(meal())">
            <svg lucideTrash2 class="h-4 w-4" aria-hidden="true"></svg>
            {{ deleteLabel() }}
          </button>
          <button appButton variant="primary" (click)="editMeal.emit(meal())">
            <svg lucidePencil class="h-4 w-4" aria-hidden="true"></svg>
            {{ editLabel() }}
          </button>
        </footer>
      </div>
    </app-drawer>
  `,
})
export class MealDetails {
  readonly meal = input.required<Meal>();
  readonly closed = output<void>();
  readonly editMeal = output<Meal>();
  readonly deleteMeal = output<Meal>();

  private readonly languageService = inject(LanguageService);

  protected t(key: string): string {
    return this.languageService.translate(key);
  }

  protected readonly formatKcal = formatKcal;
  protected readonly formatGrams = formatGrams;

  protected readonly macrosLabel = this.languageService.translateSignal('nutritionDetails.macros');
  protected readonly foodsLabel = this.languageService.translateSignal('nutritionDetails.foods');
  protected readonly notesLabel = this.languageService.translateSignal('nutritionDetails.notes');
  protected readonly deleteLabel = this.languageService.translateSignal('common.delete');
  protected readonly editLabel = this.languageService.translateSignal('common.edit');
  protected readonly caloriesLabel = this.languageService.translateSignal('nutrition.metric.calories');
  protected readonly proteinLabel = this.languageService.translateSignal('nutrition.metric.protein');
  protected readonly carbsLabel = this.languageService.translateSignal('nutrition.metric.carbs');
  protected readonly fatLabel = this.languageService.translateSignal('nutrition.metric.fat');

  protected readonly MEAL_TYPE_LABELS = computed<Record<MealType, string>>(() => ({
    breakfast: this.languageService.translate('nutrition.mealType.breakfast'),
    lunch: this.languageService.translate('nutrition.mealType.lunch'),
    snack: this.languageService.translate('nutrition.mealType.snack'),
    dinner: this.languageService.translate('nutrition.mealType.dinner'),
  }));

  protected readonly macros = () => {
    const meal = this.meal();
    const total = meal.calories || 1;
    return [
      {
        label: this.languageService.translate('nutrition.metric.protein'),
        value: formatGrams(meal.protein),
        percent: Math.round((meal.protein * 4 / total) * 100),
        bar: 'bg-accent',
      },
      {
        label: this.languageService.translate('nutrition.metric.carbs'),
        value: formatGrams(meal.carbs),
        percent: Math.round((meal.carbs * 4 / total) * 100),
        bar: 'bg-primary',
      },
      {
        label: this.languageService.translate('nutrition.metric.fat'),
        value: formatGrams(meal.fat),
        percent: Math.round((meal.fat * 9 / total) * 100),
        bar: 'bg-warning',
      },
    ];
  };

  protected badgeVariant(): 'neutral' | 'accent' | 'primary' | 'warning' {
    switch (this.meal().type) {
      case 'breakfast':
        return 'accent';
      case 'lunch':
        return 'primary';
      case 'snack':
        return 'warning';
      default:
        return 'neutral';
    }
  }
}
