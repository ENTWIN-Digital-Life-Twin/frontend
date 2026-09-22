import type { LucideIcon } from '@lucide/angular';
import {
  LucideBriefcase,
  LucideDumbbell,
  LucideGraduationCap,
  LucideHome,
  LucideUsers,
} from '@lucide/angular';

export type CalendarView = 'month' | 'week' | 'day';

export type EventCategory = 'work' | 'personal' | 'sport' | 'studies' | 'meeting';

export type CalendarFilter = 'all' | EventCategory;

export type ReminderKey = 'none' | '5' | '10' | '15' | '30' | '60' | '1440';

export interface CalendarEvent {
  id: string;
  title?: string; // free-form title (user-created events)
  titleKey?: string; // i18n key (mock events)
  description?: string; // free-form description
  detailKey?: string; // i18n key (mock events)
  date: string; // ISO date (yyyy-MM-dd)
  start: string; // HH:mm
  end: string; // HH:mm
  duration: number; // minutes
  category: EventCategory;
  location?: string; // free-form location
  locationKey?: string; // i18n key (mock events)
  participants?: string[]; // free-form participant names
  participantKeys?: string[]; // i18n keys (mock events)
  reminder?: ReminderKey;
}

export interface FreeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
  minutes: number;
}

export interface DaySummary {
  count: number;
  plannedMinutes: number;
  freeMinutes: number;
  loadPercent: number;
}

export interface AiInsight {
  titleKey: string;
  messageKey: string;
  recommendationKey?: string;
  vars?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Translation helpers
// ---------------------------------------------------------------------------

export type TranslateFn = (key: string, vars?: Record<string, string>) => string;

export function eventTitle(event: CalendarEvent, translate: TranslateFn): string {
  return event.titleKey ? translate(event.titleKey) : (event.title ?? '');
}

export function eventDetail(event: CalendarEvent, translate: TranslateFn): string {
  return event.detailKey ? translate(event.detailKey) : (event.description ?? '');
}

export function eventLocation(event: CalendarEvent, translate: TranslateFn): string {
  return event.locationKey ? translate(event.locationKey) : (event.location ?? '');
}

export function eventParticipants(
  event: CalendarEvent,
  translate: TranslateFn,
): string[] {
  if (event.participantKeys && event.participantKeys.length > 0) {
    return event.participantKeys.map((key) => translate(key));
  }
  return event.participants ?? [];
}

// ---------------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------------

const pad2 = (value: number): string => String(value).padStart(2, '0');

export function toMinutes(time: string): number {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export function minutesToLabel(minutes: number, translate: TranslateFn): string {
  if (minutes <= 0) {
    return translate('calendar.duration.zero');
  }
  if (minutes < 60) {
    return translate('calendar.duration.minutes', { value: String(minutes) });
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? translate('calendar.duration.hoursOnly', { value: String(hours) })
    : translate('calendar.duration.hoursMinutes', {
        value: String(hours),
        rest: String(rest),
      });
}

export function durationLabel(event: CalendarEvent, translate: TranslateFn): string {
  return minutesToLabel(event.duration, translate);
}

export function formatMinute(minutes: number): string {
  return `${pad2(Math.floor(minutes / 60) % 24)}:${pad2(minutes % 60)}`;
}

// ---------------------------------------------------------------------------
// Date helpers (all local-time based)
// ---------------------------------------------------------------------------

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseISO(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDaysISO(iso: string, days: number): string {
  const date = parseISO(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

export function addMonthsISO(iso: string, months: number): string {
  const date = parseISO(iso);
  date.setMonth(date.getMonth() + months);
  return toISO(date);
}

export function weekDates(iso: string): string[] {
  const monday = parseISO(iso);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return toISO(date);
  });
}

export function monthGrid(anchorIso: string): string[] {
  const anchor = parseISO(anchorIso);
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return toISO(date);
  });
}

export function isSameMonth(iso: string, anchorIso: string): boolean {
  return iso.slice(0, 7) === anchorIso.slice(0, 7);
}

export function dayNumber(iso: string): string {
  return String(parseISO(iso).getDate());
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function capitalizeFirst(value: string, locale: string): string {
  return value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);
}

export function weekdayShort(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(parseISO(iso));
}

export function formatMonthTitle(iso: string, locale: string): string {
  const date = parseISO(iso);
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  return `${capitalizeFirst(month, locale)} ${date.getFullYear()}`;
}

export function formatDayMonth(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(
    parseISO(iso),
  );
}

export function formatLongDate(iso: string, locale: string): string {
  const value = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseISO(iso));
  return capitalizeFirst(value, locale);
}

export function formatWeekRange(isos: string[], locale: string): string {
  const first = parseISO(isos[0]);
  const last = parseISO(isos[isos.length - 1]);
  const firstLabel = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(first);
  const lastLabel = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(last);
  return `${firstLabel} – ${lastLabel}`;
}

// ---------------------------------------------------------------------------
// Free-time detection
// ---------------------------------------------------------------------------

export function computeFreeSlots(
  events: CalendarEvent[],
  dayStartMin = 8 * 60,
  dayEndMin = 20 * 60,
  minGap = 15,
): FreeSlot[] {
  const slots: FreeSlot[] = [];
  let cursor = dayStartMin;
  for (const event of events) {
    const start = toMinutes(event.start);
    const end = Math.max(start, toMinutes(event.end));
    if (start > cursor && start - cursor >= minGap) {
      slots.push({ start: formatMinute(cursor), end: formatMinute(start), minutes: start - cursor });
    }
    cursor = Math.max(cursor, end);
  }
  if (dayEndMin - cursor >= minGap) {
    slots.push({ start: formatMinute(cursor), end: formatMinute(dayEndMin), minutes: dayEndMin - cursor });
  }
  return slots;
}

// ---------------------------------------------------------------------------
// Labels & visuals
// ---------------------------------------------------------------------------

export const CATEGORY_KEYS: Record<EventCategory, string> = {
  work: 'categories.work',
  personal: 'categories.personal',
  sport: 'categories.sport',
  studies: 'categories.studies',
  meeting: 'categories.meeting',
};

export const FILTER_KEYS: Record<CalendarFilter, string> = {
  all: 'common.all',
  work: 'categories.work',
  personal: 'categories.personal',
  sport: 'categories.sport',
  studies: 'categories.studies',
  meeting: 'categories.meeting',
};

export const CATEGORY_ICONS: Record<EventCategory, LucideIcon> = {
  work: LucideBriefcase,
  personal: LucideHome,
  sport: LucideDumbbell,
  studies: LucideGraduationCap,
  meeting: LucideUsers,
};

export const REMINDER_LABEL_KEYS: Record<ReminderKey, string> = {
  none: 'eventForm.reminders.none',
  '5': 'eventForm.reminders.5',
  '10': 'eventForm.reminders.10',
  '15': 'eventForm.reminders.15',
  '30': 'eventForm.reminders.30',
  '60': 'eventForm.reminders.60',
  '1440': 'eventForm.reminders.1440',
};

export interface CategoryVisual {
  icon: LucideIcon;
  dot: string;
  chip: string;
  block: string;
  ring: string;
}

export const CATEGORY_VISUALS: Record<EventCategory, CategoryVisual> = {
  work: {
    icon: LucideBriefcase,
    dot: 'bg-primary',
    chip: 'bg-primary/10 text-primary',
    block: 'bg-primary/10 text-primary border-l-2 border-primary',
    ring: 'ring-primary/30',
  },
  personal: {
    icon: LucideHome,
    dot: 'bg-accent',
    chip: 'bg-teal-50 text-accent-dark',
    block: 'bg-teal-50 text-accent-dark border-l-2 border-accent',
    ring: 'ring-accent/30',
  },
  sport: {
    icon: LucideDumbbell,
    dot: 'bg-warning',
    chip: 'bg-warning-light text-amber-700',
    block: 'bg-warning-light text-amber-700 border-l-2 border-warning',
    ring: 'ring-warning/30',
  },
  studies: {
    icon: LucideGraduationCap,
    dot: 'bg-success',
    chip: 'bg-success-light text-success',
    block: 'bg-success-light text-success border-l-2 border-success',
    ring: 'ring-success/30',
  },
  meeting: {
    icon: LucideUsers,
    dot: 'bg-navy-400',
    chip: 'bg-navy-50 text-navy-700',
    block: 'bg-navy-50 text-navy-700 border-l-2 border-navy-400',
    ring: 'ring-navy-400/30',
  },
};

export const CATEGORY_ORDER: EventCategory[] = [
  'work',
  'personal',
  'sport',
  'studies',
  'meeting',
];
