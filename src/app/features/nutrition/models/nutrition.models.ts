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

export const MOCK_MEALS: Meal[] = [
  {
    id: 'meal-breakfast',
    type: 'breakfast',
    name: 'mock.nutrition.0.name',
    time: '08:00',
    foods: ['mock.nutrition.food.omelette', 'mock.nutrition.food.painComplet', 'mock.nutrition.food.banane'],
    calories: 420,
    protein: 20,
    carbs: 45,
    fat: 17,
    notes: 'mock.nutrition.0.notes',
  },
  {
    id: 'meal-lunch',
    type: 'lunch',
    name: 'mock.nutrition.1.name',
    time: '12:45',
    foods: ['mock.nutrition.food.pouletGrille', 'mock.nutrition.food.rizComplet', 'mock.nutrition.food.legumes'],
    calories: 620,
    protein: 38,
    carbs: 78,
    fat: 14,
    notes: 'mock.nutrition.1.notes',
  },
  {
    id: 'meal-snack',
    type: 'snack',
    name: 'mock.nutrition.2.name',
    time: '16:00',
    foods: ['mock.nutrition.food.yaourtGrec', 'mock.nutrition.food.amandes'],
    calories: 240,
    protein: 12,
    carbs: 15,
    fat: 14,
  },
  {
    id: 'meal-dinner',
    type: 'dinner',
    name: 'mock.nutrition.3.name',
    time: '20:00',
    foods: ['mock.nutrition.food.saumon', 'mock.nutrition.food.salade', 'mock.nutrition.food.pommesDeTerre'],
    calories: 400,
    protein: 12,
    carbs: 72,
    fat: 13,
    notes: 'mock.nutrition.3.notes',
  },
];

export const MOCK_WATER_ENTRIES: WaterEntry[] = [
  { id: 'w1', time: '08:00', ml: 250 },
  { id: 'w2', time: '10:30', ml: 300 },
  { id: 'w3', time: '12:45', ml: 400 },
  { id: 'w4', time: '15:00', ml: 250 },
  { id: 'w5', time: '17:30', ml: 300 },
  { id: 'w6', time: '19:00', ml: 200 },
];

function seed(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export const MOCK_30_DAYS: DayNutrition[] = Array.from({ length: 30 }, (_, i) => {
  const r1 = seed(i * 5 + 1);
  const r2 = seed(i * 7 + 2);
  const r3 = seed(i * 11 + 3);
  const isWeekend = offsetDays(-(29 - i)).getDay() === 0 || offsetDays(-(29 - i)).getDay() === 6;
  return {
    date: dayKey(offsetDays(-(29 - i))),
    calories: Math.round((isWeekend ? 1700 : 1580) + 420 * r1),
    protein: Math.round(70 + 45 * r2),
    hydrationMl: Math.round(1200 + 1200 * r3),
  };
});

export const MOCK_FOODS: FoodItem[] = [
  { id: 'f1', name: 'mock.nutrition.food.pouletGrille', calories: 250, protein: 30 },
  { id: 'f2', name: 'mock.nutrition.food.rizComplet', calories: 180, protein: 4 },
  { id: 'f3', name: 'mock.nutrition.food.banane', calories: 105, protein: 1 },
  { id: 'f4', name: 'mock.nutrition.food.yaourtGrec', calories: 120, protein: 10 },
  { id: 'f5', name: 'mock.nutrition.food.amandes', calories: 160, protein: 6 },
  { id: 'f6', name: 'mock.nutrition.food.saumon', calories: 210, protein: 20 },
  { id: 'f7', name: 'mock.nutrition.food.painComplet', calories: 140, protein: 6 },
  { id: 'f8', name: 'mock.nutrition.food.omelette', calories: 180, protein: 12 },
];
