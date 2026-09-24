import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface DashboardStats {
  productivityPercent: number;
  tasksCompleted: number;
  tasksTotal: number;
  focusTime: string;
  breaksTaken: number;
  goalsMetPercent: number;
  aiConfidence: number;
  freeTimeTotal: string;
  freeTimeEvening: string;
  freeTimeLunch: string;
}

export interface TimelineEvent {
  time: string;
  title: string;
  detail: string;
  type: 'work' | 'personal' | 'meeting' | 'break';
}

export interface UpcomingEvent {
  time: string;
  title: string;
  location: string;
  isOnline: boolean;
  participants: string[];
}

export interface WellnessData {
  sleep: { value: string; level: number };
  hydration: { value: string; level: number };
  activity: { value: string; level: number };
  nutrition: { value: string; level: number };
  mood: { value: string; level: number };
}

export interface WeeklyProductivity {
  labels: string[];
  completed: number[];
  planned: number[];
}

export interface WeeklyWellness {
  labels: string[];
  sleep: number[];
  activity: number[];
  nutrition: number[];
}

/**
 * Dashboard service for fetching dashboard statistics and data.
 * Connects to the planning-service and wellness-service backends.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly planningApiUrl = environment.planningApiUrl;
  private readonly wellnessApiUrl = environment.wellnessApiUrl;
  
  // State signals
  private readonly statsData = signal<DashboardStats | null>(null);
  private readonly timelineData = signal<TimelineEvent[]>([]);
  private readonly upcomingEventData = signal<UpcomingEvent | null>(null);
  private readonly wellnessData = signal<WellnessData | null>(null);
  private readonly weeklyProductivityData = signal<WeeklyProductivity | null>(null);
  private readonly weeklyWellnessData = signal<WeeklyWellness | null>(null);
  
  // Public readonly signals
  readonly stats = this.statsData.asReadonly();
  readonly timeline = this.timelineData.asReadonly();
  readonly upcomingEvent = this.upcomingEventData.asReadonly();
  readonly wellness = this.wellnessData.asReadonly();
  readonly weeklyProductivity = this.weeklyProductivityData.asReadonly();
  readonly weeklyWellness = this.weeklyWellnessData.asReadonly();
  
  /**
   * Load dashboard statistics from backend
   */
  loadStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.planningApiUrl}/dashboard/stats`).pipe(
      tap((stats) => this.statsData.set(stats)),
      catchError((error) => {
        console.error('Failed to load dashboard stats:', error);
        this.statsData.set(null);
        return EMPTY;
      }),
    );
  }
  
  /**
   * Load today's timeline from backend
   */
  loadTimeline(): Observable<TimelineEvent[]> {
    return this.http.get<TimelineEvent[]>(`${this.planningApiUrl}/dashboard/timeline`).pipe(
      tap((timeline) => this.timelineData.set(timeline)),
      catchError((error) => {
        console.error('Failed to load timeline:', error);
        this.timelineData.set([]);
        return EMPTY;
      }),
    );
  }
  
  /**
   * Load upcoming event from backend
   */
  loadUpcomingEvent(): Observable<UpcomingEvent | null> {
    return this.http.get<UpcomingEvent | null>(`${this.planningApiUrl}/dashboard/upcoming`).pipe(
      tap((event) => this.upcomingEventData.set(event)),
      catchError((error) => {
        console.error('Failed to load upcoming event:', error);
        this.upcomingEventData.set(null);
        return EMPTY;
      }),
    );
  }
  
  /**
   * Load wellness data from backend
   */
  loadWellness(): Observable<WellnessData> {
    return this.http.get<WellnessData>(`${this.wellnessApiUrl}/wellness/dashboard`).pipe(
      tap((wellness) => this.wellnessData.set(wellness)),
      catchError((error) => {
        console.error('Failed to load wellness data:', error);
        this.wellnessData.set(null);
        return EMPTY;
      }),
    );
  }
  
  loadWeeklyWellness(): Observable<WeeklyWellness> {
    return this.http.get<WeeklyWellness>(`${this.wellnessApiUrl}/wellness/weekly`).pipe(
      tap((data) => this.weeklyWellnessData.set(data)),
      catchError((error) => {
        console.error('Failed to load weekly wellness:', error);
        this.weeklyWellnessData.set(null);
        return EMPTY;
      }),
    );
  }

  loadAll(): void {
    this.loadStats().subscribe();
    this.loadTimeline().subscribe();
    this.loadUpcomingEvent().subscribe();
    this.loadWellness().subscribe();
    this.loadWeeklyWellness().subscribe();
  }
}
