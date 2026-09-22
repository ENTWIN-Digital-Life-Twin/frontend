import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import {
  ReminderService,
  minutesFromReminderKey,
  reminderKeyFromMinutes,
} from '../../notifications/services/reminder.service';
import {
  CATEGORY_KEYS,
  FILTER_KEYS,
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
  type EventCategory,
  type FreeSlot,
} from '../models/calendar.models';

type BackendEventType = 'PERSONAL' | 'WORK' | 'STUDY' | 'APPOINTMENT' | 'HEALTH' | 'SPORT' | 'OTHER';

interface EventResponse {
  id: string;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  eventType: BackendEventType;
  locationLabel: string | null;
  recurring: boolean;
  recurrenceRule: string | null;
  participants?: string[];
}

interface PageResponse<T> {
  content: T[];
}

const CATEGORY_TO_EVENT_TYPE: Record<EventCategory, BackendEventType> = {
  work: 'WORK',
  personal: 'PERSONAL',
  sport: 'SPORT',
  studies: 'STUDY',
  meeting: 'APPOINTMENT',
};

function categoryFromEventType(type: BackendEventType): EventCategory {
  switch (type) {
    case 'WORK':
      return 'work';
    case 'SPORT':
      return 'sport';
    case 'STUDY':
      return 'studies';
    case 'APPOINTMENT':
      return 'meeting';
    default:
      return 'personal';
  }
}

const pad2 = (value: number): string => String(value).padStart(2, '0');

function toInstant(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

function fromInstant(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly languageService = inject(LanguageService);
  private readonly http = inject(HttpClient);
  private readonly reminderService = inject(ReminderService);
  private readonly baseUrl = `${environment.planningApiUrl}/events`;

  readonly events = signal<CalendarEvent[]>([]);

  private fromResponse(res: EventResponse, extras?: Partial<CalendarEvent>): CalendarEvent {
    const start = fromInstant(res.startDateTime);
    const end = fromInstant(res.endDateTime);
    const durationMinutes = Math.max(
      5,
      Math.round((new Date(res.endDateTime).getTime() - new Date(res.startDateTime).getTime()) / 60_000),
    );
    return {
      id: res.id,
      title: res.title,
      description: res.description ?? undefined,
      date: start.date,
      start: start.time,
      end: end.time,
      duration: durationMinutes,
      category: categoryFromEventType(res.eventType),
      location: res.locationLabel ?? undefined,
      participants: res.participants ?? extras?.participants,
      reminder: extras?.reminder ?? reminderKeyFromMinutes(
        this.reminderService.findBySource('EVENT', res.id)?.advanceMinutes,
      ),
    };
  }

  private toRequest(event: CalendarEvent): Record<string, unknown> {
    return {
      title: event.title ?? '',
      description: event.description ?? null,
      startDateTime: toInstant(event.date, event.start),
      endDateTime: toInstant(event.date, event.end),
      allDay: false,
      eventType: CATEGORY_TO_EVENT_TYPE[event.category],
      locationLabel: event.location ?? null,
      recurring: false,
      recurrenceRule: null,
      participants: event.participants ?? [],
    };
  }

  readonly selectedDate = signal<string>(todayISO());
  readonly view = signal<CalendarView>('month');
  readonly filter = signal<CalendarFilter>('all');
  readonly search = signal('');
  readonly selectedEventId = signal<string | null>(null);

  readonly now = signal(new Date());

  constructor() {
    this.http
      .get<PageResponse<EventResponse>>(this.baseUrl, {
        params: new HttpParams().set('page', '0').set('size', '200'),
      })
      .subscribe({
        next: (page) => this.events.set(page.content.map((res) => this.fromResponse(res))),
        error: () => this.events.set([]),
      });

    effect(() => {
      const byEvent = new Map(
        this.reminderService
          .reminders()
          .filter((reminder) => reminder.sourceType === 'EVENT' && reminder.sourceResourceId)
          .map((reminder) => [reminder.sourceResourceId as string, reminder]),
      );
      this.events.update((events) =>
        events.map((event) => {
          const reminder = byEvent.get(event.id);
          return {
            ...event,
            reminder: reminder
              ? reminderKeyFromMinutes(reminder.advanceMinutes)
              : (event.reminder ?? 'none'),
          };
        }),
      );
    });

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
    const tempId = event.id;
    this.events.update((events) => [...events, event]);
    this.selectedDate.set(event.date);
    this.selectedEventId.set(null);

    this.http.post<EventResponse>(this.baseUrl, this.toRequest(event)).subscribe({
      next: (res) => {
        const created = this.fromResponse(res, event);
        this.events.update((events) =>
          events.map((item) => (item.id === tempId ? created : item)),
        );
        this.syncReminder(created);
      },
      error: (err) => {
        console.error('Failed to create event', err);
        this.events.update((events) => events.filter((item) => item.id !== tempId));
      },
    });
  }

  updateEvent(event: CalendarEvent): void {
    this.events.update((events) =>
      events.map((item) => (item.id === event.id ? event : item)),
    );

    this.http.put<EventResponse>(`${this.baseUrl}/${event.id}`, this.toRequest(event)).subscribe({
      next: (res) => {
        const updated = this.fromResponse(res, event);
        this.events.update((events) =>
          events.map((item) => (item.id === event.id ? updated : item)),
        );
        this.syncReminder(updated);
      },
      error: (err) => console.error('Failed to update event', err),
    });
  }

  deleteEvent(id: string): void {
    this.events.update((events) => events.filter((event) => event.id !== id));
    this.selectedEventId.set(null);
    this.reminderService.deleteForSource('EVENT', id);
    this.http
      .delete(`${this.baseUrl}/${id}`)
      .subscribe({ error: (err) => console.error('Failed to delete event', err) });
  }

  private syncReminder(event: CalendarEvent): void {
    this.reminderService.sync({
      sourceType: 'EVENT',
      sourceResourceId: event.id,
      title: event.title ?? '',
      message: event.description ?? null,
      reminderType: 'EVENT',
      triggerDateTime: toInstant(event.date, event.start),
      advanceMinutes: minutesFromReminderKey(event.reminder),
    });
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
