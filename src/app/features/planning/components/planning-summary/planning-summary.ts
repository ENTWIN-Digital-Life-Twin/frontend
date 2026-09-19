import { AfterViewInit, Component, ElementRef, computed, effect, inject } from '@angular/core';
import {
  LucideCalendarDays,
  LucideGauge,
  LucideListTodo,
  LucideSun,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { formatMinutesLocale } from '../../models/planning.models';
import { PlanningService } from '../../services/planning.service';

type LoadTone = {
  labelKey: string;
  text: string;
  bar: string;
};

function loadTone(percent: number): LoadTone {
  if (percent < 60) {
    return { labelKey: 'planning.summary.light', text: 'text-success', bar: 'bg-success' };
  }
  if (percent < 75) {
    return { labelKey: 'planning.summary.balanced', text: 'text-accent-dark', bar: 'bg-accent' };
  }
  if (percent < 85) {
    return { labelKey: 'planning.summary.busy', text: 'text-warning', bar: 'bg-warning' };
  }
  return { labelKey: 'planning.summary.veryBusy', text: 'text-danger', bar: 'bg-danger' };
}

@Component({
  selector: 'app-planning-summary',
  imports: [LucideListTodo, LucideCalendarDays, LucideSun, LucideGauge],
  template: `
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div class="summary-metric rounded-panel border border-line bg-surface p-3.5 shadow-soft">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-primary/10 text-primary">
              <svg lucideListTodo class="h-4 w-4" aria-hidden="true"></svg>
            </span>
            <p class="truncate text-xs font-medium text-ink-muted">{{ tasks() }}</p>
          </div>
          <p class="font-display text-base font-semibold tabular-nums text-primary">
            {{ summary().doneTasks }}<span class="text-ink-faint">/{{ summary().totalTasks }}</span>
          </p>
        </div>
        <p class="mt-2 text-[11px] text-ink-faint">{{ tasksDone() }}</p>
      </div>

      <div class="summary-metric rounded-panel border border-line bg-surface p-3.5 shadow-soft">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-teal-50 text-accent-dark">
              <svg lucideCalendarDays class="h-4 w-4" aria-hidden="true"></svg>
            </span>
            <p class="truncate text-xs font-medium text-ink-muted">{{ events() }}</p>
          </div>
          <p class="font-display text-base font-semibold tabular-nums text-primary">
            {{ summary().totalEvents }}
          </p>
        </div>
        <p class="mt-2 text-[11px] text-ink-faint">{{ service.isToday() ? today() : planned() }}</p>
      </div>

      <div class="summary-metric rounded-panel border border-line bg-surface p-3.5 shadow-soft">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-teal-100 text-teal-700">
              <svg lucideSun class="h-4 w-4" aria-hidden="true"></svg>
            </span>
            <p class="truncate text-xs font-medium text-ink-muted">{{ freeTime() }}</p>
          </div>
          <p class="font-display text-base font-semibold tabular-nums text-primary">
            {{ freeLabel() }}
          </p>
        </div>
        <p class="mt-2 text-[11px] text-ink-faint">{{ freeTimeAuto() }}</p>
      </div>

      <div class="summary-metric rounded-panel border border-line bg-surface p-3.5 shadow-soft">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-primary/10 text-primary">
              <svg lucideGauge class="h-4 w-4" aria-hidden="true"></svg>
            </span>
            <p class="truncate text-xs font-medium text-ink-muted">{{ load() }}</p>
          </div>
          <p class="font-display text-base font-semibold tabular-nums text-primary">
            {{ summary().loadPercent }}<span class="text-sm text-ink-faint">%</span>
          </p>
        </div>
        <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-strong">
          <div
            class="charge-bar h-full origin-left rounded-full"
            [class]="tone().bar"
            style="transform: scaleX(0); transform-origin: left center;"
          ></div>
        </div>
        <p class="mt-2 text-[11px] font-medium" [class]="tone().text">{{ toneLabel() }}</p>
      </div>
    </div>
  `,
})
export class PlanningSummary implements AfterViewInit {
  protected readonly service = inject(PlanningService);
  private readonly languageService = inject(LanguageService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected readonly tasks = this.languageService.translateSignal('planning.summary.tasks');
  protected readonly tasksDone = this.languageService.translateSignal('planning.summary.tasksDone');
  protected readonly events = this.languageService.translateSignal('planning.summary.events');
  protected readonly today = this.languageService.translateSignal('planning.summary.today');
  protected readonly planned = this.languageService.translateSignal('planning.summary.planned');
  protected readonly freeTime = this.languageService.translateSignal('planning.summary.freeTime');
  protected readonly freeTimeAuto = this.languageService.translateSignal('planning.summary.freeTimeAuto');
  protected readonly load = this.languageService.translateSignal('planning.summary.load');

  protected readonly summary = computed(() => this.service.summary());
  protected readonly tone = computed(() => loadTone(this.summary().loadPercent));
  protected readonly toneLabel = computed(() =>
    this.languageService.translate(this.tone().labelKey),
  );
  protected readonly freeLabel = computed(() => formatMinutesLocale(this.summary().freeMinutes, (key) => this.languageService.translate(key)));

  constructor() {
    effect(() => {
      const target = this.summary().loadPercent / 100;
      const bars = this.host.nativeElement.querySelectorAll<HTMLElement>('.charge-bar');
      bars.forEach((bar) => {
        if (this.reduced) {
          bar.style.transform = `scaleX(${target})`;
          return;
        }
        import('gsap').then(({ default: gsap }) => {
          gsap.to(bar, { scaleX: target, duration: 0.9, ease: 'power3.out' });
        });
      });
    });
  }

  ngAfterViewInit(): void {
    if (this.reduced) {
      return;
    }
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        this.host.nativeElement.querySelectorAll<HTMLElement>('.summary-metric'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out', clearProps: 'transform' },
      );
    });
  }
}
