import { generateReply, makeId } from '../../ai/models/ai.models';

export type AssistantMessage =
  | {
      id: string;
      role: 'user' | 'assistant';
      contentKey: string;
      contentVars?: Record<string, string>;
      time: string;
    }
  | { id: string; role: 'user' | 'assistant'; content: string; time: string };

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
];

export const WELCOME_KEY = 'assistantPage.welcome';

function nowLabel(locale = 'fr'): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(),
  );
}

function conversation(
  id: string,
  titleKey: string,
  messages: AssistantMessage[],
  hoursAgo: number,
): AssistantConversation {
  const updatedAt = new Date(Date.now() - hoursAgo * 60 * 60_000).toISOString();
  return { id, titleKey, updatedAt, messages };
}

function welcomeMessage(): AssistantMessage {
  return {
    id: makeId('am'),
    role: 'assistant',
    contentKey: WELCOME_KEY,
    contentVars: { name: 'Sarah' },
    time: nowLabel(),
  };
}

export const MOCK_CONVERSATIONS: AssistantConversation[] = [
  conversation(
    'my-day',
    'assistantPage.conversationTitles.myDay',
    [
      welcomeMessage(),
      {
        id: makeId('am'),
        role: 'user',
        contentKey: 'assistantPage.suggestions.0',
        time: nowLabel(),
      },
      {
        id: makeId('am'),
        role: 'assistant',
        contentKey: 'assistantPage.replies.focusBlock',
        time: nowLabel(),
      },
    ],
    1,
  ),
  conversation(
    'organization',
    'assistantPage.conversationTitles.organization',
    [
      welcomeMessage(),
      {
        id: makeId('am'),
        role: 'user',
        contentKey: 'assistantPage.suggestions.1',
        time: nowLabel(),
      },
      {
        id: makeId('am'),
        role: 'assistant',
        contentKey: 'assistantPage.replies.fullDay',
        time: nowLabel(),
      },
    ],
    3,
  ),
  conversation(
    'week',
    'assistantPage.conversationTitles.week',
    [
      welcomeMessage(),
      {
        id: makeId('am'),
        role: 'user',
        contentKey: 'assistantPage.suggestions.3',
        time: nowLabel(),
      },
      {
        id: makeId('am'),
        role: 'assistant',
        contentKey: 'assistantPage.replies.improve',
        time: nowLabel(),
      },
    ],
    26,
  ),
];

export const CONTEXT_ITEMS: ContextItem[] = [
  { labelKey: 'assistantPage.contextItems.productivity', value: '78 %', tone: 'teal' },
  { labelKey: 'assistantPage.contextItems.tasksDone', value: '6 / 8', tone: 'success' },
  {
    labelKey: 'assistantPage.contextItems.nextEvent',
    valueKey: 'assistantPage.contextItems.nextEventValue',
    tone: 'navy',
  },
  { labelKey: 'assistantPage.contextItems.hydration', value: '1,7 / 2,5 L', tone: 'warning' },
  { labelKey: 'assistantPage.contextItems.freeTime', value: '3 h 15', tone: 'navy' },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function assistantReply(question: string): string {
  const normalized = normalize(question);
  if (normalized.includes('maintenant') || normalized.includes('tout de suite')) {
    return 'assistantPage.replies.focusBlock';
  }
  if (normalized.includes('chargee')) {
    return 'assistantPage.replies.fullDay';
  }
  if (normalized.includes('partir') || normalized.includes('reunion')) {
    return 'assistantPage.replies.departure';
  }
  return generateReply(question);
}
