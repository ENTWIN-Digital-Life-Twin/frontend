import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../../../core/services/language.service';
import {
  dayNumber,
  formatWeekRange,
  todayISO,
  weekdayLabel,
} from '../../models/planning.models';
import { PlanningService } from '../../services/planning.service';

@Component({
  selector: 'app-planning-week',
  template: `
    <section class="rounded-card border border-line bg-surface shadow-card">
      <header class="flex items-center justify-between gap-3 px-5 pt-4">
        <div>
           <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{{ overview() }}</p>
          <h2 class="mt-0.5 font-display text-lg font-semibold tracking-tight text-primary">{{ weekTitle() }}</h2>
        </div>
        <span class="text-xs font-medium text-ink-muted">{{ rangeLabel() }}</span>
      </header>

      <div class="grid grid-cols-7 gap-1.5 p-4">
        @for (iso of service.week(); track iso) {
          <button
            type="button"
            class="group relative flex flex-col items-center gap-1 rounded-panel border px-1 py-2.5 transition-all duration-200"
            [class.border-primary]="iso === selectedDate()"
            [class.bg-navy-900]="iso === selectedDate()"
            [class.text-white]="iso === selectedDate()"
            [class.shadow-soft]="iso === selectedDate()"
            [class.border-accent/50]="iso !== selectedDate() && iso === today()"
            [class.bg-teal-50]="iso !== selectedDate() && iso === today()"
            [class.text-primary]="iso !== selectedDate() && iso === today()"
            [class.border-line]="iso !== selectedDate() && iso !== today()"
            [class.bg-surface]="iso !== selectedDate() && iso !== today()"
            [class.text-ink-muted]="iso !== selectedDate() && iso !== today()"
            [class.hover:border-navy-300]="iso !== selectedDate() && iso !== today()"
            [attr.aria-label]="t('planningExtended.viewDay', { date: iso })"
            [attr.aria-pressed]="iso === selectedDate()"
            (click)="service.selectDate(iso)"
          >
            <span
              class="text-[10px] font-semibold uppercase tracking-wide"
              [class.text-white/70]="iso === selectedDate()"
              [class.text-accent-dark]="iso !== selectedDate() && iso === today()"
              [class.text-ink-faint]="iso !== selectedDate() && iso !== today()"
            >
              {{ weekdayLabel(iso) }}
            </span>
            <span
              class="text-sm font-bold tabular-nums"
              [class.text-white]="iso === selectedDate()"
              [class.text-accent-dark]="iso !== selectedDate() && iso === today()"
              [class.text-primary]="iso !== selectedDate() && iso !== today()"
            >
              {{ dayNumber(iso) }}
            </span>
            <span
              class="mt-0.5 h-1 w-1 rounded-full"
              [class.bg-white]="iso === selectedDate()"
              [class.bg-accent]="iso !== selectedDate() && iso === today()"
              [class.bg-primary/40]="iso !== selectedDate() && iso !== today() && hasEntries(iso)"
              [class.opacity-0]="!hasEntries(iso)"
            ></span>
          </button>
        }
      </div>
    </section>
  `,
})
export class PlanningWeek {
  protected readonly service = inject(PlanningService);
  private readonly languageService = inject(LanguageService);
  protected readonly t = (key: string, vars?: Record<string, string>) =>
    this.languageService.translate<string>(key, vars);
  protected readonly overview = this.languageService.translateSignal('planningExtended.overview');
  protected readonly weekTitle = this.languageService.translateSignal('planningExtended.week');
  protected readonly selectedDate = computed(() => this.service.selectedDate());
  protected readonly rangeLabel = computed(() =>
    formatWeekRange(this.service.week(), this.languageService.getLocale()),
  );

  protected readonly today = todayISO;

  protected weekdayLabel(iso: string): string {
    return weekdayLabel(iso, this.languageService.getLocale());
  }

  protected readonly dayNumber = dayNumber;

  protected hasEntries(iso: string): boolean {
    return this.service.dayHasEntries(iso);
  }
}
