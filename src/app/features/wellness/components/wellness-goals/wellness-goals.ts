import { Component, computed, inject } from '@angular/core';
import {
  LucideCoffee,
  LucideDroplets,
  LucideDynamicIcon,
  LucideMoon,
  type LucideIcon,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { WellnessService } from '../../services/wellness.service';

const GOAL_ICONS: Record<string, LucideIcon> = {
  'goal-sleep': LucideMoon,
  'goal-hydra': LucideDroplets,
  'goal-pause': LucideCoffee,
};

@Component({
  selector: 'app-wellness-goals',
  imports: [LucideDynamicIcon],
  template: `
    <div
      class="flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div>
        <h2 class="font-display text-base font-semibold tracking-tight text-primary">{{ title() }}</h2>
        <p class="mt-0.5 text-xs text-ink-faint">{{ subtitle() }}</p>
      </div>

      <ul class="mt-5 grid gap-4 sm:grid-cols-3">
        @for (goal of goals(); track goal.id) {
          <li class="rounded-panel border border-line bg-surface-muted p-4">
            <div class="flex items-center gap-2.5">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-surface">
                <svg [lucideIcon]="iconOf(goal)" class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
              </span>
              <p class="text-sm font-semibold text-primary">{{ goal.label }}</p>
            </div>
            <p class="mt-3 font-display text-xl font-bold tracking-tight text-primary">
              {{ goal.current }}
              <span class="text-xs font-medium text-ink-faint">/ {{ goal.target }}</span>
            </p>
            <p class="mt-0.5 text-xs text-ink-faint">{{ goal.unit }}</p>
            <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-strong">
              <div
                class="h-full rounded-full bg-accent transition-all duration-700"
                [style.width.%]="goal.progress"
              ></div>
            </div>
            <p class="mt-2 text-xs font-semibold tabular-nums text-ink-muted">
              {{ goal.reached }}
            </p>
          </li>
        }
      </ul>
    </div>
  `,
})
export class WellnessGoals {
  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly title = this.languageService.translateSignal('wellness.goals.title');
  protected readonly subtitle = this.languageService.translateSignal('wellness.goals.subtitle');

  protected readonly goals = computed(() =>
    this.service.goals().map((goal) => ({
      id: goal.id,
      current: goal.current,
      target: goal.target,
      progress: goal.progress,
      label: this.languageService.translate(goal.labelKey),
      unit: this.languageService.translate(goal.unitKey),
      reached: this.languageService.translate('wellness.goals.reached', {
        value: String(goal.progress),
      }),
    })),
  );

  protected readonly iconOf = (goal: { id: string }): LucideIcon => GOAL_ICONS[goal.id];
}
