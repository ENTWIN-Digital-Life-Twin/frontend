import { Component, computed, inject } from '@angular/core';
import { LucideTrendingUp } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { ChartDirective } from '../../../../shared/directives/chart/chart';
import { WellnessService } from '../../services/wellness.service';

const SUBTITLE_KEYS: Record<'today' | '7d' | '30d', string> = {
  today: 'wellness.chart.subtitleToday',
  '7d': 'wellness.chart.subtitleWeek',
  '30d': 'wellness.chart.subtitleMonth',
};

@Component({
  selector: 'app-wellness-chart',
  imports: [ChartDirective, LucideTrendingUp],
  template: `
    <div
      class="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="font-display text-base font-semibold tracking-tight text-primary">
            {{ service.chartTitle() }}
          </h2>
          <p class="mt-0.5 text-xs text-ink-muted">{{ subtitle() }}</p>
        </div>
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-navy-50">
          <svg lucideTrendingUp class="h-4 w-4 text-primary" aria-hidden="true"></svg>
        </span>
      </div>

      <div class="mt-4 h-56 sm:h-64">
        <canvas appChart [config]="service.chartConfig()"></canvas>
      </div>
    </div>
  `,
})
export class WellnessChart {
  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly subtitle = computed(() =>
    this.languageService.translate(SUBTITLE_KEYS[this.service.period()]),
  );
}
