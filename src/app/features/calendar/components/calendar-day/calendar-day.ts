import { Component, ElementRef, effect, inject, output, signal } from '@angular/core';
import { LucideCalendarX, LucideClock, LucidePlus } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import {
  formatLongDate,
  minutesToLabel,
  type CalendarEvent,
} from '../../models/calendar.models';
import { CalendarService } from '../../services/calendar.service';
import { CalendarEventComponent as EventCard } from '../calendar-event/calendar-event';

@Component({
  selector: 'app-calendar-day',
  imports: [EventCard, LucideCalendarX, LucideClock, LucidePlus],
  template: `
    <section
      class="overflow-hidden rounded-card border border-line bg-surface shadow-card"
      [attr.aria-label]="dayViewAria()"
    >
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {{ dayAgenda() }}
          </p>
          <h2 class="mt-0.5 font-display text-lg font-semibold tracking-tight text-primary sm:text-xl">
            {{ formatLongDate(service.selectedDate()) }}
          </h2>
          <p class="mt-0.5 text-xs text-ink-muted">
            {{ summaryText() }}
          </p>
        </div>
        @if (service.isToday()) {
          <span class="flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-accent-dark">
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60"></span>
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent"></span>
            </span>
            {{ todayLabel() }}
          </span>
        }
      </header>

      <div [attr.data-day-date]="service.selectedDate()">
        @if (service.dayEvents().length === 0) {
          <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-ink-faint">
              <svg lucideCalendarX class="h-6 w-6" aria-hidden="true"></svg>
            </span>
            <h3 class="mt-3 font-display text-base font-semibold text-primary">
              {{ dayEmptyTitle() }}
            </h3>
            <p class="mt-1 max-w-sm text-sm text-ink-muted">
              {{ dayEmptyDescription() }}
            </p>
            <button
              type="button"
              class="event-row mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary/90 active:scale-[0.98]"
              (click)="create.emit()"
            >
              <svg lucidePlus class="h-4 w-4" aria-hidden="true"></svg>
              {{ newEvent() }}
            </button>
          </div>
        } @else {
          <div class="divide-y divide-line">
            @for (event of service.dayEvents(); track event.id) {
              <div
                class="event-row flex gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/40 sm:px-5"
                [attr.data-event-id]="event.id"
              >
                <div class="w-14 shrink-0 pt-2 text-right sm:w-16">
                  <div class="text-sm font-bold tabular-nums text-primary">{{ event.start }}</div>
                  <div class="text-xs tabular-nums text-ink-faint">{{ event.end }}</div>
                </div>
                <div class="min-w-0 flex-1">
                  <app-calendar-event [event]="event" mode="day" (open)="openEvent($event)" />
                </div>
              </div>
            }
          </div>
        }

        @if (service.freeSlots().length > 0) {
          <div class="border-t border-line bg-surface-muted/30 px-4 py-4 sm:px-5">
            <div class="flex items-center gap-2">
              <svg lucideClock class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
              <h3 class="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {{ freeTimeLabel() }}
              </h3>
            </div>
            <div class="mt-2 flex flex-wrap gap-1.5">
              @for (slot of service.freeSlots(); track slot.start) {
                <span
                  class="rounded-full border border-accent/30 bg-teal-50 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-accent-dark"
                >
                  {{ slot.start }} – {{ slot.end }} · {{ minutesLabel(slot.minutes) }}
                </span>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class CalendarDay {
  protected readonly service = inject(CalendarService);
  protected readonly create = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly languageService = inject(LanguageService);

  protected readonly dayViewAria = this.languageService.translateSignal('calendar.dayViewAria');
  protected readonly todayLabel = this.languageService.translateSignal('calendar.today');
  protected readonly dayAgenda = this.languageService.translateSignal('calendar.dayAgenda');
  protected readonly dayEmptyTitle = this.languageService.translateSignal('calendar.dayEmptyTitle');
  protected readonly dayEmptyDescription = this.languageService.translateSignal(
    'calendar.dayEmptyDescription',
  );
  protected readonly newEvent = this.languageService.translateSignal('calendar.newEvent');
  protected readonly freeTimeLabel = this.languageService.translateSignal('calendar.freeTimeLabel');

  protected openEvent(event: CalendarEvent): void {
    this.service.selectDate(event.date);
    this.service.openEvent(event.id);
  }

  protected formatLongDate(iso: string): string {
    return formatLongDate(iso, this.languageService.getLocale());
  }

  protected minutesLabel(minutes: number): string {
    return minutesToLabel(minutes, (key, vars) => this.languageService.translate(key, vars));
  }

  protected summaryText(): string {
    const events = this.service.dayEvents();
    const planned = events.reduce((sum, event) => sum + event.duration, 0);
    const free = this.service.freeSlots().reduce((sum, slot) => sum + slot.minutes, 0);
    const eventsLabel = this.languageService.translate(
      events.length > 1 ? 'calendar.eventCountMany' : 'calendar.eventCountOne',
      { count: String(events.length) },
    );
    return this.languageService.translate('calendar.daySummary', {
      eventsLabel,
      planned: this.minutesLabel(planned),
      free: this.minutesLabel(free),
    });
  }

  constructor() {
    const dateKey = signal('');
    effect(() => {
      const key = this.service.selectedDate();
      const changed = key !== dateKey();
      dateKey.set(key);
      if (!changed || this.reduced) {
        return;
      }
      requestAnimationFrame(() => {
        const rows = this.host.nativeElement.querySelectorAll<HTMLElement>('.event-row');
        if (rows.length === 0) {
          return;
        }
        import('gsap').then(({ default: gsap }) => {
          gsap.fromTo(
            rows,
            { opacity: 0, y: 8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              stagger: 0.05,
              ease: 'power2.out',
              clearProps: 'transform',
            },
          );
        });
      });
    });
  }
}
