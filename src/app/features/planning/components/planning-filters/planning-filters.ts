import { Component, computed, inject } from '@angular/core';
import { type PlanningFilter } from '../../models/planning.models';
import { PlanningService } from '../../services/planning.service';
import { LanguageService } from '../../../../core/services/language.service';

const FILTERS: { value: PlanningFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'common.all' },
  { value: 'tasks', labelKey: 'planning.summary.tasks' },
  { value: 'events', labelKey: 'planning.summary.events' },
  { value: 'sport', labelKey: 'categories.sport' },
  { value: 'personal', labelKey: 'categories.personal' },
  { value: 'work', labelKey: 'categories.work' },
  { value: 'free', labelKey: 'categories.free' },
];

@Component({
  selector: 'app-planning-filters',
  template: `
    <div class="flex flex-wrap items-center gap-2" role="group" [attr.aria-label]="t('planningExtended.filtersAria')">
      @for (filter of translatedFilters(); track filter.value) {
        <button
          type="button"
          class="rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200"
          [class.border-primary]="active() === filter.value"
          [class.bg-primary]="active() === filter.value"
          [class.text-white]="active() === filter.value"
          [class.shadow-sm]="active() === filter.value"
          [class.border-line]="active() !== filter.value"
          [class.bg-surface]="active() !== filter.value"
          [class.text-ink-muted]="active() !== filter.value"
          [class.hover:border-navy-300]="active() !== filter.value"
          [class.hover:text-primary]="active() !== filter.value"
          [attr.aria-pressed]="active() === filter.value"
          (click)="service.setFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      }
    </div>
  `,
})
export class PlanningFilters {
  protected readonly service = inject(PlanningService);
  private readonly languageService = inject(LanguageService);
  protected readonly active = computed(() => this.service.filter());

  t = (key: string, vars?: Record<string, string>) => this.languageService.translate<string>(key, vars);

  protected readonly translatedFilters = computed(() =>
    this.languageService.translateArray(FILTERS)(),
  );
}
