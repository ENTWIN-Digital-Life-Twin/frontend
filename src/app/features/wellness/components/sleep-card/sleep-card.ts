import { Component, computed, inject } from '@angular/core';
import { LucideArrowUp, LucideMoon } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { WellnessService } from '../../services/wellness.service';

@Component({
  selector: 'app-sleep-card',
  imports: [LucideMoon, LucideArrowUp],
  template: `
    <div
      class="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-navy-50">
            <svg lucideMoon class="h-4 w-4 text-primary" aria-hidden="true"></svg>
          </span>
          <div>
            <p class="text-sm font-medium text-ink-muted">{{ title() }}</p>
            <p class="text-xs text-ink-faint">{{ lastNight() }}</p>
          </div>
        </div>
        <span
          class="inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[11px] font-semibold text-success"
        >
          <svg lucideArrowUp class="h-3 w-3" aria-hidden="true"></svg>
          {{ service.sleepDeltaLabel() }}
        </span>
      </div>

      <div class="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p class="font-display text-3xl font-bold tracking-tight text-primary">
          {{ service.sleepDuration() }}
        </p>
        <p class="text-sm text-ink-muted">{{ sleepGoal() }}</p>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-3">
        <div class="rounded-panel bg-surface-muted p-3">
          <p class="text-[11px] uppercase tracking-wide text-ink-faint">{{ bedtimeLabel() }}</p>
          <p class="mt-0.5 font-display text-base font-semibold tabular-nums text-primary">
            {{ service.sleepToday().bedTime }}
          </p>
        </div>
        <div class="rounded-panel bg-surface-muted p-3">
          <p class="text-[11px] uppercase tracking-wide text-ink-faint">{{ wakeLabel() }}</p>
          <p class="mt-0.5 font-display text-base font-semibold tabular-nums text-primary">
            {{ service.sleepToday().wakeTime }}
          </p>
        </div>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between text-xs">
          <span class="text-ink-faint">{{ consistency() }}</span>
          <span class="font-semibold tabular-nums text-ink">{{ service.sleepToday().consistency }}%</span>
        </div>
        <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-strong">
          <div
            class="h-full rounded-full bg-primary transition-all duration-700"
            [style.width.%]="service.sleepToday().consistency"
          ></div>
        </div>
      </div>

      <div class="mt-auto pt-5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-ink-faint">{{ trend7Days() }}</span>
          <span class="font-semibold tabular-nums text-ink">{{ percentOfGoal() }}</span>
        </div>
        <div class="mt-2 flex h-14 items-end gap-1.5" aria-hidden="true">
          @for (bar of trend(); track $index) {
            <div
              class="flex-1 rounded-t-md transition-all duration-500"
              [class.bg-accent/50]="!bar.today"
              [class.bg-accent]="bar.today"
              [style.height.%]="bar.pct"
            ></div>
          }
        </div>
      </div>
    </div>
  `,
})
export class SleepCard {
  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly title = this.languageService.translateSignal('wellness.sleep');
  protected readonly lastNight = this.languageService.translateSignal('wellness.sleepCard.lastNight');
  protected readonly sleepGoal = this.languageService.translateSignal('wellnessPage.metrics.sleepGoal');
  protected readonly bedtimeLabel = this.languageService.translateSignal('wellness.timeline.bedtime');
  protected readonly wakeLabel = this.languageService.translateSignal('wellness.timeline.wake');
  protected readonly consistency = this.languageService.translateSignal(
    'wellness.sleepCard.consistency',
  );
  protected readonly trend7Days = this.languageService.translateSignal('wellness.sleepCard.trend7Days');
  protected readonly percentOfGoal = computed(() =>
    this.languageService.translate('wellness.percentOfGoal', {
      percent: String(this.service.sleepPercent()),
    }),
  );

  protected readonly trend = computed(() => {
    const nights = this.service.sleepNights();
    return nights.map((night, index) => ({
      pct: this.service.sleepPct(night),
      today: index === nights.length - 1,
    }));
  });
}
