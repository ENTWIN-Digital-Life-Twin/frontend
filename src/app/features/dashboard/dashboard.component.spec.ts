import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/services/auth/auth.service';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import { LanguageService } from '../../core/services/language.service';
import { LucideActivity, LucideUsers } from '@lucide/angular';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: {
    stats: ReturnType<typeof signal>;
    timeline: ReturnType<typeof signal>;
    upcomingEvent: ReturnType<typeof signal>;
    wellness: ReturnType<typeof signal>;
    weeklyProductivity: ReturnType<typeof signal>;
    weeklyWellness: ReturnType<typeof signal>;
    state: ReturnType<typeof signal>;
    loadAll: ReturnType<typeof vi.fn>;
    retry: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

    dashboardService = {
      stats: signal({
        productivityPercent: 75,
        productivityChangePercent: 10,
        tasksCompleted: 3,
        tasksTotal: 4,
        focusMinutes: 90,
        occupiedMinutes: 240,
        freeMinutes: 240,
        priorityGoalsMetPercent: 50,
        overloaded: false,
      }),
      timeline: signal([
        { time: '09:00', title: 'Meeting', detail: 'Team sync', type: 'meeting' },
        { time: '14:00', title: 'Work', detail: 'Development', type: 'work' },
      ]),
      upcomingEvent: signal({
        id: 'event-1',
        time: '14:00 - 15:00',
        title: 'Sprint Planning',
        location: 'Room A',
        eventType: 'MEETING',
      }),
      wellness: signal({
        sleep: { value: '7h 20m', level: 92 },
        hydration: { value: '1.7 L', level: 68 },
        activity: { value: '45 min', level: 75 },
        nutrition: { value: '3 meals', level: 100 },
        mood: { value: '8.0/10', level: 80 },
      }),
      weeklyProductivity: signal({
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        productivity: [50, 75, 100, 0, 80, 0, 50],
        tasksCompleted: [1, 3, 2, 0, 4, 0, 1],
        tasksTotal: [2, 4, 2, 0, 5, 0, 2],
        focusMinutes: [30, 90, 60, 0, 120, 0, 30],
      }),
      weeklyWellness: signal({
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        sleep: [89, 91, 85, 90, 82, 100, 92],
        activity: [72, 80, 68, 84, 76, 96, 80],
        nutrition: [62, 71, 65, 74, 68, 80, 72],
      }),
      state: signal({
        stats: 'loaded',
        timeline: 'loaded',
        upcoming: 'loaded',
        wellness: 'loaded',
        weeklyProductivity: 'loaded',
        weeklyWellness: 'loaded',
      }),
      loadAll: vi.fn(),
      retry: vi.fn(),
    };

    const languageService = {
      translate: vi.fn((key: string, values?: Record<string, string>) =>
        values ? `${key}:${JSON.stringify(values)}` : key,
      ),
      translateSignal: vi.fn((key: string) => () => key),
      activeLanguage: vi.fn(() => 'en'),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: signal({
              id: '1',
              email: 'test@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'user',
              avatarUrl: null,
            }),
          },
        },
        { provide: LanguageService, useValue: languageService },
        { provide: DashboardService, useValue: dashboardService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and loads all dashboard data', () => {
    expect(component).toBeTruthy();
    expect(dashboardService.loadAll).toHaveBeenCalledOnce();
  });

  it('uses real dashboard statistics', () => {
    expect(component['stats']()?.productivityPercent).toBe(75);
    expect(component['tasksCompleted']()).toContain('"done":"3"');
  });

  it('calculates the free-time ring from free and occupied minutes', () => {
    expect(component['freeOffset']()).toBeCloseTo(component['freeCircumference'] / 2);
  });

  it('calculates the weighted weekly productivity average', () => {
    expect(component['weeklyAverage']()).toContain('73');
  });

  it('maps timeline and wellness API data', () => {
    expect(component['timeline']()).toHaveLength(2);
    expect(component['wellness']()).toHaveLength(5);
    expect(component['wellness']()[2].route).toBe('/sport');
  });

  it('maps backend event types to timeline icons', () => {
    expect(component['getIconForType']('appointment')).toBe(LucideUsers);
    expect(component['getIconForType']('meeting')).toBe(LucideUsers);
    expect(component['getIconForType']('sport')).toBe(LucideActivity);
  });

  it('provides working routes for every quick action', () => {
    expect(component['quickActions']().map((action) => action.route)).toEqual([
      '/tasks',
      '/calendar',
      '/planning',
      '/assistant',
    ]);
    expect(component['quickActions']()[0].queryParams).toEqual({ create: 'true' });
  });

  it('retries a failed section', () => {
    component['retry']('timeline');
    expect(dashboardService.retry).toHaveBeenCalledWith('timeline');
  });

  it('renders the empty timeline state', () => {
    dashboardService.timeline.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('dashboard.noTimeline');
  });

  it('renders an error state and retry control', () => {
    dashboardService.state.set({
      stats: 'loaded',
      timeline: 'loaded',
      upcoming: 'loaded',
      wellness: 'error',
      weeklyProductivity: 'loaded',
      weeklyWellness: 'loaded',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('dashboard.loadError');
  });

  it('formats durations from backend minutes', () => {
    expect(component['formatMinutes'](45)).toBe('45m');
    expect(component['formatMinutes'](135)).toBe('2h 15m');
  });
});
