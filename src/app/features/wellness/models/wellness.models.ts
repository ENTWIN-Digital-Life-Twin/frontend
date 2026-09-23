export type WellnessPeriod = 'today' | '7d' | '30d';

export type StressLevel = 'low' | 'moderate' | 'high';
export type FatigueLevel = 'low' | 'moderate' | 'high';
export type WellnessDataType = 'sleep' | 'hydration' | 'mood' | 'stress' | 'activity';

export interface DayMetrics {
  date: string;
  balance: number;
  sleepMinutes: number;
  hydrationMl: number;
  mood: number;
  stress: StressLevel;
  fatigue: FatigueLevel;
}

export interface SleepNight {
  id?: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  sleepMinutes: number;
  consistency: number;
}

export interface HydrationEntry {
  id: string;
  time: string;
  ml: number;
}

export type TimelineKind = 'wake' | 'hydration' | 'meal' | 'break' | 'activity' | 'sleep';

export interface TimelineItem {
  id: string;
  time: string;
  titleKey?: string;
  title?: string;
  detailKey?: string;
  detail?: string;
  detailVars?: Record<string, string>;
  kind: TimelineKind;
}

export interface InsightFactor {
  labelKey: string;
  value?: string;
  valueKey?: string;
  valueArgs?: Record<string, string>;
}

export interface WellnessInsight {
  titleKey: string;
  messageKey: string;
  recommendationKey: string;
  title?: string;
  message?: string;
  recommendation?: string;
  confidence: number;
  factors: InsightFactor[];
}

export type GoalKind = 'sleep' | 'hydration' | 'minutes';

export interface WellnessGoal {
  id: string;
  labelKey: string;
  unitKey: string;
  kind: GoalKind;
  value: number;
  target: number;
  progress: number;
}

export interface ScorePart {
  labelKey: string;
  score: number;
}

export const PERIOD_LABEL_KEYS: Record<WellnessPeriod, string> = {
  today: 'wellnessPage.period.today',
  '7d': 'wellnessPage.period.week7',
  '30d': 'wellnessPage.period.days30',
};

export const MOOD_LEVELS: { value: number; emoji: string; labelKey: string }[] = [
  { value: 1, emoji: '😞', labelKey: 'wellness.moodLevels.veryDifficult' },
  { value: 2, emoji: '😕', labelKey: 'wellness.moodLevels.difficult' },
  { value: 3, emoji: '😐', labelKey: 'wellness.moodLevels.neutral' },
  { value: 4, emoji: '🙂', labelKey: 'wellness.moodLevels.good' },
  { value: 5, emoji: '😄', labelKey: 'wellness.moodLevels.excellent' },
];

export const MOOD_LABEL_KEYS: Record<number, string> = {
  1: 'wellness.moodLevels.veryDifficult',
  2: 'wellness.moodLevels.difficult',
  3: 'wellness.moodLevels.neutral',
  4: 'wellness.moodLevels.good',
  5: 'wellness.moodLevels.excellent',
};

export const STRESS_LEVELS: { value: StressLevel; labelKey: string; dot: string }[] = [
  { value: 'low', labelKey: 'wellness.stressLevels.low', dot: 'bg-success' },
  { value: 'moderate', labelKey: 'wellness.stressLevels.moderate', dot: 'bg-warning' },
  { value: 'high', labelKey: 'wellness.stressLevels.high', dot: 'bg-danger' },
];

export const STRESS_LABEL_KEYS: Record<StressLevel, string> = {
  low: 'wellness.stressLevels.low',
  moderate: 'wellness.stressLevels.moderate',
  high: 'wellness.stressLevels.high',
};

export const FATIGUE_LABEL_KEYS: Record<FatigueLevel, string> = {
  low: 'wellness.fatigueLevels.low',
  moderate: 'wellness.fatigueLevels.moderate',
  high: 'wellness.fatigueLevels.high',
};

export const SLEEP_GOAL_MINUTES = 480;
export const HYDRATION_GOAL_ML = 2500;

export function offsetDays(days: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = (value || '00:00').split(':').map((part) => Number(part) || 0);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const wrapped = ((Math.round(totalMinutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Overnight wrap: 23:00 → 07:00 is 8h, not a negative span. */
export function sleepMinutesBetween(bedTime: string, wakeTime: string): number {
  const start = parseTimeToMinutes(bedTime);
  let end = parseTimeToMinutes(wakeTime);
  if (end <= start) {
    end += 24 * 60;
  }
  return end - start;
}

export function wakeTimeFromDuration(bedTime: string, durationMinutes: number): string {
  const clamped = Math.max(30, Math.min(16 * 60, Math.round(durationMinutes)));
  return minutesToTime(parseTimeToMinutes(bedTime) + clamped);
}

export function formatMinutes(minutes: number, locale = 'fr-FR'): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (locale.startsWith('ar')) {
    return m === 0 ? `${h} س` : `${h} س ${String(m).padStart(2, '0')}`;
  }
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, '0')}`;
}

export function formatLiters(ml: number, locale = 'fr-FR'): string {
  const liters = ml / 1000;
  return `${liters.toLocaleString(locale, { maximumFractionDigits: 2 })} L`;
}
