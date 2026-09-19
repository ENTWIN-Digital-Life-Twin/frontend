import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideCheck,
  LucideClock,
  LucideHistory,
  LucideListChecks,
  LucideListPlus,
  LucideNotebookPen,
  LucidePencil,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Badge, type BadgeVariant } from '../../../../shared/ui/badge/badge';
import { Button } from '../../../../shared/ui/button/button';
import {
  CATEGORY_KEYS,
  PRIORITY_KEYS,
  STATUS_KEYS,
  dueLabel,
  durationLabel,
  isOverdue,
  type Subtask,
  type Task,
  type TaskActivity,
} from '../../models/task.models';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-detail',
  imports: [
    Button,
    Badge,
    FormsModule,
    LucideX,
    LucidePencil,
    LucideTrash2,
    LucideCheck,
    LucideClock,
    LucideListChecks,
    LucideListPlus,
    LucideNotebookPen,
    LucideHistory,
  ],
  template: `
    <div class="fixed inset-0 z-40" role="dialog" aria-modal="true" [attr.aria-label]="task()?.title">
      <div class="absolute inset-0 bg-navy-900/40 backdrop-blur-[2px]" (click)="closed.emit()"></div>
      <aside
        class="details-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-background shadow-drawer"
      >
        @if (task(); as task) {
          <header class="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <app-badge [variant]="statusVariant()" [dot]="statusInfo().dot">
                  {{ statusInfo().label }}
                </app-badge>
                <app-badge variant="outline">{{ categoryLabel(task.category) }}</app-badge>
              </div>
              <h3 class="mt-1.5 font-display text-lg font-semibold tracking-tight text-primary">
                {{ title() }}
              </h3>
            </div>
            <button
              type="button"
              appButton
              variant="ghost"
              size="icon"
              [attr.aria-label]="t('tasksDetail.close')"
              (click)="closed.emit()"
            >
              <svg lucideX class="h-4 w-4" aria-hidden="true"></svg>
            </button>
          </header>

          <div class="flex-1 overflow-y-auto px-5 py-4">
            @if (task.description) {
              <p class="text-sm leading-relaxed text-ink-muted">{{ description() }}</p>
            }

            <dl class="mt-5 grid grid-cols-2 gap-2">
              <div class="rounded-panel border border-line bg-surface-muted/50 p-3">
                <dt class="text-[11px] font-medium text-ink-faint">{{ t('tasksDetail.status') }}</dt>
                <dd class="mt-0.5 text-sm font-semibold text-primary">
                  {{ statusLabel(task.status) }}
                </dd>
              </div>
              <div class="rounded-panel border border-line bg-surface-muted/50 p-3">
                <dt class="text-[11px] font-medium text-ink-faint">{{ t('tasksDetail.priority') }}</dt>
                <dd class="mt-0.5 text-sm font-semibold text-primary">
                  {{ priorityLabel(task.priority) }}
                </dd>
              </div>
              <div class="rounded-panel border border-line bg-surface-muted/50 p-3">
                <dt class="text-[11px] font-medium text-ink-faint">{{ t('tasksDetail.dueDate') }}</dt>
                <dd class="mt-0.5 text-sm font-semibold text-primary">
                  {{ dueLabel(task.dueDate) }}
                </dd>
              </div>
              <div class="rounded-panel border border-line bg-surface-muted/50 p-3">
                <dt class="text-[11px] font-medium text-ink-faint">{{ t('tasksDetail.duration') }}</dt>
                <dd class="mt-0.5 text-sm font-semibold text-primary">
                  {{ durationLabel(task.duration) }}
                </dd>
              </div>
            </dl>

            <!-- Progression -->
            <section class="mt-5 rounded-card border border-line bg-surface p-4 shadow-soft">
              <div class="flex items-center justify-between gap-3">
                <h4 class="text-sm font-semibold text-primary">{{ t('tasksDetail.progress') }}</h4>
                <span class="font-display text-lg font-bold tabular-nums text-accent-dark">
                  {{ progress() }}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                class="mt-3 h-1.5 w-full cursor-pointer accent-teal-500"
                [value]="progress()"
                [attr.aria-label]="t('tasksDetail.progressAria')"
                (input)="onProgress($event)"
              />
              <p class="mt-2 text-[11px] text-ink-faint">
                {{ progressNote() }}
              </p>
            </section>

            <!-- Notes -->
            <section class="mt-4 rounded-card border border-line bg-surface p-4 shadow-soft">
              <div class="flex items-center justify-between gap-3">
                <h4 class="flex items-center gap-2 text-sm font-semibold text-primary">
                  <svg lucideNotebookPen class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
                   {{ t('tasksDetail.notes') }}
                </h4>
                @if (notesDirty()) {
                  <button appButton variant="ghost" size="sm" (click)="saveNotes()">{{ t('common.save') }}</button>
                }
              </div>
              <textarea
                class="mt-2.5 w-full resize-none rounded-panel border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows="3"
                [placeholder]="t('tasksDetail.notesPlaceholder')"
                [attr.aria-label]="t('tasksDetail.notesAria')"
                [ngModel]="notesDraft()"
                (ngModelChange)="notesDraft.set($event)"
              ></textarea>
              @if (notesSaved()) {
                <p class="mt-1.5 text-[11px] font-medium text-success">{{ t('tasksDetail.notesSaved') }}</p>
              }
            </section>

            <!-- Sous-tâches -->
            <section class="mt-4 rounded-card border border-line bg-surface p-4 shadow-soft">
              <h4 class="flex items-center gap-2 text-sm font-semibold text-primary">
                <svg lucideListChecks class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
                {{ t('tasksDetail.subtasks') }}
                <span class="text-xs font-medium text-ink-faint">
                  ({{ doneCount() }}/{{ task.subtasks.length }})
                </span>
              </h4>

              @if (task.subtasks.length > 0) {
                <ul class="mt-3 space-y-1.5">
                  @for (subtask of task.subtasks; track subtask.id) {
                    <li class="group flex items-center gap-2.5 rounded-panel px-2 py-1.5 transition-colors hover:bg-surface-muted">
                      <button
                        type="button"
                        class="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all duration-200"
                        [class.border-accent]="subtask.done"
                        [class.bg-accent]="subtask.done"
                        [class.text-white]="subtask.done"
                        [class.border-line-strong]="!subtask.done"
                        [class.text-transparent]="!subtask.done"
                        [attr.aria-label]="(subtask.done ? t('tasksDetail.subtaskUndoneAria') : t('tasksDetail.subtaskDoneAria')) + subtaskTitle(subtask)"
                        (click)="service.toggleSubtask(task.id, subtask.id)"
                      >
                        <svg lucideCheck class="h-3 w-3" stroke-width="3" aria-hidden="true"></svg>
                      </button>
                      <span
                        class="min-w-0 flex-1 text-sm text-ink"
                        [class.line-through]="subtask.done"
                        [class.text-ink-faint]="subtask.done"
                      >
                        {{ subtaskTitle(subtask) }}
                      </span>
                      <button
                        type="button"
                        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-panel text-ink-faint opacity-0 transition-all hover:bg-danger-light hover:text-danger group-hover:opacity-100"
                        [attr.aria-label]="t('tasksDetail.subtaskDeleteAria') + subtaskTitle(subtask)"
                        (click)="service.removeSubtask(task.id, subtask.id)"
                      >
                        <svg lucideX class="h-3.5 w-3.5" aria-hidden="true"></svg>
                      </button>
                    </li>
                  }
                </ul>
              } @else {
                <p class="mt-3 text-xs text-ink-faint">{{ t('tasksDetail.subtaskEmpty') }}</p>
              }

              <div class="mt-3 flex gap-2">
                <input
                  class="h-9 min-w-0 flex-1 rounded-panel border border-line bg-background px-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  [placeholder]="t('tasksDetail.subtaskPlaceholder')"
                  [attr.aria-label]="t('tasksDetail.subtaskAria')"
                  [ngModel]="subtaskDraft()"
                  (ngModelChange)="subtaskDraft.set($event)"
                  (keydown.enter)="addSubtask()"
                />
                <button
                  appButton
                  variant="secondary"
                  size="sm"
                  type="button"
                  [disabled]="!subtaskDraft().trim()"
                  [attr.aria-label]="t('tasksDetail.subtaskAddAria')"
                  (click)="addSubtask()"
                >
                  <svg lucideListPlus class="h-4 w-4" aria-hidden="true"></svg>
                   {{ t('common.add') }}
                </button>
              </div>
            </section>

            <!-- Activité -->
            @if (task.activity.length > 0) {
              <section class="mt-4">
                <h4 class="flex items-center gap-2 text-sm font-semibold text-primary">
                  <svg lucideHistory class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
                   {{ t('tasksDetail.activity') }}
                </h4>
                <ul class="mt-2.5 space-y-2">
                  @for (item of task.activity; track item.id) {
                    <li class="flex items-center gap-2.5 text-xs text-ink-muted">
                      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60"></span>
                      <span>
                        <svg lucideClock class="mr-1.5 inline h-3 w-3 text-ink-faint" aria-hidden="true"></svg>
                         {{ activityLabel(item) }}
                      </span>
                    </li>
                  }
                </ul>
              </section>
            }
          </div>

          <!-- Actions -->
          <footer class="space-y-2 border-t border-line px-5 py-4">
            <button appButton variant="secondary" size="md" class="w-full" (click)="service.toggleComplete(task.id)">
              <svg lucideCheck class="h-4 w-4" aria-hidden="true"></svg>
              {{ task.status === 'done' ? t('tasksDetail.markUndone') : t('tasksDetail.markDone') }}
            </button>
            <div class="grid grid-cols-2 gap-2">
              <button appButton variant="outline" size="md" class="w-full" (click)="edit.emit(task)">
                <svg lucidePencil class="h-4 w-4" aria-hidden="true"></svg>
                {{ t('common.edit') }}
              </button>
              @if (!confirmDelete()) {
                <button appButton variant="danger" size="md" class="w-full" (click)="confirmDelete.set(true)">
                  <svg lucideTrash2 class="h-4 w-4" aria-hidden="true"></svg>
                  {{ t('common.delete') }}
                </button>
              } @else {
                <div class="col-span-2 flex items-center justify-between gap-2 rounded-panel border border-danger/30 bg-danger-light/50 p-2 pl-3">
                  <span class="text-xs font-medium text-danger">{{ t('tasksDetail.confirmDelete') }}</span>
                  <div class="flex gap-1.5">
                    <button appButton variant="ghost" size="sm" (click)="confirmDelete.set(false)">{{ t('common.cancel') }}</button>
                    <button appButton variant="danger" size="sm" (click)="deleteTask(task)">{{ t('common.delete') }}</button>
                  </div>
                </div>
              }
            </div>
          </footer>
        }
      </aside>
    </div>
  `,
})
export class TaskDetail {
  readonly task = input.required<Task | null>();
  readonly closed = output<void>();
  readonly edit = output<Task>();

  protected readonly service = inject(TaskService);

  private readonly languageService = inject(LanguageService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  t = (key: string, vars?: Record<string, string>) => this.languageService.translate<string>(key, vars);

  protected readonly confirmDelete = signal(false);
  protected readonly subtaskDraft = signal('');
  protected readonly notesDraft = signal('');
  protected readonly notesSaved = signal(false);
  protected readonly notesDirty = signal(false);

  private lastTaskId: string | null = null;

  protected readonly CATEGORY_KEYS = CATEGORY_KEYS;
  protected readonly PRIORITY_KEYS = PRIORITY_KEYS;
  protected readonly STATUS_KEYS = STATUS_KEYS;
  protected readonly durationLabel = durationLabel;

  protected readonly title = computed(() => this.languageService.translate(this.task()?.title ?? ''));
  protected readonly description = computed(() => this.languageService.translate(this.task()?.description ?? ''));

  protected subtaskTitle(sub: Subtask): string {
    return this.languageService.translate(sub.title);
  }

  protected activityLabel(item: TaskActivity): string {
    return this.languageService.translate(item.label);
  }

  protected dueLabel(iso: string): string {
    return dueLabel(iso, this.languageService.getLocale(), (key) => this.languageService.translate(key));
  }

  protected categoryLabel(value: Task['category']): string {
    return this.languageService.translate(CATEGORY_KEYS[value]);
  }

  protected priorityLabel(value: Task['priority']): string {
    return this.languageService.translate(PRIORITY_KEYS[value]);
  }

  protected statusLabel(value: Task['status']): string {
    return this.languageService.translate(STATUS_KEYS[value]);
  }

  protected readonly progress = computed(() => {
    const task = this.task();
    if (!task) {
      return 0;
    }
    return this.service.subtaskProgress(task);
  });

  protected readonly progressNote = computed(() => {
    const task = this.task();
    if (!task) {
      return '';
    }
    if (task.subtasks.length > 0) {
      return this.t('tasksDetail.progressFromSubtasks', { count: String(task.subtasks.length) });
    }
    return this.t('tasksDetail.progressManual');
  });

  protected readonly doneCount = computed(
    () => this.task()?.subtasks.filter((sub) => sub.done).length ?? 0,
  );

  protected readonly statusInfo = computed(() => {
    const task = this.task();
    if (!task) {
      return { label: '', variant: 'neutral' as BadgeVariant, dot: false };
    }
    if (isOverdue(task)) {
      return { label: this.t('statuses.overdue'), variant: 'danger' as BadgeVariant, dot: true };
    }
    switch (task.status) {
      case 'done':
        return { label: this.t('statuses.done'), variant: 'success' as BadgeVariant, dot: false };
      case 'in-progress':
        return { label: this.t('statuses.inProgress'), variant: 'accent' as BadgeVariant, dot: true };
      default:
        return { label: this.t('statuses.todo'), variant: 'neutral' as BadgeVariant, dot: false };
    }
  });

  protected readonly statusVariant = computed(() => this.statusInfo().variant);

  constructor() {
    effect(() => {
      const task = this.task();
      if (!task || task.id !== this.lastTaskId) {
        this.lastTaskId = task?.id ?? null;
        this.notesDraft.set(task?.notes ?? '');
        this.notesDirty.set(false);
        this.confirmDelete.set(false);
        this.subtaskDraft.set('');
      } else {
        this.notesDirty.set(this.notesDraft() !== task.notes);
      }
      if (this.reduced) {
        return;
      }
      requestAnimationFrame(() => {
        const panel = this.host.nativeElement.querySelector<HTMLElement>('.details-panel');
        const overlay = this.host.nativeElement.querySelector<HTMLElement>('.fixed');
        import('gsap').then(({ default: gsap }) => {
          if (panel) {
            gsap.fromTo(panel, { x: 48, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
          }
          if (overlay) {
            gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
          }
        });
      });
    });
  }

  protected onProgress(event: Event): void {
    const task = this.task();
    if (!task) {
      return;
    }
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.service.updateProgress(task.id, value);
  }

  protected addSubtask(): void {
    const task = this.task();
    if (!task) {
      return;
    }
    this.service.addSubtask(task.id, this.subtaskDraft());
    this.subtaskDraft.set('');
  }

  protected saveNotes(): void {
    const task = this.task();
    if (!task) {
      return;
    }
    this.service.updateNotes(task.id, this.notesDraft().trim());
    this.notesDirty.set(false);
    this.notesSaved.set(true);
    setTimeout(() => this.notesSaved.set(false), 2000);
  }

  protected deleteTask(task: Task): void {
    this.service.deleteTask(task.id);
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }
}
