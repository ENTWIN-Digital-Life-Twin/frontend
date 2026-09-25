import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  sectionFor,
  type AppNotification,
  type NotificationFilter,
  type NotificationSection,
  type NotificationType,
} from '../models/notification.models';

type BackendNotificationType = 'REMINDER' | 'WARNING' | 'INFO' | 'SYSTEM';
type BackendNotificationStatus = 'SCHEDULED' | 'SENT' | 'READ' | 'FAILED' | 'CANCELLED';
type BackendSourceType = 'TASK' | 'EVENT' | 'WELLNESS_GOAL' | 'CUSTOM' | null;

interface NotificationResponse {
  id: string;
  userId: string;
  notificationType: BackendNotificationType;
  title: string;
  message: string;
  channel: string;
  status: BackendNotificationStatus;
  scheduledAt: string;
  sentAt: string | null;
  readAt: string | null;
  retryCount: number;
  reminderId: string | null;
  sourceType: BackendSourceType;
  sourceResourceId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

function typeFromResponse(res: NotificationResponse): NotificationType {
  switch (res.sourceType) {
    case 'TASK':
      return 'task';
    case 'EVENT':
      return 'calendar';
    case 'WELLNESS_GOAL':
      return 'wellness';
    default:
      break;
  }
  switch (res.notificationType) {
    case 'SYSTEM':
      return 'system';
    case 'WARNING':
      return 'wellness';
    default:
      return 'ai';
  }
}

function fromResponse(res: NotificationResponse): AppNotification {
  return {
    id: res.id,
    type: typeFromResponse(res),
    title: res.title,
    message: res.message,
    createdAt: res.scheduledAt ?? res.createdAt,
    read: res.status === 'READ' || res.readAt !== null,
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.notificationApiUrl}/notifications`;

  private readonly notificationsSignal = signal<AppNotification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();

  readonly filter = signal<NotificationFilter>('all');
  readonly selectedId = signal<string | null>(null);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.http
      .get<PageResponse<NotificationResponse>>(this.baseUrl, {
        params: new HttpParams()
          .set('page', '0')
          .set('size', '50')
          .set('sort', 'scheduledAt,desc'),
      })
      .subscribe({
        next: (page) => this.notificationsSignal.set(page.content.map(fromResponse)),
        error: (err) => {
          console.error('Failed to load notifications', err);
          this.notificationsSignal.set([]);
        },
      });
  }

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
    const current = this.notificationsSignal().find((notification) => notification.id === id);
    if (!current || current.read) {
      return;
    }
    this.notificationsSignal.update((list) =>
      list.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
    this.http.patch(`${this.baseUrl}/${id}/read`, {}).subscribe({
      error: (err) => console.error('Failed to mark notification as read', err),
    });
  }

  markAllRead(): void {
    const hadUnread = this.notificationsSignal().some((notification) => !notification.read);
    if (!hadUnread) {
      return;
    }
    this.notificationsSignal.update((list) =>
      list.map((notification) => ({ ...notification, read: true })),
    );
    this.http.patch(`${this.baseUrl}/read-all`, {}).subscribe({
      error: (err) => console.error('Failed to mark all notifications as read', err),
    });
  }

  delete(id: string): void {
    this.notificationsSignal.update((list) => list.filter((notification) => notification.id !== id));
    if (this.selectedId() === id) {
      this.selectedId.set(null);
    }
    this.http.delete(`${this.baseUrl}/${id}`).subscribe({
      error: (err) => console.error('Failed to delete notification', err),
    });
  }
}
