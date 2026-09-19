import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import {
  CATEGORY_KEYS,
  FILTER_KEYS,
  MOCK_CALENDAR_EVENTS,
  addDaysISO,
  addMonthsISO,
  computeFreeSlots,
  eventDetail,
  eventTitle,
  formatMinute,
  formatMonthTitle,
  formatWeekRange,
  minutesToLabel,
  monthGrid,
  toMinutes,
  todayISO,
  weekDates,
  type AiInsight,
  type CalendarEvent,
  type CalendarFilter,
  type CalendarView,
  type DaySummary,
  type FreeSlot,
} from '../models/calendar.models';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly languageService = inject(LanguageService);

  readonly events = signal<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);

  readonly selectedDate = signal<string>(todayISO());
  readonly view = signal<CalendarView>('month');
  readonly filter = signal<CalendarFilter>('all');
  readonly search = signal('');
  readonly selectedEventId = signal<string | null>(null);

  readonly now = signal(new Date());

  constructor() {
    effect(() => {
      const timer = setInterval(() => this.now.set(new Date()), 60_000);
      return () => clearInterval(timer);
    });
  }

  readonly isToday = computed(() => this.selectedDate() === todayISO());
  readonly today = todayISO;

  readonly nowMinTop = computed(() => {
    const date = this.now();
    const minutes = date.getHours() * 60 + date.getMinutes();
    return Math.max(0, Math.min(minutes - 8 * 60, 12 * 60));
  });

  readonly monthCells = computed(() => monthGrid(this.selectedDate()));
  readonly monthLabel = computed(() =>
    formatMonthTitle(this.selectedDate(), this.languageService.getLocale()),
  );
  readonly weekDays = computed(() => weekDates(this.selectedDate()));
  readonly weekLabel = computed(() =>
    formatWeekRange(this.weekDays(), this.languageService.getLocale()),
  );

  readonly selectedEvent = computed(() => {
    const id = this.selectedEventId();
    if (!id) {
      return null;
    }
    return this.events().find((event) => event.id === id) ?? null;
  });

  readonly dayEvents = computed(() => this.eventsFor(this.selectedDate()));

  readonly freeSlots = computed<FreeSlot[]>(() =>
    computeFreeSlots(this.dayEvents()),
  );

  readonly plannedMinutes = computed(() =>
    this.dayEvents().reduce((total, event) => total + event.duration, 0),
  );

  readonly todaySummary = computed<DaySummary>(() => {
    const events = this.eventsFor(todayISO());
    const planned = events.reduce((total, event) => total + event.duration, 0);
    const free = computeFreeSlots(events).reduce((total, slot) => total + slot.minutes, 0);
    const loadPercent =
      planned + free > 0 ? Math.round((planned / (planned + free)) * 100) : 0;
    return { count: events.length, plannedMinutes: planned, freeMinutes: free, loadPercent };
  });

  readonly aiInsight = computed<AiInsight>(() => {
    const events = this.dayEvents();
    const slots = this.freeSlots();
    const translate = (key: string, vars?: Record<string, string>) =>
      this.languageService.translate(key, vars);

    let result: AiInsight;

    if (events.length === 0) {
      result = {
        titleKey: 'calendar.insight.calmTitle',
        messageKey: 'calendar.insight.calmMessage',
        recommendationKey: 'calendar.insight.calmRecommendation',
      };
    } else {
      const afternoonStart = 12 * 60;
      const afternoon = events.filter((event) => toMinutes(event.start) >= afternoonStart);
      const freeAfternoon = slots.filter((slot) => toMinutes(slot.start) >= afternoonStart);

      if (afternoon.length >= 2 && freeAfternoon.length > 0) {
        const slot = freeAfternoon[0];
        result = {
          titleKey: 'calendar.insight.busyAfternoonTitle',
          messageKey: 'calendar.insight.busyAfternoonMessage',
          recommendationKey: 'calendar.insight.busyAfternoonRecommendation',
          vars: {
            count: String(afternoon.length),
            duration: minutesToLabel(slot.minutes, translate),
            time: formatMinute(toMinutes(slot.start)),
          },
        };
      } else if (events.length >= 5) {
        result = {
          titleKey: 'calendar.insight.fullDayTitle',
          messageKey: 'calendar.insight.fullDayMessage',
          recommendationKey: 'calendar.insight.fullDayRecommendation',
          vars: { count: String(events.length) },
        };
      } else if (slots.length > 0) {
        const slot = slots[0];
        result = {
          titleKey: 'calendar.insight.spaceTitle',
          messageKey: 'calendar.insight.spaceMessage',
          recommendationKey: 'calendar.insight.spaceRecommendation',
          vars: {
            duration: minutesToLabel(slot.minutes, translate),
            time: formatMinute(toMinutes(slot.start)),
          },
        };
      } else {
        result = {
          titleKey: 'calendar.insight.organizedTitle',
          messageKey: 'calendar.insight.organizedMessage',
          recommendationKey: 'calendar.insight.organizedRecommendation',
        };
      }
    }

    return result;
  });

  readonly upcoming = computed(() => {
    const nowMin = this.now().getHours() * 60 + this.now().getMinutes();
    const today = todayISO();
    return this.events()
      .filter((event) => {
        if (event.date > today) {
          return true;
        }
        return event.date === today && toMinutes(event.end) > nowMin;
      })
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) || toMinutes(a.start) - toMinutes(b.start),
      )
      .slice(0, 6);
  });

  setView(view: CalendarView): void {
    this.view.set(view);
  }

  setFilter(filter: CalendarFilter): void {
    this.filter.set(filter);
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  hasCriteria(): boolean {
    return this.filter() !== 'all' || this.search().length > 0;
  }

  resetCriteria(): void {
    this.filter.set('all');
    this.search.set('');
  }

  selectDate(iso: string): void {
    this.selectedDate.set(iso);
  }

  goToday(): void {
    this.selectedDate.set(todayISO());
  }

  goPrevious(): void {
    switch (this.view()) {
      case 'month':
        this.selectedDate.set(addMonthsISO(this.selectedDate(), -1));
        break;
      case 'week':
        this.selectedDate.set(addDaysISO(this.selectedDate(), -7));
        break;
      default:
        this.selectedDate.set(addDaysISO(this.selectedDate(), -1));
    }
  }

  goNext(): void {
    switch (this.view()) {
      case 'month':
        this.selectedDate.set(addMonthsISO(this.selectedDate(), 1));
        break;
      case 'week':
        this.selectedDate.set(addDaysISO(this.selectedDate(), 7));
        break;
      default:
        this.selectedDate.set(addDaysISO(this.selectedDate(), 1));
    }
  }

  openEvent(id: string): void {
    this.selectedEventId.set(id);
  }

  closeEvent(): void {
    this.selectedEventId.set(null);
  }

  addEvent(event: CalendarEvent): void {
    this.events.update((events) => [...events, event]);
    this.selectedDate.set(event.date);
    this.selectedEventId.set(null);
  }

  updateEvent(event: CalendarEvent): void {
    this.events.update((events) =>
      events.map((item) => (item.id === event.id ? event : item)),
    );
  }

  deleteEvent(id: string): void {
    this.events.update((events) => events.filter((event) => event.id !== id));
    this.selectedEventId.set(null);
  }

  eventsFor(iso: string): CalendarEvent[] {
    const filter = this.filter();
    const search = this.search().trim().toLowerCase();
    const translate = (key: string, vars?: Record<string, string>) =>
      this.languageService.translate(key, vars);
    return this.events()
      .filter((event) => event.date === iso)
      .filter((event) => (filter === 'all' ? true : event.category === filter))
      .filter((event) =>
        search.length > 0
          ? eventTitle(event, translate).toLowerCase().includes(search) ||
            eventDetail(event, translate).toLowerCase().includes(search) ||
            this.languageService.translate(CATEGORY_KEYS[event.category]).toLowerCase().includes(search)
          : true,
      )
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }

  dayCount(iso: string): number {
    return this.eventsFor(iso).length;
  }

  hasEvents(iso: string): boolean {
    return this.dayCount(iso) > 0;
  }

  filterLabel(filter: CalendarFilter): string {
    return this.languageService.translate(FILTER_KEYS[filter]);
  }
}
