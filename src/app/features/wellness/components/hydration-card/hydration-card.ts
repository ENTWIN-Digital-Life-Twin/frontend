import { Component, computed, inject, output } from '@angular/core';
import { LucideDroplets, LucidePlus } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { WellnessService } from '../../services/wellness.service';

@Component({
  selector: 'app-hydration-card',
  imports: [Button, LucideDroplets, LucidePlus],
  template: `
    <div
      class="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-teal-50">
            <svg lucideDroplets class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
          </span>
          <div>
            <p class="text-sm font-medium text-ink-muted">{{ title() }}</p>
            <p class="text-xs text-ink-faint">{{ dailyTracking() }}</p>
          </div>
        </div>
        <span class="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-accent-dark">
          {{ percentOfGoal() }}
        </span>
      </div>

      <div class="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p class="font-display text-3xl font-bold tracking-tight text-primary">
          {{ service.hydrationLabel() }}
        </p>
        <p class="text-sm text-ink-muted">{{ onTotal() }}</p>
      </div>

      <div class="mt-3">
        <div class="h-2 overflow-hidden rounded-full bg-surface-strong">
          <div
            class="h-full rounded-full bg-accent transition-all duration-700"
            [style.width.%]="service.hydrationPercent()"
          ></div>
        </div>
      </div>

      <button appButton variant="accent" size="md" class="mt-4 self-start" (click)="add.emit()">
        <svg lucidePlus class="h-4 w-4" aria-hidden="true"></svg>
        {{ addLabel() }}
      </button>

      <div class="mt-auto pt-4">
        <p class="text-xs font-medium text-ink-muted">{{ dailyConsumption() }}</p>
        <ul class="mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1">
          @for (entry of service.hydrationEntries(); track entry.id) {
            <li class="flex items-center justify-between rounded-panel bg-surface-muted px-3 py-2 text-sm">
              <span class="flex items-center gap-2 text-ink-muted">
                <svg lucideDroplets class="h-3.5 w-3.5 text-accent" aria-hidden="true"></svg>
                <span class="tabular-nums">{{ entry.time }}</span>
              </span>
              <span class="font-semibold tabular-nums text-primary">{{ entry.ml }} ml</span>
            </li>
          } @empty {
            <li class="rounded-panel bg-surface-muted px-3 py-2 text-sm text-ink-faint">
              {{ emptyLabel() }}
            </li>
          }
        </ul>
      </div>
    </div>
  `,
})
export class HydrationCard {
  readonly add = output<void>();

  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly title = this.languageService.translateSignal('wellness.hydration');
  protected readonly dailyTracking = this.languageService.translateSignal(
    'wellness.hydrationCard.dailyTracking',
  );
  protected readonly addLabel = this.languageService.translateSignal('wellness.hydrationCard.add250');
  protected readonly dailyConsumption = this.languageService.translateSignal(
    'wellness.hydrationCard.dailyConsumption',
  );
  protected readonly emptyLabel = this.languageService.translateSignal('wellness.hydrationCard.empty');
  protected readonly onTotal = computed(() =>
    this.languageService.translate('wellness.onTotal', {
      value: this.service.hydrationGoalLabel(),
    }),
  );
  protected readonly percentOfGoal = computed(() =>
    this.languageService.translate('wellness.percentOfGoal', {
      percent: String(this.service.hydrationPercent()),
    }),
  );
}
