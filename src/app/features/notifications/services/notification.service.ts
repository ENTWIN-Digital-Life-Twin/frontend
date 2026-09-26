import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import { TokenStorageService } from '../../../core/services/auth/token-storage.service';
import { consumeNewDeviceLabel } from '../../../core/services/auth/device-id';
import {
  sectionFor,
  type AppNotification,
  type NotificationFilter,
  type NotificationSection,
  type NotificationType,
} from '../models/notification.models';

type BackendNotificationType = 'REMINDER' | 'WARNING' | 'INFO' | 'SYSTEM' | 'SECURITY';
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
  if (res.notificationType === 'SECURITY') {
    return 'security';
  }
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

const POLL_MS = 45_000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly languageService = inject(LanguageService);
  private readonly baseUrl = `${environment.notificationApiUrl}/notifications`;
  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private primed = false;

  private readonly notificationsSignal = signal<AppNotification[]>([]);
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

  startSession(): void {
    if (!this.tokenStorage.getAccessToken()) {
      return;
    }
    if (!this.primed) {
      this.prime();
      this.primed = true;
    } else {
      this.load();
    }
    if (this.pollHandle) {
      return;
    }
    this.pollHandle = setInterval(() => this.load(), POLL_MS);
  }

  stopSession(): void {
    this.primed = false;
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  refresh(): void {
    if (this.primed) {
      this.load();
      return;
    }
    this.prime();
  }

  private prime(): void {
    if (!this.tokenStorage.getAccessToken()) {
      return;
    }
    this.http
      .post<{ created: number }>(`${this.baseUrl}/bootstrap`, {})
      .pipe(
        catchError(() => of({ created: 0 })),
        switchMap(() => this.publishNewDeviceIfNeeded()),
        switchMap(() => this.fetchPage()),
      )
      .subscribe({
        next: (page) => this.notificationsSignal.set(page.content.map(fromResponse)),
        error: (err) => console.error('Failed to load notifications', err),
      });
  }

  private load(): void {
    if (!this.tokenStorage.getAccessToken()) {
      return;
    }
    this.fetchPage().subscribe({
      next: (page) => this.notificationsSignal.set(page.content.map(fromResponse)),
      error: (err) => console.error('Failed to load notifications', err),
    });
  }

  private fetchPage() {
    return this.http.get<PageResponse<NotificationResponse>>(this.baseUrl, {
      params: new HttpParams().set('page', '0').set('size', '50').set('sort', 'scheduledAt,desc'),
    });
  }

  private publishNewDeviceIfNeeded() {
    const label = consumeNewDeviceLabel();
    if (!label) {
      return of(null);
    }
    return this.http
      .post(`${this.baseUrl}`, {
        notificationType: 'SECURITY',
        title: this.languageService.translate('notifications.security.newDeviceTitle'),
        message: this.languageService.translate('notifications.security.newDeviceMessage', {
          device: label,
        }),
        sourceType: 'CUSTOM',
      })
      .pipe(catchError(() => of(null)));
  }

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
