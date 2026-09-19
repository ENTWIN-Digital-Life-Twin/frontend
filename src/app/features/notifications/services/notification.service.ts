import { Injectable, computed, signal } from '@angular/core';
import {
  MOCK_NOTIFICATIONS,
  sectionFor,
  type AppNotification,
  type NotificationFilter,
  type NotificationSection,
} from '../models/notification.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationsSignal = signal<AppNotification[]>(MOCK_NOTIFICATIONS);
  readonly notifications = this.notificationsSignal.asReadonly();

  readonly filter = signal<NotificationFilter>('all');
  readonly selectedId = signal<string | null>(null);

  readonly unreadCount = computed(
    () => this.notificationsSignal().filter((notification) => !notification.read).length,
  );

  readonly filtered = computed(() => {
    const filter = this.filter();
    return this.notificationsSignal().filter((notification) => {
      if (filter === 'unread') {
        return !notification.read;
      }
      if (filter === 'all') {
        return true;
      }
      return notification.type === filter;
    });
  });

  readonly grouped = computed(() => {
    const groups: { section: NotificationSection; items: AppNotification[] }[] = [
      { section: 'today', items: [] },
      { section: 'week', items: [] },
      { section: 'older', items: [] },
    ];
    for (const notification of this.filtered()) {
      const section = sectionFor(notification);
      const group = groups.find((g) => g.section === section);
      group?.items.push(notification);
    }
    return groups.filter((group) => group.items.length > 0);
  });

  readonly selected = computed(
    () =>
      this.notificationsSignal().find((notification) => notification.id === this.selectedId()) ??
      null,
  );

  setFilter(filter: NotificationFilter): void {
    this.filter.set(filter);
  }

  select(id: string | null): void {
    this.selectedId.set(id);
    if (id) {
      this.markRead(id);
    }
  }

  markRead(id: string): void {
    this.notificationsSignal.update((list) =>
      list.map((notification) =>
        notification.id === id && !notification.read
          ? { ...notification, read: true }
          : notification,
      ),
    );
  }

  markAllRead(): void {
    this.notificationsSignal.update((list) =>
      list.map((notification) => ({ ...notification, read: true })),
    );
  }

  delete(id: string): void {
    this.notificationsSignal.update((list) => list.filter((notification) => notification.id !== id));
    if (this.selectedId() === id) {
      this.selectedId.set(null);
    }
  }
}
