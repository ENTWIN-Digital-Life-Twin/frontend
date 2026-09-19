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
  titleKey: string;
  detailKey: string;
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

function seed(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function generateMetrics(days: number): DayMetrics[] {
  const list: DayMetrics[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = offsetDays(-i);
    const r1 = seed(i * 3 + 1);
    const r2 = seed(i * 7 + 2);
    const r3 = seed(i * 11 + 3);
    const r4 = seed(i * 13 + 4);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    const sleepMinutes = Math.round(390 + 75 * r1);
    const hydrationMl = Math.round(1300 + 750 * r2);
    const mood = Math.min(5, Math.max(3, Math.round(2.5 + 2 * r3)));
    const stress: StressLevel = isWeekend
      ? 'low'
      : r4 < 0.25
        ? 'low'
        : r4 < 0.75
          ? 'moderate'
          : 'high';
    const fatigue: FatigueLevel = sleepMinutes < 400 ? 'high' : sleepMinutes < 430 ? 'moderate' : 'low';

    const balance = Math.round(
      (sleepMinutes / 480) * 30 +
        (hydrationMl / 2500) * 25 +
        mood * 5 +
        (stress === 'low' ? 18 : stress === 'moderate' ? 14 : 9),
    );

    list.push({ date: dayKey(date), balance, sleepMinutes, hydrationMl, mood, stress, fatigue });
  }
  return list;
}

export const MOCK_METRICS_30: DayMetrics[] = generateMetrics(30);

export const MOCK_DAY_TODAY: DayMetrics = {
  date: dayKey(offsetDays(0)),
  balance: 82,
  sleepMinutes: 440,
  hydrationMl: 1700,
  mood: 4,
  stress: 'low',
  fatigue: 'moderate',
};

MOCK_METRICS_30[MOCK_METRICS_30.length - 1] = MOCK_DAY_TODAY;

export const MOCK_SLEEP_NIGHTS: SleepNight[] = [6, 5, 4, 3, 2, 1, 0].map((back, index) => {
  const defs: Omit<SleepNight, 'date'>[] = [
    { bedTime: '22:50', wakeTime: '05:40', sleepMinutes: 410, consistency: 74 },
    { bedTime: '23:05', wakeTime: '06:20', sleepMinutes: 435, consistency: 80 },
    { bedTime: '22:35', wakeTime: '05:10', sleepMinutes: 395, consistency: 71 },
    { bedTime: '23:30', wakeTime: '07:10', sleepMinutes: 460, consistency: 85 },
    { bedTime: '23:45', wakeTime: '07:25', sleepMinutes: 460, consistency: 88 },
    { bedTime: '23:05', wakeTime: '06:45', sleepMinutes: 405, consistency: 76 },
    { bedTime: '23:15', wakeTime: '06:35', sleepMinutes: 440, consistency: 78 },
  ];
  const def = defs[index];
  return { ...def, date: dayKey(offsetDays(-back)) };
});

export const MOCK_HYDRATION_ENTRIES: HydrationEntry[] = [
  { id: 'h1', time: '08:10', ml: 250 },
  { id: 'h2', time: '10:30', ml: 300 },
  { id: 'h3', time: '12:15', ml: 400 },
  { id: 'h4', time: '14:45', ml: 250 },
  { id: 'h5', time: '16:30', ml: 300 },
  { id: 'h6', time: '18:20', ml: 200 },
];

export const MOCK_TIMELINE: TimelineItem[] = [
  {
    id: 't1',
    time: '07:00',
    titleKey: 'wellness.timeline.wake',
    detailKey: 'wellness.timeline.wakeDetail',
    kind: 'wake',
  },
  {
    id: 't2',
    time: '08:00',
    titleKey: 'wellness.timeline.breakfast',
    detailKey: 'wellness.timeline.breakfastDetail',
    kind: 'meal',
  },
  {
    id: 't3',
    time: '08:10',
    titleKey: 'wellness.hydration',
    detailKey: 'wellness.timeline.hydrationDetail',
    detailVars: { value: '250' },
    kind: 'hydration',
  },
  {
    id: 't4',
    time: '10:30',
    titleKey: 'wellness.hydration',
    detailKey: 'wellness.timeline.hydrationDetail',
    detailVars: { value: '300' },
    kind: 'hydration',
  },
  {
    id: 't5',
    time: '12:15',
    titleKey: 'wellness.timeline.lunch',
    detailKey: 'wellness.timeline.lunchDetail',
    kind: 'meal',
  },
  {
    id: 't6',
    time: '14:30',
    titleKey: 'wellness.activeBreak',
    detailKey: 'wellness.timeline.activeBreakDetail',
    detailVars: { value: '20' },
    kind: 'break',
  },
  {
    id: 't7',
    time: '16:30',
    titleKey: 'wellness.hydration',
    detailKey: 'wellness.timeline.hydrationDetail',
    detailVars: { value: '250' },
    kind: 'hydration',
  },
  {
    id: 't8',
    time: '18:15',
    titleKey: 'wellness.timeline.activity',
    detailKey: 'wellness.timeline.activityDetail',
    detailVars: { value: '45' },
    kind: 'activity',
  },
  {
    id: 't9',
    time: '20:00',
    titleKey: 'wellness.timeline.dinner',
    detailKey: 'wellness.timeline.dinnerDetail',
    kind: 'meal',
  },
  {
    id: 't10',
    time: '22:15',
    titleKey: 'wellness.timeline.relaxation',
    detailKey: 'wellness.timeline.relaxationDetail',
    kind: 'break',
  },
  {
    id: 't11',
    time: '23:15',
    titleKey: 'wellness.timeline.bedtime',
    detailKey: 'wellness.timeline.sleepDetail',
    kind: 'sleep',
  },
];

export const MOCK_GOALS: WellnessGoal[] = [
  {
    id: 'goal-sleep',
    labelKey: 'wellness.sleep',
    unitKey: 'wellness.goals.perNight',
    kind: 'sleep',
    value: 440,
    target: 480,
    progress: 92,
  },
  {
    id: 'goal-hydra',
    labelKey: 'wellness.hydration',
    unitKey: 'wellness.goals.perDay',
    kind: 'hydration',
    value: 1700,
    target: 2500,
    progress: 68,
  },
  {
    id: 'goal-pause',
    labelKey: 'wellness.activeBreak',
    unitKey: 'wellness.goals.perDay',
    kind: 'minutes',
    value: 20,
    target: 30,
    progress: 67,
  },
];
