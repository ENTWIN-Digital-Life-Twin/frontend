import { Component, computed, inject } from '@angular/core';
import {
  LucideActivity,
  LucideClock,
  LucideCoffee,
  LucideDynamicIcon,
  LucideGlassWater,
  LucideMoonStar,
  LucideSunrise,
  LucideUtensils,
  type LucideIcon,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { MOCK_TIMELINE, type TimelineKind } from '../../models/wellness.models';

const KIND_VISUALS: Record<TimelineKind, { icon: LucideIcon; chip: string }> = {
  wake: { icon: LucideSunrise, chip: 'bg-teal-50 text-accent-dark' },
  hydration: { icon: LucideGlassWater, chip: 'bg-teal-50 text-accent-dark' },
  meal: { icon: LucideUtensils, chip: 'bg-warning-light text-warning' },
  break: { icon: LucideCoffee, chip: 'bg-navy-50 text-primary' },
  activity: { icon: LucideActivity, chip: 'bg-success-light text-success' },
  sleep: { icon: LucideMoonStar, chip: 'bg-primary text-white' },
};

@Component({
  selector: 'app-wellness-timeline',
  imports: [LucideDynamicIcon, LucideClock],
  template: `
    <div
      class="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div class="flex items-center gap-2.5">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-navy-50">
          <svg lucideClock class="h-4 w-4 text-primary" aria-hidden="true"></svg>
        </span>
        <div>
          <h2 class="font-display text-base font-semibold tracking-tight text-primary">{{ title() }}</h2>
          <p class="text-xs text-ink-faint">{{ subtitle() }}</p>
        </div>
      </div>

      <ol class="mt-4 max-h-[420px] flex-1 overflow-y-auto pr-1">
        @for (item of items(); track item.id; let index = $index) {
          <li class="relative flex gap-3 pb-4 last:pb-0">
            @if (index < items().length - 1) {
              <span
                class="absolute bottom-0 left-[17px] top-8 w-px"
                [class.bg-line-strong]="index >= activeIndex()"
                [class.bg-accent/40]="index < activeIndex()"
                aria-hidden="true"
              ></span>
            }
            <span
              class="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-panel"
              [class]="visuals[item.kind].chip"
            >
              <svg [lucideIcon]="visuals[item.kind].icon" class="h-3.5 w-3.5" aria-hidden="true"></svg>
            </span>
            <div class="min-w-0 pt-0.5">
              <p class="flex items-baseline gap-2 text-sm">
                <span class="font-semibold tabular-nums text-primary">{{ item.time }}</span>
                <span class="font-medium text-ink">{{ item.title }}</span>
              </p>
              <p class="mt-0.5 text-xs text-ink-muted">{{ item.detail }}</p>
            </div>
          </li>
        }
      </ol>
    </div>
  `,
})
export class WellnessTimeline {
  private readonly languageService = inject(LanguageService);

  protected readonly visuals = KIND_VISUALS;
  protected readonly title = this.languageService.translateSignal('wellness.timeline.title');
  protected readonly subtitle = this.languageService.translateSignal('wellness.timeline.subtitle');

  protected readonly items = computed(() =>
    MOCK_TIMELINE.map((item) => ({
      id: item.id,
      time: item.time,
      kind: item.kind,
      title: this.languageService.translate(item.titleKey),
      detail: this.languageService.translate(item.detailKey, item.detailVars),
    })),
  );

  protected readonly activeIndex = computed(() => {
    const now = new Date().getHours() * 60 + new Date().getMinutes();
    let active = -1;
    this.items().forEach((item, index) => {
      const [hours, minutes] = item.time.split(':').map(Number);
      if (hours * 60 + minutes <= now) {
        active = index;
      }
    });
    return active;
  });
}
