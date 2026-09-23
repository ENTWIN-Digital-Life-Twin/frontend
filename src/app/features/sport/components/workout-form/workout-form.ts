import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { Modal } from '../../../../shared/ui/modal/modal';
import {
  WORKOUT_TYPES,
  toISODate,
  type Workout,
  type WorkoutIntensity,
  type WorkoutType,
} from '../../models/sport.models';
import { ACTIONS, ERROR_TEXT, FIELD, GRID_2, INPUT, LABEL } from '../../../../shared/ui/form-styles/form-styles';

const KCAL_PER_MIN: Record<WorkoutType, number> = {
  running: 11,
  walking: 5,
  cycling: 8,
  gym: 7,
  stretching: 3,
  other: 6,
};

@Component({
  selector: 'app-workout-form',
  imports: [Modal, Button, FormsModule],
  template: `
    <app-modal
      [title]="workout() ? editTitle() : newTitle()"
      [subtitle]="subtitle()"
      (closed)="closed.emit()"
    >
      <form (ngSubmit)="save()" novalidate>
        <div [class]="FIELD">
          <span [class]="LABEL">{{ typeLabel() }}</span>
          <div class="flex flex-wrap gap-2" role="radiogroup">
            @for (option of WORKOUT_TYPES; track option) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="type() === option"
                class="rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150"
                [class.bg-primary]="type() === option"
                [class.text-white]="type() === option"
                [class.border-primary]="type() === option"
                [class.border-line]="type() !== option"
                [class.text-ink-muted]="type() !== option"
                (click)="type.set(option)"
              >
                {{ WORKOUT_TYPE_LABELS()[option] }}
              </button>
            }
          </div>
        </div>

        <div [class]="GRID_2 + ' mt-4'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="workout-date">{{ dateLabel() }}</label>
            <input id="workout-date" [class]="INPUT" type="date" [ngModel]="date()" name="date" (ngModelChange)="date.set($event)" />
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="workout-time">{{ timeLabel() }}</label>
            <input id="workout-time" [class]="INPUT" type="time" [ngModel]="startTime()" name="startTime" (ngModelChange)="startTime.set($event)" />
          </div>
        </div>

        <div [class]="GRID_2 + ' mt-3'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="workout-duration">{{ durationLabel() }}</label>
            <input
              id="workout-duration"
              [class]="INPUT"
              type="number"
              min="5"
              step="5"
              [ngModel]="duration()"
              name="duration"
              (ngModelChange)="duration.set(asNumber($event))"
            />
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="workout-distance">{{ distanceLabel() }}</label>
            <input
              id="workout-distance"
              [class]="INPUT"
              type="number"
              min="0"
              step="0.1"
              [ngModel]="distance()"
              name="distance"
              (ngModelChange)="distance.set(asNumber($event))"
            />
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 rounded-panel border border-line bg-surface-muted/50 p-3">
          <p class="text-xs text-ink-muted">{{ caloriesLabel() }}<br /><span class="text-sm font-semibold text-primary">{{ calories() }} kcal</span></p>
          <p class="text-xs text-ink-muted">{{ intensityLabel() }}<br /><span class="text-sm font-semibold text-primary">{{ intensityLabelValue() }}</span></p>
        </div>

        @if (submitted() && duration() < 5) {
          <p [class]="ERROR_TEXT + ' mt-3'">{{ durationRequired() }}</p>
        }

        <div [class]="ACTIONS">
          <button appButton variant="ghost" size="md" type="button" (click)="closed.emit()">{{ cancelLabel() }}</button>
          <button appButton variant="primary" size="md" type="submit">{{ saveLabel() }}</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class WorkoutForm {
  readonly workout = input<Workout | null>(null);
  readonly saved = output<Workout>();
  readonly closed = output<void>();

  private readonly languageService = inject(LanguageService);

  protected readonly type = signal<WorkoutType>('running');
  protected readonly date = signal(toISODate(new Date()));
  protected readonly startTime = signal('18:00');
  protected readonly duration = signal(30);
  protected readonly distance = signal(0);
  protected readonly submitted = signal(false);

  protected readonly WORKOUT_TYPES = WORKOUT_TYPES;
  protected readonly FIELD = FIELD;
  protected readonly LABEL = LABEL;
  protected readonly INPUT = INPUT;
  protected readonly GRID_2 = GRID_2;
  protected readonly ACTIONS = ACTIONS;
  protected readonly ERROR_TEXT = ERROR_TEXT;

  protected readonly editTitle = this.languageService.translateSignal('sportForm.editTitle');
  protected readonly newTitle = this.languageService.translateSignal('sportForm.newTitle');
  protected readonly subtitle = this.languageService.translateSignal('sportForm.subtitle');
  protected readonly typeLabel = this.languageService.translateSignal('sportForm.type');
  protected readonly dateLabel = this.languageService.translateSignal('sportForm.date');
  protected readonly timeLabel = this.languageService.translateSignal('sportForm.time');
  protected readonly durationLabel = this.languageService.translateSignal('sportForm.duration');
  protected readonly distanceLabel = this.languageService.translateSignal('sportForm.distance');
  protected readonly caloriesLabel = this.languageService.translateSignal('sportForm.calories');
  protected readonly intensityLabel = this.languageService.translateSignal('sportForm.intensity');
  protected readonly cancelLabel = this.languageService.translateSignal('common.cancel');
  protected readonly saveLabel = this.languageService.translateSignal('common.save');
  protected readonly durationRequired = this.languageService.translateSignal('sportForm.durationRequired');

  protected readonly WORKOUT_TYPE_LABELS = computed<Record<WorkoutType, string>>(() => ({
    running: this.languageService.translate('sport.types.running'),
    walking: this.languageService.translate('sport.types.walking'),
    cycling: this.languageService.translate('sport.types.cycling'),
    gym: this.languageService.translate('sport.types.gym'),
    stretching: this.languageService.translate('sport.types.stretching'),
    other: this.languageService.translate('sport.types.other'),
  }));

  protected readonly calories = computed(() =>
    Math.max(0, Math.round((KCAL_PER_MIN[this.type()] ?? 6) * Math.max(5, this.duration() || 0))),
  );

  protected readonly intensity = computed<WorkoutIntensity>(() => {
    if (this.type() === 'running' || this.duration() >= 50) {
      return 'high';
    }
    if (this.type() === 'walking' || this.type() === 'stretching') {
      return 'low';
    }
    return 'medium';
  });

  protected readonly intensityLabelValue = computed(() =>
    this.languageService.translate(`sportForm.intensityOptions.${this.intensity()}`),
  );

  constructor() {
    effect(() => {
      const existing = this.workout();
      if (!existing) {
        return;
      }
      this.type.set(existing.type);
      this.date.set(existing.date);
      this.startTime.set(existing.startTime);
      this.duration.set(existing.duration);
      this.distance.set(existing.distance);
    });
  }

  protected asNumber(value: string | number): number {
    return Number(value);
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.duration() < 5) {
      return;
    }
    const existing = this.workout();
    const title = `${this.WORKOUT_TYPE_LABELS()[this.type()]} · ${this.duration()} min`;
    this.saved.emit({
      id: existing?.id ?? `w-${Date.now()}`,
      title,
      type: this.type(),
      date: this.date() || toISODate(new Date()),
      startTime: this.startTime(),
      duration: Math.max(5, Number(this.duration()) || 30),
      distance: Math.max(0, Number(this.distance()) || 0),
      calories: this.calories(),
      intensity: this.intensity(),
      notes: existing?.notes ?? '',
    });
  }
}
