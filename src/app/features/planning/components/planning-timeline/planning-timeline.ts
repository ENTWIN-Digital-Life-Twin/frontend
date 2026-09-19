import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideCalendarDays, LucideClock } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import {
  formatTimeLocale,
  nowMinutes,
  toMinutes,
  toTime,
  type PlanningEntry,
} from '../../models/planning.models';
import { PlanningService } from '../../services/planning.service';
import { TimelineItem } from '../timeline-item/timeline-item';

@Component({
  selector: 'app-now-divider',
  template: `
    <div class="flex items-center gap-3 py-1" aria-hidden="true">
      <span class="h-px w-4 rounded-full bg-accent/80"></span>
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-accent-dark px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-white shadow-sm"
      >
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-white/90"></span>
        {{ label() }}
      </span>
      <span class="h-px flex-1 bg-gradient-to-r from-accent/80 to-accent/20"></span>
    </div>
  `,
})
export class NowDivider {
  readonly label = input.required<string>();
}

@Component({
  selector: 'app-planning-timeline',
  imports: [TimelineItem, EmptyState, LucideClock, NowDivider],
  template: `
    <section class="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <header class="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {{ sectionLabel() }}
          </p>
          <h2 class="mt-0.5 font-display text-lg font-semibold tracking-tight text-primary">
            {{ title() }}
          </h2>
        </div>
        @if (service.isToday()) {
          <span
            class="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-teal-50 px-2.5 py-1 text-xs font-medium text-accent-dark"
          >
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
            {{ nowLabel() }}
          </span>
        } @else {
          <span class="inline-flex items-center gap-1.5 text-xs text-ink-faint">
            <svg lucideClock class="h-3.5 w-3.5" aria-hidden="true"></svg>
            {{ itemsLabel() }}
          </span>
        }
      </header>

      <div class="px-4 py-5 sm:px-6">
        @if (count() === 0) {
          <app-empty-state
            [icon]="LucideCalendarDays"
            [title]="emptyTitle()"
            [description]="emptyDescription()"
            [actionLabel]="resetFilter()"
            (action)="service.setFilter('all')"
          />
        } @else {
          <div class="flex flex-col">
            @for (entry of service.filteredEntries(); track entry.id; let i = $index) {
              @if (service.isToday() && i === dividerIndex()) {
                <app-now-divider [label]="nowLabel()" />
              }
              <div class="timeline-item">
                <app-timeline-item
                  [entry]="entry"
                  [last]="i === count() - 1"
                  (open)="service.openEntry($event.id)"
                  (edit)="edit.emit($event)"
                  (toggle)="service.toggleComplete($event.id)"
                />
              </div>
            }
            @if (service.isToday() && dividerIndex() === count()) {
              <app-now-divider [label]="nowLabel()" />
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class PlanningTimeline {
  protected readonly service = inject(PlanningService);
  private readonly languageService = inject(LanguageService);
  protected readonly edit = output<PlanningEntry>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly nowMinutesSignal = signal(nowMinutes());

  protected readonly sectionLabel = this.languageService.translateSignal(
    'planning.timeline.sectionLabel',
  );
  protected readonly title = this.languageService.translateSignal('planning.timeline.title');
  protected readonly emptyTitle = this.languageService.translateSignal('planning.timeline.emptyTitle');
  protected readonly emptyDescription = this.languageService.translateSignal(
    'planning.timeline.emptyDescription',
  );
  protected readonly resetFilter = this.languageService.translateSignal(
    'planning.timeline.resetFilter',
  );

  protected readonly count = computed(() => this.service.filteredEntries().length);

  protected readonly itemsLabel = computed(() =>
    this.count() > 1
      ? this.languageService.translate('planning.timeline.itemsMany', {
          count: String(this.count()),
        })
      : this.languageService.translate('planning.timeline.itemsOne', {
          count: String(this.count()),
        }),
  );

  protected readonly nowLabel = computed(() =>
    formatTimeLocale(toTime(this.nowMinutesSignal()), this.languageService.getLocale()),
  );

  protected readonly dividerIndex = computed(() => {
    if (!this.service.isToday()) {
      return -1;
    }
    const list = this.service.filteredEntries();
    const now = this.nowMinutesSignal();
    return list.filter((entry) => toMinutes(entry.end) <= now).length;
  });

  protected readonly LucideCalendarDays = LucideCalendarDays;

  constructor() {
    const interval = setInterval(() => this.nowMinutesSignal.set(nowMinutes()), 30_000);
    this.destroyRef.onDestroy(() => clearInterval(interval));

    effect(() => {
      void this.service.filteredEntries();
      void this.service.selectedDate();
      if (this.reduced) {
        return;
      }
      requestAnimationFrame(() => {
        const items = this.host.nativeElement.querySelectorAll<HTMLElement>('.timeline-item');
        if (items.length === 0) {
          return;
        }
        import('gsap').then(({ default: gsap }) => {
          gsap.fromTo(
            items,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.05,
              duration: 0.45,
              ease: 'power2.out',
              clearProps: 'transform',
            },
          );
        });
      });
    });
  }
}
