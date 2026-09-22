import type { LucideIcon } from '@lucide/angular';
import {
  LucideBriefcase,
  LucideDumbbell,
  LucideGraduationCap,
  LucideHome,
} from '@lucide/angular';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'work' | 'personal' | 'sport' | 'studies';

export type TaskStatusFilter = 'all' | TaskStatus | 'overdue';
export type TaskPriorityFilter = 'all' | TaskPriority;
export type TaskCategoryFilter = 'all' | TaskCategory;
export type TaskSort = 'newest' | 'oldest' | 'priority' | 'due' | 'duration';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskActivity {
  id: string;
  label: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string; // ISO (yyyy-MM-dd)
  startTime: string; // HH:mm
  duration: number; // minutes
  progress: number; // 0..100
  notes: string;
  subtasks: Subtask[];
  activity: TaskActivity[];
  createdAt: string; // ISO
}

export const CATEGORY_KEYS: Record<TaskCategory, string> = {
  work: 'categories.work',
  personal: 'categories.personal',
  sport: 'categories.sport',
  studies: 'categories.studies',
};

export const PRIORITY_KEYS: Record<TaskPriority, string> = {
  low: 'priorities.low',
  medium: 'priorities.medium',
  high: 'priorities.high',
};

export const STATUS_KEYS: Record<TaskStatus, string> = {
  todo: 'statuses.todo',
  'in-progress': 'statuses.inProgress',
  done: 'statuses.done',
};

export const CATEGORY_ICONS: Record<TaskCategory, LucideIcon> = {
  work: LucideBriefcase,
  personal: LucideHome,
  sport: LucideDumbbell,
  studies: LucideGraduationCap,
};

const PRIORITY_RANK: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2 };

const pad2 = (value: number): string => String(value).padStart(2, '0');

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISO(date);
}

export function todayISO(): string {
  return daysFromNow(0);
}

export function isOverdue(task: Task): boolean {
  return task.status !== 'done' && task.dueDate < todayISO();
}

export function dueLabel(
  iso: string,
  locale = 'fr',
  t?: (key: string) => string,
): string {
  if (iso === todayISO()) {
    return t ? t('commonExtended.dueToday') : "Aujourd'hui";
  }
  if (iso === daysFromNow(1)) {
    return t ? t('commonExtended.dueTomorrow') : 'Demain';
  }
  if (iso === daysFromNow(-1)) {
    return t ? t('commonExtended.dueYesterday') : 'Hier';
  }
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  return `${weekday[0].toUpperCase()}${weekday.slice(1)}`;
}

export function durationLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest}`;
}

export function compareTasks(a: Task, b: Task, sort: TaskSort): number {
  switch (sort) {
    case 'newest':
      return a.createdAt < b.createdAt ? 1 : -1;
    case 'oldest':
      return a.createdAt > b.createdAt ? 1 : -1;
    case 'priority':
      return (
        PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] ||
        a.dueDate.localeCompare(b.dueDate)
      );
    case 'duration':
      return b.duration - a.duration;
    default:
      return a.dueDate.localeCompare(b.dueDate);
  }
}
