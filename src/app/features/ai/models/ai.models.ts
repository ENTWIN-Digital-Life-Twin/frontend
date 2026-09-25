import type { LucideIcon } from '@lucide/angular';
import {
  LucideActivity,
  LucideBriefcase,
  LucideClock,
  LucideHeartPulse,
  LucideListTodo,
  LucideUtensils,
} from '@lucide/angular';

export type AiCategory = 'productivity' | 'wellness' | 'schedule' | 'nutrition' | 'tasks';
export type RiskLevel = 'low' | 'moderate' | 'high';

export interface LocalizedAiInsight {
  id: string;
  category: AiCategory;
  risk: RiskLevel;
  title: string;
  confidence: number; // 0..100
  explanation: string;
  factors: { label: string; value: string }[];
  recommendation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AI_CATEGORY_KEYS: Record<AiCategory, string> = {
  productivity: 'aiPage.categories.productivity',
  wellness: 'aiPage.categories.wellness',
  schedule: 'aiPage.categories.schedule',
  nutrition: 'aiPage.categories.nutrition',
  tasks: 'aiPage.categories.tasks',
};

export const AI_CATEGORY_ICONS: Record<AiCategory, LucideIcon> = {
  productivity: LucideBriefcase,
  wellness: LucideHeartPulse,
  schedule: LucideClock,
  nutrition: LucideUtensils,
  tasks: LucideListTodo,
};

export const AI_CATEGORY_CHIP: Record<AiCategory, string> = {
  productivity: 'bg-navy-50 text-primary',
  wellness: 'bg-teal-50 text-accent-dark',
  schedule: 'bg-primary/10 text-primary',
  nutrition: 'bg-warning-light text-warning',
  tasks: 'bg-success-light text-success',
};

export const RISK_KEYS: Record<RiskLevel, string> = {
  low: 'aiPage.risk.low',
  moderate: 'aiPage.risk.moderate',
  high: 'aiPage.risk.high',
};

export const SUGGESTED_QUESTION_KEYS: string[] = [
  'aiPage.suggestions.0',
  'aiPage.suggestions.1',
  'aiPage.suggestions.2',
  'aiPage.suggestions.3',
];

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}
