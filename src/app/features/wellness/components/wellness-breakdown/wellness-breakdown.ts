import { Component, computed, inject } from '@angular/core';
import { LucideTarget } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { WellnessService } from '../../services/wellness.service';

@Component({
  selector: 'app-wellness-breakdown',
  imports: [LucideTarget],
  template: `
    <div
      class="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-accent/10">
            <svg lucideTarget class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
          </span>
          <div>
            <h2 class="font-display text-base font-semibold tracking-tight text-primary">
              {{ title() }}
            </h2>
            <p class="text-xs text-ink-faint">{{ service.periodLabel() }}</p>
          </div>
        </div>
        <p class="font-display text-3xl font-bold tracking-tight text-primary">
          <span class="tabular-nums">{{ service.breakdownTotal() }}</span>
          <span class="text-lg text-ink-faint">/100</span>
        </p>
      </div>

      <ul class="mt-5 space-y-4">
        @for (part of parts(); track part.labelKey) {
          <li>
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-ink">{{ part.label }}</span>
              <span class="font-semibold tabular-nums text-primary">{{ part.score }}</span>
            </div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-strong">
              <div
                class="h-full rounded-full bg-accent transition-all duration-700"
                [style.width.%]="part.score"
              ></div>
            </div>
          </li>
        }
      </ul>
    </div>
  `,
})
export class WellnessBreakdown {
  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly title = this.languageService.translateSignal('wellness.breakdown.title');

  protected readonly parts = computed(() =>
    this.service.breakdown().map((part) => ({
      ...part,
      label: this.languageService.translate(part.labelKey),
    })),
  );
}
