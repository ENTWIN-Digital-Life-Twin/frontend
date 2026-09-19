import { Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { Field } from '../../../../shared/ui/field/field';
import { Modal } from '../../../../shared/ui/modal/modal';
import {
  InputDirective,
  SelectDirective,
  TextareaDirective,
} from '../../../../shared/directives/field-control/field-control';
import {
  MEAL_TYPES,
  type Meal,
  type MealType,
} from '../../models/nutrition.models';

@Component({
  selector: 'app-meal-form',
  imports: [
    ReactiveFormsModule,
    Button,
    Field,
    Modal,
    InputDirective,
    SelectDirective,
    TextareaDirective,
  ],
  template: `
    <app-modal
      [title]="meal() ? editTitle() : newTitle()"
      [subtitle]="subtitle()"
      (closed)="closed.emit()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-field [label]="typeLabel()" [error]="errorFor('type')">
            <select appSelect formControlName="type" [appSelectInvalid]="form.controls.type.touched && form.controls.type.invalid">
              @for (type of mealTypes; track type) {
                <option [value]="type">{{ MEAL_TYPE_LABELS()[type] }}</option>
              }
            </select>
          </app-field>

          <app-field [label]="timeLabel()" [error]="errorFor('time')">
            <input appInput type="time" formControlName="time" [appInputInvalid]="form.controls.time.touched && form.controls.time.invalid" />
          </app-field>
        </div>

        <app-field [label]="nameLabel()" [error]="errorFor('name')">
          <input
            appInput
            type="text"
            formControlName="name"
            [placeholder]="namePlaceholder()"
            [appInputInvalid]="form.controls.name.touched && form.controls.name.invalid"
          />
        </app-field>

        <app-field
          [label]="foodsLabel()"
          [hint]="foodsHint()"
          [error]="errorFor('foods')"
        >
          <textarea
            appTextarea
            formControlName="foods"
            [placeholder]="foodsPlaceholder()"
            [appTextareaInvalid]="form.controls.foods.touched && form.controls.foods.invalid"
          ></textarea>
        </app-field>

        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <app-field [label]="caloriesLabel()" [error]="errorFor('calories')">
            <input appInput type="number" min="0" formControlName="calories" [appInputInvalid]="form.controls.calories.touched && form.controls.calories.invalid" />
          </app-field>
          <app-field [label]="proteinLabel()" [error]="errorFor('protein')">
            <input appInput type="number" min="0" formControlName="protein" [appInputInvalid]="form.controls.protein.touched && form.controls.protein.invalid" />
          </app-field>
          <app-field [label]="carbsLabel()" [error]="errorFor('carbs')">
            <input appInput type="number" min="0" formControlName="carbs" [appInputInvalid]="form.controls.carbs.touched && form.controls.carbs.invalid" />
          </app-field>
          <app-field [label]="fatLabel()" [error]="errorFor('fat')">
            <input appInput type="number" min="0" formControlName="fat" [appInputInvalid]="form.controls.fat.touched && form.controls.fat.invalid" />
          </app-field>
        </div>

        <app-field [label]="notesLabel()">
          <textarea appTextarea formControlName="notes" [placeholder]="notesPlaceholder()"></textarea>
        </app-field>

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

  private readonly fb = inject(FormBuilder);
  private readonly languageService = inject(LanguageService);

  protected readonly mealTypes = MEAL_TYPES;

  protected readonly editTitle = this.languageService.translateSignal('nutritionForm.editTitle');
  protected readonly newTitle = this.languageService.translateSignal('nutritionForm.newTitle');
  protected readonly subtitle = this.languageService.translateSignal('nutritionForm.subtitle');
  protected readonly typeLabel = this.languageService.translateSignal('nutritionForm.type');
  protected readonly timeLabel = this.languageService.translateSignal('nutritionForm.time');
  protected readonly nameLabel = this.languageService.translateSignal('nutritionForm.name');
  protected readonly namePlaceholder = this.languageService.translateSignal(
    'nutritionForm.namePlaceholder',
  );
  protected readonly foodsLabel = this.languageService.translateSignal('nutritionForm.foods');
  protected readonly foodsHint = this.languageService.translateSignal('nutritionForm.foodsHint');
  protected readonly foodsPlaceholder = this.languageService.translateSignal(
    'nutritionForm.foodsPlaceholder',
  );
  protected readonly caloriesLabel = this.languageService.translateSignal(
    'nutritionForm.calories',
  );
  protected readonly proteinLabel = this.languageService.translateSignal('nutritionForm.protein');
  protected readonly carbsLabel = this.languageService.translateSignal('nutritionForm.carbs');
  protected readonly fatLabel = this.languageService.translateSignal('nutritionForm.fat');
  protected readonly notesLabel = this.languageService.translateSignal('nutritionForm.notes');
  protected readonly notesPlaceholder = this.languageService.translateSignal(
    'nutritionForm.notesPlaceholder',
  );
  protected readonly cancelLabel = this.languageService.translateSignal('common.cancel');
  protected readonly saveLabel = this.languageService.translateSignal('common.save');
  protected readonly addSubmit = this.languageService.translateSignal('nutritionForm.addSubmit');

  protected readonly submitLabel = computed(() =>
    this.meal() ? this.saveLabel() : this.addSubmit(),
  );

  protected readonly MEAL_TYPE_LABELS = computed<Record<MealType, string>>(() => ({
    breakfast: this.languageService.translate('nutrition.mealType.breakfast'),
    lunch: this.languageService.translate('nutrition.mealType.lunch'),
    snack: this.languageService.translate('nutrition.mealType.snack'),
    dinner: this.languageService.translate('nutrition.mealType.dinner'),
  }));

  protected readonly form = this.fb.nonNullable.group({
    type: ['lunch' as MealType, Validators.required],
    name: ['', [Validators.required, Validators.minLength(2)]],
    time: ['12:30', Validators.required],
    foods: ['', Validators.required],
    calories: [0, [Validators.required, Validators.min(0)]],
    protein: [0, [Validators.required, Validators.min(0)]],
    carbs: [0, [Validators.required, Validators.min(0)]],
    fat: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  constructor() {
    const meal = this.meal();
    if (meal) {
      this.form.patchValue({
        type: meal.type,
        name: meal.name,
        time: meal.time,
        foods: meal.foods.join(', '),
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        notes: meal.notes ?? '',
      });
    }
  }

  protected errorFor(control: keyof MealForm['form']['controls']): string | null {
    const field = this.form.controls[control];
    if (!field.touched || !field.invalid) {
      return null;
    }
    const t = (key: string) => this.languageService.translate(key);
    if (field.hasError('required')) {
      return t('nutritionForm.required');
    }
    if (field.hasError('minlength')) {
      return t('nutritionForm.tooShort');
    }
    if (field.hasError('min')) {
      return t('nutritionForm.minZero');
    }
    return t('nutritionForm.invalid');
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const existing = this.meal();
    const meal: Meal = {
      id: existing?.id ?? 'meal-new',
      type: raw.type,
      name: raw.name.trim(),
      time: raw.time,
      foods: raw.foods
        .split(',')
        .map((food) => food.trim())
        .filter(Boolean),
      calories: Number(raw.calories),
      protein: Number(raw.protein),
      carbs: Number(raw.carbs),
      fat: Number(raw.fat),
      notes: raw.notes.trim() || undefined,
    };
    this.saved.emit(meal);
  }
}
