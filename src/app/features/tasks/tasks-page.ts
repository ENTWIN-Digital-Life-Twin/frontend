import { AfterViewInit, Component, ElementRef, computed, inject, signal } from '@angular/core';
import {
  LucideActivity,
  LucideAlarmClock,
  LucideCircleCheck,
  LucideListTodo,
  LucidePlus,
  LucideRotateCcw,
  LucideSearch,
} from '@lucide/angular';
import { LanguageService } from '../../core/services/language.service';
import { Toast, type ToastTone } from '../../shared/ui/toast/toast';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { Button } from '../../shared/ui/button/button';
import {
  type Task,
  type TaskCategory,
  type TaskPriorityFilter,
  type TaskSort,
  type TaskStatusFilter,
} from './models/task.models';
import { TaskService } from './services/task.service';
import { TaskDetail } from './components/task-detail/task-detail';
import { TaskForm } from './components/task-form/task-form';
import { TaskItem } from './components/task-item/task-item';

type TaskStatusOption = { value: TaskStatusFilter; label: string };
type TaskPriorityOption = { value: TaskPriorityFilter; label: string };
type TaskCategoryOption = { value: TaskCategory; label: string };
type TaskSortOption = { value: TaskSort; label: string };

@Component({
  selector: 'app-tasks-page',
  imports: [
    Toast,
    EmptyState,
    Button,
    TaskDetail,
    TaskForm,
    TaskItem,
    LucideListTodo,
    LucideCircleCheck,
    LucideActivity,
    LucideAlarmClock,
    LucidePlus,
    LucideSearch,
    LucideRotateCcw,
  ],
  template: `
    <div class="space-y-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            {{ eyebrow() }}
          </p>
          <h1 class="mt-0.5 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {{ title() }}
          </h1>
          <p class="mt-1 text-sm text-ink-muted">
            {{ subtitle() }}
          </p>
        </div>
        <button appButton variant="accent" size="md" (click)="openCreate()">
          <svg lucidePlus class="h-4 w-4" aria-hidden="true"></svg>
          {{ newTask() }}
        </button>
      </header>

      <!-- Statistiques -->
      <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" [attr.aria-label]="statsAria()">
        <div class="metric-card rounded-panel border border-line bg-surface p-4 shadow-soft">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2.5">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-primary/10 text-primary">
                <svg lucideListTodo class="h-4 w-4" aria-hidden="true"></svg>
              </span>
              <p class="truncate text-xs font-medium text-ink-muted">{{ statsTotal() }}</p>
            </div>
            <p class="font-display text-xl font-semibold tabular-nums text-primary">
              {{ service.counts().total }}
            </p>
          </div>
          <p class="mt-2 text-[11px] text-ink-faint">{{ statsTotalHint() }}</p>
        </div>

        <div class="metric-card rounded-panel border border-line bg-surface p-4 shadow-soft">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2.5">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-success-light text-success">
                <svg lucideCircleCheck class="h-4 w-4" aria-hidden="true"></svg>
              </span>
              <p class="truncate text-xs font-medium text-ink-muted">{{ statsDone() }}</p>
            </div>
            <p class="font-display text-xl font-semibold tabular-nums text-primary">
              {{ service.counts().done }}
            </p>
          </div>
          <p class="mt-2 text-[11px] text-ink-faint">{{ statsDoneHint() }}</p>
        </div>

        <div class="metric-card rounded-panel border border-line bg-surface p-4 shadow-soft">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2.5">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-teal-50 text-accent-dark">
                <svg lucideActivity class="h-4 w-4" aria-hidden="true"></svg>
              </span>
              <p class="truncate text-xs font-medium text-ink-muted">{{ statsInProgress() }}</p>
            </div>
            <p class="font-display text-xl font-semibold tabular-nums text-primary">
              {{ service.counts().inProgress }}
            </p>
          </div>
          <p class="mt-2 text-[11px] text-ink-faint">{{ statsInProgressHint() }}</p>
        </div>

        <div class="metric-card rounded-panel border border-line bg-surface p-4 shadow-soft">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2.5">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-danger-light text-danger">
                <svg lucideAlarmClock class="h-4 w-4" aria-hidden="true"></svg>
              </span>
              <p class="truncate text-xs font-medium text-ink-muted">{{ statsOverdue() }}</p>
            </div>
            <p class="font-display text-xl font-semibold tabular-nums text-danger">
              {{ service.counts().overdue }}
            </p>
          </div>
          <p class="mt-2 text-[11px] text-ink-faint">{{ statsOverdueHint() }}</p>
        </div>
      </section>

      <!-- Barre d'outils -->
      <section class="rounded-card border border-line bg-surface p-3 shadow-card sm:p-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div class="relative min-w-[12rem] flex-1">
            <svg
              lucideSearch
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            ></svg>
            <input
              type="search"
              class="h-10 w-full rounded-panel border border-line bg-background pl-9 pr-3.5 text-sm text-ink shadow-soft transition-all duration-200 placeholder:text-ink-faint focus:border-accent/60 focus:outline-none focus:ring-4 focus:ring-accent/15"
              [placeholder]="searchPlaceholder()"
              [attr.aria-label]="searchAria()"
              [value]="service.search()"
              (input)="onSearch($event)"
            />
          </div>

          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <select
              class="h-10 w-full cursor-pointer rounded-panel border border-line bg-background px-3 pr-8 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              [value]="service.statusFilter()"
              [attr.aria-label]="filterByStatus()"
              (change)="onStatus($event)"
            >
              @for (option of STATUS_OPTIONS(); track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
            <select
              class="h-10 w-full cursor-pointer rounded-panel border border-line bg-background px-3 pr-8 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              [value]="service.priorityFilter()"
              [attr.aria-label]="filterByPriority()"
              (change)="onPriority($event)"
            >
              @for (option of PRIORITY_OPTIONS(); track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
            <select
              class="h-10 w-full cursor-pointer rounded-panel border border-line bg-background px-3 pr-8 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              [value]="service.categoryFilter()"
              [attr.aria-label]="filterByCategory()"
              (change)="onCategory($event)"
            >
              <option value="all">{{ categoryAll() }}</option>
              @for (option of CATEGORY_OPTIONS(); track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
            <select
              class="h-10 w-full cursor-pointer rounded-panel border border-line bg-background px-3 pr-8 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              [value]="service.sort()"
              [attr.aria-label]="sortBy()"
              (change)="onSort($event)"
            >
              @for (option of SORT_OPTIONS(); track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </div>

          @if (hasFilters()) {
            <button appButton variant="ghost" size="sm" (click)="service.resetFilters()">
              <svg lucideRotateCcw class="h-3.5 w-3.5" aria-hidden="true"></svg>
              {{ resetFilters() }}
            </button>
          }
        </div>
      </section>

      <!-- Liste des tâches -->
      <section>
        <div class="mb-3 flex items-center justify-between gap-3">
          <h2 class="font-display text-lg font-semibold tracking-tight text-primary">{{ yourTasks() }}</h2>
          <span class="text-xs font-medium text-ink-faint">
            {{ taskCount() }}
          </span>
        </div>

        @if (service.filteredTasks().length === 0) {
          <div class="rounded-card border border-dashed border-line-strong bg-surface/60 shadow-card">
            <app-empty-state
              [icon]="LucideListTodo"
              [title]="emptyTitle()"
              [description]="emptyDescription()"
              [actionLabel]="createTask()"
              (action)="openCreate()"
            />
          </div>
        } @else {
          <div class="flex flex-col gap-2.5">
            @for (task of service.filteredTasks(); track task.id) {
              <app-task-item
                [task]="task"
                [selected]="task.id === service.selectedTaskId()"
                (open)="service.selectTask($event.id)"
                (toggle)="onToggle($event)"
              />
            }
          </div>
        }
      </section>
    </div>

    @if (service.selectedTask(); as task) {
      <app-task-detail
        [task]="task"
        (closed)="service.selectTask(null)"
        (edit)="onEdit($event)"
      />
    }

    @if (formOpen()) {
      <app-task-form
        [task]="editing()"
        (saved)="onSaved($event)"
        (closed)="closeForm()"
      />
    }

    @if (toast(); as message) {
      <app-toast [message]="message" [tone]="toastTone()" (closed)="toast.set(null)" />
    }
  `,
})
export class TasksPage implements AfterViewInit {
  protected readonly service = inject(TaskService);
  private readonly languageService = inject(LanguageService);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Task | null>(null);
  protected readonly toast = signal<string | null>(null);
  protected readonly toastTone = signal<ToastTone>('primary');

  protected readonly eyebrow = this.languageService.translateSignal('tasks.eyebrow');
  protected readonly title = this.languageService.translateSignal('tasks.title');
  protected readonly subtitle = this.languageService.translateSignal('tasks.subtitle');
  protected readonly newTask = this.languageService.translateSignal('tasks.newTask');
  protected readonly createTask = this.languageService.translateSignal('tasks.createTask');
  protected readonly yourTasks = this.languageService.translateSignal('tasks.yourTasks');
  protected readonly statsAria = this.languageService.translateSignal('tasks.statsAria');
  protected readonly searchPlaceholder = this.languageService.translateSignal(
    'tasks.searchPlaceholder',
  );
  protected readonly searchAria = this.languageService.translateSignal('tasks.searchAria');
  protected readonly filterByStatus = this.languageService.translateSignal('tasks.filterByStatus');
  protected readonly filterByPriority = this.languageService.translateSignal(
    'tasks.filterByPriority',
  );
  protected readonly filterByCategory = this.languageService.translateSignal(
    'tasks.filterByCategory',
  );
  protected readonly sortBy = this.languageService.translateSignal('tasks.sortBy');
  protected readonly resetFilters = this.languageService.translateSignal('common.reset');
  protected readonly statsTotal = this.languageService.translateSignal('tasks.stats.total');
  protected readonly statsTotalHint = this.languageService.translateSignal('tasks.stats.totalHint');
  protected readonly statsDone = this.languageService.translateSignal('tasks.stats.done');
  protected readonly statsDoneHint = this.languageService.translateSignal('tasks.stats.doneHint');
  protected readonly statsInProgress = this.languageService.translateSignal('tasks.stats.inProgress');
  protected readonly statsInProgressHint = this.languageService.translateSignal(
    'tasks.stats.inProgressHint',
  );
  protected readonly statsOverdue = this.languageService.translateSignal('tasks.stats.overdue');
  protected readonly statsOverdueHint = this.languageService.translateSignal(
    'tasks.stats.overdueHint',
  );
  protected readonly categoryAll = this.languageService.translateSignal(
    'tasks.filters.category.all',
  );
  protected readonly emptyTitle = this.languageService.translateSignal('tasks.emptyTitle');
  protected readonly emptyDescription = this.languageService.translateSignal(
    'tasks.emptyDescription',
  );
  protected readonly LucideListTodo = LucideListTodo;

  protected readonly STATUS_OPTIONS = computed<TaskStatusOption[]>(() => [
    { value: 'all', label: this.languageService.translate('tasks.filters.status.all') },
    { value: 'todo', label: this.languageService.translate('tasks.filters.status.todo') },
    { value: 'in-progress', label: this.languageService.translate('tasks.filters.status.inProgress') },
    { value: 'done', label: this.languageService.translate('tasks.filters.status.done') },
    { value: 'overdue', label: this.languageService.translate('tasks.filters.status.overdue') },
  ]);

  protected readonly PRIORITY_OPTIONS = computed<TaskPriorityOption[]>(() => [
    { value: 'all', label: this.languageService.translate('tasks.filters.priority.all') },
    { value: 'low', label: this.languageService.translate('tasks.filters.priority.low') },
    { value: 'medium', label: this.languageService.translate('tasks.filters.priority.medium') },
    { value: 'high', label: this.languageService.translate('tasks.filters.priority.high') },
  ]);

  protected readonly CATEGORY_OPTIONS = computed<TaskCategoryOption[]>(() => [
    { value: 'work', label: this.languageService.translate('tasks.filters.category.work') },
    { value: 'personal', label: this.languageService.translate('tasks.filters.category.personal') },
    { value: 'sport', label: this.languageService.translate('tasks.filters.category.sport') },
    { value: 'studies', label: this.languageService.translate('tasks.filters.category.studies') },
  ]);

  protected readonly SORT_OPTIONS = computed<TaskSortOption[]>(() => [
    { value: 'due', label: this.languageService.translate('tasks.filters.sort.due') },
    { value: 'newest', label: this.languageService.translate('tasks.filters.sort.newest') },
    { value: 'oldest', label: this.languageService.translate('tasks.filters.sort.oldest') },
    { value: 'priority', label: this.languageService.translate('tasks.filters.sort.priority') },
    { value: 'duration', label: this.languageService.translate('tasks.filters.sort.duration') },
  ]);

  protected readonly taskCount = computed(() => {
    const count = this.service.filteredTasks().length;
    return this.languageService.translate(count > 1 ? 'tasks.countMany' : 'tasks.countOne', {
      count: String(count),
    });
  });

  protected readonly hasFilters = computed(() => {
    const s = this.service;
    return (
      s.search().length > 0 ||
      s.statusFilter() !== 'all' ||
      s.priorityFilter() !== 'all' ||
      s.categoryFilter() !== 'all'
    );
  });

  protected onSearch(event: Event): void {
    this.service.setSearch((event.target as HTMLInputElement).value);
  }

  protected onStatus(event: Event): void {
    this.service.setStatusFilter((event.target as HTMLSelectElement).value as TaskStatusFilter);
  }

  protected onPriority(event: Event): void {
    this.service.setPriorityFilter((event.target as HTMLSelectElement).value as TaskPriorityFilter);
  }

  protected onCategory(event: Event): void {
    this.service.setCategoryFilter((event.target as HTMLSelectElement).value as TaskCategory);
  }

  protected onSort(event: Event): void {
    this.service.setSort((event.target as HTMLSelectElement).value as TaskSort);
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  protected onEdit(task: Task): void {
    this.editing.set(task);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  protected onToggle(task: Task): void {
    const wasDone = task.status === 'done';
    this.service.toggleComplete(task.id);
    this.toastTone.set('success');
    this.toast.set(
      this.languageService.translate(
        wasDone ? 'tasks.toast.uncompleted' : 'tasks.toast.completed',
      ),
    );
  }

  protected onSaved(task: Task): void {
    if (this.editing()) {
      this.service.updateTask(task);
      this.toastTone.set('success');
      this.toast.set(this.languageService.translate('tasks.toast.updated'));
    } else {
      this.service.addTask(task);
      this.toastTone.set('success');
      this.toast.set(this.languageService.translate('tasks.toast.added'));
    }
    this.closeForm();
  }

  ngAfterViewInit(): void {
    if (this.reduced) {
      return;
    }
    const root = this.host.nativeElement;
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('.metric-card'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'transform' },
      );
      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('.task-item'),
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.04,
          ease: 'power2.out',
          delay: 0.15,
          clearProps: 'transform',
        },
      );
    });
  }
}
