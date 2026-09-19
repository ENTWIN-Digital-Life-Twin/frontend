import { Component, computed, inject, output } from '@angular/core';
import {
  LucideCalendarDays,
  LucideChevronLeft,
  LucideChevronRight,
  LucidePlus,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { formatLongDate, todayISO, type CalendarView } from '../../models/calendar.models';
import { CalendarService } from '../../services/calendar.service';

type ViewOption = { value: CalendarView; label: string };

@Component({
  selector: 'app-calendar-header',
  imports: [
    Button,
    LucideChevronLeft,
    LucideChevronRight,
    LucideCalendarDays,
    LucidePlus,
  ],
  template: `
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
          {{ eyebrow() }}
        </p>
        <h1 class="mt-0.5 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {{ title() }}
        </h1>
        <p class="mt-1 text-sm text-ink-muted">
          {{ subtitle() }}
        </p>
      </div>

      <button appButton variant="accent" size="md" (click)="create.emit()">
        <svg lucidePlus class="h-4 w-4" aria-hidden="true"></svg>
        {{ newEvent() }}
      </button>
    </header>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1 rounded-full border border-line bg-surface p-1.5 shadow-soft">
          <button
            type="button"
            appButton
            variant="ghost"
            size="icon"
            [attr.aria-label]="previousPeriod()"
            (click)="service.goPrevious()"
          >
            <svg lucideChevronLeft class="h-4 w-4" aria-hidden="true"></svg>
          </button>
          <button
            type="button"
            class="flex h-9 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-muted"
            [class.text-accent-dark]="service.isToday()"
            (click)="service.goToday()"
          >
            <svg lucideCalendarDays class="h-4 w-4" aria-hidden="true"></svg>
            {{ today() }}
          </button>
          <button
            type="button"
            appButton
            variant="ghost"
            size="icon"
            [attr.aria-label]="nextPeriod()"
            (click)="service.goNext()"
          >
            <svg lucideChevronRight class="h-4 w-4" aria-hidden="true"></svg>
          </button>
        </div>

        <span class="hidden text-sm font-semibold text-primary sm:inline">{{ periodLabel() }}</span>
      </div>

      <div
        class="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-soft"
        role="tablist"
        [attr.aria-label]="changeView()"
      >
        @for (option of VIEW_OPTIONS(); track option.value) {
          <button
            type="button"
            role="tab"
            class="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200"
            [class.bg-primary]="service.view() === option.value"
            [class.text-white]="service.view() === option.value"
            [class.shadow-soft]="service.view() === option.value"
            [class.text-ink-muted]="service.view() !== option.value"
            [class.hover:text-primary]="service.view() !== option.value"
            [attr.aria-selected]="service.view() === option.value"
            (click)="service.setView(option.value)"
          >
            {{ option.label }}
          </button>
        }
      </div>
    </div>
  `,
})
export class CalendarHeader {
  protected readonly service = inject(CalendarService);
  private readonly languageService = inject(LanguageService);
  protected readonly create = output<void>();

  protected readonly eyebrow = this.languageService.translateSignal('calendar.eyebrow');
  protected readonly title = this.languageService.translateSignal('calendar.title');
  protected readonly subtitle = this.languageService.translateSignal('calendar.subtitle');
  protected readonly newEvent = this.languageService.translateSignal('calendar.newEvent');
  protected readonly today = this.languageService.translateSignal('calendar.today');
  protected readonly previousPeriod = this.languageService.translateSignal(
    'calendar.previousPeriod',
  );
  protected readonly nextPeriod = this.languageService.translateSignal('calendar.nextPeriod');
  protected readonly changeView = this.languageService.translateSignal('calendar.changeView');

  protected readonly VIEW_OPTIONS = computed<ViewOption[]>(() => [
    { value: 'month', label: this.languageService.translate('calendar.view.month') },
    { value: 'week', label: this.languageService.translate('calendar.view.week') },
    { value: 'day', label: this.languageService.translate('calendar.view.day') },
  ]);

  protected readonly periodLabel = computed(() => {
    switch (this.service.view()) {
      case 'week':
        return this.service.weekLabel();
      case 'day':
        return formatLongDate(this.service.selectedDate(), this.languageService.getLocale());
      default:
        return this.service.monthLabel();
    }
  });

  protected readonly isToday = computed(() => this.service.selectedDate() === todayISO());
}
