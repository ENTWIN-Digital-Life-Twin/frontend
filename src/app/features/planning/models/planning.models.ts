import type { LucideIcon } from '@lucide/angular';
import {
  LucideBriefcase,
  LucideDumbbell,
  LucideGraduationCap,
  LucideHeart,
  LucideHome,
  LucideLaptop,
  LucideShoppingBag,
  LucideUtensils,
} from '@lucide/angular';

export type PlanningFilter =
  | 'all'
  | 'tasks'
  | 'events'
  | 'sport'
  | 'personal'
  | 'work'
  | 'free';

export type PlanningView = 'week' | 'day';

export type PlanningCategory = 'work' | 'personal' | 'sport' | 'free' | 'meals';

export type PlanningEntryType = 'task' | 'event' | 'break' | 'sport' | 'free';

export type PlanningPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type PlanningTone = 'primary' | 'accent' | 'warning' | 'danger';

export interface PlanningTime {
  hour: number;
  minute: number;
}

export interface PlanningEntry {
  id: string;
  type: PlanningEntryType;
  title: string;
  description?: string;
  category: PlanningCategory;
  date: string; // ISO date (yyyy-MM-dd)
  start: string; // HH:mm
  end: string; // HH:mm
  duration: number; // minutes
  status?: TaskStatus;
  priority?: PlanningPriority;
  location?: string;
  participants?: string[];
  recurrence?: 'daily' | 'weekly';
  tone: PlanningTone;
}

export interface DaySummary {
  totalTasks: number;
  doneTasks: number;
  totalEvents: number;
  blocks: number;
  freeMinutes: number;
  loadPercent: number;
  tone: PlanningTone;
  categories: { category: PlanningCategory; minutes: number }[];
}

export interface PlanningData {
  entries: PlanningEntry[];
}

// ---------------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------------

const pad2 = (value: number): string => String(value).padStart(2, '0');

export function toMinutes(time: string): number {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export function toTime(minutes: number): PlanningTime {
  return { hour: Math.floor(minutes / 60) % 24, minute: minutes % 60 };
}

export function formatTime(time: string, locale = 'fr'): string {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  const d = new Date(2000, 0, 1, hour, minute);
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d);
}

export function formatTimeLocale(time: PlanningTime, locale = 'fr'): string {
  const d = new Date(2000, 0, 1, time.hour, time.minute);
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d);
}

export function durationOf(entry: PlanningEntry): number {
  return Math.max(1, Math.round((toMinutes(entry.end) - toMinutes(entry.start)) / 5) * 5);
}

type TranslateFn = (key: string) => string;

export function minutesToLabel(minutes: number, t?: TranslateFn): string {
  if (minutes <= 0) {
    return `0 ${t ? t('common.units.minuteShort') : 'min'}`;
  }
  if (minutes < 60) {
    return `${minutes} ${t ? t('common.units.minuteShort') : 'min'}`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const h = t ? t('common.units.hourShort') : 'h';
  const m = t ? t('common.units.minuteShort') : 'min';
  return rest === 0 ? `${hours} ${h}` : `${hours} ${h} ${rest} ${m}`;
}

export function entryDurationLabel(entry: PlanningEntry, t?: TranslateFn): string {
  return minutesToLabel(entry.duration, t);
}

export function formatMinutesLocale(minutes: number, t?: TranslateFn): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hUnit = t ? t('common.units.hourShort') : 'h';
  const mUnit = t ? t('common.units.minuteShort') : 'min';
  if (h === 0) {
    return `${m} ${mUnit}`;
  }
  if (m === 0) {
    return `${h} ${hUnit}`;
  }
  return `${h} ${hUnit} ${m} ${mUnit}`;
}

export function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function nowISOTime(): string {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

// ---------------------------------------------------------------------------
// Date helpers (all local-time based)
// ---------------------------------------------------------------------------

export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function parseISO(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function nextDateISO(iso: string): string {
  const date = parseISO(iso);
  date.setDate(date.getDate() + 1);
  return toISO(date);
}

export function prevDateISO(iso: string): string {
  const date = parseISO(iso);
  date.setDate(date.getDate() - 1);
  return toISO(date);
}

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
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

export function weekdayLabel(iso: string, locale = 'fr'): string {
  const date = parseISO(iso);
  const label = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  return `${label[0].toUpperCase()}${label.slice(1)}`;
}

export function dayNumber(iso: string): string {
  return String(parseISO(iso).getDate());
}

export function formatWeekRange(isos: string[], locale = 'fr'): string {
  const first = formatDayMonth(isos[0], locale);
  const last = formatDayMonth(isos[isos.length - 1], locale);
  return `${first} – ${last}`;
}

export function formatDayMonth(iso: string, locale = 'fr'): string {
  const date = parseISO(iso);
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(date);
}

export function formatLongDate(iso: string, locale = 'fr'): string {
  const date = parseISO(iso);
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const CATEGORY_KEYS: Record<PlanningCategory, string> = {
  work: 'categories.work',
  personal: 'categories.personal',
  sport: 'categories.sport',
  free: 'categories.free',
  meals: 'categories.meals',
};

export const PRIORITY_KEYS: Record<PlanningPriority, string> = {
  low: 'priorities.low',
  medium: 'priorities.medium',
  high: 'priorities.high',
};

export const STATUS_KEYS: Record<TaskStatus, string> = {
  todo: 'statuses.todo',
  'in-progress': 'statuses.inProgress',
  done: 'statuses.done',
};

export const CATEGORY_ICONS: Record<PlanningCategory, LucideIcon> = {
  work: LucideBriefcase,
  personal: LucideHome,
  sport: LucideDumbbell,
  free: LucideLaptop,
  meals: LucideUtensils,
};

// ---------------------------------------------------------------------------
// Visual mapping
// ---------------------------------------------------------------------------

export interface EntryVisual {
  icon: LucideIcon;
  dot: string;
  chip: string;
  card: string;
  labelKey: string;
}

export const ENTRY_VISUALS: Record<PlanningEntryType, EntryVisual> = {
  task: {
    icon: LucideLaptop,
    dot: 'bg-primary',
    chip: 'bg-primary/10 text-primary',
    card: 'bg-surface border-l-primary',
    labelKey: 'planningExtended.entryTypeTask',
  },
  event: {
    icon: LucideBriefcase,
    dot: 'bg-accent',
    chip: 'bg-accent/10 text-accent-dark',
    card: 'bg-surface border-l-accent',
    labelKey: 'planningExtended.entryTypeEvent',
  },
  break: {
    icon: LucideHeart,
    dot: 'bg-warning',
    chip: 'bg-warning/15 text-amber-700',
    card: 'bg-surface border-l-warning',
    labelKey: 'planningExtended.entryTypeBreak',
  },
  sport: {
    icon: LucideDumbbell,
    dot: 'bg-danger',
    chip: 'bg-danger/10 text-danger',
    card: 'bg-surface border-l-danger',
    labelKey: 'planningExtended.entryTypeSport',
  },
  free: {
    icon: LucideHome,
    dot: 'bg-navy-300',
    chip: 'bg-surface-muted text-ink-muted',
    card: 'bg-surface-muted/60 border-l-navy-300 border-dashed',
    labelKey: 'planningExtended.entryTypeFree',
  },
};

export function getEntryVisual(type: PlanningEntryType, t: (key: string) => string): EntryVisual & { label: string } {
  const { labelKey, ...rest } = ENTRY_VISUALS[type];
  return { ...rest, labelKey, label: t(labelKey) };
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

export const PLANNING_SAMPLE_ENTRIES: PlanningEntry[] = [
  {
    id: 'e-01',
    type: 'task',
    title: 'mock.planning.0.title',
    description: 'mock.planning.0.desc',
    category: 'work',
    date: '2026-08-12',
    start: '09:00',
    end: '10:30',
    duration: 90,
    status: 'in-progress',
    priority: 'high',
    tone: 'primary',
  },
  {
    id: 'e-02',
    type: 'event',
    title: 'mock.planning.1.title',
    description: 'mock.planning.1.desc',
    category: 'work',
    date: '2026-08-12',
    start: '10:45',
    end: '12:15',
    duration: 90,
    location: 'mock.planning.1.location',
    participants: ['mock.participants.groupe3a', 'mock.participants.drBenali'],
    tone: 'accent',
  },
  {
    id: 'e-03',
    type: 'break',
    title: 'mock.planning.2.title',
    category: 'meals',
    date: '2026-08-12',
    start: '12:30',
    end: '13:30',
    duration: 60,
    tone: 'warning',
  },
  {
    id: 'e-04',
    type: 'sport',
    title: 'mock.planning.3.title',
    description: 'mock.planning.3.desc',
    category: 'sport',
    date: '2026-08-12',
    start: '18:00',
    end: '19:00',
    duration: 60,
    location: 'mock.planning.3.location',
    tone: 'danger',
  },
  {
    id: 'e-05',
    type: 'free',
    title: 'mock.planning.4.title',
    category: 'free',
    date: '2026-08-12',
    start: '19:30',
    end: '22:00',
    duration: 150,
    tone: 'primary',
  },
  {
    id: 'e-06',
    type: 'task',
    title: 'mock.planning.5.title',
    description: 'mock.planning.5.desc',
    category: 'work',
    date: '2026-08-11',
    start: '14:00',
    end: '16:00',
    duration: 120,
    status: 'done',
    priority: 'medium',
    tone: 'primary',
  },
  {
    id: 'e-07',
    type: 'event',
    title: 'mock.planning.6.title',
    category: 'personal',
    date: '2026-08-11',
    start: '10:00',
    end: '10:45',
    duration: 45,
    location: 'mock.planning.6.location',
    tone: 'accent',
  },
  {
    id: 'e-08',
    type: 'free',
    title: 'mock.planning.7.title',
    category: 'free',
    date: '2026-08-11',
    start: '17:00',
    end: '20:00',
    duration: 180,
    tone: 'primary',
  },
  {
    id: 'e-09',
    type: 'task',
    title: 'mock.planning.8.title',
    category: 'personal',
    date: '2026-08-13',
    start: '17:30',
    end: '18:15',
    duration: 45,
    status: 'todo',
    priority: 'low',
    tone: 'primary',
  },
  {
    id: 'e-10',
    type: 'event',
    title: 'mock.planning.9.title',
    description: 'mock.planning.9.desc',
    category: 'work',
    date: '2026-08-13',
    start: '11:00',
    end: '12:00',
    duration: 60,
    location: 'mock.planning.9.location',
    participants: ['mock.participants.tuteur', 'mock.participants.groupePFA'],
    recurrence: 'weekly',
    tone: 'accent',
  },
  {
    id: 'e-11',
    type: 'sport',
    title: 'mock.planning.10.title',
    category: 'sport',
    date: '2026-08-13',
    start: '19:00',
    end: '20:30',
    duration: 90,
    location: 'mock.planning.10.location',
    participants: ['mock.participants.equipe2'],
    tone: 'danger',
  },
  {
    id: 'e-12',
    type: 'task',
    title: 'mock.planning.11.title',
    category: 'work',
    date: '2026-08-14',
    start: '09:00',
    end: '10:00',
    duration: 60,
    status: 'todo',
    priority: 'medium',
    tone: 'primary',
  },
  {
    id: 'e-13',
    type: 'event',
    title: 'mock.planning.12.title',
    category: 'personal',
    date: '2026-08-14',
    start: '15:00',
    end: '15:30',
    duration: 30,
    location: 'mock.planning.12.location',
    tone: 'accent',
  },
  {
    id: 'e-14',
    type: 'break',
    title: 'mock.planning.13.title',
    category: 'meals',
    date: '2026-08-15',
    start: '16:00',
    end: '16:15',
    duration: 15,
    tone: 'warning',
  },
];
