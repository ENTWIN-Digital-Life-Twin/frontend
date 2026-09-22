import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap, tap, throwError } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { environment } from '../../../../environments/environment';
import {
  CATEGORY_ICONS,
  CATEGORY_KEYS,
  nextDateISO,
  prevDateISO,
  toMinutes,
  todayISO,
  weekDates,
  type DaySummary,
  type PlanningCategory,
  type PlanningEntry,
  type PlanningFilter,
} from '../models/planning.models';
import { TaskCategoryDirectoryService } from './task-category-directory.service';
import { TaskService } from '../../tasks/services/task.service';

interface ConflictResponse {
  conflictType: string;
  conflictingResourceId: string;
  conflictingResourceType: string;
  message: string;
}

interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  priority: string;
  status: string;
  plannedDurationMinutes: number;
  actualDurationMinutes: number | null;
  startDateTime: string | null;
  deadline: string | null;
  completionPercentage: number;
  conflicts: ConflictResponse[];
}

interface EventResponse {
  id: string;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  eventType: string;
  locationLabel: string | null;
  recurring: boolean;
  recurrenceRule: string | null;
  participants?: string[];
  conflicts: ConflictResponse[];
}

interface DailyPlanSummaryResponse {
  totalTasks: number;
  completedTasks: number;
  plannedMinutes: number;
  eventMinutes: number;
  occupiedMinutes: number;
  freeMinutes: number;
  conflictCount: number;
  overloaded: boolean;
}

interface DailyPlanResponse {
  date: string;
  timezone: string;
  tasks: TaskResponse[];
  events: EventResponse[];
  summary: DailyPlanSummaryResponse;
}

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private readonly http = inject(HttpClient);
  private readonly languageService = inject(LanguageService);
  private readonly categories = inject(TaskCategoryDirectoryService);
  private readonly tasks = inject(TaskService);
  private readonly baseUrl = environment.planningApiUrl;
  private readonly backendSummary = signal<DailyPlanSummaryResponse | null>(null);

  readonly entries = signal<PlanningEntry[]>([]);
  readonly selectedDate = signal(todayISO());
  readonly filter = signal<PlanningFilter>('all');
  readonly selectedEntryId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  readonly isToday = computed(() => this.selectedDate() === todayISO());
  readonly filteredEntries = computed(() =>
    this.entriesFor(this.selectedDate()).filter((entry) => this.matches(entry)),
  );
  readonly selectedEntry = computed(() => {
    const id = this.selectedEntryId();
    return id ? this.entries().find((entry) => entry.id === id) ?? null : null;
  });
  readonly week = computed(() => weekDates(this.selectedDate()));
  readonly summary = computed<DaySummary>(() => {
    const entries = this.entriesFor(this.selectedDate());
    const summary = this.backendSummary();
    const blocks = entries.filter((entry) => entry.type !== 'free');
    const categories = (['work', 'personal', 'sport', 'meals'] as PlanningCategory[])
      .map((category) => ({
        category,
        minutes: blocks
          .filter((entry) => entry.category === category)
          .reduce((total, entry) => total + entry.duration, 0),
      }))
      .filter((item) => item.minutes > 0);
    const occupied = summary?.occupiedMinutes ?? blocks.reduce((total, entry) => total + entry.duration, 0);
    const free = summary?.freeMinutes ?? 0;
    const available = occupied + free;
    const loadPercent = available === 0 ? 0 : Math.min(100, Math.round((occupied * 100) / available));

    return {
      totalTasks: summary?.totalTasks ?? entries.filter((entry) => entry.type === 'task').length,
      doneTasks: summary?.completedTasks ?? entries.filter((entry) => entry.status === 'done').length,
      totalEvents: summary ? entries.filter((entry) => entry.type === 'event').length : 0,
      blocks: blocks.length,
      freeMinutes: free,
      loadPercent,
      tone: summary?.overloaded ? 'danger' : loadPercent > 75 ? 'warning' : 'primary',
      categories,
    };
  });

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.categories
      .load()
      .pipe(
        switchMap(() =>
          this.http.get<DailyPlanResponse>(`${this.baseUrl}/planning/daily`, {
            params: { date: this.selectedDate() },
          }),
        ),
        tap((response) => {
          console.log('Planning loaded for date', this.selectedDate(), response);
          this.entries.set([
            ...response.tasks.map((task) => this.fromTask(task)),
            ...response.events.map((event) => this.fromEvent(event)),
          ]);
          this.backendSummary.set(response.summary);
          this.selectedEntryId.set(null);
          this.loading.set(false);
        }),
        catchError((error) => {
          console.error('Failed to load planning', error);
          this.entries.set([]);
          this.backendSummary.set(null);
          this.loading.set(false);
          this.error.set('planning.loadError');
          return of(null);
        }),
      )
      .subscribe();
  }

  retry(): void {
    this.load();
  }

  setFilter(filter: PlanningFilter): void {
    this.filter.set(filter);
  }

  selectDate(iso: string): void {
    if (iso === this.selectedDate()) return;
    this.selectedDate.set(iso);
    this.load();
  }

  goToday(): void {
    this.selectedDate.set(todayISO());
    this.load();
  }

  goPreviousDay(): void {
    this.selectedDate.set(prevDateISO(this.selectedDate()));
    this.load();
  }

  goNextDay(): void {
    this.selectedDate.set(nextDateISO(this.selectedDate()));
    this.load();
  }

  openEntry(id: string): void {
    this.selectedEntryId.set(id);
  }

  closeEntry(): void {
    this.selectedEntryId.set(null);
  }

  toggleComplete(id: string): void {
    const entry = this.entries().find((item) => item.id === id && item.type === 'task');
    if (!entry) return;
    const status = entry.status === 'done' ? 'SCHEDULED' : 'COMPLETED';
    this.saving.set(true);
    this.http
      .patch(`${this.baseUrl}/tasks/${id}/status`, { status })
      .pipe(
        tap(() => {
          this.saving.set(false);
          this.load();
          this.tasks.reload();
        }),
        catchError((error) => this.operationFailed(error)),
      )
      .subscribe();
  }

  addEntry(entry: PlanningEntry): Observable<PlanningEntry> {
    this.saving.set(true);
    const request = entry.type === 'task'
      ? this.http.post<TaskResponse>(`${this.baseUrl}/tasks`, this.toTaskRequest(entry)).pipe(map((response) => this.fromTask(response)))
      : this.http.post<EventResponse>(`${this.baseUrl}/events`, this.toEventRequest(entry)).pipe(map((response) => this.fromEvent(response)));
    return request.pipe(
      tap((created) => {
        this.saving.set(false);
        this.selectedDate.set(created.date);
        this.load();
      }),
      catchError((error) => this.operationFailed(error)),
    );
  }

  updateEntry(entry: PlanningEntry): Observable<PlanningEntry> {
    this.saving.set(true);
    const request = entry.type === 'task'
      ? this.http.put<TaskResponse>(`${this.baseUrl}/tasks/${entry.id}`, this.toTaskRequest(entry, true)).pipe(
          switchMap((response) => {
            const desiredStatus = this.toBackendStatus(entry.status);
            return response.status === desiredStatus
              ? of(response)
              : this.http.patch<TaskResponse>(`${this.baseUrl}/tasks/${entry.id}/status`, { status: desiredStatus });
          }),
          map((response) => this.fromTask(response)),
        )
      : this.http.put<EventResponse>(`${this.baseUrl}/events/${entry.id}`, this.toEventRequest(entry)).pipe(map((response) => this.fromEvent(response)));
    return request.pipe(
      tap(() => {
        this.saving.set(false);
        this.load();
      }),
      catchError((error) => this.operationFailed(error)),
    );
  }

  deleteEntry(id: string): void {
    const entry = this.entries().find((item) => item.id === id);
    if (!entry) return;
    const resource = entry.type === 'task' ? 'tasks' : 'events';
    this.saving.set(true);
    this.http
      .delete(`${this.baseUrl}/${resource}/${id}`)
      .pipe(
        tap(() => {
          this.saving.set(false);
          this.closeEntry();
          this.load();
          this.tasks.reload();
        }),
        catchError((error) => this.operationFailed(error)),
      )
      .subscribe();
  }

  entriesFor(iso: string): PlanningEntry[] {
    return this.entries()
      .filter((entry) => entry.date === iso)
      .sort((left, right) => toMinutes(left.start) - toMinutes(right.start));
  }

  dayHasEntries(iso: string): boolean {
    return this.entriesFor(iso).length > 0;
  }

  dayCount(iso: string): number {
    return this.entriesFor(iso).length;
  }

  categoryIcon(category: PlanningCategory): typeof CATEGORY_ICONS[PlanningCategory] {
    return CATEGORY_ICONS[category];
  }

  categoryLabel(category: PlanningCategory): string {
    return this.languageService.translate(CATEGORY_KEYS[category]);
  }

  private fromTask(task: TaskResponse): PlanningEntry {
    const anchor = task.startDateTime ?? task.deadline ?? new Date().toISOString();
    const startDate = new Date(anchor);
    const endDate = new Date(startDate.getTime() + task.plannedDurationMinutes * 60_000);
    const taskCategory = this.categories.categoryFor(task.categoryId);
    const category: PlanningCategory =
      taskCategory === 'sport' ? 'sport' : taskCategory === 'personal' ? 'personal' : 'work';
    return {
      id: task.id,
      type: 'task',
      title: task.title,
      description: task.description ?? undefined,
      category,
      date: this.localDate(startDate),
      start: this.localTime(startDate),
      end: this.localTime(endDate),
      duration: task.plannedDurationMinutes,
      status: this.fromBackendStatus(task.status),
      priority: task.priority === 'LOW' ? 'low' : task.priority === 'MEDIUM' ? 'medium' : 'high',
      tone: 'primary',
    };
  }

  private fromEvent(event: EventResponse): PlanningEntry {
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const category = this.eventCategory(event.eventType);
    return {
      id: event.id,
      type: 'event',
      title: event.title,
      description: event.description ?? undefined,
      category,
      date: this.localDate(start),
      start: this.localTime(start),
      end: this.localTime(end),
      duration: Math.max(1, Math.round((end.getTime() - start.getTime()) / 60_000)),
      location: event.locationLabel ?? undefined,
      participants: event.participants ?? [],
      recurrence: event.recurring && event.recurrenceRule === 'DAILY' ? 'daily' : event.recurring ? 'weekly' : undefined,
      tone: event.eventType === 'SPORT' ? 'danger' : 'accent',
    };
  }

  private toTaskRequest(entry: PlanningEntry, update = false): Record<string, unknown> {
    return {
      title: entry.title,
      description: entry.description ?? null,
      categoryId: this.categories.categoryIdFor(
        entry.category === 'meals' || entry.category === 'free'
          ? 'personal'
          : entry.category === 'sport'
            ? 'sport'
            : entry.category === 'personal'
              ? 'personal'
              : 'work',
      ),
      priority: entry.priority?.toUpperCase() ?? 'MEDIUM',
      plannedDurationMinutes: entry.duration,
      ...(update ? { actualDurationMinutes: entry.status === 'done' ? entry.duration : null } : {}),
      startDateTime: this.toInstant(entry.date, entry.start),
      deadline: this.toInstant(entry.date, entry.end),
      completionPercentage: entry.status === 'done' ? 100 : entry.status === 'in-progress' ? 50 : 0,
      energyRequired: null,
      complexityLevel: null,
    };
  }

  private toEventRequest(entry: PlanningEntry): Record<string, unknown> {
    return {
      title: entry.title,
      description: entry.description ?? null,
      startDateTime: this.toInstant(entry.date, entry.start),
      endDateTime: this.toInstant(entry.date, entry.end),
      allDay: false,
      eventType: entry.category === 'sport' ? 'SPORT' : entry.category === 'personal' ? 'PERSONAL' : 'WORK',
      locationLabel: entry.location ?? null,
      recurring: Boolean(entry.recurrence),
      recurrenceRule: entry.recurrence?.toUpperCase() ?? null,
      participants: entry.participants ?? [],
    };
  }

  private eventCategory(type: string): PlanningCategory {
    if (type === 'SPORT' || type === 'HEALTH') return 'sport';
    if (type === 'PERSONAL') return 'personal';
    return 'work';
  }

  private fromBackendStatus(status: string): PlanningEntry['status'] {
    if (status === 'COMPLETED') return 'done';
    if (status === 'IN_PROGRESS' || status === 'PAUSED') return 'in-progress';
    return 'todo';
  }

  private toBackendStatus(status: PlanningEntry['status']): string {
    return status === 'done' ? 'COMPLETED' : status === 'in-progress' ? 'IN_PROGRESS' : 'SCHEDULED';
  }

  private toInstant(date: string, time: string): string {
    return new Date(`${date}T${time}:00`).toISOString();
  }

  private localDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private localTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private matches(entry: PlanningEntry): boolean {
    const filter = this.filter();
    if (filter === 'all') return true;
    if (filter === 'tasks') return entry.type === 'task';
    if (filter === 'events') return entry.type === 'event';
    return entry.category === filter;
  }

  private operationFailed(error: unknown): Observable<never> {
    console.error('Planning operation failed', error);
    this.saving.set(false);
    this.error.set('planning.operationError');
    return throwError(() => error);
  }
}
