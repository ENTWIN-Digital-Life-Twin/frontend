import { Component, computed, inject, output } from '@angular/core';
import {
  LucideCalendarClock,
  LucideCalendarDays,
  LucideDynamicIcon,
  LucideListChecks,
  LucideSparkles,
  LucideTarget,
  LucideTimer,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import {
  formatMinutesLocale,
  type PlanningCategory,
} from '../../models/planning.models';
import { PlanningService } from '../../services/planning.service';
import type { LucideIcon } from '@lucide/angular';

@Component({
  selector: 'app-planning-sidebar',
  imports: [
    Button,
    LucideDynamicIcon,
    LucideSparkles,
    LucideCalendarClock,
    LucideListChecks,
    LucideTimer,
    LucideCalendarDays,
    LucideTarget,
  ],
  template: `
    <aside class="flex flex-col gap-4">
      <button appButton variant="primary" size="md" class="w-full" (click)="plan.emit()">
        <svg lucideSparkles class="h-4 w-4" aria-hidden="true"></svg>
        {{ planDay() }}
      </button>

      <button appButton variant="secondary" size="md" class="w-full" (click)="create.emit()">
        <svg lucideCalendarClock class="h-4 w-4" aria-hidden="true"></svg>
        {{ addEntry() }}
      </button>

      <section class="rounded-card border border-line bg-surface p-4 shadow-card">
        <div class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-panel bg-primary/10 text-primary">
            <svg lucideListChecks class="h-4 w-4" aria-hidden="true"></svg>
          </span>
          <h3 class="font-display text-sm font-semibold text-primary">{{ todayTitle() }}</h3>
        </div>

        <dl class="mt-3 space-y-2 text-xs">
          <div class="flex items-center justify-between gap-2">
            <dt class="flex items-center gap-1.5 text-ink-muted">
              <svg lucideTarget class="h-3.5 w-3.5" aria-hidden="true"></svg>
              {{ tasks() }}
            </dt>
            <dd class="font-semibold tabular-nums text-primary">
              {{ summary().doneTasks }}/{{ summary().totalTasks }}
            </dd>
          </div>
          <div class="flex items-center justify-between gap-2">
            <dt class="flex items-center gap-1.5 text-ink-muted">
              <svg lucideCalendarDays class="h-3.5 w-3.5" aria-hidden="true"></svg>
              {{ events() }}
            </dt>
            <dd class="font-semibold tabular-nums text-primary">{{ summary().totalEvents }}</dd>
          </div>
          <div class="flex items-center justify-between gap-2">
            <dt class="flex items-center gap-1.5 text-ink-muted">
              <svg lucideTimer class="h-3.5 w-3.5" aria-hidden="true"></svg>
              {{ freeTime() }}
            </dt>
            <dd class="font-semibold tabular-nums text-primary">
              {{ formatMinutesLabel(summary().freeMinutes) }}
            </dd>
          </div>
        </dl>

        <div class="mt-4">
          <div class="mb-1.5 flex items-center justify-between">
            <span class="text-[11px] font-medium text-ink-muted">{{ dayLoad() }}</span>
            <span class="text-[11px] font-semibold tabular-nums text-ink">{{ summary().loadPercent }}%</span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              class="h-full rounded-full transition-all duration-500"
              [class]="loadTone()"
              [style.width]="summary().loadPercent + '%'"
            ></div>
          </div>
        </div>
      </section>

      <section class="rounded-card border border-line bg-surface p-4 shadow-card">
        <h3 class="font-display text-sm font-semibold text-primary">{{ categoriesTitle() }}</h3>
        <ul class="mt-3 space-y-2.5">
          @for (cat of summary().categories; track cat.category) {
            <li>
              <div class="mb-1 flex items-center justify-between text-xs">
                <span class="flex items-center gap-1.5 text-ink-muted">
                  <svg [lucideIcon]="categoryIcon(cat.category)" class="h-3.5 w-3.5" aria-hidden="true"></svg>
                  {{ categoryLabel(cat.category) }}
                </span>
                <span class="font-medium tabular-nums text-ink">{{ formatMinutesLabel(cat.minutes) }}</span>
              </div>
              <div class="h-1 overflow-hidden rounded-full bg-surface-muted">
                <div class="h-full rounded-full" [class]="barTone(cat.category)" [style.width]="barWidth(cat.minutes) + '%'"></div>
              </div>
            </li>
          }
        </ul>
        @if (summary().categories.length === 0) {
          <p class="mt-2 text-xs text-ink-faint">{{ noActivity() }}</p>
        }
      </section>
    </aside>
  `,
})
export class PlanningSidebar {
  protected readonly service = inject(PlanningService);
  private readonly languageService = inject(LanguageService);
  protected readonly plan = output<void>();
  protected readonly create = output<void>();

  protected readonly planDay = this.languageService.translateSignal('planning.sidebar.planDay');
  protected readonly addEntry = this.languageService.translateSignal('planning.sidebar.addEntry');
  protected readonly todayTitle = this.languageService.translateSignal('planning.sidebar.today');
  protected readonly tasks = this.languageService.translateSignal('planning.sidebar.tasks');
  protected readonly events = this.languageService.translateSignal('planning.sidebar.events');
  protected readonly freeTime = this.languageService.translateSignal('planning.sidebar.freeTime');
  protected readonly dayLoad = this.languageService.translateSignal('planning.sidebar.dayLoad');
  protected readonly categoriesTitle = this.languageService.translateSignal(
    'planning.sidebar.categoriesTitle',
  );
  protected readonly noActivity = this.languageService.translateSignal(
    'planning.sidebar.noActivity',
  );

  protected readonly summary = computed(() => this.service.summary());

  protected readonly loadTone = computed(() =>
    this.summary().tone === 'danger'
      ? 'bg-danger'
      : this.summary().tone === 'warning'
        ? 'bg-warning'
        : 'bg-primary',
  );

  protected readonly maxCategoryMinutes = computed(() => {
    const max = Math.max(...this.summary().categories.map((cat) => cat.minutes), 0);
    return max > 0 ? max : 1;
  });

  protected formatMinutesLabel(minutes: number): string {
    return formatMinutesLocale(minutes, (key) => this.languageService.translate(key));
  }

  protected categoryIcon(category: PlanningCategory): LucideIcon {
    return this.service.categoryIcon(category);
  }

  protected categoryLabel(category: PlanningCategory): string {
    return this.service.categoryLabel(category);
  }

  protected barWidth(minutes: number): number {
    return Math.round((minutes / this.maxCategoryMinutes()) * 100);
  }

  protected barTone(category: PlanningCategory): string {
    switch (category) {
      case 'sport':
        return 'bg-danger';
      case 'personal':
        return 'bg-accent';
      case 'meals':
        return 'bg-warning';
      default:
        return 'bg-primary';
    }
  }
}
