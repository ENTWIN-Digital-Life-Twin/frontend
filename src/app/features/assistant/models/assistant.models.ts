import type { ProposedTaskPayload } from '../../ai/services/ai.service';

export type AssistantMessage =
  | {
      id: string;
      role: 'user' | 'assistant';
      contentKey: string;
      contentVars?: Record<string, string>;
      time: string;
    }
  | {
      id: string;
      role: 'user' | 'assistant';
      content: string;
      time: string;
      proposedTask?: ProposedTaskPayload;
      taskCreated?: boolean;
    };

export interface AssistantConversation {
  id: string;
  titleKey: string;
  updatedAt: string;
  messages: AssistantMessage[];
}

export interface ContextItem {
  labelKey: string;
  value?: string;
  valueKey?: string;
  tone: 'navy' | 'teal' | 'success' | 'warning' | 'danger';
}

export const SUGGESTED_QUESTION_KEYS: string[] = [
  'assistantPage.suggestions.0',
  'assistantPage.suggestions.1',
  'assistantPage.suggestions.2',
  'assistantPage.suggestions.3',
  'assistantPage.suggestions.4',
];

export const WELCOME_KEY = 'assistantPage.welcome';
