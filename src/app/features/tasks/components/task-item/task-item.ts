import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  LucideCalendar,
  LucideCheck,
  LucideClock,
  LucideDynamicIcon,
  LucideFlag,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Badge, type BadgeVariant } from '../../../../shared/ui/badge/badge';
import {
  CATEGORY_ICONS,
  CATEGORY_KEYS,
  PRIORITY_KEYS,
  dueLabel,
  durationLabel,
  isOverdue,
  type Task,
} from '../../models/task.models';

const PRIORITY_COLOR: Record<Task['priority'], string> = {
  low: 'text-ink-faint',
  medium: 'text-accent-dark',
  high: 'text-warning',
};

const CATEGORY_CHIP: Record<Task['category'], string> = {
  work: 'bg-primary/10 text-primary',
  personal: 'bg-teal-50 text-accent-dark',
  sport: 'bg-teal-100 text-teal-700',
  studies: 'bg-navy-100 text-navy-700',
};

@Component({
  selector: 'app-task-item',
  imports: [Badge, LucideDynamicIcon, LucideCheck, LucideCalendar, LucideClock, LucideFlag],
  template: `
    <article
      class="task-item group relative flex cursor-pointer items-start gap-3 rounded-panel border bg-surface p-3.5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover sm:gap-4 sm:p-4"
      [class.border-accent/40]="selected()"
      [class.ring-1]="selected()"
      [class.ring-accent/20]="selected()"
      role="button"
      tabindex="0"
      [attr.aria-label]="t('tasksExtended.detailOpenAria') + title()"
      (click)="open.emit(task())"
      (keydown.enter)="open.emit(task())"
      (keydown.space)="open.emit(task()); $event.preventDefault()"
    >
      <button
        #checkBtn
        type="button"
        class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200"
        [class.border-accent]="isDone()"
        [class.bg-accent]="isDone()"
        [class.text-white]="isDone()"
        [class.border-line-strong]="!isDone()"
        [class.bg-surface]="!isDone()"
        [class.text-transparent]="!isDone()"
        [class.hover:border-accent]="!isDone()"
        [class.hover:text-accent]="!isDone()"
        [attr.aria-label]="isDone() ? t('tasksDetail.markUndone') : t('tasksDetail.markDone')"
        (click)="toggle.emit(task()); $event.stopPropagation()"
      >
        <svg lucideCheck class="h-3.5 w-3.5" stroke-width="3" aria-hidden="true"></svg>
      </button>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <p
            class="min-w-0 truncate text-sm font-semibold text-primary"
            [class.line-through]="isDone()"
            [class.text-ink-muted]="isDone()"
          >
            {{ title() }}
          </p>
          <app-badge [variant]="statusInfo().variant" [dot]="statusInfo().dot">
            {{ statusInfo().label }}
          </app-badge>
        </div>

        <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span class="inline-flex items-center gap-1.5 font-medium">
            <span class="flex h-5 w-5 items-center justify-center rounded-md" [class]="CATEGORY_CHIP[task().category]">
              <svg [lucideIcon]="categoryIcon()" class="h-3 w-3" aria-hidden="true"></svg>
            </span>
            {{ categoryLabel(task().category) }}
          </span>
          <span class="inline-flex items-center gap-1">
            <svg lucideFlag class="h-3 w-3" [class]="PRIORITY_COLOR[task().priority]" aria-hidden="true"></svg>
            {{ priorityLabel(task().priority) }}
          </span>
        </div>

        <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-faint">
          <span class="inline-flex items-center gap-1" [class.text-danger]="overdue()">
            <svg lucideCalendar class="h-3 w-3" aria-hidden="true"></svg>
            {{ dueText() }}
          </span>
          <span class="inline-flex items-center gap-1">
            <svg lucideClock class="h-3 w-3" aria-hidden="true"></svg>
            {{ durationLabel(task().duration) }}
          </span>
        </div>

        @if (!isDone()) {
          <div class="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-surface-strong">
            <div
              class="h-full rounded-full bg-accent transition-all duration-500"
              [style.width.%]="progress()"
            ></div>
          </div>
        }
      </div>
    </article>
  `,
})
export class TaskItem {
  readonly task = input.required<Task>();
  readonly selected = input(false);

  readonly open = output<Task>();
  readonly toggle = output<Task>();

  private readonly languageService = inject(LanguageService);
  private readonly checkBtn = viewChild<ElementRef<HTMLElement>>('checkBtn');

  t = (key: string, vars?: Record<string, string>) => this.languageService.translate<string>(key, vars);

  protected readonly CATEGORY_CHIP = CATEGORY_CHIP;
  protected readonly PRIORITY_COLOR = PRIORITY_COLOR;
  protected readonly CATEGORY_KEYS = CATEGORY_KEYS;
  protected readonly PRIORITY_KEYS = PRIORITY_KEYS;
  protected readonly durationLabel = durationLabel;

  protected categoryLabel(value: Task['category']): string {
    return this.languageService.translate(CATEGORY_KEYS[value]);
  }

  protected priorityLabel(value: Task['priority']): string {
    return this.languageService.translate(PRIORITY_KEYS[value]);
  }

  protected readonly title = computed(() => this.languageService.translate(this.task().title));
  protected readonly isDone = computed(() => this.task().status === 'done');
  protected readonly overdue = computed(() => isOverdue(this.task()));
  protected readonly categoryIcon = computed(() => CATEGORY_ICONS[this.task().category]);
  protected readonly dueText = computed(() => dueLabel(this.task().dueDate, this.languageService.getLocale(), (key) => this.languageService.translate(key)));

  protected readonly progress = computed(() => {
    const subs = this.task().subtasks;
    if (subs.length > 0) {
      return Math.round((subs.filter((sub) => sub.done).length / subs.length) * 100);
    }
    return this.task().progress;
  });

  protected readonly statusInfo = computed(() => {
    if (this.overdue()) {
      return { label: this.t('statuses.overdue'), variant: 'danger' as BadgeVariant, dot: true };
    }
    switch (this.task().status) {
      case 'done':
        return { label: this.t('statuses.done'), variant: 'success' as BadgeVariant, dot: false };
      case 'in-progress':
        return { label: this.t('statuses.inProgress'), variant: 'accent' as BadgeVariant, dot: true };
      default:
        return { label: this.t('statuses.todo'), variant: 'neutral' as BadgeVariant, dot: false };
    }
  });

  constructor() {
    effect(() => {
      void this.isDone();
      const el = this.checkBtn()?.nativeElement;
      if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      import('gsap').then(({ default: gsap }) => {
        gsap.fromTo(el, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
      });
    });
  }
}
