import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import {
  CATEGORY_KEYS,
  CATEGORY_ORDER,
  CATEGORY_VISUALS,
  dayNumber,
  eventTitle as resolveEventTitle,
  formatLongDate,
  isSameMonth,
  todayISO,
  weekdayShort,
  type CalendarEvent,
  type EventCategory,
} from '../../models/calendar.models';
import { CalendarService } from '../../services/calendar.service';
import { CalendarEventComponent as EventRow } from '../calendar-event/calendar-event';

@Component({
  selector: 'app-calendar-month',
  imports: [EventRow, LucideChevronRight],
  template: `
    <section
      class="overflow-hidden rounded-card border border-line bg-surface shadow-card"
      [attr.aria-label]="monthViewAria()"
    >
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {{ monthAgenda() }}
          </p>
          <h2 class="mt-0.5 font-display text-lg font-semibold tracking-tight text-primary">
            {{ service.monthLabel() }}
          </h2>
        </div>
        <div class="hidden items-center gap-3 lg:flex">
          @for (category of CATEGORY_ORDER; track category) {
            <span class="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
              <span class="h-2 w-2 rounded-full" [class]="CATEGORY_VISUALS[category].dot"></span>
              {{ categoryLabel(category) }}
            </span>
          }
        </div>
      </header>

      <div class="hidden grid-cols-7 border-b border-line bg-surface md:grid">
        @for (weekday of weekdays(); track weekday) {
          <div class="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            {{ weekday }}
          </div>
        }
      </div>

      <div class="grid grid-cols-7 gap-px bg-line">
        @for (iso of service.monthCells(); track iso) {
          <div
            class="cal-cell relative flex min-h-[88px] cursor-pointer flex-col bg-surface p-1 transition-colors hover:bg-surface-muted/40 sm:p-1.5 md:min-h-[108px]"
            [class.bg-surface-muted/40]="!inMonth(iso)"
            [class.ring-1]="iso === service.selectedDate()"
            [class.ring-inset]="iso === service.selectedDate()"
            [class.ring-accent/60]="iso === service.selectedDate()"
            [attr.data-date]="iso"
            (click)="selectDay(iso)"
          >
            <div class="flex items-start justify-between gap-1">
              <button
                type="button"
                class="day-num flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-all duration-200"
                [class.bg-primary]="iso === service.selectedDate()"
                [class.text-white]="iso === service.selectedDate()"
                [class.shadow-soft]="iso === service.selectedDate()"
                [class.text-accent-dark]="iso !== service.selectedDate() && iso === today"
                [class.ring-1]="iso !== service.selectedDate() && iso === today"
                [class.ring-accent/40]="iso !== service.selectedDate() && iso === today"
                [class.text-primary]="iso !== service.selectedDate() && iso !== today && inMonth(iso)"
                [class.text-ink-muted]="!inMonth(iso)"
                [attr.aria-label]="selectDayAria(iso)"
                (click)="selectDay(iso)"
              >
                {{ dayNumber(iso) }}
              </button>
              <span class="hidden items-center gap-0.5 md:flex">
                @for (event of eventsFor(iso).slice(0, 2); track event.id) {
                  <span class="h-1.5 w-1.5 rounded-full" [class]="CATEGORY_VISUALS[event.category].dot"></span>
                }
              </span>
            </div>

            <div class="mt-1 hidden min-h-0 flex-col gap-1 md:flex">
              @for (event of eventsFor(iso).slice(0, 2); track event.id) {
                <app-calendar-event
                  [event]="event"
                  mode="month"
                  (open)="openEvent($event)"
                />
              }
              @if (eventsFor(iso).length > 2) {
                <button
                  type="button"
                  class="rounded-md px-1.5 py-0.5 text-left text-[11px] font-semibold text-ink-muted transition-colors hover:text-primary"
                  (click)="selectDay(iso)"
                >
                  {{ moreEvents(eventsFor(iso).length - 2) }}
                </button>
              }
            </div>

            <div class="mt-auto flex items-center gap-1 md:hidden">
              @if (eventsFor(iso).length > 0) {
                @for (event of eventsFor(iso).slice(0, 3); track event.id) {
                  <span class="h-1.5 w-1.5 rounded-full" [class]="CATEGORY_VISUALS[event.category].dot"></span>
                }
                @if (eventsFor(iso).length > 3) {
                  <span class="text-[9px] font-semibold text-ink-faint">
                    +{{ eventsFor(iso).length - 3 }}
                  </span>
                }
              }
            </div>
          </div>
        }
      </div>

      <div class="border-t border-line bg-surface p-4 md:hidden">
        <div class="mb-2 flex items-center justify-between">
          <h3 class="font-display text-sm font-semibold text-primary">
            {{ formatLongDate(service.selectedDate()) }}
          </h3>
          <span class="text-[11px] font-medium text-ink-faint">
            {{ selectedCountLabel() }}
          </span>
        </div>
        @if (selectedEvents().length === 0) {
          <p class="rounded-panel bg-surface-muted/60 px-3 py-2.5 text-xs text-ink-muted">
            {{ monthMobileEmpty() }}
          </p>
        } @else {
          <div class="flex flex-col gap-1.5">
            @for (event of selectedEvents(); track event.id) {
              <button
                type="button"
                class="flex items-center gap-2 rounded-panel border border-line bg-surface px-2.5 py-2 text-left shadow-soft transition-colors hover:border-accent/40"
                (click)="openEvent(event)"
              >
                <span class="h-2 w-2 shrink-0 rounded-full" [class]="CATEGORY_VISUALS[event.category].dot"></span>
                <span class="shrink-0 text-[11px] font-semibold tabular-nums text-ink-muted">
                  {{ event.start }}
                </span>
                <span class="truncate text-xs font-semibold text-primary">{{ titleOf(event) }}</span>
                <svg lucideChevronRight class="ml-auto h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true"></svg>
              </button>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class CalendarMonth {
  protected readonly service = inject(CalendarService);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected readonly CATEGORY_ORDER = CATEGORY_ORDER;
  protected readonly CATEGORY_VISUALS = CATEGORY_VISUALS;
  protected readonly today = todayISO();

  private readonly languageService = inject(LanguageService);

  protected readonly monthViewAria = this.languageService.translateSignal(
    'calendar.monthViewAria',
  );
  protected readonly monthAgenda = this.languageService.translateSignal(
    'calendar.monthAgenda',
  );
  protected readonly monthMobileEmpty = this.languageService.translateSignal(
    'calendar.monthMobileEmpty',
  );

  protected readonly weekdays = computed<string[]>(() => {
    const locale = this.languageService.getLocale();
    return ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07']
      .map((iso) => weekdayShort(iso, locale));
  });

  protected readonly selectedEvents = this.service.dayEvents;

  protected categoryLabel(value: EventCategory): string {
    return this.languageService.translate(CATEGORY_KEYS[value]);
  }

  protected titleOf(event: CalendarEvent): string {
    return resolveEventTitle(event, (key, vars) => this.languageService.translate(key, vars));
  }

  protected formatLongDate(iso: string): string {
    return formatLongDate(iso, this.languageService.getLocale());
  }

  protected dayNumber(iso: string): string {
    return dayNumber(iso);
  }

  protected selectDayAria(iso: string): string {
    return this.languageService.translate('calendar.selectDay', {
      date: this.formatLongDate(iso),
    });
  }

  protected moreEvents(count: number): string {
    return this.languageService.translate('calendar.moreEvents', { count: String(count) });
  }

  protected selectedCountLabel(): string {
    const count = this.selectedCount();
    return this.languageService.translate(
      count > 1 ? 'calendar.eventCountMany' : 'calendar.eventCountOne',
      { count: String(count) },
    );
  }

  protected selectedCount(): number {
    return this.service.dayCount(this.service.selectedDate());
  }

  protected inMonth(iso: string): boolean {
    return isSameMonth(iso, this.service.selectedDate());
  }

  protected eventsFor(iso: string): CalendarEvent[] {
    return this.service.eventsFor(iso);
  }

  protected selectDay(iso: string): void {
    this.service.selectDate(iso);
  }

  protected openEvent(event: CalendarEvent): void {
    this.service.selectDate(event.date);
    this.service.openEvent(event.id);
  }

  constructor() {
    const gridKey = signal('');
    effect(() => {
      const key = this.service.monthCells().join('|');
      const changed = key !== gridKey();
      gridKey.set(key);
      if (!changed || this.reduced) {
        return;
      }
      requestAnimationFrame(() => {
        const cells = this.host.nativeElement.querySelectorAll<HTMLElement>('.cal-cell');
        if (cells.length === 0) {
          return;
        }
        import('gsap').then(({ default: gsap }) => {
          gsap.fromTo(
            cells,
            { opacity: 0, y: 8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              stagger: 0.008,
              ease: 'power2.out',
              clearProps: 'transform',
            },
          );
        });
      });
    });

    effect(() => {
      void this.service.selectedDate();
      if (this.reduced) {
        return;
      }
      requestAnimationFrame(() => {
        const selected = this.host.nativeElement.querySelector<HTMLElement>(
          `.day-num[class*="bg-primary"]`,
        );
        if (!selected) {
          return;
        }
        import('gsap').then(({ default: gsap }) => {
          gsap.fromTo(
            selected,
            { scale: 0.8 },
            { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.6)', clearProps: 'transform' },
          );
        });
      });
    });

    this.destroyRef.onDestroy(() => gridKey.set(''));
  }
}
