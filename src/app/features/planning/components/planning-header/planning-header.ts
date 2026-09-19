import { Component, computed, inject } from '@angular/core';
import { LucideCalendarDays, LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { formatLongDate, todayISO } from '../../models/planning.models';
import { PlanningService } from '../../services/planning.service';

@Component({
  selector: 'app-planning-header',
  imports: [Button, LucideChevronLeft, LucideChevronRight, LucideCalendarDays],
  template: `
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
          {{ eyebrow() }}
        </p>
        <h1 class="mt-0.5 font-display text-2xl font-bold tracking-tight text-primary">{{ title() }}</h1>
      </div>

      <div class="flex items-center gap-1 rounded-full border border-line bg-surface p-1.5 shadow-soft">
        <button
          type="button"
          appButton
          variant="ghost"
          size="icon"
          [attr.aria-label]="previousDay()"
          (click)="service.goPreviousDay()"
        >
          <svg lucideChevronLeft class="h-4 w-4" aria-hidden="true"></svg>
        </button>
        <button
          type="button"
          class="flex min-w-[9.5rem] items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-surface-muted"
          [class.text-accent-dark]="isToday()"
          (click)="service.goToday()"
          [attr.title]="todayTitle()"
        >
          <svg lucideCalendarDays class="h-4 w-4" aria-hidden="true"></svg>
          {{ dateLabel() }}
        </button>
        <button
          type="button"
          appButton
          variant="ghost"
          size="icon"
          [attr.aria-label]="nextDay()"
          (click)="service.goNextDay()"
        >
          <svg lucideChevronRight class="h-4 w-4" aria-hidden="true"></svg>
        </button>
      </div>
    </header>
  `,
})
export class PlanningHeader {
  protected readonly service = inject(PlanningService);
  private readonly languageService = inject(LanguageService);

  protected readonly eyebrow = this.languageService.translateSignal('planning.header.eyebrow');
  protected readonly title = this.languageService.translateSignal('planning.header.title');
  protected readonly previousDay = this.languageService.translateSignal('planning.header.previousDay');
  protected readonly nextDay = this.languageService.translateSignal('planning.header.nextDay');
  protected readonly today = this.languageService.translateSignal('planning.header.today');
  protected readonly goToToday = this.languageService.translateSignal('planning.header.goToToday');

  protected readonly dateLabel = computed(() => formatLongDate(this.service.selectedDate(), this.languageService.getLocale()));
  protected readonly isToday = computed(() => this.service.selectedDate() === todayISO());
  protected readonly todayTitle = computed(() =>
    this.isToday() ? this.today() : this.goToToday(),
  );
}
