import { AfterViewInit, Component, ElementRef, inject, viewChild, computed, OnInit } from '@angular/core';
import { type ChartConfiguration } from 'chart.js/auto';
import {
  LucideActivity,
  LucideArrowRight,
  LucideBriefcase,
  LucideCalendar,
  LucideCalendarClock,
  LucideCalendarPlus,
  LucideCode2,
  LucideDroplets,
  LucideDumbbell,
  LucideDynamicIcon,
  LucideMapPin,
  LucideMoon,
  LucidePalette,
  LucidePlus,
  LucideSmile,
  LucideSparkles,
  LucideTarget,
  LucideTrendingUp,
  LucideUsers,
  LucideUtensils,
  LucideVideo,
  LucideWind,
  type LucideIcon,
} from '@lucide/angular';
import { ChartDirective } from '../../shared/directives/chart/chart';
import { Button } from '../../shared/ui/button/button';
import { Badge } from '../../shared/ui/badge/badge';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { AuthService } from '../../core/services/auth/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';

interface TimelineItem {
  time: string;
  titleKey: string;
  detailKey: string;
  icon: LucideIcon;
  title: string;
  detail: string;
}

interface WellnessMetric {
  labelKey: string;
  valueKey: string;
  noteKey: string;
  icon: LucideIcon;
  level: number;
  chip: string;
  bar: string;
  label: string;
  value: string;
  note: string;
}

interface QuickAction {
  labelKey: string;
  label: string;
  icon: LucideIcon;
}

const FREE_RADIUS = 28;
const FREE_CIRCUMFERENCE = 2 * Math.PI * FREE_RADIUS;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    LucideDynamicIcon,
    LucideTrendingUp,
    LucideTarget,
    LucideSparkles,
    LucideArrowRight,
    LucideCalendar,
    LucideMapPin,
    LucideVideo,
    ChartDirective,
    Button,
    Badge,
    Avatar,
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  protected readonly freeCircumference = FREE_CIRCUMFERENCE;
  
  private readonly authService = inject(AuthService);
  protected readonly languageService = inject(LanguageService);
  private readonly dashboardService = inject(DashboardService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly prodCount = viewChild<ElementRef<HTMLElement>>('prodCount');
  private readonly freeRing = viewChild<ElementRef<HTMLElement>>('freeRing');

  // Computed properties
  protected readonly firstName = computed(() => 
    this.authService.currentUser()?.firstName ?? 'User'
  );

  protected readonly stats = computed(() => 
    this.dashboardService.stats() ?? {
      productivityPercent: 0,
      tasksCompleted: 0,
      tasksTotal: 0,
      focusTime: '0h 0m',
      breaksTaken: 0,
      goalsMetPercent: 0,
      aiConfidence: 0,
      freeTimeTotal: '0h 0m',
      freeTimeEvening: '0h 0m',
      freeTimeLunch: '0h 0m',
    }
  );

  protected readonly freeOffset = computed(() => {
    const stats = this.stats();
    // Calculate free time ratio (example: 3h15m out of 4h = 0.8125)
    const ratio = stats.productivityPercent / 100;
    return FREE_CIRCUMFERENCE * (1 - ratio);
  });

  protected readonly upcomingEvent = this.dashboardService.upcomingEvent;

  protected readonly locale = computed(() =>
    this.languageService.activeLanguage() === 'fr'
      ? 'fr-FR'
      : this.languageService.activeLanguage() === 'en'
        ? 'en-US'
        : 'ar-EG',
  );

  protected readonly todayLabel = computed(() =>
    new Intl.DateTimeFormat(this.locale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
  );

  // Translation signals
  protected readonly greeting = computed(() =>
    this.languageService.translate('dashboard.greeting', { name: this.firstName() })
  );
  protected readonly subtitle = this.languageService.translateSignal('dashboard.subtitle');
  protected readonly balanced = this.languageService.translateSignal('dashboard.balanced');
  protected readonly productivity = this.languageService.translateSignal('dashboard.productivity');
  protected readonly dayOverview = this.languageService.translateSignal('dashboard.dayOverview');
  protected readonly vsYesterday = this.languageService.translateSignal('dashboard.vsYesterday');
  
  protected readonly tasksCompleted = computed(() => {
    const stats = this.stats();
    return this.languageService.translate('dashboard.tasksCompleted', {
      done: String(stats.tasksCompleted),
      total: String(stats.tasksTotal),
    });
  });
  
  protected readonly dailyGoal = this.languageService.translateSignal('dashboard.dailyGoal');
  protected readonly focusTime = this.languageService.translateSignal('dashboard.focusTime');
  protected readonly breaksTaken = this.languageService.translateSignal('dashboard.breaksTaken');
  protected readonly goalsMet = this.languageService.translateSignal('dashboard.goalsMet');
  protected readonly aiInsight = this.languageService.translateSignal('dashboard.aiInsight');
  protected readonly recommendation = this.languageService.translateSignal('dashboard.recommendation');
  
  protected readonly confidence = computed(() =>
    this.languageService.translate('dashboard.confidence', {
      value: String(this.stats().aiConfidence),
    })
  );
  
  protected readonly energyText = this.languageService.translateSignal('dashboard.energyText');
  protected readonly modelReliability = this.languageService.translateSignal('dashboard.modelReliability');
  protected readonly seeAnalysis = this.languageService.translateSignal('dashboard.seeAnalysis');
  protected readonly today = this.languageService.translateSignal('dashboard.today');
  protected readonly yourProgram = this.languageService.translateSignal('dashboard.yourProgram');
  protected readonly now = this.languageService.translateSignal('dashboard.now');
  protected readonly inProgress = this.languageService.translateSignal('dashboard.inProgress');
  protected readonly upcoming = this.languageService.translateSignal('dashboard.upcoming');
  protected readonly work = this.languageService.translateSignal('dashboard.work');
  protected readonly eventTime = this.languageService.translateSignal('dashboard.eventTime');
  protected readonly meetingTitle = this.languageService.translateSignal('dashboard.meetingTitle');
  protected readonly location = this.languageService.translateSignal('dashboard.location');
  protected readonly online = this.languageService.translateSignal('dashboard.online');
  protected readonly join = this.languageService.translateSignal('dashboard.join');
  protected readonly wellbeing = this.languageService.translateSignal('dashboard.wellbeing');
  protected readonly balancedBadge = this.languageService.translateSignal('dashboard.balancedBadge');
  protected readonly freeTime = this.languageService.translateSignal('dashboard.freeTime');
  protected readonly freeTimeToday = this.languageService.translateSignal('dashboard.freeTimeToday');
  protected readonly endOfDay = this.languageService.translateSignal('dashboard.endOfDay');
  protected readonly lunchBreak = this.languageService.translateSignal('dashboard.lunchBreak');
  protected readonly thisWeek = this.languageService.translateSignal('dashboard.thisWeek');
  protected readonly weeklyAverage = this.languageService.translateSignal('dashboard.weeklyAverage');

  // Quick actions
  protected readonly quickActions = computed<QuickAction[]>(() => [
    {
      labelKey: 'dashboard.quickActions.newTask',
      label: this.languageService.translate('dashboard.quickActions.newTask'),
      icon: LucidePlus,
    },
    {
      labelKey: 'dashboard.quickActions.newEvent',
      label: this.languageService.translate('dashboard.quickActions.newEvent'),
      icon: LucideCalendarPlus,
    },
    {
      labelKey: 'dashboard.quickActions.planDay',
      label: this.languageService.translate('dashboard.quickActions.planDay'),
      icon: LucideCalendarClock,
    },
    {
      labelKey: 'dashboard.quickActions.askAI',
      label: this.languageService.translate('dashboard.quickActions.askAI'),
      icon: LucideSparkles,
    },
  ]);

  // Timeline from service
  protected readonly timeline = computed<TimelineItem[]>(() => {
    const timelineData = this.dashboardService.timeline();
    return timelineData.map(item => ({
      time: item.time,
      titleKey: `dashboard.timeline.${item.type}`,
      title: item.title,
      detailKey: `dashboard.timeline.${item.type}Detail`,
      detail: item.detail,
      icon: this.getIconForType(item.type),
    }));
  });

  // Wellness metrics from service
  protected readonly wellness = computed<WellnessMetric[]>(() => {
    const wellnessData = this.dashboardService.wellness();
    if (!wellnessData) return [];
    
    return [
      {
        labelKey: 'wellness.sleep',
        label: this.languageService.translate('wellness.sleep'),
        valueKey: 'wellness.sleep',
        value: wellnessData.sleep.value,
        noteKey: 'wellness.sleepTarget',
        note: this.languageService.translate('wellness.sleepTarget'),
        icon: LucideMoon,
        level: wellnessData.sleep.level,
        chip: 'bg-primary/10 text-primary',
        bar: 'bg-primary',
      },
      {
        labelKey: 'wellness.hydration',
        label: this.languageService.translate('wellness.hydration'),
        valueKey: 'wellness.hydration',
        value: wellnessData.hydration.value,
        noteKey: 'wellness.hydrationTarget',
        note: this.languageService.translate('wellness.hydrationTarget'),
        icon: LucideDroplets,
        level: wellnessData.hydration.level,
        chip: 'bg-teal-50 text-accent-dark',
        bar: 'bg-accent',
      },
      {
        labelKey: 'wellness.activity',
        label: this.languageService.translate('wellness.activity'),
        valueKey: 'wellness.activity',
        value: String(wellnessData.activity.value),
        noteKey: 'wellness.activityNote',
        note: this.languageService.translate('wellness.activityNote'),
        icon: LucideActivity,
        level: wellnessData.activity.level,
        chip: 'bg-success-light text-success',
        bar: 'bg-success',
      },
      {
        labelKey: 'wellness.nutrition',
        label: this.languageService.translate('wellness.nutrition'),
        valueKey: 'wellness.nutrition',
        value: String(wellnessData.nutrition.value),
        noteKey: 'wellness.nutritionNote',
        note: this.languageService.translate('wellness.nutritionNote'),
        icon: LucideUtensils,
        level: wellnessData.nutrition.level,
        chip: 'bg-warning-light text-warning',
        bar: 'bg-warning',
      },
      {
        labelKey: 'wellness.mood',
        label: this.languageService.translate('wellness.mood'),
        valueKey: 'wellness.mood',
        value: String(wellnessData.mood.value),
        noteKey: 'wellness.moodNote',
        note: this.languageService.translate('wellness.moodNote'),
        icon: LucideSmile,
        level: wellnessData.mood.level,
        chip: 'bg-teal-50 text-accent-dark',
        bar: 'bg-accent',
      },
    ];
  });

  // Charts
  protected readonly productivityChart = computed<ChartConfiguration<'bar'>>(() => {
    const weeklyData = this.dashboardService.weeklyProductivity();
    const labels = weeklyData?.labels ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = weeklyData?.completed ?? [0, 0, 0, 0, 0, 0, 0];
    
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: this.languageService.translate('dashboard.chart.productivity'),
            data,
            backgroundColor: '#2A9D9D',
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 18,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1B3A57',
            titleColor: '#FFFFFF',
            bodyColor: 'rgba(255,255,255,0.8)',
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: 'var(--color-ink-faint)', font: { size: 11 } },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(42,157,157,0.08)' },
            border: { display: false },
            ticks: { color: 'var(--color-ink-faint)', font: { size: 10 }, maxTicksLimit: 5 },
          },
        },
      },
    };
  });

  protected readonly wellnessChart = computed<ChartConfiguration<'line'>>(() => {
    const weeklyData = this.dashboardService.weeklyWellness();
    const labels = weeklyData?.labels ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: this.languageService.translate('dashboard.chart.sleep'),
            data: weeklyData?.sleep ?? [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#1B3A57',
            backgroundColor: '#1B3A57',
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            label: this.languageService.translate('dashboard.chart.activity'),
            data: weeklyData?.activity ?? [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#2A9D9D',
            backgroundColor: '#2A9D9D',
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            label: this.languageService.translate('dashboard.chart.nutrition'),
            data: weeklyData?.nutrition ?? [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#7FD1D1',
            backgroundColor: '#7FD1D1',
            tension: 0.35,
            borderWidth: 2,
            borderDash: [4, 4],
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 6,
              boxHeight: 6,
              padding: 14,
              color: 'var(--color-ink-muted)',
              font: { size: 11 },
            },
          },
          tooltip: {
            backgroundColor: '#1B3A57',
            titleColor: '#FFFFFF',
            bodyColor: 'rgba(255,255,255,0.8)',
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: 'var(--color-ink-faint)', font: { size: 10 } },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(42,157,157,0.08)' },
            border: { display: false },
            ticks: { display: false },
          },
        },
      },
    };
  });

  // Active timeline index
  private readonly nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  
  protected readonly activeIndex = computed(() => {
    return this.timeline().reduce((active, item, index) => {
      const [hours, minutes] = item.time.split(':').map(Number);
      return hours * 60 + minutes <= this.nowMinutes ? index : active;
    }, -1);
  });

  ngOnInit(): void {
    // Load all dashboard data
    this.dashboardService.loadAll();
  }

  /**
   * Get translated text for "others" count
   */
  protected othersText(count: number): string {
    return this.languageService.translate('dashboard.others', { count: String(count) });
  }

  ngAfterViewInit(): void {
    const root = this.host.nativeElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const count = this.prodCount()?.nativeElement;
    if (count && reduced) {
      count.textContent = String(this.stats().productivityPercent);
    }

    if (reduced) {
      return;
    }

    // Animate dashboard elements
    import('gsap').then(({ default: gsap }) => {
      // Reveal cards
      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('[data-reveal]'),
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'transform',
          onComplete: function(this: HTMLElement) {
            this.classList.add('revealed');
          },
        },
      );

      // Animate progress bars and counters
      gsap.delayedCall(0.2, () => {
        root.querySelectorAll<HTMLElement>('[data-fill]').forEach((el) => {
          const parent = el.closest('section');
          if (!parent) return;
          
          let target = this.stats().productivityPercent / 100;
          if (parent.textContent?.includes('82%')) {
            target = this.stats().aiConfidence / 100;
          }
          
          gsap.fromTo(
            el,
            { scaleX: 0 },
            { scaleX: target, duration: 1, ease: 'power3.out', transformOrigin: 'left center' },
          );
        });

        // Animate productivity counter
        if (count) {
          const proxy = { value: 0 };
          gsap.to(proxy, {
            value: this.stats().productivityPercent,
            duration: 1.4,
            ease: 'power3.out',
            onUpdate: () => {
              count.textContent = String(Math.round(proxy.value));
            },
          });
        }

        // Animate free time ring
        const ring = this.freeRing()?.nativeElement;
        if (ring) {
          gsap.fromTo(
            ring,
            { strokeDashoffset: FREE_CIRCUMFERENCE },
            {
              strokeDashoffset: this.freeOffset(),
              duration: 1.4,
              ease: 'power3.out',
            },
          );
        }
      });

      // Animate timeline items
      gsap.delayedCall(0.4, () => {
        gsap.fromTo(
          root.querySelectorAll<HTMLElement>('.timeline-item'),
          { opacity: 0, x: 8 },
          { opacity: 1, x: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out' },
        );
      });
    });
  }

  /**
   * Get icon for timeline event type
   */
  private getIconForType(type: string): LucideIcon {
    switch (type) {
      case 'work':
        return LucideBriefcase;
      case 'meeting':
        return LucideUsers;
      case 'break':
        return LucideUtensils;
      case 'personal':
        return LucidePalette;
      default:
        return LucideCode2;
    }
  }
}
