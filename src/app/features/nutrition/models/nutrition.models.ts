export type NutritionPeriod = 'today' | '7d' | '30d';
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';
export type WeeklyMetric = 'calories' | 'protein' | 'hydration';

export interface Meal {
  id: string;
  type: MealType;
  name: string;
  time: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

export interface WaterEntry {
  id: string;
  time: string;
  ml: number;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
}

export interface DayNutrition {
  date: string;
  calories: number;
  protein: number;
  hydrationMl: number;
}

export interface ScorePart {
  label: string;
  score: number;
}

export interface InsightFactor {
  label: string;
  value: string;
}

export interface NutritionInsight {
  title: string;
  message: string;
  recommendation: string;
  factors: InsightFactor[];
}

export interface NutritionGoal {
  label: string;
  current: string;
  target: string;
  progress: number;
  unit: string;
}

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export const MEAL_TYPE_CHIP: Record<MealType, string> = {
  breakfast: 'bg-teal-50 text-accent-dark',
  lunch: 'bg-navy-50 text-primary',
  snack: 'bg-warning-light text-warning',
  dinner: 'bg-surface-muted text-ink',
};

export const DAILY_CALORIE_GOAL = 2200;
export const DAILY_PROTEIN_GOAL = 120;
export const DAILY_CARB_GOAL = 280;
export const DAILY_FAT_GOAL = 75;
export const DAILY_WATER_GOAL_ML = 2500;
export const MEAL_SLOTS = 4;

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

export function formatKcal(n: number, locale = 'fr'): string {
  return n.toLocaleString(locale);
}

export function formatGrams(n: number): string {
  return `${n} g`;
}

export function formatLiters(ml: number, locale = 'fr'): string {
  return `${(ml / 1000).toLocaleString(locale, { maximumFractionDigits: 2 })} L`;
}
