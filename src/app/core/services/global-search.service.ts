import { Injectable, computed, inject, signal } from '@angular/core';
import {
  LucideLayoutDashboard,
  LucideCalendarDays,
  LucideListTodo,
  LucideCalendar,
  LucideHeartPulse,
  LucideApple,
  LucideDumbbell,
  LucideBot,
  LucideBell,
  LucideUser,
  LucideSettings,
  LucideShield,
  LucideCheckCircle,
  LucideClock,
  LucideZap,
  LucideUtensils,
  type LucideIcon,
} from '@lucide/angular';
import { LanguageService } from './language.service';
import { ALL_NAV_ITEMS, NAV_SECTIONS, ACCOUNT_ITEMS, ADMIN_ITEM, type NavItem } from '../models/navigation';
import { TaskService } from '../../features/tasks/services/task.service';
import { CalendarService } from '../../features/calendar/services/calendar.service';
import { NotificationService } from '../../features/notifications/services/notification.service';
import { PlanningService } from '../../features/planning/services/planning.service';
import { SportService } from '../../features/sport/services/sport.service';
import { NutritionService } from '../../features/nutrition/services/nutrition.service';
import {
  eventTitle,
  eventDetail,
  eventLocation,
  CATEGORY_KEYS as EVENT_CATEGORY_KEYS,
} from '../../features/calendar/models/calendar.models';
import { CATEGORY_KEYS as TASK_CATEGORY_KEYS } from '../../features/tasks/models/task.models';
import {
  CATEGORY_KEYS as PLANNING_CATEGORY_KEYS,
} from '../../features/planning/models/planning.models';
import {
  NOTIFICATION_TYPE_KEYS,
} from '../../features/notifications/models/notification.models';
import type { SearchResult, SearchResultGroup, SearchCategory } from '../models/search';

/** Strip accents/diacritics for accent-insensitive search. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchScore(query: string, target: string): number {
  const nq = normalize(query);
  const nt = normalize(target);
  if (nq === nt) return 0;
  if (nt.startsWith(nq)) return 1;
  if (nt.includes(nq)) return 2;
  return -1;
}

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  pages: 'search.categories.pages',
  tasks: 'search.categories.tasks',
  events: 'search.categories.events',
  planning: 'search.categories.planning',
  notifications: 'search.categories.notifications',
  workouts: 'search.categories.workouts',
  meals: 'search.categories.meals',
};

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private readonly languageService = inject(LanguageService);
  private readonly taskService = inject(TaskService);
  private readonly calendarService = inject(CalendarService);
  private readonly notificationService = inject(NotificationService);
  private readonly planningService = inject(PlanningService);
  private readonly sportService = inject(SportService);
  private readonly nutritionService = inject(NutritionService);

  readonly query = signal('');
  readonly isOpen = signal(false);
  readonly activeIndex = signal(0);

  private readonly tr = (key: string, vars?: Record<string, string>): string =>
    this.languageService.translate(key, vars);

  /** All flat search results computed from live data. */
  private readonly allResults = computed<SearchResult[]>(() => {
    const results: SearchResult[] = [];
    const t = (key: string) => this.languageService.translate(key);

    // A. Navigation / pages
    for (const nav of ALL_NAV_ITEMS) {
      results.push({
        id: `nav-${nav.path}`,
        category: 'pages',
        title: t(nav.labelKey),
        subtitle: t(nav.descriptionKey),
        path: nav.path,
        icon: nav.icon,
        rank: 3,
      });
    }

    // B. Tasks
    for (const task of this.taskService.tasks()) {
      const categoryLabel = t(TASK_CATEGORY_KEYS[task.category]);
      const statusLabel = task.status === 'done' ? t('statuses.done') :
        task.status === 'in-progress' ? t('statuses.inProgress') : t('statuses.todo');
      results.push({
        id: `task-${task.id}`,
        category: 'tasks',
        title: task.title,
        subtitle: `${categoryLabel} · ${statusLabel}`,
        path: '/tasks',
        icon: task.status === 'done' ? LucideCheckCircle : LucideListTodo,
        rank: task.status === 'done' ? 4 : 2,
      });
    }

    // C. Calendar events
    const translate = (key: string, vars?: Record<string, string>) => this.languageService.translate(key, vars);
    for (const event of this.calendarService.events()) {
      const title = eventTitle(event, translate);
      if (!title) continue;
      const detail = eventDetail(event, translate);
      const location = eventLocation(event, translate);
      const categoryLabel = t(EVENT_CATEGORY_KEYS[event.category]);
      results.push({
        id: `event-${event.id}`,
        category: 'events',
        title,
        subtitle: [categoryLabel, detail, location].filter(Boolean).join(' · '),
        path: '/calendar',
        icon: LucideCalendar,
        rank: 3,
      });
    }

    // D. Planning entries
    for (const entry of this.planningService.entries()) {
      const categoryLabel = t(PLANNING_CATEGORY_KEYS[entry.category]);
      results.push({
        id: `plan-${entry.id}`,
        category: 'planning',
        title: entry.title,
        subtitle: [categoryLabel, entry.description, entry.location].filter(Boolean).join(' · '),
        path: '/planning',
        icon: LucideCalendarDays,
        rank: 3,
      });
    }

    // E. Notifications
    for (const notif of this.notificationService.notifications()) {
      results.push({
        id: `notif-${notif.id}`,
        category: 'notifications',
        title: t(notif.titleKey),
        subtitle: t(notif.messageKey),
        path: '/notifications',
        icon: LucideBell,
        rank: 4,
      });
    }

    // F. Workouts
    for (const workout of this.sportService.workouts()) {
      results.push({
        id: `workout-${workout.id}`,
        category: 'workouts',
        title: workout.title,
        subtitle: workout.notes || `${workout.duration} min`,
        path: '/sport',
        icon: LucideDumbbell,
        rank: 4,
      });
    }

    // G. Meals
    for (const meal of this.nutritionService.meals()) {
      results.push({
        id: `meal-${meal.id}`,
        category: 'meals',
        title: meal.name,
        subtitle: meal.foods.join(', '),
        path: '/nutrition',
        icon: LucideUtensils,
        rank: 4,
      });
    }

    return results;
  });

  /** Grouped and filtered results for the current query. */
  readonly results = computed<SearchResultGroup[]>(() => {
    const q = this.query().trim();
    if (!q) return [];

    const all = this.allResults();
    const matched: SearchResult[] = [];

    for (const item of all) {
      const titleScore = matchScore(q, item.title);
      const subtitleScore = matchScore(q, item.subtitle);

      if (titleScore >= 0 || subtitleScore >= 0) {
        const bestRank = titleScore >= 0 ? titleScore : subtitleScore + 1;
        matched.push({ ...item, rank: Math.min(item.rank, bestRank) });
      }
    }

    matched.sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title));

    // Group by category
    const groups = new Map<SearchCategory, SearchResult[]>();
    for (const item of matched) {
      const existing = groups.get(item.category) ?? [];
      existing.push(item);
      groups.set(item.category, existing);
    }

    const result: SearchResultGroup[] = [];
    const categoryOrder: SearchCategory[] = ['pages', 'tasks', 'events', 'planning', 'workouts', 'meals', 'notifications'];
    for (const cat of categoryOrder) {
      const items = groups.get(cat);
      if (items && items.length > 0) {
        result.push({
          category: cat,
          labelKey: CATEGORY_LABELS[cat],
          items,
        });
      }
    }

    return result;
  });

  /** Flat list of all matched results for keyboard navigation. */
  readonly flatResults = computed(() =>
    this.results().flatMap((group) => group.items),
  );

  readonly hasResults = computed(() => this.flatResults().length > 0);
  readonly totalResults = computed(() => this.flatResults().length);

  setQuery(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.query.set('');
    this.activeIndex.set(0);
  }

  moveUp(): void {
    const total = this.flatResults().length;
    if (total === 0) return;
    this.activeIndex.set((this.activeIndex() - 1 + total) % total);
  }

  moveDown(): void {
    const total = this.flatResults().length;
    if (total === 0) return;
    this.activeIndex.set((this.activeIndex() + 1) % total);
  }

  getActiveResult(): SearchResult | null {
    return this.flatResults()[this.activeIndex()] ?? null;
  }

  categoryLabelKey(category: SearchCategory): string {
    return CATEGORY_LABELS[category];
  }
}
