import { Component, computed, inject } from '@angular/core';
import { LucideTrendingDown, LucideWind } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { MOCK_METRICS_30, type FatigueLevel } from '../../models/wellness.models';
import { WellnessService } from '../../services/wellness.service';

const FATIGUE_HEIGHT: Record<FatigueLevel, number> = { low: 28, moderate: 52, high: 78 };

@Component({
  selector: 'app-fatigue-card',
  imports: [LucideWind, LucideTrendingDown],
  template: `
    <div
      class="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card transition-all duration-200 hover:shadow-card-hover"
    >
      <div class="flex items-start justify-between gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-warning-light">
          <svg lucideWind class="h-4 w-4 text-warning" aria-hidden="true"></svg>
        </span>
        <span
          class="inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[11px] font-semibold text-success"
        >
          <svg lucideTrendingDown class="h-3 w-3" aria-hidden="true"></svg>
          {{ weekBadge() }}
        </span>
      </div>

      <p class="mt-4 text-sm font-medium text-ink-muted">{{ title() }}</p>
      <p class="mt-1 font-display text-2xl font-bold tracking-tight text-primary">
        {{ service.fatigueLabel() }}
      </p>
      <p class="mt-0.5 text-xs text-ink-faint">
        {{ description() }}
      </p>

      <div class="mt-auto pt-4">
        <p class="text-xs text-ink-faint">{{ last7Days() }}</p>
        <div class="mt-2 flex h-12 items-end gap-1.5" aria-hidden="true">
          @for (bar of bars(); track $index) {
            <div
              class="flex-1 rounded-t-md transition-all duration-500"
              [class.bg-accent/60]="!bar.today"
              [class.bg-primary]="bar.today"
              [style.height.%]="bar.height"
            ></div>
          }
        </div>
      </div>
    </div>
  `,
})
export class FatigueCard {
  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly title = this.languageService.translateSignal('wellness.fatigue');
  protected readonly weekBadge = this.languageService.translateSignal('wellness.fatigueCard.weekBadge');
  protected readonly description = this.languageService.translateSignal(
    'wellness.fatigueCard.description',
  );
  protected readonly last7Days = this.languageService.translateSignal('wellness.fatigueCard.last7Days');

  protected readonly bars = computed(() =>
    MOCK_METRICS_30.slice(-7).map((metric, index) => ({
      height: FATIGUE_HEIGHT[metric.fatigue],
      today: index === 6,
    })),
  );
}
