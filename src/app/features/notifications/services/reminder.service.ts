import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TokenStorageService } from '../../../core/services/auth/token-storage.service';
import type { ReminderKey } from '../../calendar/models/calendar.models';

export type ReminderSourceType = 'TASK' | 'EVENT' | 'WELLNESS_GOAL' | 'CUSTOM';
export type ReminderType = 'TASK' | 'EVENT' | 'WATER' | 'MEAL' | 'SLEEP' | 'WORKOUT' | 'CUSTOM';

export interface Reminder {
  id: string;
  title: string;
  message: string | null;
  reminderType: ReminderType;
  triggerDateTime: string;
  recurring: boolean;
  recurrenceType: 'NONE' | 'DAILY' | 'WEEKLY';
  enabled: boolean;
  sourceType: ReminderSourceType | null;
  sourceResourceId: string | null;
  advanceMinutes: number;
  nextTriggerAt: string;
  lastTriggeredAt: string | null;
}

export interface SyncReminderRequest {
  sourceType: ReminderSourceType;
  sourceResourceId: string;
  title: string;
  message?: string | null;
  reminderType: ReminderType;
  triggerDateTime: string;
  advanceMinutes: number | null;
}

interface PageResponse<T> {
  content: T[];
}

const DAILY_DEFAULTS: Array<{
  reminderType: ReminderType;
  title: string;
  message: string;
  hour: number;
  minute: number;
}> = [
  {
    reminderType: 'WATER',
    title: 'Drink water',
    message: 'A glass of water keeps you on track with your hydration goal.',
    hour: 10,
    minute: 0,
  },
  {
    reminderType: 'MEAL',
    title: 'Log your meal',
    message: 'Take a moment to record what you eat.',
    hour: 12,
    minute: 30,
  },
  {
    reminderType: 'SLEEP',
    title: 'Wind down',
    message: 'Prepare for a good night of sleep.',
    hour: 22,
    minute: 0,
  },
];

export function reminderKeyFromMinutes(minutes?: number | null): ReminderKey {
  switch (minutes) {
    case 5:
    case 10:
    case 15:
    case 30:
    case 60:
    case 1440:
      return String(minutes) as ReminderKey;
    default:
      return 'none';
  }
}

export function minutesFromReminderKey(key?: ReminderKey | null): number | null {
  if (!key || key === 'none') {
    return null;
  }
  const minutes = Number(key);
  return Number.isFinite(minutes) ? minutes : null;
}

function nextDailyAt(hour: number, minute: number): string {
  const when = new Date();
  when.setHours(hour, minute, 0, 0);
  if (when.getTime() <= Date.now()) {
    when.setDate(when.getDate() + 1);
  }
  return when.toISOString();
}

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly baseUrl = `${environment.notificationApiUrl}/reminders`;
  private started = false;

  private readonly remindersSignal = signal<Reminder[]>([]);
  readonly reminders = this.remindersSignal.asReadonly();

  readonly upcoming = computed(() => {
    const now = Date.now();
    return this.remindersSignal()
      .filter((reminder) => reminder.enabled && new Date(reminder.nextTriggerAt).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.nextTriggerAt).getTime() - new Date(b.nextTriggerAt).getTime(),
      )
      .slice(0, 8);
  });

  startSession(): void {
    if (!this.tokenStorage.getAccessToken()) {
      return;
    }
    this.refresh(() => {
      if (!this.started) {
        this.seedDailyDefaults();
        this.started = true;
      }
    });
  }

  stopSession(): void {
    this.started = false;
  }

  refresh(after?: () => void): void {
    if (!this.tokenStorage.getAccessToken()) {
      return;
    }
    this.http
      .get<PageResponse<Reminder>>(this.baseUrl, {
        params: new HttpParams().set('page', '0').set('size', '100').set('sort', 'nextTriggerAt,asc'),
      })
      .subscribe({
        next: (page) => {
          this.remindersSignal.set(page.content ?? []);
          after?.();
        },
        error: (err) => {
          console.error('Failed to load reminders', err);
        },
      });
  }

  findBySource(sourceType: ReminderSourceType, sourceResourceId: string): Reminder | undefined {
    return this.remindersSignal().find(
      (reminder) =>
        reminder.sourceType === sourceType && reminder.sourceResourceId === sourceResourceId,
    );
  }

  sync(request: SyncReminderRequest): void {
    if (!request.sourceResourceId) {
      return;
    }
    const existing = this.findBySource(request.sourceType, request.sourceResourceId);
    if (request.advanceMinutes == null) {
      if (existing) {
        this.delete(existing.id);
      }
      return;
    }

    const fireAt =
      new Date(request.triggerDateTime).getTime() - request.advanceMinutes * 60_000;
    if (fireAt < Date.now()) {
      if (existing) {
        this.delete(existing.id);
      }
      return;
    }

    const body = {
      title: request.title || 'Reminder',
      message: request.message || null,
      reminderType: request.reminderType,
      triggerDateTime: request.triggerDateTime,
      recurring: false,
      recurrenceType: 'NONE',
      enabled: true,
      sourceType: request.sourceType,
      sourceResourceId: request.sourceResourceId,
      advanceMinutes: request.advanceMinutes,
    };

    if (existing) {
      this.http.put<Reminder>(`${this.baseUrl}/${existing.id}`, body).subscribe({
        next: (updated) => this.upsert(updated),
        error: (err) => console.error('Failed to update reminder', err),
      });
      return;
    }

    this.http.post<Reminder>(this.baseUrl, body).subscribe({
      next: (created) => this.upsert(created),
      error: (err) => console.error('Failed to create reminder', err),
    });
  }

  deleteForSource(sourceType: ReminderSourceType, sourceResourceId: string): void {
    const existing = this.findBySource(sourceType, sourceResourceId);
    if (existing) {
      this.delete(existing.id);
    }
  }

  delete(id: string): void {
    this.remindersSignal.update((list) => list.filter((reminder) => reminder.id !== id));
    this.http.delete(`${this.baseUrl}/${id}`).subscribe({
      error: (err) => console.error('Failed to delete reminder', err),
    });
  }

  private seedDailyDefaults(): void {
    const existing = this.remindersSignal();
    for (const preset of DAILY_DEFAULTS) {
      const already = existing.some(
        (reminder) => reminder.reminderType === preset.reminderType && reminder.recurring,
      );
      if (already) {
        continue;
      }
      this.http
        .post<Reminder>(this.baseUrl, {
          title: preset.title,
          message: preset.message,
          reminderType: preset.reminderType,
          triggerDateTime: nextDailyAt(preset.hour, preset.minute),
          recurring: true,
          recurrenceType: 'DAILY',
          enabled: true,
          sourceType: 'WELLNESS_GOAL',
          sourceResourceId: null,
          advanceMinutes: 0,
        })
        .subscribe({
          next: (created) => this.upsert(created),
          error: (err) => console.error('Failed to create daily reminder', err),
        });
    }
  }

  private upsert(reminder: Reminder): void {
    this.remindersSignal.update((list) => {
      const index = list.findIndex((item) => item.id === reminder.id);
      if (index === -1) {
        return [...list, reminder];
      }
      const next = [...list];
      next[index] = reminder;
      return next;
    });
  }
}
