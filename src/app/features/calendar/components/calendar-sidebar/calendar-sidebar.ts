import { Component, inject } from '@angular/core';
import {
  LucideBarChart3,
  LucideCalendarClock,
  LucideClock,
  LucideSparkles,
  LucideSun,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import {
  CATEGORY_KEYS,
  CATEGORY_VISUALS,
  eventLocation,
  eventTitle,
  formatDayMonth,
  formatLongDate,
  minutesToLabel,
  todayISO,
  type CalendarEvent,
  type EventCategory,
} from '../../models/calendar.models';
import { CalendarService } from '../../services/calendar.service';

@Component({
  selector: 'app-calendar-sidebar',
  imports: [
    LucideBarChart3,
    LucideCalendarClock,
    LucideClock,
    LucideSparkles,
    LucideSun,
  ],
  template: `
    <aside class="flex flex-col gap-4">
      <section class="rounded-card border border-line bg-surface p-4 shadow-card">
        <div class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-panel bg-primary/10 text-primary">
            <svg lucideCalendarClock class="h-4 w-4" aria-hidden="true"></svg>
          </span>
          <div>
            <h3 class="font-display text-sm font-semibold text-primary">{{ upcoming() }}</h3>
            <p class="text-[11px] text-ink-muted">{{ upcomingHint() }}</p>
          </div>
        </div>

        @if (service.upcoming().length === 0) {
          <p class="mt-3 rounded-panel bg-surface-muted/60 px-3 py-2.5 text-xs text-ink-muted">
            {{ noUpcoming() }}
          </p>
        } @else {
          <ul class="mt-3 flex flex-col gap-1">
            @for (event of service.upcoming(); track event.id) {
              <li>
                <button
                  type="button"
                  class="group flex w-full items-center gap-3 rounded-panel px-2 py-2 text-left transition-colors hover:bg-surface-muted"
                  [attr.data-event-id]="event.id"
                  (click)="openEvent(event)"
                >
                  <span class="flex w-12 shrink-0 flex-col items-center rounded-md py-1" [class]="CATEGORY_VISUALS[event.category].chip">
                    <span class="text-[10px] font-semibold uppercase tabular-nums">{{ dayLabel(event.date) }}</span>
                    <span class="text-[11px] font-bold tabular-nums">{{ event.start }}</span>
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-semibold text-primary">{{ titleOf(event) }}</span>
                    <span class="block text-[11px] text-ink-muted">
                      {{ categoryLabel(event.category) }}
                      @if (locationOf(event)) {
                        · {{ locationOf(event) }}
                      }
                    </span>
                  </span>
                  <span class="h-2 w-2 shrink-0 rounded-full" [class]="CATEGORY_VISUALS[event.category].dot"></span>
                </button>
              </li>
            }
          </ul>
        }
      </section>

      <section class="rounded-card border border-line bg-surface p-4 shadow-card">
        <div class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-panel bg-amber-100 text-amber-600">
            <svg lucideSun class="h-4 w-4" aria-hidden="true"></svg>
          </span>
          <div>
            <h3 class="font-display text-sm font-semibold text-primary">{{ sidebarToday() }}</h3>
            <p class="text-[11px] text-ink-muted">{{ formatLongDate(today) }}</p>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between rounded-panel bg-surface-muted/60 px-3 py-2 text-sm">
          <span class="font-semibold tabular-nums text-primary">
            {{ eventCountLabel() }}
          </span>
          <span class="flex items-center gap-1 text-xs font-medium text-ink-muted">
            <svg lucideClock class="h-3.5 w-3.5 text-accent-dark" aria-hidden="true"></svg>
            {{ freeTimeOfDay() }}
          </span>
        </div>

        <div class="mt-3">
          <div class="flex items-center justify-between text-[11px] font-medium text-ink-muted">
            <span class="flex items-center gap-1">
              <svg lucideBarChart3 class="h-3.5 w-3.5" aria-hidden="true"></svg>
              {{ dayLoad() }}
            </span>
            <span class="tabular-nums">{{ service.todaySummary().loadPercent }}%</span>
          </div>
          <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              class="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-700"
              [style.width.%]="service.todaySummary().loadPercent"
            ></div>
          </div>
          <p class="mt-1.5 text-[11px] text-ink-muted">
            {{ plannedHint() }}
          </p>
        </div>
      </section>

      <section class="rounded-card border border-line bg-surface p-4 shadow-card">
        <div class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-panel bg-teal-50 text-accent-dark">
            <svg lucideClock class="h-4 w-4" aria-hidden="true"></svg>
          </span>
          <div>
            <h3 class="font-display text-sm font-semibold text-primary">{{ freeTime() }}</h3>
            <p class="text-[11px] text-ink-muted">{{ formatDayMonth(service.selectedDate()) }}</p>
          </div>
        </div>

        @if (service.freeSlots().length === 0) {
          <p class="mt-3 rounded-panel bg-surface-muted/60 px-3 py-2.5 text-xs text-ink-muted">
            {{ noFreeTime() }}
          </p>
        } @else {
          <ul class="mt-3 flex flex-col gap-1.5">
            @for (slot of service.freeSlots(); track slot.start) {
              <li class="flex items-center gap-2 rounded-panel border border-accent/25 bg-teal-50/60 px-2.5 py-2">
                <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
                <span class="text-xs font-semibold tabular-nums text-accent-dark">
                  {{ slot.start }} – {{ slot.end }}
                </span>
                <span class="ml-auto text-[11px] font-medium tabular-nums text-ink-muted">
                  {{ minutesLabel(slot.minutes) }}
                </span>
              </li>
            }
          </ul>
        }
      </section>

      <section class="relative overflow-hidden rounded-card border border-accent/25 bg-gradient-to-br from-teal-50 via-surface to-surface p-4 shadow-card">
        <div class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-panel bg-accent/15 text-accent-dark">
            <svg lucideSparkles class="h-4 w-4" aria-hidden="true"></svg>
          </span>
          <div>
            <h3 class="font-display text-sm font-semibold text-primary">{{ smartOverview() }}</h3>
            <p class="text-[11px] text-ink-muted">{{ smartOverviewHint() }}</p>
          </div>
        </div>
        <p class="mt-3 text-xs font-semibold text-accent-dark">{{ aiTitle() }}</p>
        <p class="mt-1 text-sm leading-relaxed text-ink">
          {{ aiMessage() }}
        </p>
        @if (aiRecommendation()) {
          <p class="mt-2 rounded-panel bg-surface px-3 py-2 text-xs leading-relaxed text-ink-muted">
            {{ aiRecommendation() }}
          </p>
        }
      </section>
    </aside>
  `,
})
export class CalendarSidebar {
  protected readonly service = inject(CalendarService);
  protected readonly today = todayISO();

  private readonly languageService = inject(LanguageService);

  protected readonly CATEGORY_VISUALS = CATEGORY_VISUALS;
  protected readonly CATEGORY_KEYS = CATEGORY_KEYS;

  protected readonly upcoming = this.languageService.translateSignal('calendarSidebar.upcoming');
  protected readonly upcomingHint = this.languageService.translateSignal(
    'calendarSidebar.upcomingHint',
  );
  protected readonly noUpcoming = this.languageService.translateSignal('calendarSidebar.noUpcoming');
  protected readonly sidebarToday = this.languageService.translateSignal('calendarSidebar.today');
  protected readonly dayLoad = this.languageService.translateSignal('calendarSidebar.dayLoad');
  protected readonly freeTime = this.languageService.translateSignal('calendarSidebar.freeTime');
  protected readonly noFreeTime = this.languageService.translateSignal('calendarSidebar.noFreeTime');
  protected readonly smartOverview = this.languageService.translateSignal(
    'calendarSidebar.smartOverview',
  );
  protected readonly smartOverviewHint = this.languageService.translateSignal(
    'calendarSidebar.smartOverviewHint',
  );

  protected eventCountLabel(): string {
    const count = this.service.todaySummary().count;
    return this.languageService.translate(
      count > 1 ? 'calendarSidebar.eventsCountMany' : 'calendarSidebar.eventsCountOne',
      { count: String(count) },
    );
  }

  protected freeTimeOfDay(): string {
    const free = this.service.todaySummary().freeMinutes;
    return this.languageService.translate('calendarSidebar.freeTimeOfDay', {
      value: this.minutesLabel(free),
    });
  }

  protected plannedHint(): string {
    const planned = this.service.todaySummary().plannedMinutes;
    return this.languageService.translate('calendarSidebar.plannedHint', {
      value: this.minutesLabel(planned),
    });
  }

  protected minutesLabel(minutes: number): string {
    return minutesToLabel(minutes, (key, vars) => this.languageService.translate(key, vars));
  }

  protected formatLongDate(iso: string): string {
    return formatLongDate(iso, this.languageService.getLocale());
  }

  protected formatDayMonth(iso: string): string {
    return formatDayMonth(iso, this.languageService.getLocale());
  }

  protected titleOf(event: CalendarEvent): string {
    return eventTitle(event, (key, vars) => this.languageService.translate(key, vars));
  }

  protected locationOf(event: CalendarEvent): string {
    return eventLocation(event, (key, vars) => this.languageService.translate(key, vars));
  }

  protected categoryLabel(value: EventCategory): string {
    return this.languageService.translate(CATEGORY_KEYS[value]);
  }

  protected aiTitle(): string {
    const insight = this.service.aiInsight();
    return this.languageService.translate(insight.titleKey, insight.vars);
  }

  protected aiMessage(): string {
    const insight = this.service.aiInsight();
    return this.languageService.translate(insight.messageKey, insight.vars);
  }

  protected aiRecommendation(): string {
    const insight = this.service.aiInsight();
    return insight.recommendationKey
      ? this.languageService.translate(insight.recommendationKey, insight.vars)
      : '';
  }

  protected dayLabel(iso: string): string {
    const today = todayISO();
    if (iso === today) {
      return this.languageService.translate('calendarSidebar.todayShort');
    }
    const date = new Date(iso + 'T00:00:00');
    return `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  protected openEvent(event: CalendarEvent): void {
    this.service.selectDate(event.date);
    this.service.openEvent(event.id);
  }
}
