import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DashboardStats {
  productivityPercent: number;
  productivityChangePercent: number;
  tasksCompleted: number;
  tasksTotal: number;
  focusMinutes: number;
  occupiedMinutes: number;
  freeMinutes: number;
  priorityGoalsMetPercent: number;
  overloaded: boolean;
}

export interface TimelineEvent {
  time: string;
  title: string;
  detail: string;
  type: string;
}

export interface UpcomingEvent {
  id: string;
  time: string;
  title: string;
  location: string | null;
  eventType: string;
}

export interface WellnessMetricData {
  value: string;
  level: number;
}

export interface WellnessData {
  sleep: WellnessMetricData;
  hydration: WellnessMetricData;
  activity: WellnessMetricData;
  nutrition: WellnessMetricData;
  mood: WellnessMetricData;
}

export interface WeeklyProductivity {
  labels: string[];
  productivity: number[];
  tasksCompleted: number[];
  tasksTotal: number[];
  focusMinutes: number[];
}

export interface WeeklyWellness {
  labels: string[];
  sleep: number[];
  activity: number[];
  nutrition: number[];
}

export type DashboardSection =
  | 'stats'
  | 'timeline'
  | 'upcoming'
  | 'wellness'
  | 'weeklyProductivity'
  | 'weeklyWellness';
export type DashboardLoadState = 'idle' | 'loading' | 'loaded' | 'error';
export type DashboardState = Record<DashboardSection, DashboardLoadState>;

const INITIAL_STATE: DashboardState = {
  stats: 'idle',
  timeline: 'idle',
  upcoming: 'idle',
  wellness: 'idle',
  weeklyProductivity: 'idle',
  weeklyWellness: 'idle',
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly planningApiUrl = environment.planningApiUrl;
  private readonly wellnessApiUrl = environment.wellnessApiUrl;

  private readonly statsData = signal<DashboardStats | null>(null);
  private readonly timelineData = signal<TimelineEvent[]>([]);
  private readonly upcomingEventData = signal<UpcomingEvent | null>(null);
  private readonly wellnessData = signal<WellnessData | null>(null);
  private readonly weeklyProductivityData = signal<WeeklyProductivity | null>(null);
  private readonly weeklyWellnessData = signal<WeeklyWellness | null>(null);
  private readonly stateData = signal<DashboardState>(INITIAL_STATE);

  readonly stats = this.statsData.asReadonly();
  readonly timeline = this.timelineData.asReadonly();
  readonly upcomingEvent = this.upcomingEventData.asReadonly();
  readonly wellness = this.wellnessData.asReadonly();
  readonly weeklyProductivity = this.weeklyProductivityData.asReadonly();
  readonly weeklyWellness = this.weeklyWellnessData.asReadonly();
  readonly state = this.stateData.asReadonly();

  loadStats(): Observable<DashboardStats | null> {
    this.setState('stats', 'loading');
    return this.http.get<DashboardStats>(`${this.planningApiUrl}/dashboard/stats`).pipe(
      tap((stats) => {
        this.statsData.set(stats);
        this.setState('stats', 'loaded');
      }),
      catchError((error) => {
        console.error('Failed to load dashboard stats:', error);
        this.statsData.set(null);
        this.setState('stats', 'error');
        return of(null);
      }),
    );
  }

  loadTimeline(): Observable<TimelineEvent[]> {
    this.setState('timeline', 'loading');
    return this.http.get<TimelineEvent[]>(`${this.planningApiUrl}/dashboard/timeline`).pipe(
      tap((timeline) => {
        this.timelineData.set(timeline);
        this.setState('timeline', 'loaded');
      }),
      catchError((error) => {
        console.error('Failed to load timeline:', error);
        this.timelineData.set([]);
        this.setState('timeline', 'error');
        return of([]);
      }),
    );
  }

  loadUpcomingEvent(): Observable<UpcomingEvent | null> {
    this.setState('upcoming', 'loading');
    return this.http
      .get<UpcomingEvent>(`${this.planningApiUrl}/dashboard/upcoming`, { observe: 'response' })
      .pipe(
        map((response) => this.upcomingFromResponse(response)),
        tap((event) => {
          this.upcomingEventData.set(event);
          this.setState('upcoming', 'loaded');
        }),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 204) {
            this.upcomingEventData.set(null);
            this.setState('upcoming', 'loaded');
            return of(null);
          }
          console.error('Failed to load upcoming event:', error);
          this.upcomingEventData.set(null);
          this.setState('upcoming', 'error');
          return of(null);
        }),
      );
  }

  loadWellness(): Observable<WellnessData | null> {
    this.setState('wellness', 'loading');
    return this.http.get<WellnessData>(`${this.wellnessApiUrl}/wellness/dashboard`).pipe(
      tap((wellness) => {
        this.wellnessData.set(wellness);
        this.setState('wellness', 'loaded');
      }),
      catchError((error) => {
        console.error('Failed to load wellness data:', error);
        this.wellnessData.set(null);
        this.setState('wellness', 'error');
        return of(null);
      }),
    );
  }

  loadWeeklyProductivity(): Observable<WeeklyProductivity | null> {
    this.setState('weeklyProductivity', 'loading');
    return this.http.get<WeeklyProductivity>(`${this.planningApiUrl}/dashboard/weekly`).pipe(
      tap((data) => {
        this.weeklyProductivityData.set(data);
        this.setState('weeklyProductivity', 'loaded');
      }),
      catchError((error) => {
        console.error('Failed to load weekly productivity:', error);
        this.weeklyProductivityData.set(null);
        this.setState('weeklyProductivity', 'error');
        return of(null);
      }),
    );
  }

  loadWeeklyWellness(): Observable<WeeklyWellness | null> {
    this.setState('weeklyWellness', 'loading');
    return this.http.get<WeeklyWellness>(`${this.wellnessApiUrl}/wellness/weekly`).pipe(
      tap((data) => {
        this.weeklyWellnessData.set(data);
        this.setState('weeklyWellness', 'loaded');
      }),
      catchError((error) => {
        console.error('Failed to load weekly wellness:', error);
        this.weeklyWellnessData.set(null);
        this.setState('weeklyWellness', 'error');
        return of(null);
      }),
    );
  }

  loadAll(): void {
    this.loadStats().subscribe();
    this.loadTimeline().subscribe();
    this.loadUpcomingEvent().subscribe();
    this.loadWellness().subscribe();
    this.loadWeeklyProductivity().subscribe();
    this.loadWeeklyWellness().subscribe();
  }

  retry(section: DashboardSection): void {
    const loaders: Record<DashboardSection, () => Observable<unknown>> = {
      stats: () => this.loadStats(),
      timeline: () => this.loadTimeline(),
      upcoming: () => this.loadUpcomingEvent(),
      wellness: () => this.loadWellness(),
      weeklyProductivity: () => this.loadWeeklyProductivity(),
      weeklyWellness: () => this.loadWeeklyWellness(),
    };
    loaders[section]().subscribe();
  }

  private setState(section: DashboardSection, state: DashboardLoadState): void {
    this.stateData.update((current) => ({ ...current, [section]: state }));
  }

  private upcomingFromResponse(response: HttpResponse<UpcomingEvent>): UpcomingEvent | null {
    if (response.status === 204) {
      return null;
    }
    return response.body ?? null;
  }
}
