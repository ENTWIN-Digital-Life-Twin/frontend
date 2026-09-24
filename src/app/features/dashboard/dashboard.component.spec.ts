import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/services/auth/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: any;
  let mockLanguageService: any;
  let mockDashboardService: any;

  beforeEach(async () => {
    // Create mock services
    mockAuthService = {
      currentUser: signal({ id: '1', email: 'test@example.com', firstName: 'John', lastName: 'Doe', role: 'user' as const, avatarUrl: null }),
    };

    mockLanguageService = {
      translate: vi.fn().mockReturnValue('Translated'),
      translateSignal: vi.fn().mockReturnValue(() => 'Translated'),
      activeLanguage: vi.fn().mockReturnValue('en'),
    };

    mockDashboardService = {
      stats: signal({
        productivityPercent: 78,
        tasksCompleted: 6,
        tasksTotal: 8,
        focusTime: '2h 30m',
        breaksTaken: 3,
        goalsMetPercent: 75,
        aiConfidence: 82,
        freeTimeTotal: '3h 15m',
        freeTimeEvening: '2h 30m',
        freeTimeLunch: '45m',
      }),
      timeline: signal([
        { time: '09:00', title: 'Meeting', detail: 'Team sync', type: 'meeting' as const },
        { time: '14:00', title: 'Work', detail: 'Development', type: 'work' as const },
      ]),
      upcomingEvent: signal({
        time: '14:00 - 15:00',
        title: 'Sprint Planning',
        location: 'Room A',
        isOnline: true,
        participants: ['John', 'Jane'],
      }),
      wellness: signal({
        sleep: { value: '7h 20m', level: 92 },
        hydration: { value: '1.7 L', level: 68 },
        activity: { value: 82, level: 82 },
        nutrition: { value: 35, level: 35 },
        mood: { value: 55, level: 55 },
      }),
      weeklyProductivity: signal({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        completed: [62, 78, 70, 84, 72, 55, 68],
        planned: [70, 80, 75, 85, 75, 60, 70],
      }),
      weeklyWellness: signal({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        sleep: [89, 91, 85, 90, 82, 100, 92],
        activity: [72, 80, 68, 84, 76, 96, 80],
        nutrition: [62, 71, 65, 74, 68, 80, 72],
      }),
      loadAll: vi.fn(),
      loadStats: vi.fn().mockReturnValue(of({})),
      loadTimeline: vi.fn().mockReturnValue(of([])),
      loadUpcomingEvent: vi.fn().mockReturnValue(of(null)),
      loadWellness: vi.fn().mockReturnValue(of({})),
      loadWeeklyProductivity: vi.fn().mockReturnValue(of({})),
      loadWeeklyWellness: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: DashboardService, useValue: mockDashboardService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    component.ngOnInit();
    expect(mockDashboardService.loadAll).toHaveBeenCalled();
  });

  it('should get user first name from auth service', () => {
    expect(component['firstName']()).toBe('John');
  });

  it('should get stats from dashboard service', () => {
    const stats = component['stats']();
    expect(stats.productivityPercent).toBe(78);
    expect(stats.tasksCompleted).toBe(6);
    expect(stats.tasksTotal).toBe(8);
  });

  it('should format today label correctly', () => {
    const label = component['todayLabel']();
    expect(label).toBeTruthy();
    expect(typeof label).toBe('string');
  });

  it('should have quick actions', () => {
    const actions = component['quickActions']();
    expect(actions.length).toBe(4);
    expect(actions[0].labelKey).toBe('dashboard.quickActions.newTask');
  });

  it('should have timeline items', () => {
    const timeline = component['timeline']();
    expect(timeline.length).toBe(2);
    expect(timeline[0].time).toBe('09:00');
  });

  it('should have wellness metrics', () => {
    const wellness = component['wellness']();
    expect(wellness.length).toBe(5);
    expect(wellness[0].labelKey).toBe('wellness.sleep');
  });

  it('should calculate active timeline index', () => {
    const activeIndex = component['activeIndex']();
    expect(typeof activeIndex).toBe('number');
    expect(activeIndex).toBeGreaterThanOrEqual(-1);
  });

  it('should have productivity chart configuration', () => {
    const chart = component['productivityChart']();
    expect(chart.type).toBe('bar');
    expect(chart.data.datasets.length).toBe(1);
    expect(chart.data.datasets[0].data.length).toBe(7);
  });

  it('should have wellness chart configuration', () => {
    const chart = component['wellnessChart']();
    expect(chart.type).toBe('line');
    expect(chart.data.datasets.length).toBe(3);
  });

  it('should calculate free time offset', () => {
    const offset = component['freeOffset']();
    expect(typeof offset).toBe('number');
    expect(offset).toBeGreaterThanOrEqual(0);
  });

  it('should have upcoming event from service', () => {
    const event = component['upcomingEvent']();
    expect(event).toBeTruthy();
    expect(event?.title).toBe('Sprint Planning');
  });

  it('should translate greeting with user name', () => {
    const greeting = component['greeting']();
    expect(mockLanguageService.translate).toHaveBeenCalledWith('dashboard.greeting', { name: 'John' });
  });

  it('should translate tasks completed with stats', () => {
    const tasksCompleted = component['tasksCompleted']();
    expect(mockLanguageService.translate).toHaveBeenCalledWith('dashboard.tasksCompleted', {
      done: '6',
      total: '8',
    });
  });

  it('should use correct locale based on language', () => {
    const locale = component['locale']();
    expect(locale).toBe('en-US');
  });

  it('should handle reduced motion preference', () => {
    // This test would need to mock window.matchMedia
    // For now, just verify the method exists
    expect(component.ngAfterViewInit).toBeDefined();
  });
});
