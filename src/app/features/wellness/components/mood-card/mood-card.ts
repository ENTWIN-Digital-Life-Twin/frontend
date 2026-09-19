import { Component, inject, output } from '@angular/core';
import { LucideSmile } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { MOOD_LEVELS } from '../../models/wellness.models';
import { WellnessService } from '../../services/wellness.service';

@Component({
  selector: 'app-mood-card',
  imports: [LucideSmile],
  template: `
    <div
      class="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card transition-all duration-200 hover:shadow-card-hover"
    >
      <div class="flex items-start justify-between gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-teal-50">
          <svg lucideSmile class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
        </span>
        <span class="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-accent-dark">
          {{ service.moodLabel() }}
        </span>
      </div>

      <p class="mt-4 text-sm font-medium text-ink-muted">{{ moodLabel() }}</p>
      <div
        class="mt-3 flex items-center justify-between gap-1"
        role="radiogroup"
        [attr.aria-label]="levelAria()"
      >
        @for (level of levels(); track level.value) {
          <button
            type="button"
            role="radio"
            [attr.aria-checked]="service.mood() === level.value"
            [attr.aria-label]="moodAria(level.label)"
            class="flex h-9 flex-1 items-center justify-center rounded-panel border text-lg transition-all duration-150"
            [class.border-accent/60]="service.mood() === level.value"
            [class.bg-teal-50]="service.mood() === level.value"
            [class.scale-105]="service.mood() === level.value"
            [class.border-line]="service.mood() !== level.value"
            [class.hover:border-accent/40]="service.mood() !== level.value"
            (click)="select(level.value)"
          >
            <span aria-hidden="true">{{ level.emoji }}</span>
          </button>
        }
      </div>

      <p class="mt-auto pt-3 text-xs text-ink-faint">{{ selectHint() }}</p>
    </div>
  `,
})
export class MoodCard {
  readonly changed = output<void>();

  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly levels = this.languageService.translateArray(MOOD_LEVELS);
  protected readonly moodLabel = this.languageService.translateSignal('wellness.mood');
  protected readonly levelAria = this.languageService.translateSignal('wellness.moodCard.levelAria');
  protected readonly selectHint = this.languageService.translateSignal('wellness.moodCard.selectHint');

  protected moodAria(label: string): string {
    return this.languageService.translate('wellness.aria.mood', { value: label });
  }

  protected select(value: number): void {
    this.service.setMood(value);
    this.changed.emit();
  }
}
