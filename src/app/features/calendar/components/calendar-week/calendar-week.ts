import { Component, ElementRef, effect, inject, signal } from '@angular/core';
import { LanguageService } from '../../../../core/services/language.service';
import {
  dayNumber,
  formatMinute,
  toMinutes,
  todayISO,
  weekdayShort,
  type CalendarEvent,
} from '../../models/calendar.models';
import { CalendarService } from '../../services/calendar.service';
import { CalendarEventComponent as EventBlock } from '../calendar-event/calendar-event';

const HOUR_HEIGHT = 60;
const DAY_START_MIN = 8 * 60;
const DAY_END_MIN = 20 * 60;
const DAY_MINUTES = DAY_END_MIN - DAY_START_MIN;
const PX_PER_MIN = HOUR_HEIGHT / 60;
const GRID_HEIGHT = DAY_MINUTES * PX_PER_MIN;
const HOUR_COUNT = 12;

interface LaneEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
}

function layoutDay(events: CalendarEvent[]): LaneEvent[] {
  const sorted = [...events].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const lanes: number[] = [];
  const placed: LaneEvent[] = [];

  for (const event of sorted) {
    const start = Math.max(DAY_START_MIN, toMinutes(event.start));
    const end = Math.min(DAY_END_MIN, Math.max(start, toMinutes(event.end)));
    let lane = lanes.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      lane = lanes.length;
      lanes.push(0);
    }
    lanes[lane] = end;
    const laneCount = lanes.length;
    placed.push({
      event,
      top: (start - DAY_START_MIN) * PX_PER_MIN,
      height: Math.max((end - start) * PX_PER_MIN, 28),
      leftPct: (lane / laneCount) * 100,
      widthPct: 100 / laneCount,
    });
  }
  return placed;
}

@Component({
  selector: 'app-calendar-week',
  imports: [EventBlock],
  template: `
    <section
      class="overflow-hidden rounded-card border border-line bg-surface shadow-card"
      [attr.aria-label]="weekViewAria()"
    >
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {{ weekAgenda() }}
          </p>
          <h2 class="mt-0.5 font-display text-lg font-semibold tracking-tight text-primary">
            {{ service.weekLabel() }}
          </h2>
        </div>
        <div class="flex items-center gap-2 text-[11px] font-medium text-ink-muted">
          @if (service.isToday()) {
            <span class="flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 font-semibold text-accent-dark">
              <span class="relative flex h-1.5 w-1.5">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60"></span>
                <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent"></span>
              </span>
              {{ todayLabel() }}
            </span>
          }
          <span class="hidden tabular-nums sm:inline">
            {{ totalCountLabel() }}
          </span>
        </div>
      </header>

      <div class="overflow-x-auto">
        <div class="min-w-[840px]">
          <div class="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-line bg-surface">
            <div class="border-r border-line/60"></div>
            @for (iso of service.weekDays(); track iso) {
              <button
                type="button"
                class="week-day relative flex cursor-pointer flex-col items-center gap-1 border-r border-line/60 py-2 transition-colors last:border-r-0 hover:bg-surface-muted/50"
                [class.bg-accent/[0.04]]="iso === service.today()"
                [attr.data-week-day]="iso"
                (click)="selectDay(iso)"
              >
                <span class="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  {{ weekdayLabel(iso) }}
                </span>
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-all duration-200"
                  [class.bg-primary]="iso === service.selectedDate()"
                  [class.text-white]="iso === service.selectedDate()"
                  [class.shadow-soft]="iso === service.selectedDate()"
                  [class.text-primary]="iso !== service.selectedDate() && iso !== service.today()"
                  [class.text-accent-dark]="iso !== service.selectedDate() && iso === service.today()"
                  [class.ring-1]="iso !== service.selectedDate() && iso === service.today()"
                  [class.ring-accent/40]="iso !== service.selectedDate() && iso === service.today()"
                >
                  {{ dayNumber(iso) }}
                </span>
              </button>
            }
          </div>

          <div class="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] bg-line">
            <div class="relative border-r border-line/60 bg-surface">
              @for (hour of hours; track hour) {
                <div
                  class="absolute right-2 -translate-y-1/2 text-[10px] font-medium tabular-nums text-ink-faint"
                  [style.top.px]="(hour - DAY_START_MIN) * PX_PER_MIN"
                >
                  {{ hourLabel(hour) }}
                </div>
              }
            </div>
            @for (iso of service.weekDays(); track iso) {
              <div
                class="relative bg-surface"
                [attr.data-week-day]="iso"
                [style.height.px]="GRID_HEIGHT"
              >
                @for (hour of hours; track hour) {
                  <div
                    class="absolute inset-x-0 border-t border-line/60"
                    [style.top.px]="(hour - DAY_START_MIN) * PX_PER_MIN"
                  ></div>
                }
                @if (iso === service.today()) {
                  <div
                    class="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                    [style.top.px]="nowTop()"
                    aria-hidden="true"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
                    <span class="h-0.5 flex-1 bg-accent"></span>
                  </div>
                }
                @for (item of layoutFor(iso); track item.event.id) {
                  <app-calendar-event
                    [event]="item.event"
                    mode="week"
                    [top]="item.top"
                    [height]="item.height"
                    [leftPct]="item.leftPct"
                    [widthPct]="item.widthPct"
                    (open)="openEvent($event)"
                  />
                }
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class CalendarWeek {
  protected readonly service = inject(CalendarService);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected readonly GRID_HEIGHT = GRID_HEIGHT;
  protected readonly DAY_START_MIN = DAY_START_MIN;
  protected readonly PX_PER_MIN = PX_PER_MIN;
  protected readonly hours = Array.from(
    { length: HOUR_COUNT },
    (_, i) => DAY_START_MIN + i * 60,
  );

  protected readonly today = todayISO();

  protected readonly nowTop = this.service.nowMinTop;

  private readonly languageService = inject(LanguageService);

  protected readonly weekViewAria = this.languageService.translateSignal(
    'calendar.weekViewAria',
  );
  protected readonly weekAgenda = this.languageService.translateSignal('calendar.weekAgenda');
  protected readonly todayLabel = this.languageService.translateSignal('calendar.today');

  protected weekdayLabel(iso: string): string {
    return weekdayShort(iso, this.languageService.getLocale());
  }

  protected dayNumber(iso: string): string {
    return dayNumber(iso);
  }

  protected layoutFor(iso: string): LaneEvent[] {
    return layoutDay(this.service.eventsFor(iso));
  }

  protected totalCountLabel(): string {
    const count = this.totalCount();
    return this.languageService.translate(
      count > 1 ? 'calendar.eventCountMany' : 'calendar.eventCountOne',
      { count: String(count) },
    );
  }

  protected totalCount(): number {
    return this.service.weekDays().reduce((sum, iso) => sum + this.service.dayCount(iso), 0);
  }

  protected hourLabel(minutes: number): string {
    return formatMinute(minutes);
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
      const key = this.service.weekDays().join('|');
      const changed = key !== gridKey();
      gridKey.set(key);
      if (!changed || this.reduced) {
        return;
      }
      requestAnimationFrame(() => {
        const blocks = this.host.nativeElement.querySelectorAll<HTMLElement>('.week-day, .week-block');
        if (blocks.length === 0) {
          return;
        }
        import('gsap').then(({ default: gsap }) => {
          gsap.fromTo(
            blocks,
            { opacity: 0, y: 6 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              stagger: 0.03,
              ease: 'power2.out',
              clearProps: 'transform',
            },
          );
        });
      });
    });
  }
}
