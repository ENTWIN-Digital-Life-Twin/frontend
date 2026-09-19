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

export interface AiInsightFactor {
  labelKey: string;
  value?: string;
  valueKey?: string;
}

export interface AiInsight {
  id: string;
  category: AiCategory;
  risk: RiskLevel;
  titleKey: string;
  confidence: number; // 0..100
  explanationKey: string;
  factors: AiInsightFactor[];
  recommendationKey: string;
}

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

export const MOCK_INSIGHTS: AiInsight[] = [
  {
    id: 'ai-01',
    category: 'productivity',
    risk: 'moderate',
    titleKey: 'aiPage.insights.afternoon.title',
    confidence: 82,
    explanationKey: 'aiPage.insights.afternoon.explanation',
    factors: [
      { labelKey: 'aiPage.insights.afternoon.factorLabels.focusBlocks', value: '4' },
      { labelKey: 'aiPage.insights.afternoon.factorLabels.break', value: '10 min' },
      { labelKey: 'aiPage.insights.afternoon.factorLabels.energy', valueKey: 'aiPage.factorValues.decreasing' },
    ],
    recommendationKey: 'aiPage.insights.afternoon.recommendation',
  },
  {
    id: 'ai-02',
    category: 'wellness',
    risk: 'moderate',
    titleKey: 'aiPage.insights.hydration.title',
    confidence: 78,
    explanationKey: 'aiPage.insights.hydration.explanation',
    factors: [
      { labelKey: 'aiPage.insights.hydration.factorLabels.consumed', value: '1,7 L' },
      { labelKey: 'aiPage.insights.hydration.factorLabels.goal', value: '2,5 L' },
      { labelKey: 'aiPage.insights.hydration.factorLabels.goalReached', value: '68 %' },
    ],
    recommendationKey: 'aiPage.insights.hydration.recommendation',
  },
  {
    id: 'ai-03',
    category: 'schedule',
    risk: 'low',
    titleKey: 'aiPage.insights.freeTime.title',
    confidence: 90,
    explanationKey: 'aiPage.insights.freeTime.explanation',
    factors: [
      { labelKey: 'aiPage.insights.freeTime.factorLabels.freeTime', value: '3 h 15' },
      { labelKey: 'aiPage.insights.freeTime.factorLabels.conflicts', valueKey: 'aiPage.factorValues.none' },
      { labelKey: 'aiPage.insights.freeTime.factorLabels.busyDay', valueKey: 'aiPage.factorValues.no' },
    ],
    recommendationKey: 'aiPage.insights.freeTime.recommendation',
  },
  {
    id: 'ai-04',
    category: 'nutrition',
    risk: 'moderate',
    titleKey: 'aiPage.insights.protein.title',
    confidence: 64,
    explanationKey: 'aiPage.insights.protein.explanation',
    factors: [
      { labelKey: 'aiPage.insights.protein.factorLabels.proteins', value: '82 / 120 g' },
      { labelKey: 'aiPage.insights.protein.factorLabels.carbs', value: '210 / 280 g' },
      { labelKey: 'aiPage.insights.protein.factorLabels.balance', value: '84 / 100' },
    ],
    recommendationKey: 'aiPage.insights.protein.recommendation',
  },
  {
    id: 'ai-05',
    category: 'tasks',
    risk: 'high',
    titleKey: 'aiPage.insights.lateTask.title',
    confidence: 88,
    explanationKey: 'aiPage.insights.lateTask.explanation',
    factors: [
      { labelKey: 'aiPage.insights.lateTask.factorLabels.lateTasks', value: '1' },
      { labelKey: 'aiPage.insights.lateTask.factorLabels.deadline', valueKey: 'aiPage.factorValues.yesterday' },
      { labelKey: 'aiPage.insights.lateTask.factorLabels.priority', valueKey: 'aiPage.factorValues.high' },
    ],
    recommendationKey: 'aiPage.insights.lateTask.recommendation',
  },
  {
    id: 'ai-06',
    category: 'wellness',
    risk: 'low',
    titleKey: 'aiPage.insights.sleep.title',
    confidence: 85,
    explanationKey: 'aiPage.insights.sleep.explanation',
    factors: [
      { labelKey: 'aiPage.insights.sleep.factorLabels.duration', value: '7 h 20' },
      { labelKey: 'aiPage.insights.sleep.factorLabels.goal', value: '7 h 30' },
      { labelKey: 'aiPage.insights.sleep.factorLabels.quality', valueKey: 'aiPage.factorValues.good' },
    ],
    recommendationKey: 'aiPage.insights.sleep.recommendation',
  },
];

export const SUGGESTED_QUESTION_KEYS: string[] = [
  'aiPage.suggestions.0',
  'aiPage.suggestions.1',
  'aiPage.suggestions.2',
  'aiPage.suggestions.3',
];

export interface MockReply {
  keywords: string[];
  answerKey: string;
}

export const MOCK_REPLIES: MockReply[] = [
  {
    keywords: ['apres-midi', 'organiser', 'organize', 'afternoon', 'بعد الظهر', 'تنظيم', 'أنظم'],
    answerKey: 'aiPage.replies.afternoon',
  },
  {
    keywords: ['ameliorer', 'journee', 'improve', 'تحسين'],
    answerKey: 'aiPage.replies.improve',
  },
  {
    keywords: ['prioritaires', 'priorite', 'taches', 'priorities', 'priority', 'أولويات', 'أولوية'],
    answerKey: 'aiPage.replies.priorities',
  },
  {
    keywords: ['temps libre', 'libre', 'free time', 'وقت حر'],
    answerKey: 'aiPage.replies.freeTime',
  },
];

export function generateReply(question: string): string {
  const normalized = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const match =
    MOCK_REPLIES.find((reply) =>
      reply.keywords.some((keyword) => normalized.includes(keyword)),
    ) ?? MOCK_REPLIES[1];
  return match.answerKey;
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}
