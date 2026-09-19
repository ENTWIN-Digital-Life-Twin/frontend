import { Component, computed, inject, input, output } from '@angular/core';
import {
  LucideCheck,
  LucideDynamicIcon,
  LucideMapPin,
  LucidePencil,
  LucideUsers,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Badge, type BadgeVariant } from '../../../../shared/ui/badge/badge';
import {
  CATEGORY_KEYS,
  ENTRY_VISUALS,
  PRIORITY_KEYS,
  STATUS_KEYS,
  entryDurationLabel,
  getEntryVisual,
  type PlanningCategory,
  type PlanningEntry,
  type PlanningPriority,
  type TaskStatus,
} from '../../models/planning.models';

const PRIORITY_VARIANT: Record<PlanningPriority, BadgeVariant> = {
  low: 'neutral',
  medium: 'primary',
  high: 'warning',
};

const STATUS_VARIANT: Record<TaskStatus, BadgeVariant> = {
  todo: 'neutral',
  'in-progress': 'accent',
  done: 'success',
};

@Component({
  selector: 'app-timeline-item',
  imports: [LucideDynamicIcon, LucideCheck, LucidePencil, LucideMapPin, LucideUsers, Badge],
  template: `
    <div
      class="group relative flex gap-3 sm:gap-4"
      role="button"
      tabindex="0"
      [attr.aria-label]="t('planningExtended.detailOpenAria') + entryTitle(entry())"
      (click)="open.emit(entry())"
      (keydown.enter)="open.emit(entry())"
      (keydown.space)="open.emit(entry()); $event.preventDefault()"
    >
      <div class="w-12 shrink-0 pt-3 text-right">
        <p class="text-xs font-semibold tabular-nums text-ink">{{ entry().start }}</p>
        <p class="text-[11px] tabular-nums text-ink-faint">{{ entry().end }}</p>
        <p class="mt-0.5 text-[10px] font-medium text-ink-faint">{{ duration() }}</p>
      </div>

      <div class="relative flex flex-col items-center">
        <span class="mt-3.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-background" [class]="visual().dot"></span>
        @if (!last()) {
          <span class="mt-0.5 w-px flex-1 bg-line"></span>
        }
      </div>

      <div class="min-w-0 flex-1 pb-4">
        <div
          class="relative rounded-panel border border-l-[3px] shadow-soft transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-card-hover"
          [class]="visual().card"
          [class.opacity-60]="isDone()"
        >
          <div class="flex items-start gap-3 p-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel" [class]="visual().chip">
              <svg [lucideIcon]="visual().icon" class="h-4 w-4" aria-hidden="true"></svg>
            </span>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <p
                  class="min-w-0 truncate text-sm font-semibold text-primary"
                  [class.line-through]="isDone()"
                  [class.text-ink-muted]="isDone()"
                >
                  {{ entryTitle(entry()) }}
                </p>
                <div class="flex shrink-0 items-center gap-1">
                  @if (entry().type === 'task') {
                    <button
                      type="button"
                      class="flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200"
                      [class.border-accent]="isDone()"
                      [class.bg-accent]="isDone()"
                      [class.text-white]="isDone()"
                      [class.border-line-strong]="!isDone()"
                      [class.bg-surface]="!isDone()"
                      [class.text-transparent]="!isDone()"
                      [class.hover:border-accent]="!isDone()"
                      [class.hover:text-accent]="!isDone()"
                      [attr.aria-label]="isDone() ? t('tasksDetail.markUndone') : t('tasksDetail.markDone')"
                      (click)="toggle.emit(entry()); $event.stopPropagation()"
                    >
                      <svg lucideCheck class="h-3.5 w-3.5" stroke-width="3" aria-hidden="true"></svg>
                    </button>
                  }
                  @if (canEdit()) {
                    <button
                      type="button"
                      class="flex h-7 w-7 items-center justify-center rounded-panel text-ink-faint transition-colors hover:bg-surface-muted hover:text-primary"
                      [attr.aria-label]="t('planningExtended.editAria') + entryTitle(entry())"
                      (click)="edit.emit(entry()); $event.stopPropagation()"
                    >
                      <svg lucidePencil class="h-3.5 w-3.5" aria-hidden="true"></svg>
                    </button>
                  }
                </div>
              </div>

              @if (entry().description) {
                <p class="mt-0.5 text-xs leading-relaxed text-ink-muted">{{ entryDesc(entry()) }}</p>
              }

              <div class="mt-2 flex flex-wrap items-center gap-1.5">
                <app-badge variant="neutral">{{ visual().label }}</app-badge>
                <app-badge variant="outline">{{ categoryLabel(entry().category) }}</app-badge>
                @if (entry().priority) {
                  <app-badge [variant]="PRIORITY_VARIANT[entry().priority!]">{{ priorityLabel(entry().priority!) }}</app-badge>
                }
                @if (entry().type === 'task' && entry().status && entry().status !== 'done') {
                  <app-badge [variant]="STATUS_VARIANT[entry().status!]" [dot]="entry().status === 'in-progress'">
                    {{ statusLabel(entry().status!) }}
                  </app-badge>
                }
                @if (entry().type === 'event' && entry().location) {
                  <span class="inline-flex items-center gap-1 text-[11px] text-ink-faint">
                    <svg lucideMapPin class="h-3 w-3" aria-hidden="true"></svg>
                    {{ entryLocation(entry()) }}
                  </span>
                }
                @if (entry().type === 'event' && participantCount() > 0) {
                  <span class="inline-flex items-center gap-1 text-[11px] text-ink-faint">
                    <svg lucideUsers class="h-3 w-3" aria-hidden="true"></svg>
                    {{ participantCount() }}{{ t('planningExtended.participantsCount') }}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TimelineItem {
  readonly entry = input.required<PlanningEntry>();
  readonly last = input(false);

  readonly open = output<PlanningEntry>();
  readonly edit = output<PlanningEntry>();
  readonly toggle = output<PlanningEntry>();

  private readonly languageService = inject(LanguageService);

  t = (key: string, vars?: Record<string, string>) => this.languageService.translate<string>(key, vars);

  protected readonly PRIORITY_VARIANT = PRIORITY_VARIANT;
  protected readonly STATUS_VARIANT = STATUS_VARIANT;
  protected readonly CATEGORY_KEYS = CATEGORY_KEYS;
  protected readonly PRIORITY_KEYS = PRIORITY_KEYS;
  protected readonly STATUS_KEYS = STATUS_KEYS;

  protected readonly visual = computed(() => getEntryVisual(this.entry().type, (key) => this.languageService.translate(key)));
  protected readonly duration = computed(() => entryDurationLabel(this.entry(), (key) => this.languageService.translate(key)));
  protected readonly isDone = computed(() => this.entry().status === 'done');
  protected readonly canEdit = computed(() => this.entry().type !== 'free');
  protected readonly participantCount = computed(
    () => this.entry().participants?.length ?? 0,
  );

  protected categoryLabel(value: PlanningCategory): string {
    return this.languageService.translate(CATEGORY_KEYS[value]);
  }

  protected priorityLabel(value: PlanningPriority): string {
    return this.languageService.translate(PRIORITY_KEYS[value]);
  }

  protected statusLabel(value: TaskStatus): string {
    return this.languageService.translate(STATUS_KEYS[value]);
  }

  protected entryTitle(entry: PlanningEntry): string {
    return this.languageService.translate(entry.title);
  }

  protected entryDesc(entry: PlanningEntry): string {
    return entry.description ? this.languageService.translate(entry.description) : '';
  }

  protected entryLocation(entry: PlanningEntry): string {
    return entry.location ? this.languageService.translate(entry.location) : '';
  }
}
