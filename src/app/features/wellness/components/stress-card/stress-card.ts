import { Component, inject, output } from '@angular/core';
import { LucideWind } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { STRESS_LEVELS, type StressLevel } from '../../models/wellness.models';
import { WellnessService } from '../../services/wellness.service';

@Component({
  selector: 'app-stress-card',
  imports: [LucideWind],
  template: `
    <div
      class="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card transition-all duration-200 hover:shadow-card-hover"
    >
      <div class="flex items-start justify-between gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-navy-50">
          <svg lucideWind class="h-4 w-4 text-primary" aria-hidden="true"></svg>
        </span>
        <span class="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {{ service.stressLabel() }}
        </span>
      </div>

      <p class="mt-4 text-sm font-medium text-ink-muted">{{ stressLabel() }}</p>
      <div
        class="mt-3 flex flex-col gap-2"
        role="radiogroup"
        [attr.aria-label]="levelAria()"
      >
        @for (level of levels(); track level.value) {
          <button
            type="button"
            role="radio"
            [attr.aria-checked]="service.stress() === level.value"
            [attr.aria-label]="stressAria(level.label)"
            class="flex items-center gap-2.5 rounded-panel border px-3 py-2 text-sm font-medium transition-all duration-150"
            [class.border-accent/60]="service.stress() === level.value"
            [class.bg-teal-50]="service.stress() === level.value"
            [class.text-accent-dark]="service.stress() === level.value"
            [class.border-line]="service.stress() !== level.value"
            [class.text-ink-muted]="service.stress() !== level.value"
            [class.hover:border-accent/40]="service.stress() !== level.value"
            (click)="select(level.value)"
          >
            <span class="h-2 w-2 shrink-0 rounded-full" [class]="level.dot"></span>
            {{ level.label }}
          </button>
        }
      </div>

      <p class="mt-auto pt-3 text-xs text-ink-faint">{{ selectHint() }}</p>
    </div>
  `,
})
export class StressCard {
  readonly changed = output<void>();

  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly levels = this.languageService.translateArray(STRESS_LEVELS);
  protected readonly stressLabel = this.languageService.translateSignal('wellness.stress');
  protected readonly levelAria = this.languageService.translateSignal('wellness.stressCard.levelAria');
  protected readonly selectHint = this.languageService.translateSignal('wellness.stressCard.selectHint');

  protected stressAria(label: string): string {
    return this.languageService.translate('wellness.aria.stress', { value: label });
  }

  protected select(value: StressLevel): void {
    this.service.setStress(value);
    this.changed.emit();
  }
}
