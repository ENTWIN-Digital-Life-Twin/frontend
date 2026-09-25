import { AfterViewInit, Component, ElementRef, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  LucideDynamicIcon,
  LucideMapPin,
  LucideMoon,
  LucidePalette,
  LucidePlus,
  LucideSmile,
  LucideSparkles,
  LucideTarget,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideUsers,
  LucideUtensils,
  type LucideIcon,
} from '@lucide/angular';
import {
  DashboardSection,
  DashboardService,
} from '../../core/services/dashboard/dashboard.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { ChartDirective } from '../../shared/directives/chart/chart';
import { Badge, type BadgeVariant } from '../../shared/ui/badge/badge';
import { Button } from '../../shared/ui/button/button';

interface TimelineItem {
  time: string;
  title: string;
  detail: string;
  icon: LucideIcon;
}

interface WellnessMetric {
  labelKey: string;
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  level: number;
  chip: string;
  bar: string;
  route: string;
}

interface QuickAction {
  labelKey: string;
  label: string;
  icon: LucideIcon;
  route: string;
  queryParams?: Record<string, string>;
}

const FREE_RADIUS = 28;
const FREE_CIRCUMFERENCE = 2 * Math.PI * FREE_RADIUS;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    RouterLink,
    LucideDynamicIcon,
    LucideTrendingUp,
    LucideTrendingDown,
    LucideTarget,
    LucideSparkles,
    LucideArrowRight,
    LucideCalendar,
    LucideMapPin,
    ChartDirective,
    Button,
    Badge,
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  protected readonly freeCircumference = FREE_CIRCUMFERENCE;

  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  protected readonly dashboardService = inject(DashboardService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly state = this.dashboardService.state;
  protected readonly stats = this.dashboardService.stats;
  protected readonly upcomingEvent = this.dashboardService.upcomingEvent;

  protected readonly firstName = computed(
    () => this.authService.currentUser()?.firstName ?? this.languageService.translate('dashboard.user'),
  );
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
  protected readonly greeting = computed(() =>
    this.languageService.translate('dashboard.greeting', { name: this.firstName() }),
  );

  protected readonly subtitle = this.languageService.translateSignal('dashboard.subtitle');
  protected readonly productivity = this.languageService.translateSignal('dashboard.productivity');
  protected readonly dayOverview = this.languageService.translateSignal('dashboard.dayOverview');
  protected readonly focusTime = this.languageService.translateSignal('dashboard.focusTime');
  protected readonly occupiedTime = this.languageService.translateSignal('dashboard.occupiedTime');
  protected readonly goalsMet = this.languageService.translateSignal('dashboard.goalsMet');
  protected readonly aiInsight = this.languageService.translateSignal('dashboard.aiInsight');
  protected readonly recommendation = this.languageService.translateSignal('dashboard.recommendation');
  protected readonly seeAnalysis = this.languageService.translateSignal('dashboard.seeAnalysis');
  protected readonly today = this.languageService.translateSignal('dashboard.today');
  protected readonly yourProgram = this.languageService.translateSignal('dashboard.yourProgram');
  protected readonly now = this.languageService.translateSignal('dashboard.now');
  protected readonly inProgress = this.languageService.translateSignal('dashboard.inProgress');
  protected readonly upcoming = this.languageService.translateSignal('dashboard.upcoming');
  protected readonly wellbeing = this.languageService.translateSignal('dashboard.wellbeing');
  protected readonly freeTime = this.languageService.translateSignal('dashboard.freeTime');
  protected readonly freeTimeToday = this.languageService.translateSignal('dashboard.freeTimeToday');
  protected readonly thisWeek = this.languageService.translateSignal('dashboard.thisWeek');
  protected readonly loading = this.languageService.translateSignal('common.loading');
  protected readonly retryLabel = this.languageService.translateSignal('common.retry');
  protected readonly viewAll = this.languageService.translateSignal('dashboard.viewAll');
  protected readonly noTimeline = this.languageService.translateSignal('dashboard.noTimeline');
  protected readonly noUpcoming = this.languageService.translateSignal('dashboard.noUpcoming');
  protected readonly noWellness = this.languageService.translateSignal('dashboard.noWellness');
  protected readonly noChartData = this.languageService.translateSignal('dashboard.noChartData');
  protected readonly loadError = this.languageService.translateSignal('dashboard.loadError');
  protected readonly openAssistant = this.languageService.translateSignal('dashboard.openAssistant');
  protected readonly viewCalendar = this.languageService.translateSignal('dashboard.viewCalendar');

  protected readonly quickActions = computed<QuickAction[]>(() => [
    {
      labelKey: 'dashboard.quickActions.newTask',
      label: this.languageService.translate('dashboard.quickActions.newTask'),
      icon: LucidePlus,
      route: '/tasks',
      queryParams: { create: 'true' },
    },
    {
      labelKey: 'dashboard.quickActions.newEvent',
      label: this.languageService.translate('dashboard.quickActions.newEvent'),
      icon: LucideCalendarPlus,
      route: '/calendar',
      queryParams: { create: 'true' },
    },
    {
      labelKey: 'dashboard.quickActions.planDay',
      label: this.languageService.translate('dashboard.quickActions.planDay'),
      icon: LucideCalendarClock,
      route: '/planning',
    },
    {
      labelKey: 'dashboard.quickActions.askAI',
      label: this.languageService.translate('dashboard.quickActions.askAI'),
      icon: LucideSparkles,
      route: '/assistant',
    },
  ]);

  protected readonly statusLabel = computed(() =>
    this.languageService.translate(
      this.stats()?.overloaded ? 'dashboard.statusOverloaded' : 'dashboard.statusBalanced',
    ),
  );
  protected readonly statusVariant = computed<BadgeVariant>(() =>
    this.stats()?.overloaded ? 'warning' : 'success',
  );
  protected readonly productivityChange = computed(() => {
    const change = this.stats()?.productivityChangePercent ?? 0;
    return this.languageService.translate('dashboard.changeFromYesterday', {
      value: `${change > 0 ? '+' : ''}${change}`,
    });
  });
  protected readonly tasksCompleted = computed(() => {
    const stats = this.stats();
    return this.languageService.translate('dashboard.tasksCompleted', {
      done: String(stats?.tasksCompleted ?? 0),
      total: String(stats?.tasksTotal ?? 0),
    });
  });
  protected readonly freeOffset = computed(() => {
    const stats = this.stats();
    if (!stats) return FREE_CIRCUMFERENCE;
    const total = stats.freeMinutes + stats.occupiedMinutes;
    const ratio = total === 0 ? 0 : stats.freeMinutes / total;
    return FREE_CIRCUMFERENCE * (1 - ratio);
  });
  protected readonly weeklyAverage = computed(() => {
    const data = this.dashboardService.weeklyProductivity();
    if (!data) return '';
    const total = data.tasksTotal.reduce((sum, value) => sum + value, 0);
    const completed = data.tasksCompleted.reduce((sum, value) => sum + value, 0);
    const average = total === 0 ? 0 : Math.round((completed * 100) / total);
    return this.languageService.translate('dashboard.weeklyAverageValue', {
      value: String(average),
    });
  });

  protected readonly timeline = computed<TimelineItem[]>(() =>
    this.dashboardService.timeline().map((item) => ({
      time: item.time,
      title: item.title,
      detail: item.detail,
      icon: this.getIconForType(item.type),
    })),
  );
  protected readonly wellness = computed<WellnessMetric[]>(() => {
    const data = this.dashboardService.wellness();
    if (!data) return [];
    return [
      this.metric('wellness.sleep', data.sleep.value, 'wellness.sleepTarget', LucideMoon, data.sleep.level, 'bg-primary/10 text-primary', 'bg-primary', '/wellness'),
      this.metric('wellness.hydration', data.hydration.value, 'wellness.hydrationTarget', LucideDroplets, data.hydration.level, 'bg-teal-50 text-accent-dark', 'bg-accent', '/wellness'),
      this.metric('wellness.activity', data.activity.value, 'wellness.activityNote', LucideActivity, data.activity.level, 'bg-success-light text-success', 'bg-success', '/sport'),
      this.metric('wellness.nutrition', data.nutrition.value, 'wellness.nutritionNote', LucideUtensils, data.nutrition.level, 'bg-warning-light text-warning', 'bg-warning', '/nutrition'),
      this.metric('wellness.mood', data.mood.value, 'wellness.moodNote', LucideSmile, data.mood.level, 'bg-teal-50 text-accent-dark', 'bg-accent', '/wellness'),
    ];
  });

  protected readonly productivityChart = computed<ChartConfiguration<'bar'>>(() => ({
    type: 'bar',
    data: {
      labels: this.dashboardService.weeklyProductivity()?.labels ?? [],
      datasets: [
        {
          label: this.languageService.translate('dashboard.chart.productivity'),
          data: this.dashboardService.weeklyProductivity()?.productivity ?? [],
          backgroundColor: '#2A9D9D',
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 18,
        },
      ],
    },
    options: this.barChartOptions(),
  }));
  protected readonly wellnessChart = computed<ChartConfiguration<'line'>>(() => {
    const data = this.dashboardService.weeklyWellness();
    return {
      type: 'line',
      data: {
        labels: data?.labels ?? [],
        datasets: [
          this.lineDataset('dashboard.chart.sleep', data?.sleep ?? [], '#1B3A57'),
          this.lineDataset('dashboard.chart.activity', data?.activity ?? [], '#2A9D9D'),
          { ...this.lineDataset('dashboard.chart.nutrition', data?.nutrition ?? [], '#7FD1D1'), borderDash: [4, 4] },
        ],
      },
      options: this.lineChartOptions(),
    };
  });
  protected readonly activeIndex = computed(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return this.timeline().reduce((active, item, index) => {
      const [hours, minutes] = item.time.split(':').map(Number);
      return hours * 60 + minutes <= nowMinutes ? index : active;
    }, -1);
  });

  ngOnInit(): void {
    this.dashboardService.loadAll();
  }

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        this.host.nativeElement.querySelectorAll<HTMLElement>('[data-reveal]'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: 'transform' },
      );
    });
  }

  protected isLoading(section: DashboardSection): boolean {
    return this.state()[section] === 'loading' || this.state()[section] === 'idle';
  }

  protected hasError(section: DashboardSection): boolean {
    return this.state()[section] === 'error';
  }

  protected retry(section: DashboardSection): void {
    this.dashboardService.retry(section);
  }

  protected formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  protected eventTypeLabel(type: string): string {
    return type.toLowerCase().replaceAll('_', ' ');
  }

  private metric(
    labelKey: string,
    value: string,
    noteKey: string,
    icon: LucideIcon,
    level: number | null,
    chip: string,
    bar: string,
    route: string,
  ): WellnessMetric {
    return {
      labelKey,
      label: this.languageService.translate(labelKey),
      value,
      note: this.languageService.translate(noteKey),
      icon,
      level: level ?? 0,
      chip,
      bar,
      route,
    };
  }

  private lineDataset(labelKey: string, data: number[], color: string) {
    return {
      label: this.languageService.translate(labelKey),
      data,
      borderColor: color,
      backgroundColor: color,
      tension: 0.35,
      borderWidth: 2,
      pointRadius: 0,
    };
  }

  private barChartOptions(): ChartConfiguration<'bar'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { min: 0, max: 100, border: { display: false }, ticks: { maxTicksLimit: 5 } },
      },
    };
  }

  private lineChartOptions(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, boxHeight: 6, padding: 14 },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { min: 0, max: 100, border: { display: false }, ticks: { maxTicksLimit: 5 } },
      },
    };
  }

  private getIconForType(type: string): LucideIcon {
    switch (type.toLowerCase()) {
      case 'work':
        return LucideBriefcase;
      case 'meeting':
      case 'appointment':
        return LucideUsers;
      case 'break':
        return LucideUtensils;
      case 'personal':
        return LucidePalette;
      case 'study':
        return LucideCode2;
      case 'health':
        return LucideMoon;
      case 'sport':
        return LucideActivity;
      default:
        return LucideCalendarClock;
    }
  }
}
