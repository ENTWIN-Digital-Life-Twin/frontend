import { Component, inject, input } from '@angular/core';
import { LucideArrowDown, LucideArrowUp, LucideDynamicIcon, type LucideIcon } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-wellness-metric',
  imports: [LucideDynamicIcon],
  template: `
    <div
      class="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card transition-all duration-200 hover:shadow-card-hover"
    >
      <div class="flex items-start justify-between gap-3">
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel"
          [class.bg-navy-50]="tone() === 'navy'"
          [class.bg-teal-50]="tone() === 'teal'"
        >
          <svg
            [lucideIcon]="icon()"
            class="h-4 w-4"
            [class.text-primary]="tone() === 'navy'"
            [class.text-accent-dark]="tone() === 'teal'"
            aria-hidden="true"
          ></svg>
        </span>
        <span
          class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          [class.bg-success-light]="positive()"
          [class.text-success]="positive()"
          [class.bg-danger-light]="!positive()"
          [class.text-danger]="!positive()"
        >
          <svg [lucideIcon]="positive() ? iconUp : iconDown" class="h-3 w-3" aria-hidden="true"></svg>
          {{ delta() }}
        </span>
      </div>

      <p class="mt-4 text-sm font-medium text-ink-muted">{{ label() }}</p>
      <p class="mt-1 font-display text-2xl font-bold tracking-tight text-primary">{{ value() }}</p>
      <p class="mt-0.5 text-xs text-ink-faint">{{ goal() }}</p>

      <div class="mt-auto pt-4">
        <div class="flex items-center justify-between text-xs">
          <span class="text-ink-faint">{{ objective() }}</span>
          <span class="font-semibold tabular-nums text-ink">{{ progress() }}%</span>
        </div>
        <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-strong">
          <div
            class="h-full rounded-full transition-all duration-700"
            [class.bg-primary]="tone() === 'navy'"
            [class.bg-accent]="tone() === 'teal'"
            [style.width.%]="progress()"
          ></div>
        </div>
      </div>
    </div>
  `,
})
export class WellnessMetric {
  readonly icon = input.required<LucideIcon>();
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly goal = input.required<string>();
  readonly progress = input.required<number>();
  readonly delta = input.required<string>();
  readonly positive = input(true);
  readonly tone = input<'navy' | 'teal'>('navy');

  private readonly languageService = inject(LanguageService);

  protected readonly objective = this.languageService.translateSignal('wellness.metric.objective');
  protected readonly iconUp = LucideArrowUp;
  protected readonly iconDown = LucideArrowDown;
}
