import type { LucideIcon } from '@lucide/angular';
import {
  LucideBell,
  LucideCalendar,
  LucideHeart,
  LucideListTodo,
  LucideSparkles,
} from '@lucide/angular';

export type NotificationType = 'task' | 'calendar' | 'wellness' | 'ai' | 'system';
export type NotificationSection = 'today' | 'week' | 'older';
export type NotificationFilter = 'all' | NotificationType | 'unread';

export interface AppNotification {
  id: string;
  type: NotificationType;
  titleKey: string;
  messageKey: string;
  createdAt: string; // ISO datetime
  read: boolean;
}

export const NOTIFICATION_TYPE_KEYS: Record<NotificationType, string> = {
  task: 'notifications.types.task',
  calendar: 'notifications.types.calendar',
  wellness: 'notifications.types.wellness',
  ai: 'notifications.types.ai',
  system: 'notifications.types.system',
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  task: LucideListTodo,
  calendar: LucideCalendar,
  wellness: LucideHeart,
  ai: LucideSparkles,
  system: LucideBell,
};

export const NOTIFICATION_TYPE_CHIP: Record<NotificationType, string> = {
  task: 'bg-primary/10 text-primary',
  calendar: 'bg-navy-50 text-navy-600',
  wellness: 'bg-teal-50 text-accent-dark',
  ai: 'bg-warning-light text-warning',
  system: 'bg-surface-muted text-ink-muted',
};

export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function hoursAgo(hours: number): string {
  return minutesAgo(hours * 60);
}

export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60_000).toISOString();
}

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-01',
    type: 'task',
    titleKey: 'notifications.mock.deadlineTitle',
    messageKey: 'notifications.mock.deadlineMessage',
    createdAt: minutesAgo(12),
    read: false,
  },
  {
    id: 'n-02',
    type: 'calendar',
    titleKey: 'notifications.mock.eventSoonTitle',
    messageKey: 'notifications.mock.eventSoonMessage',
    createdAt: minutesAgo(28),
    read: false,
  },
  {
    id: 'n-03',
    type: 'wellness',
    titleKey: 'notifications.mock.hydrationTitle',
    messageKey: 'notifications.mock.hydrationMessage',
    createdAt: minutesAgo(55),
    read: false,
  },
  {
    id: 'n-04',
    type: 'ai',
    titleKey: 'notifications.mock.aiRecommendationTitle',
    messageKey: 'notifications.mock.aiRecommendationMessage',
    createdAt: hoursAgo(2),
    read: false,
  },
  {
    id: 'n-05',
    type: 'task',
    titleKey: 'notifications.mock.taskDoneTitle',
    messageKey: 'notifications.mock.taskDoneMessage',
    createdAt: hoursAgo(3),
    read: true,
  },
  {
    id: 'n-06',
    type: 'wellness',
    titleKey: 'notifications.mock.sleepAboveAverageTitle',
    messageKey: 'notifications.mock.sleepAboveAverageMessage',
    createdAt: hoursAgo(6),
    read: true,
  },
  {
    id: 'n-07',
    type: 'calendar',
    titleKey: 'notifications.mock.eventCreatedTitle',
    messageKey: 'notifications.mock.eventCreatedMessage',
    createdAt: hoursAgo(9),
    read: true,
  },
  {
    id: 'n-08',
    type: 'ai',
    titleKey: 'notifications.mock.weekAnalysisTitle',
    messageKey: 'notifications.mock.weekAnalysisMessage',
    createdAt: hoursAgo(26),
    read: true,
  },
  {
    id: 'n-09',
    type: 'system',
    titleKey: 'notifications.mock.newFeatureTitle',
    messageKey: 'notifications.mock.newFeatureMessage',
    createdAt: hoursAgo(50),
    read: true,
  },
  {
    id: 'n-10',
    type: 'wellness',
    titleKey: 'notifications.mock.goalReachedTitle',
    messageKey: 'notifications.mock.goalReachedMessage',
    createdAt: daysAgo(2),
    read: true,
  },
  {
    id: 'n-11',
    type: 'task',
    titleKey: 'notifications.mock.lateTaskTitle',
    messageKey: 'notifications.mock.lateTaskMessage',
    createdAt: daysAgo(3),
    read: true,
  },
  {
    id: 'n-12',
    type: 'system',
    titleKey: 'notifications.mock.maintenanceTitle',
    messageKey: 'notifications.mock.maintenanceMessage',
    createdAt: daysAgo(5),
    read: true,
  },
];

export function sectionFor(notification: AppNotification): NotificationSection {
  const diffDays = (Date.now() - new Date(notification.createdAt).getTime()) / (24 * 60 * 60_000);
  if (diffDays < 1) {
    return 'today';
  }
  if (diffDays < 7) {
    return 'week';
  }
  return 'older';
}
