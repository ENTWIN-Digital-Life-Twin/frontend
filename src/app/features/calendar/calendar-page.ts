import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideRotateCcw, LucideSearch } from '@lucide/angular';
import { LanguageService } from '../../core/services/language.service';
import { Toast, type ToastTone } from '../../shared/ui/toast/toast';
import { CalendarDay } from './components/calendar-day/calendar-day';
import { CalendarHeader } from './components/calendar-header/calendar-header';
import { CalendarMonth } from './components/calendar-month/calendar-month';
import { CalendarSidebar } from './components/calendar-sidebar/calendar-sidebar';
import { CalendarWeek } from './components/calendar-week/calendar-week';
import { EventDetails } from './components/event-details/event-details';
import { EventForm } from './components/event-form/event-form';
import { type CalendarEvent, type CalendarFilter } from './models/calendar.models';
import { CalendarService } from './services/calendar.service';

@Component({
  selector: 'app-calendar-page',
  imports: [
    FormsModule,
    CalendarHeader,
    CalendarMonth,
    CalendarWeek,
    CalendarDay,
    CalendarSidebar,
    EventDetails,
    EventForm,
    Toast,
    LucideSearch,
    LucideRotateCcw,
  ],
  template: `
    <div class="space-y-6">
      <app-calendar-header (create)="onCreate()" />

      <div
        class="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-3 shadow-soft sm:p-4"
      >
        <div class="flex flex-wrap items-center gap-2">
          <label
            class="flex min-w-[220px] flex-1 items-center gap-2 rounded-panel border border-line bg-surface px-3 py-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:min-w-[260px]"
          >
            <svg lucideSearch class="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true"></svg>
            <input
              type="search"
              class="w-full bg-transparent text-sm text-primary placeholder:text-ink-faint focus:outline-none"
              [placeholder]="searchPlaceholder()"
              [attr.aria-label]="searchAria()"
              [ngModel]="service.search()"
              (ngModelChange)="service.setSearch($event)"
            />
          </label>

          @for (filter of FILTERS(); track filter.value) {
            <button
              type="button"
              class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150"
              [class.bg-primary]="service.filter() === filter.value"
              [class.text-white]="service.filter() === filter.value"
              [class.border-primary]="service.filter() === filter.value"
              [class.shadow-soft]="service.filter() === filter.value"
              [class.border-line]="service.filter() !== filter.value"
              [class.text-ink-muted]="service.filter() !== filter.value"
              [class.hover:border-accent/40]="service.filter() !== filter.value"
              [class.hover:text-primary]="service.filter() !== filter.value"
              [attr.aria-pressed]="service.filter() === filter.value"
              (click)="service.setFilter(filter.value)"
            >
              {{ filter.label }}
            </button>
          }

          @if (service.hasCriteria()) {
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-accent-dark transition-colors hover:bg-teal-50"
              (click)="service.resetCriteria()"
            >
              <svg lucideRotateCcw class="h-3.5 w-3.5" aria-hidden="true"></svg>
              {{ resetCriteria() }}
            </button>
          }
        </div>

        <p class="text-xs font-medium tabular-nums text-ink-muted">
          {{ visibleCountLabel() }}
        </p>
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div class="view-root min-w-0">
          @switch (service.view()) {
            @case ('month') {
              <app-calendar-month />
            }
            @case ('week') {
              <app-calendar-week />
            }
            @case ('day') {
              <app-calendar-day (create)="onCreate()" />
            }
          }
        </div>

        <app-calendar-sidebar class="w-full xl:sticky xl:top-6 xl:self-start" />
      </div>
    </div>

    @if (modalOpen()) {
      <app-event-form
        [event]="editing()"
        [initialDate]="service.selectedDate()"
        (saved)="onSaved($event)"
        (closed)="onCloseModal()"
      />
    }

    @if (service.selectedEvent(); as event) {
      <app-event-details
        [event]="event"
        (closed)="service.closeEvent()"
        (edit)="onEdit($event)"
        (delete)="onDelete($event)"
      />
    }

    @if (toast(); as message) {
      <app-toast [message]="message" [tone]="toastTone()" (closed)="toast.set(null)" />
    }
  `,
})
export class CalendarPage {
  protected readonly service = inject(CalendarService);
  private readonly languageService = inject(LanguageService);

  protected readonly modalOpen = signal(false);
  protected readonly editing = signal<CalendarEvent | null>(null);
  protected readonly toast = signal<string | null>(null);
  protected readonly toastTone = signal<ToastTone>('primary');

  protected readonly searchPlaceholder = this.languageService.translateSignal(
    'calendar.searchPlaceholder',
  );
  protected readonly searchAria = this.languageService.translateSignal('calendar.searchAria');
  protected readonly resetCriteria = this.languageService.translateSignal('common.reset');

  protected readonly FILTERS = computed<{ value: CalendarFilter; label: string }[]>(() =>
    (
      [
        'all',
        'work',
        'personal',
        'sport',
        'studies',
        'meeting',
      ] as CalendarFilter[]
    ).map((value) => ({
      value,
      label: this.languageService.translate(`calendar.filters.${value}`),
    })),
  );

  protected readonly visibleCount = computed(() => {
    switch (this.service.view()) {
      case 'week':
        return this.service
          .weekDays()
          .reduce((sum, iso) => sum + this.service.dayCount(iso), 0);
      case 'day':
        return this.service.dayCount(this.service.selectedDate());
      default:
        return this.service
          .monthCells()
          .reduce((sum, iso) => sum + this.service.dayCount(iso), 0);
    }
  });

  protected readonly visibleCountLabel = computed(() => {
    const count = this.visibleCount();
    return this.languageService.translate(count > 1 ? 'calendar.eventCountMany' : 'calendar.eventCountOne', {
      count: String(count),
    });
  });

  protected onCreate(): void {
    this.editing.set(null);
    this.modalOpen.set(true);
  }

  protected onEdit(event: CalendarEvent): void {
    this.editing.set(event);
    this.modalOpen.set(true);
  }

  protected onSaved(event: CalendarEvent): void {
    if (this.editing()) {
      this.service.updateEvent(event);
      this.toastTone.set('success');
      this.toast.set(this.languageService.translate('calendar.toast.updated'));
    } else {
      this.service.addEvent(event);
      this.toastTone.set('success');
      this.toast.set(this.languageService.translate('calendar.toast.added'));
    }
    this.onCloseModal();
  }

  protected onDelete(event: CalendarEvent): void {
    this.service.deleteEvent(event.id);
    this.toastTone.set('primary');
    this.toast.set(this.languageService.translate('calendar.toast.deleted'));
  }

  protected onCloseModal(): void {
    this.modalOpen.set(false);
    this.editing.set(null);
  }
}
