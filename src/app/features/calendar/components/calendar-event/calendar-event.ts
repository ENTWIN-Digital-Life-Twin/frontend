import { Component, computed, inject, input, output } from '@angular/core';
import { LucideClock, LucideDynamicIcon, LucideMapPin, LucideUsers } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import {
  CATEGORY_KEYS,
  CATEGORY_VISUALS,
  durationLabel,
  eventLocation,
  eventParticipants,
  eventTitle,
  type CalendarEvent,
  type EventCategory,
} from '../../models/calendar.models';
type EventMode = 'month' | 'week' | 'day';

@Component({
  selector: 'app-calendar-event',
  imports: [LucideDynamicIcon, LucideClock, LucideMapPin, LucideUsers],
  template: `
    @switch (mode()) {
      @case ('month') {
        <button
          type="button"
          class="event-pill flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] leading-tight transition-all duration-150 hover:brightness-95 hover:shadow-soft"
          [class]="visual().chip"
          (click)="open.emit(event())"
        >
          <span class="h-1.5 w-1.5 shrink-0 rounded-full" [class]="visual().dot"></span>
          <span class="shrink-0 font-semibold tabular-nums">{{ event().start }}</span>
          <span class="truncate font-medium">{{ title() }}</span>
        </button>
      }
      @case ('week') {
        <button
          type="button"
          class="week-block absolute flex min-h-0 flex-col justify-center overflow-hidden rounded-md px-2 py-1 text-left transition-transform duration-150 hover:scale-[1.02] hover:shadow-card"
          [style]="style()"
          (click)="open.emit(event())"
        >
          <span class="truncate text-[11px] font-semibold leading-tight">{{ title() }}</span>
          <span class="mt-0.5 flex items-center gap-1 truncate text-[10px] font-medium opacity-80">
            <svg lucideClock class="h-3 w-3 shrink-0" aria-hidden="true"></svg>
            <span class="tabular-nums">{{ event().start }} – {{ event().end }}</span>
          </span>
          @if (location() && tallEnough()) {
            <span class="mt-0.5 flex items-center gap-1 truncate text-[10px] opacity-75">
              <svg lucideMapPin class="h-3 w-3 shrink-0" aria-hidden="true"></svg>
              <span class="truncate">{{ location() }}</span>
            </span>
          }
        </button>
      }
      @case ('day') {
        <button
          type="button"
          class="group flex w-full items-stretch gap-3 rounded-card border border-line bg-surface p-3 text-left shadow-soft transition-all duration-200 hover:border-accent/40 hover:shadow-card"
          (click)="open.emit(event())"
        >
          <span
            class="flex w-16 shrink-0 flex-col items-center justify-center rounded-panel py-2"
            [class]="visual().chip"
          >
            <span class="text-[10px] font-semibold uppercase tracking-wide opacity-80">
              {{ event().start }}
            </span>
            <span class="text-[10px] opacity-70">{{ event().end }}</span>
          </span>
          <span class="flex min-w-0 flex-1 flex-col justify-center py-0.5">
            <span class="flex items-center gap-2">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" [class]="visual().chip">
                <svg [lucideIcon]="visual().icon" class="h-3.5 w-3.5" aria-hidden="true"></svg>
              </span>
              <span class="truncate font-display text-sm font-semibold text-primary">
                {{ title() }}
              </span>
            </span>
            <span class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-muted">
              <span class="tabular-nums">{{ duration() }}</span>
              <span class="text-ink-faint">·</span>
              <span>{{ category() }}</span>
              @if (location()) {
                <span class="text-ink-faint">·</span>
                <span class="flex items-center gap-1 truncate">
                  <svg lucideMapPin class="h-3 w-3 shrink-0" aria-hidden="true"></svg>
                  <span class="truncate">{{ location() }}</span>
                </span>
              }
              @if (participants().length) {
                <span class="text-ink-faint">·</span>
                <span class="flex items-center gap-1">
                  <svg lucideUsers class="h-3 w-3 shrink-0" aria-hidden="true"></svg>
                  <span class="truncate">{{ participants().join(', ') }}</span>
                </span>
              }
            </span>
          </span>
        </button>
      }
    }
  `,
})
export class CalendarEventComponent {
  readonly event = input.required<CalendarEvent>();
  readonly mode = input<EventMode>('month');
  readonly top = input(0);
  readonly height = input(0);
  readonly leftPct = input(0);
  readonly widthPct = input(0);

  readonly open = output<CalendarEvent>();

  private readonly languageService = inject(LanguageService);

  protected readonly translate = (key: string, vars?: Record<string, string>) =>
    this.languageService.translate(key, vars);

  protected readonly visual = computed(() => CATEGORY_VISUALS[this.event().category]);

  protected readonly title = computed(() => eventTitle(this.event(), this.translate));
  protected readonly location = computed(() => eventLocation(this.event(), this.translate));
  protected readonly participants = computed(() => eventParticipants(this.event(), this.translate));
  protected readonly duration = computed(() => durationLabel(this.event(), this.translate));

  protected readonly tallEnough = computed(() => this.height() >= 44);

  protected readonly style = computed(() => ({
    top: `${this.top()}px`,
    height: `${Math.max(26, this.height())}px`,
    left: `${this.leftPct()}%`,
    width: `calc(${this.widthPct()}% - 3px)`,
  }));

  protected category(): string {
    return this.languageService.translate(CATEGORY_KEYS[this.event().category]);
  }
}
