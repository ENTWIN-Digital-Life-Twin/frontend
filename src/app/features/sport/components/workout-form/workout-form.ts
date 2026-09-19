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
import { ACTIONS, ERROR_TEXT, FIELD, GRID_2, INPUT, LABEL, TEXTAREA } from '../../../../shared/ui/form-styles/form-styles';

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
          <span [class]="LABEL" id="workout-type-label">{{ typeLabel() }}</span>
          <div
            class="flex flex-wrap gap-2"
            role="radiogroup"
            aria-labelledby="workout-type-label"
          >
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
                [class.hover:text-primary]="type() !== option"
                (click)="type.set(option)"
              >
                {{ WORKOUT_TYPE_LABELS()[option] }}
              </button>
            }
          </div>
        </div>

        <div [class]="FIELD + ' mt-4'">
          <label [class]="LABEL" for="workout-title">{{ titleLabel() }}</label>
          <input
            id="workout-title"
            [class]="INPUT"
            type="text"
            [placeholder]="titlePlaceholder()"
            autocomplete="off"
            [ngModel]="title()"
            name="title"
            (ngModelChange)="title.set($event)"
          />
        </div>

        <div [class]="GRID_2 + ' mt-3'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="workout-date">{{ dateLabel() }}</label>
            <input
              id="workout-date"
              [class]="INPUT"
              type="date"
              [ngModel]="date()"
              name="date"
              (ngModelChange)="date.set($event)"
            />
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="workout-time">{{ timeLabel() }}</label>
            <input
              id="workout-time"
              [class]="INPUT"
              type="time"
              [ngModel]="startTime()"
              name="startTime"
              (ngModelChange)="startTime.set($event)"
            />
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
              (ngModelChange)="duration.set($event)"
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
              (ngModelChange)="distance.set($event)"
            />
          </div>
        </div>

        <div [class]="GRID_2 + ' mt-3'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="workout-calories">{{ caloriesLabel() }}</label>
            <input
              id="workout-calories"
              [class]="INPUT"
              type="number"
              min="0"
              [ngModel]="calories()"
              name="calories"
              (ngModelChange)="calories.set($event)"
            />
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="workout-intensity">{{ intensityLabel() }}</label>
            <select
              id="workout-intensity"
              [class]="INPUT"
              [ngModel]="intensity()"
              name="intensity"
              (ngModelChange)="intensity.set($event)"
            >
              @for (option of intensityOptions(); track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </div>
        </div>

        <div [class]="FIELD + ' mt-3'">
          <label [class]="LABEL" for="workout-notes">{{ notesLabel() }}</label>
          <textarea
            id="workout-notes"
            [class]="TEXTAREA"
            rows="2"
            [placeholder]="notesPlaceholder()"
            [ngModel]="notes()"
            name="notes"
            (ngModelChange)="notes.set($event)"
          ></textarea>
        </div>

        @if (submitted() && !title().trim()) {
          <p [class]="ERROR_TEXT + ' mt-3'">{{ titleRequired() }}</p>
        }

        <div [class]="ACTIONS">
          <button appButton variant="ghost" size="md" type="button" (click)="closed.emit()">
            {{ cancelLabel() }}
          </button>
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

  protected readonly title = signal('');
  protected readonly type = signal<WorkoutType>('running');
  protected readonly date = signal(toISODate(new Date()));
  protected readonly startTime = signal('18:00');
  protected readonly duration = signal(30);
  protected readonly distance = signal(0);
  protected readonly calories = signal(200);
  protected readonly intensity = signal<WorkoutIntensity>('medium');
  protected readonly notes = signal('');
  protected readonly submitted = signal(false);

  protected readonly WORKOUT_TYPES = WORKOUT_TYPES;
  protected readonly FIELD = FIELD;
  protected readonly LABEL = LABEL;
  protected readonly INPUT = INPUT;
  protected readonly TEXTAREA = TEXTAREA;
  protected readonly GRID_2 = GRID_2;
  protected readonly ACTIONS = ACTIONS;
  protected readonly ERROR_TEXT = ERROR_TEXT;

  protected readonly editTitle = this.languageService.translateSignal('sportForm.editTitle');
  protected readonly newTitle = this.languageService.translateSignal('sportForm.newTitle');
  protected readonly subtitle = this.languageService.translateSignal('sportForm.subtitle');
  protected readonly typeLabel = this.languageService.translateSignal('sportForm.type');
  protected readonly titleLabel = this.languageService.translateSignal('sportForm.title');
  protected readonly titlePlaceholder = this.languageService.translateSignal(
    'sportForm.titlePlaceholder',
  );
  protected readonly dateLabel = this.languageService.translateSignal('sportForm.date');
  protected readonly timeLabel = this.languageService.translateSignal('sportForm.time');
  protected readonly durationLabel = this.languageService.translateSignal('sportForm.duration');
  protected readonly distanceLabel = this.languageService.translateSignal('sportForm.distance');
  protected readonly caloriesLabel = this.languageService.translateSignal('sportForm.calories');
  protected readonly intensityLabel = this.languageService.translateSignal('sportForm.intensity');
  protected readonly notesLabel = this.languageService.translateSignal('sportForm.notes');
  protected readonly notesPlaceholder = this.languageService.translateSignal(
    'sportForm.notesPlaceholder',
  );
  protected readonly cancelLabel = this.languageService.translateSignal('common.cancel');
  protected readonly saveLabel = this.languageService.translateSignal('common.save');
  protected readonly titleRequired = this.languageService.translateSignal('sportForm.titleRequired');

  protected readonly WORKOUT_TYPE_LABELS = computed<Record<WorkoutType, string>>(() => ({
    running: this.languageService.translate('sport.types.running'),
    walking: this.languageService.translate('sport.types.walking'),
    cycling: this.languageService.translate('sport.types.cycling'),
    gym: this.languageService.translate('sport.types.gym'),
    stretching: this.languageService.translate('sport.types.stretching'),
  }));

  protected readonly intensityOptions = computed<{ value: WorkoutIntensity; label: string }[]>(() => [
    { value: 'low', label: this.languageService.translate('sportForm.intensityOptions.low') },
    { value: 'medium', label: this.languageService.translate('sportForm.intensityOptions.medium') },
    { value: 'high', label: this.languageService.translate('sportForm.intensityOptions.high') },
  ]);

  constructor() {
    effect(() => {
      const existing = this.workout();
      if (!existing) {
        return;
      }
      this.title.set(existing.title);
      this.type.set(existing.type);
      this.date.set(existing.date);
      this.startTime.set(existing.startTime);
      this.duration.set(existing.duration);
      this.distance.set(existing.distance);
      this.calories.set(existing.calories);
      this.intensity.set(existing.intensity);
      this.notes.set(existing.notes);
    });
  }

  protected save(): void {
    this.submitted.set(true);
    if (!this.title().trim()) {
      return;
    }
    const existing = this.workout();
    this.saved.emit({
      id: existing?.id ?? `w-${Date.now()}`,
      title: this.title().trim(),
      type: this.type(),
      date: this.date() || toISODate(new Date()),
      startTime: this.startTime(),
      duration: Math.max(5, Number(this.duration()) || 30),
      distance: Math.max(0, Number(this.distance()) || 0),
      calories: Math.max(0, Number(this.calories()) || 0),
      intensity: this.intensity(),
      notes: this.notes(),
    });
  }
}
