import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { Field } from '../../../../shared/ui/field/field';
import { Modal } from '../../../../shared/ui/modal/modal';
import { InputDirective, SelectDirective } from '../../../../shared/directives/field-control/field-control';
import {
  FOOD_CATALOG,
  foodImageUrl,
  sumMacros,
  type MealFoodLine,
} from '../../models/food-catalog';
import {
  MEAL_CATALOG,
  findMealPreset,
  mealsForType,
  type MealPreset,
} from '../../models/meal-catalog';
import { MEAL_TYPES, type Meal, type MealType } from '../../models/nutrition.models';

@Component({
  selector: 'app-meal-form',
  imports: [FormsModule, Button, Field, Modal, InputDirective, SelectDirective],
  template: `
    <app-modal
      [wide]="true"
      [title]="meal() ? editTitle() : newTitle()"
      [subtitle]="subtitle()"
      (closed)="closed.emit()"
    >
      <form (ngSubmit)="onSubmit()" class="space-y-4" novalidate>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-field [label]="typeLabel()">
            <select appSelect [ngModel]="type()" name="type" (ngModelChange)="onTypeChange($event)">
              @for (option of mealTypes; track option) {
                <option [value]="option">{{ MEAL_TYPE_LABELS()[option] }}</option>
              }
            </select>
          </app-field>
          <app-field [label]="timeLabel()">
            <input appInput type="time" [ngModel]="time()" name="time" (ngModelChange)="time.set($event)" />
          </app-field>
        </div>

        <app-field [label]="nameLabel()" [error]="submitted() && !name().trim() ? requiredLabel() : null">
          <input
            appInput
            type="search"
            [ngModel]="query()"
            name="mealSearch"
            [placeholder]="searchLabel()"
            (ngModelChange)="query.set($event)"
          />
        </app-field>

        @if (selectedPreset(); as selected) {
          <div class="flex items-center gap-3 rounded-panel border border-accent/40 bg-teal-50/40 p-3">
            <img
              [src]="selected.imageUrl"
              [alt]="selected.name"
              class="h-16 w-16 shrink-0 rounded-panel object-cover"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <div class="min-w-0">
              <p class="text-sm font-semibold text-primary">{{ selected.name }}</p>
              <p class="truncate text-xs text-ink-muted">
                {{ foodsSummary(selected) }}
              </p>
            </div>
          </div>
        }

        <div class="max-h-64 overflow-y-auto rounded-panel border border-line p-2">
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            @for (preset of filteredPresets(); track preset.name) {
              <button
                type="button"
                class="flex items-center gap-2 rounded-panel border p-2 text-left transition-all duration-150"
                [class.border-accent]="name() === preset.name && !customName()"
                [class.bg-teal-50/60]="name() === preset.name && !customName()"
                [class.border-line]="name() !== preset.name || customName()"
                (click)="selectPreset(preset)"
              >
                <img
                  [src]="preset.imageUrl"
                  [alt]="preset.name"
                  class="h-12 w-12 shrink-0 rounded-panel object-cover"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />
                <span class="min-w-0 text-xs font-semibold leading-snug text-primary">{{ preset.name }}</span>
              </button>
            }
            <button
              type="button"
              class="flex items-center gap-2 rounded-panel border border-dashed p-2 text-left"
              [class.border-accent]="customName()"
              [class.bg-teal-50/60]="customName()"
              [class.border-line]="!customName()"
              (click)="onNameChange('__custom')"
            >
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-panel bg-surface-muted text-lg text-ink-muted">+</span>
              <span class="text-xs font-semibold text-ink-muted">{{ customNameLabel() }}</span>
            </button>
          </div>
          @if (filteredPresets().length === 0) {
            <p class="px-2 py-6 text-center text-xs text-ink-muted">{{ noMatchLabel() }}</p>
          }
        </div>

        @if (customName()) {
          <app-field [label]="nameLabel()">
            <input
              appInput
              type="text"
              [ngModel]="name()"
              name="customName"
              [placeholder]="namePlaceholder()"
              (ngModelChange)="name.set($event)"
            />
          </app-field>
        }

        <div>
          <p class="mb-2 text-xs font-semibold text-ink-muted">{{ foodsLabel() }}</p>
          <p class="mb-3 text-xs text-ink-faint">{{ foodsHint() }}</p>
          <div class="space-y-2">
            @for (line of foods(); track $index; let index = $index) {
              <div class="grid grid-cols-[2.75rem_1fr_7rem_auto] items-center gap-2">
                @if (foodThumb(line.name); as thumb) {
                  <img
                    [src]="thumb"
                    [alt]="line.name"
                    class="h-11 w-11 rounded-panel object-cover"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                  />
                } @else {
                  <span class="h-11 w-11 rounded-panel bg-surface-muted"></span>
                }
                <select
                  appSelect
                  [ngModel]="line.name"
                  [name]="'food-' + index"
                  (ngModelChange)="updateFood(index, $event, line.grams)"
                >
                  @for (food of catalog; track food.name) {
                    <option [value]="food.name">{{ food.name }}</option>
                  }
                </select>
                <input
                  appInput
                  type="number"
                  min="5"
                  step="5"
                  [ngModel]="line.grams"
                  [name]="'grams-' + index"
                  (ngModelChange)="updateFood(index, line.name, asNumber($event))"
                />
                <button appButton variant="ghost" type="button" (click)="removeFood(index)">×</button>
              </div>
            }
          </div>
          <button appButton variant="secondary" type="button" class="mt-3" (click)="addFood()">
            {{ addFoodLabel() }}
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 rounded-panel border border-line bg-surface-muted/50 p-3 sm:grid-cols-4">
          <p class="text-xs text-ink-muted">{{ caloriesLabel() }}<br /><span class="text-sm font-semibold text-primary">{{ totals().calories }}</span></p>
          <p class="text-xs text-ink-muted">{{ proteinLabel() }}<br /><span class="text-sm font-semibold text-primary">{{ totals().protein }} g</span></p>
          <p class="text-xs text-ink-muted">{{ carbsLabel() }}<br /><span class="text-sm font-semibold text-primary">{{ totals().carbs }} g</span></p>
          <p class="text-xs text-ink-muted">{{ fatLabel() }}<br /><span class="text-sm font-semibold text-primary">{{ totals().fat }} g</span></p>
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-line pt-4">
          <button appButton variant="ghost" type="button" (click)="closed.emit()">{{ cancelLabel() }}</button>
          <button appButton variant="accent" type="submit">{{ submitLabel() }}</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class MealForm {
  readonly meal = input<Meal | null>(null);
  readonly saved = output<Meal>();
  readonly closed = output<void>();

  private readonly languageService = inject(LanguageService);

  protected readonly mealTypes = MEAL_TYPES;
  protected readonly catalog = FOOD_CATALOG;
  protected readonly type = signal<MealType>('lunch');
  protected readonly name = signal(MEAL_CATALOG.lunch[0].name);
  protected readonly time = signal('12:30');
  protected readonly foods = signal<MealFoodLine[]>(MEAL_CATALOG.lunch[0].foods.map((line) => ({ ...line })));
  protected readonly customName = signal(false);
  protected readonly submitted = signal(false);
  protected readonly query = signal('');

  protected readonly editTitle = this.languageService.translateSignal('nutritionForm.editTitle');
  protected readonly newTitle = this.languageService.translateSignal('nutritionForm.newTitle');
  protected readonly subtitle = this.languageService.translateSignal('nutritionForm.subtitle');
  protected readonly typeLabel = this.languageService.translateSignal('nutritionForm.type');
  protected readonly timeLabel = this.languageService.translateSignal('nutritionForm.time');
  protected readonly nameLabel = this.languageService.translateSignal('nutritionForm.name');
  protected readonly namePlaceholder = this.languageService.translateSignal('nutritionForm.namePlaceholder');
  protected readonly foodsLabel = this.languageService.translateSignal('nutritionForm.foods');
  protected readonly foodsHint = this.languageService.translateSignal('nutritionForm.foodsHint');
  protected readonly caloriesLabel = this.languageService.translateSignal('nutritionForm.calories');
  protected readonly proteinLabel = this.languageService.translateSignal('nutritionForm.protein');
  protected readonly carbsLabel = this.languageService.translateSignal('nutritionForm.carbs');
  protected readonly fatLabel = this.languageService.translateSignal('nutritionForm.fat');
  protected readonly cancelLabel = this.languageService.translateSignal('common.cancel');
  protected readonly addSubmit = this.languageService.translateSignal('nutritionForm.addSubmit');
  protected readonly saveLabel = this.languageService.translateSignal('common.save');
  protected readonly addFoodLabel = this.languageService.translateSignal('nutritionForm.addFood');
  protected readonly customNameLabel = this.languageService.translateSignal('nutritionForm.customName');
  protected readonly requiredLabel = this.languageService.translateSignal('nutritionForm.required');
  protected readonly searchLabel = this.languageService.translateSignal('nutritionForm.searchMeals');
  protected readonly noMatchLabel = this.languageService.translateSignal('nutritionForm.noMealMatch');
  protected readonly submitLabel = computed(() => (this.meal() ? this.saveLabel() : this.addSubmit()));
  protected readonly MEAL_TYPE_LABELS = computed<Record<MealType, string>>(() => ({
    breakfast: this.languageService.translate('nutrition.mealType.breakfast'),
    lunch: this.languageService.translate('nutrition.mealType.lunch'),
    snack: this.languageService.translate('nutrition.mealType.snack'),
    dinner: this.languageService.translate('nutrition.mealType.dinner'),
  }));
  protected readonly presets = computed(() => mealsForType(this.type()));
  protected readonly filteredPresets = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.presets();
    if (!q) {
      return list;
    }
    return list.filter((preset) => preset.name.toLowerCase().includes(q));
  });
  protected readonly selectedPreset = computed(() =>
    this.customName() ? undefined : findMealPreset(this.name(), this.type()),
  );
  protected readonly totals = computed(() => sumMacros(this.foods()));

  constructor() {
    const existing = this.meal();
    if (!existing) {
      return;
    }
    this.type.set(existing.type);
    this.name.set(existing.name);
    this.time.set(existing.time);
    this.foods.set(parseFoodLines(existing.foods));
    this.customName.set(!findMealPreset(existing.name, existing.type));
  }

  protected foodsSummary(preset: MealPreset): string {
    return preset.foods.map((line) => `${line.name} ${line.grams}g`).join(' · ');
  }

  protected foodThumb(name: string): string | null {
    return foodImageUrl(name);
  }

  protected asNumber(value: string | number): number {
    return Number(value);
  }

  protected onTypeChange(type: MealType): void {
    this.type.set(type);
    this.query.set('');
    const first = mealsForType(type)[0];
    if (first) {
      this.selectPreset(first);
    }
  }

  protected selectPreset(preset: MealPreset): void {
    this.customName.set(false);
    this.name.set(preset.name);
    this.foods.set(preset.foods.map((line) => ({ ...line })));
  }

  protected onNameChange(value: string): void {
    if (value === '__custom') {
      this.customName.set(true);
      this.name.set('');
      return;
    }
    const preset = this.presets().find((item) => item.name === value);
    if (preset) {
      this.selectPreset(preset);
    }
  }

  protected updateFood(index: number, name: string, grams: number): void {
    this.foods.update((list) =>
      list.map((line, i) => (i === index ? { name, grams: Math.max(5, grams || 5) } : line)),
    );
  }

  protected addFood(): void {
    this.foods.update((list) => [...list, { name: 'Rice', grams: 100 }]);
  }

  protected removeFood(index: number): void {
    this.foods.update((list) => list.filter((_, i) => i !== index));
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (!this.name().trim() || this.foods().length === 0) {
      return;
    }
    const totals = this.totals();
    const existing = this.meal();
    this.saved.emit({
      id: existing?.id ?? 'meal-new',
      type: this.type(),
      name: this.name().trim(),
      time: this.time(),
      foods: this.foods().map((line) => `${line.name} ${line.grams}g`),
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    });
  }
}

function parseFoodLines(raw: string[]): MealFoodLine[] {
  const parsed = raw
    .map((part) => part.trim())
    .map((part) => {
      const match = part.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*g$/i);
      if (match) {
        return { name: match[1].trim(), grams: Number(match[2]) };
      }
      return { name: part, grams: 100 };
    })
    .filter((line) => line.name);
  return parsed.length ? parsed : [{ name: 'Rice', grams: 100 }];
}
