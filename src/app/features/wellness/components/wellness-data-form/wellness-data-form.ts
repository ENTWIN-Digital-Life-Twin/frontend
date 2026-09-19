import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { Field } from '../../../../shared/ui/field/field';
import { Modal } from '../../../../shared/ui/modal/modal';
import {
  MOOD_LEVELS,
  STRESS_LEVELS,
  type StressLevel,
  type WellnessDataType,
} from '../../models/wellness.models';
import { WellnessService } from '../../services/wellness.service';

const FIELD = 'block';
const LABEL = 'mb-1.5 block text-xs font-semibold text-ink-muted';
const INPUT =
  'w-full rounded-panel border border-line bg-surface px-3 py-2 text-sm text-primary placeholder:text-ink-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const TYPES: { value: WellnessDataType; labelKey: string }[] = [
  { value: 'hydration', labelKey: 'wellness.hydration' },
  { value: 'sleep', labelKey: 'wellness.sleep' },
  { value: 'mood', labelKey: 'wellness.mood' },
  { value: 'stress', labelKey: 'wellness.stress' },
  { value: 'activity', labelKey: 'wellness.timeline.activity' },
];

@Component({
  selector: 'app-wellness-data-form',
  imports: [Modal, Button, Field, FormsModule],
  template: `
    <app-modal
      [title]="title()"
      [subtitle]="subtitle()"
      (closed)="closed.emit()"
    >
      <div role="radiogroup" [attr.aria-label]="typeAria()" class="flex flex-wrap gap-2">
        @for (type of types(); track type.value) {
          <button
            type="button"
            role="radio"
            [attr.aria-checked]="selected() === type.value"
            class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150"
            [class.bg-primary]="selected() === type.value"
            [class.text-white]="selected() === type.value"
            [class.border-primary]="selected() === type.value"
            [class.border-line]="selected() !== type.value"
            [class.text-ink-muted]="selected() !== type.value"
            [class.hover:text-primary]="selected() !== type.value"
            (click)="selectType(type.value)"
          >
            {{ type.label }}
          </button>
        }
      </div>

      <div class="mt-6">
        @switch (selected()) {
          @case ('hydration') {
            <div [class]="FIELD">
              <span [class]="LABEL" id="ml-label">{{ quantityLabel() }}</span>
              <div class="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="ml-label">
                @for (amount of ML_OPTIONS; track amount) {
                  <button
                    type="button"
                    role="radio"
                    [attr.aria-checked]="ml() === amount"
                    class="rounded-panel border px-4 py-2 text-sm font-semibold transition-all duration-150"
                    [class.border-accent/60]="ml() === amount"
                    [class.bg-teal-50]="ml() === amount"
                    [class.text-accent-dark]="ml() === amount"
                    [class.border-line]="ml() !== amount"
                    [class.text-ink-muted]="ml() !== amount"
                    (click)="ml.set(amount)"
                  >
                    {{ amount }} ml
                  </button>
                }
              </div>
              <p class="mt-2 text-xs text-ink-faint">{{ hydrationHint() }}</p>
            </div>
          }
          @case ('sleep') {
            <div class="grid grid-cols-2 gap-3">
              <app-field [label]="bedtimeLabel()">
                <input
                  [class]="INPUT"
                  type="time"
                  [ngModel]="bed()"
                  name="bed"
                  (ngModelChange)="bed.set($event)"
                />
              </app-field>
              <app-field [label]="wakeLabel()">
                <input
                  [class]="INPUT"
                  type="time"
                  [ngModel]="wake()"
                  name="wake"
                  (ngModelChange)="wake.set($event)"
                />
              </app-field>
            </div>
            <p class="mt-3 text-xs text-ink-faint">{{ sleepHint() }}</p>
          }
          @case ('mood') {
            <div
              role="radiogroup"
              [attr.aria-label]="moodAriaLabel()"
              class="flex items-center justify-between gap-1"
            >
              @for (level of moodLevels(); track level.value) {
                <button
                  type="button"
                  role="radio"
                  [attr.aria-checked]="mood() === level.value"
                  [attr.aria-label]="moodAria(level.label)"
                  class="flex h-12 flex-1 items-center justify-center rounded-panel border text-xl transition-all duration-150"
                  [class.border-accent/60]="mood() === level.value"
                  [class.bg-teal-50]="mood() === level.value"
                  [class.border-line]="mood() !== level.value"
                  (click)="mood.set(level.value)"
                >
                  <span aria-hidden="true">{{ level.emoji }}</span>
                </button>
              }
            </div>
          }
          @case ('stress') {
            <div
              role="radiogroup"
              [attr.aria-label]="stressAriaLabel()"
              class="flex flex-col gap-2"
            >
              @for (level of stressLevels(); track level.value) {
                <button
                  type="button"
                  role="radio"
                  [attr.aria-checked]="stress() === level.value"
                  [attr.aria-label]="stressAria(level.label)"
                  class="flex items-center gap-2.5 rounded-panel border px-4 py-2.5 text-sm font-semibold transition-all duration-150"
                  [class.border-accent/60]="stress() === level.value"
                  [class.bg-teal-50]="stress() === level.value"
                  [class.border-line]="stress() !== level.value"
                  [class.text-ink]="stress() !== level.value"
                  (click)="stress.set(level.value)"
                >
                  <span class="h-2 w-2 rounded-full" [class]="level.dot"></span>
                  {{ level.label }}
                </button>
              }
            </div>
          }
          @case ('activity') {
            <app-field [label]="activityDurationLabel()">
              <input
                [class]="INPUT"
                type="number"
                min="5"
                max="180"
                [ngModel]="minutes()"
                name="minutes"
                (ngModelChange)="minutes.set($event)"
              />
            </app-field>
            <p class="mt-3 text-xs text-ink-faint">{{ activityHint() }}</p>
          }
        }
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button appButton variant="ghost" size="md" type="button" (click)="closed.emit()">
          {{ cancelLabel() }}
        </button>
        <button appButton variant="primary" size="md" type="button" (click)="submit()">
          {{ saveLabel() }}
        </button>
      </div>
    </app-modal>
  `,
})
export class WellnessDataForm {
  readonly saved = output<void>();
  readonly closed = output<void>();

  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly types = this.languageService.translateArray(TYPES);
  protected readonly ML_OPTIONS = [250, 300, 400, 500];
  protected readonly moodLevels = this.languageService.translateArray(MOOD_LEVELS);
  protected readonly stressLevels = this.languageService.translateArray(STRESS_LEVELS);
  protected readonly INPUT = INPUT;
  protected readonly FIELD = FIELD;
  protected readonly LABEL = LABEL;

  protected readonly title = this.languageService.translateSignal('wellnessPage.addData');
  protected readonly subtitle = this.languageService.translateSignal('wellness.dataForm.subtitle');
  protected readonly typeAria = this.languageService.translateSignal('wellness.dataForm.typeAria');
  protected readonly quantityLabel = this.languageService.translateSignal('wellness.dataForm.quantity');
  protected readonly hydrationHint = this.languageService.translateSignal(
    'wellness.dataForm.hydrationHint',
  );
  protected readonly bedtimeLabel = this.languageService.translateSignal('wellness.timeline.bedtime');
  protected readonly wakeLabel = this.languageService.translateSignal('wellness.timeline.wake');
  protected readonly sleepHint = this.languageService.translateSignal('wellness.dataForm.sleepHint');
  protected readonly moodAriaLabel = this.languageService.translateSignal('wellness.dataForm.moodAria');
  protected readonly stressAriaLabel = this.languageService.translateSignal(
    'wellness.dataForm.stressAria',
  );
  protected readonly activityDurationLabel = this.languageService.translateSignal(
    'wellness.dataForm.activityDuration',
  );
  protected readonly activityHint = this.languageService.translateSignal('wellness.dataForm.activityHint');
  protected readonly cancelLabel = this.languageService.translateSignal('wellness.dataForm.cancel');
  protected readonly saveLabel = this.languageService.translateSignal('wellness.dataForm.save');

  protected readonly selected = signal<WellnessDataType>('hydration');
  protected readonly ml = signal(250);
  protected readonly bed = signal('23:15');
  protected readonly wake = signal('06:35');
  protected readonly mood = signal(4);
  protected readonly stress = signal<StressLevel>('low');
  protected readonly minutes = signal(20);

  protected selectType(type: WellnessDataType): void {
    this.selected.set(type);
  }

  protected moodAria(label: string): string {
    return this.languageService.translate('wellness.aria.mood', { value: label });
  }

  protected stressAria(label: string): string {
    return this.languageService.translate('wellness.aria.stress', { value: label });
  }

  protected submit(): void {
    switch (this.selected()) {
      case 'sleep':
        this.service.setSleep(this.bed(), this.wake());
        break;
      case 'hydration':
        this.service.addHydration(this.ml());
        break;
      case 'mood':
        this.service.setMood(this.mood());
        break;
      case 'stress':
        this.service.setStress(this.stress());
        break;
      case 'activity':
        this.service.setActivity(this.minutes());
        break;
    }
    this.saved.emit();
  }
}
