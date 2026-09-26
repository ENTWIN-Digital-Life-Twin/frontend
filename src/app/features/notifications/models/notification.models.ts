import type { LucideIcon } from '@lucide/angular';
import {
  LucideBell,
  LucideCalendar,
  LucideHeart,
  LucideListTodo,
  LucideShield,
  LucideSparkles,
} from '@lucide/angular';

export type NotificationType = 'task' | 'calendar' | 'wellness' | 'ai' | 'system' | 'security';
export type NotificationSection = 'today' | 'week' | 'older';
export type NotificationFilter = 'all' | NotificationType | 'unread';

/**
 * A notification as displayed in the UI. `title`/`message` are plain,
 * already-resolved text coming straight from notification-service (the
 * backend generates them server-side, so unlike most of the UI they are
 * NOT translation keys and must be rendered as-is).
 */
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO datetime
  read: boolean;
}

export const NOTIFICATION_TYPE_KEYS: Record<NotificationType, string> = {
  task: 'notifications.types.task',
  calendar: 'notifications.types.calendar',
  wellness: 'notifications.types.wellness',
  ai: 'notifications.types.ai',
  system: 'notifications.types.system',
  security: 'notifications.types.security',
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  task: LucideListTodo,
  calendar: LucideCalendar,
  wellness: LucideHeart,
  ai: LucideSparkles,
  system: LucideBell,
  security: LucideShield,
};

export const NOTIFICATION_TYPE_CHIP: Record<NotificationType, string> = {
  task: 'bg-primary/10 text-primary',
  calendar: 'bg-navy-50 text-navy-600',
  wellness: 'bg-teal-50 text-accent-dark',
  ai: 'bg-warning-light text-warning',
  system: 'bg-surface-muted text-ink-muted',
  security: 'bg-danger-light text-danger',
};

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
