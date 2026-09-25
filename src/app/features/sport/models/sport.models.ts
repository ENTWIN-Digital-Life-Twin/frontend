import type { LucideIcon } from '@lucide/angular';
import { LucideBike, LucideDumbbell, LucideFootprints, LucidePersonStanding, LucideZap } from '@lucide/angular';

export type WorkoutType = 'running' | 'walking' | 'cycling' | 'gym' | 'stretching';
export type WorkoutIntensity = 'low' | 'medium' | 'high';

export interface Workout {
  id: string;
  type: WorkoutType;
  title: string;
  date: string; // ISO yyyy-MM-dd
  startTime: string; // HH:mm
  duration: number; // minutes
  distance: number; // km
  calories: number;
  intensity: WorkoutIntensity;
  notes: string;
}

export interface WeeklyStat {
  day: string;
  activeMinutes: number;
  calories: number;
}

export const WORKOUT_TYPES: WorkoutType[] = ['running', 'walking', 'cycling', 'gym', 'stretching'];

export const WORKOUT_TYPE_ICONS: Record<WorkoutType, LucideIcon> = {
  running: LucideZap,
  walking: LucideFootprints,
  cycling: LucideBike,
  gym: LucideDumbbell,
  stretching: LucidePersonStanding,
};

export const WORKOUT_TYPE_CHIP: Record<WorkoutType, string> = {
  running: 'bg-teal-50 text-accent-dark',
  walking: 'bg-navy-50 text-primary',
  cycling: 'bg-success-light text-success',
  gym: 'bg-warning-light text-warning',
  stretching: 'bg-surface-muted text-ink',
};

export const WORKOUT_TYPE_BAR: Record<WorkoutType, string> = {
  running: 'bg-accent',
  walking: 'bg-primary',
  cycling: 'bg-success',
  gym: 'bg-warning',
  stretching: 'bg-navy-300',
};

export const WORKOUT_TYPE_TEXT: Record<WorkoutType, string> = {
  running: 'text-accent-dark',
  walking: 'text-primary',
  cycling: 'text-success',
  gym: 'text-warning',
  stretching: 'text-navy-600',
};

export const DAILY_STEPS_GOAL = 8000;
export const DAILY_ACTIVE_GOAL = 45;
export const DAILY_CALORIE_GOAL = 500;

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function offsetDays(days: number): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

export function formatDuration(minutes: number, t?: (key: string) => string): string {
  if (minutes < 60) {
    return `${minutes} ${t ? t('common.units.minuteShort') : 'min'}`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const h = t ? t('common.units.hourShort') : 'h';
  const m = t ? t('common.units.minuteShort') : 'min';
  return rest === 0 ? `${hours} ${h}` : `${hours} ${h} ${rest} ${m}`;
}

export function formatDistance(km: number, locale = 'fr'): string {
  return km === 0 ? '—' : `${km.toLocaleString(locale, { maximumFractionDigits: 1 })} km`;
}
