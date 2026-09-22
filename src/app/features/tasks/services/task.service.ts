import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import { ReminderService } from '../../notifications/services/reminder.service';
import { TaskCategoryDirectoryService } from '../../planning/services/task-category-directory.service';
import {
  CATEGORY_KEYS,
  compareTasks,
  isOverdue,
  todayISO,
  type Subtask,
  type Task,
  type TaskCategoryFilter,
  type TaskPriority,
  type TaskPriorityFilter,
  type TaskSort,
  type TaskStatus,
  type TaskStatusFilter,
} from '../models/task.models';

type BackendTaskStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';
type BackendTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  priority: BackendTaskPriority;
  status: BackendTaskStatus;
  plannedDurationMinutes: number;
  actualDurationMinutes: number | null;
  startDateTime: string | null;
  deadline: string | null;
  completionPercentage: number | null;
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
}

interface PageResponse<T> {
  content: T[];
}

const STATUS_TO_BACKEND: Record<TaskStatus, BackendTaskStatus> = {
  todo: 'SCHEDULED',
  'in-progress': 'IN_PROGRESS',
  done: 'COMPLETED',
};

function statusFromBackend(status: BackendTaskStatus): TaskStatus {
  if (status === 'IN_PROGRESS') return 'in-progress';
  if (status === 'COMPLETED') return 'done';
  return 'todo';
}

const PRIORITY_TO_BACKEND: Record<TaskPriority, BackendTaskPriority> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
};

function priorityFromBackend(priority: BackendTaskPriority): TaskPriority {
  if (priority === 'LOW') return 'low';
  if (priority === 'MEDIUM') return 'medium';
  return 'high';
}

const pad2 = (value: number): string => String(value).padStart(2, '0');

function toInstant(dueDate: string, time: string): string {
  const [year, month, day] = dueDate.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

function addMinutesIso(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function fromInstant(iso: string): { date: string; time: string } {
  const date = new Date(iso);
  return {
    date: `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
    time: `${pad2(date.getHours())}:${pad2(date.getMinutes())}`,
  };
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly languageService = inject(LanguageService);
  private readonly http = inject(HttpClient);
  private readonly categoryDirectory = inject(TaskCategoryDirectoryService);
  private readonly reminderService = inject(ReminderService);
  private readonly baseUrl = `${environment.planningApiUrl}/tasks`;

  private readonly tasksSignal = signal<Task[]>([]);

  constructor() {
    this.categoryDirectory
      .load()
      .pipe(switchMap(() => this.http.get<PageResponse<TaskResponse>>(this.baseUrl, {
        params: new HttpParams().set('page', '0').set('size', '100'),
      })))
      .subscribe({
        next: (page) => this.tasksSignal.set(page.content.map((res) => this.fromResponse(res))),
        error: () => this.tasksSignal.set([]),
      });
  }

  reload(): void {
    this.http
      .get<PageResponse<TaskResponse>>(this.baseUrl, {
        params: new HttpParams().set('page', '0').set('size', '100'),
      })
      .subscribe({
        next: (page) => this.tasksSignal.set(page.content.map((res) => this.fromResponse(res))),
        error: (err) => console.error('Failed to reload tasks', err),
      });
  }

  private fromResponse(res: TaskResponse, extras?: Partial<Task>): Task {
    const anchorIso = res.startDateTime ?? res.deadline ?? res.createdAt;
    const { date, time } = fromInstant(anchorIso);
    return {
      id: res.id,
      title: res.title,
      description: res.description ?? '',
      status: statusFromBackend(res.status),
      priority: priorityFromBackend(res.priority),
      category: this.categoryDirectory.categoryFor(res.categoryId),
      dueDate: date,
      startTime: time,
      duration: res.plannedDurationMinutes,
      progress: res.completionPercentage ?? 0,
      notes: extras?.notes ?? '',
      subtasks: res.subtasks ?? extras?.subtasks ?? [],
      activity: extras?.activity ?? [],
      createdAt: res.createdAt,
    };
  }

  private toCreateRequest(task: Task): Record<string, unknown> {
    const start = toInstant(task.dueDate, task.startTime);
    return {
      title: task.title,
      description: task.description || null,
      categoryId: this.categoryDirectory.categoryIdFor(task.category) ?? null,
      priority: PRIORITY_TO_BACKEND[task.priority],
      plannedDurationMinutes: task.duration,
      startDateTime: start,
      deadline: addMinutesIso(start, task.duration),
      completionPercentage: task.progress,
      subtasks: task.subtasks.map((sub) => ({
        id: sub.id,
        title: sub.title,
        done: sub.done,
      })),
    };
  }

  private toUpdateRequest(task: Task): Record<string, unknown> {
    return { ...this.toCreateRequest(task), actualDurationMinutes: null };
  }

  readonly search = signal('');
  readonly statusFilter = signal<TaskStatusFilter>('all');
  readonly priorityFilter = signal<TaskPriorityFilter>('all');
  readonly categoryFilter = signal<TaskCategoryFilter>('all');
  readonly sort = signal<TaskSort>('due');
  readonly selectedTaskId = signal<string | null>(null);

  readonly tasks = this.tasksSignal.asReadonly();

  readonly filteredTasks = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const category = this.categoryFilter();

    const list = this.tasksSignal().filter((task) => {
      if (status === 'overdue' ? !isOverdue(task) : status !== 'all' && task.status !== status) {
        return false;
      }
      if (priority !== 'all' && task.priority !== priority) {
        return false;
      }
      if (category !== 'all' && task.category !== category) {
        return false;
      }
      if (query) {
        const haystack = `${this.languageService.translate(task.title)} ${this.languageService.translate(task.description)} ${this.languageService.translate(
          CATEGORY_KEYS[task.category],
        )}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });

    return [...list].sort((a, b) => compareTasks(a, b, this.sort()));
  });

  readonly counts = computed(() => {
    const all = this.tasksSignal();
    return {
      total: all.length,
      done: all.filter((task) => task.status === 'done').length,
      inProgress: all.filter((task) => task.status === 'in-progress').length,
      overdue: all.filter(isOverdue).length,
    };
  });

  readonly todayStats = computed(() => {
    const today = todayISO();
    const todayTasks = this.tasksSignal().filter((task) => task.dueDate === today);
    const done = todayTasks.filter((task) => task.status === 'done').length;
    return {
      total: todayTasks.length,
      done,
      remaining: todayTasks.length - done,
      important: todayTasks.filter(
        (task) => task.status !== 'done' && task.priority === 'high',
      ).length,
      percent: todayTasks.length > 0 ? Math.round((done / todayTasks.length) * 100) : 0,
    };
  });

  readonly importantToday = computed(
    () =>
      this.tasksSignal().filter(
        (task) => task.dueDate === todayISO() && task.status !== 'done' && task.priority === 'high',
      ).length,
  );

  readonly selectedTask = computed(
    () => this.tasksSignal().find((task) => task.id === this.selectedTaskId()) ?? null,
  );

  setSearch(value: string): void {
    this.search.set(value);
  }

  setStatusFilter(value: TaskStatusFilter): void {
    this.statusFilter.set(value);
  }

  setPriorityFilter(value: TaskPriorityFilter): void {
    this.priorityFilter.set(value);
  }

  setCategoryFilter(value: TaskCategoryFilter): void {
    this.categoryFilter.set(value);
  }

  setSort(value: TaskSort): void {
    this.sort.set(value);
  }

  resetFilters(): void {
    this.search.set('');
    this.statusFilter.set('all');
    this.priorityFilter.set('all');
    this.categoryFilter.set('all');
  }

  selectTask(id: string | null): void {
    this.selectedTaskId.set(id);
  }

  toggleComplete(id: string, onDone?: (completed: boolean) => void): void {
    const current = this.tasksSignal().find((task) => task.id === id);
    if (!current) {
      return;
    }
    const nextStatus: TaskStatus = current.status === 'done' ? 'todo' : 'done';
    const nextProgress = current.status === 'done' ? current.progress : 100;
    this.tasksSignal.update((tasks) =>
      tasks.map((task) =>
        task.id === id ? { ...task, status: nextStatus, progress: nextProgress } : task,
      ),
    );
    this.http
      .patch(`${this.baseUrl}/${id}/status`, { status: STATUS_TO_BACKEND[nextStatus] })
      .subscribe({
        next: () => onDone?.(nextStatus === 'done'),
        error: (err) => {
          console.error('Failed to update task status', err);
          this.tasksSignal.update((tasks) =>
            tasks.map((task) => (task.id === id ? current : task)),
          );
        },
      });
    this.syncReminder({ ...current, status: nextStatus, progress: nextProgress });
  }

  addTask(task: Task, onDone?: () => void): void {
    const tempId = task.id;
    const optimistic: Task = {
      ...task,
      activity: [
        { id: `a-${Date.now()}`, label: this.languageService.translate('mock.activity.createdToday') },
        ...task.activity,
      ],
      createdAt: todayISO(),
    };
    this.tasksSignal.update((tasks) => [...tasks, optimistic]);
    this.selectTask(tempId);

    this.http.post<TaskResponse>(this.baseUrl, this.toCreateRequest(task)).subscribe({
      next: (res) => {
        const created = this.fromResponse(res, optimistic);
        this.tasksSignal.update((tasks) =>
          tasks.map((item) => (item.id === tempId ? created : item)),
        );
        if (this.selectedTaskId() === tempId) {
          this.selectedTaskId.set(created.id);
        }
        this.syncReminder(created);
        onDone?.();
      },
      error: (err) => {
        console.error('Failed to create task', err);
        this.tasksSignal.update((tasks) => tasks.filter((item) => item.id !== tempId));
        if (this.selectedTaskId() === tempId) {
          this.selectedTaskId.set(null);
        }
      },
    });
  }

  updateTask(task: Task, onDone?: () => void): void {
    const withActivity: Task = {
      ...task,
      activity: [
        { id: `a-${Date.now()}`, label: this.languageService.translate('mock.activity.modifiedToday') },
        ...task.activity,
      ],
    };
    this.tasksSignal.update((tasks) =>
      tasks.map((item) => (item.id === task.id ? withActivity : item)),
    );
    this.selectTask(task.id);

    this.http.put<TaskResponse>(`${this.baseUrl}/${task.id}`, this.toUpdateRequest(task)).subscribe({
      next: (res) => {
        const updated = this.fromResponse(res, withActivity);
        this.tasksSignal.update((tasks) =>
          tasks.map((item) => (item.id === task.id ? updated : item)),
        );
        this.syncReminder(updated);
        onDone?.();
      },
      error: (err) => console.error('Failed to update task', err),
    });
  }

  deleteTask(id: string): void {
    this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
    if (this.selectedTaskId() === id) {
      this.selectedTaskId.set(null);
    }
    this.reminderService.deleteForSource('TASK', id);
    this.http
      .delete(`${this.baseUrl}/${id}`)
      .subscribe({ error: (err) => console.error('Failed to delete task', err) });
  }

  private syncReminder(task: Task): void {
    this.reminderService.sync({
      sourceType: 'TASK',
      sourceResourceId: task.id,
      title: task.title,
      message: task.description || null,
      reminderType: 'TASK',
      triggerDateTime: toInstant(task.dueDate, task.startTime),
      advanceMinutes: task.status === 'done' ? null : 15,
    });
  }

  updateNotes(id: string, notes: string): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, notes } : task)),
    );
  }

  updateProgress(id: string, progress: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(progress)));
    const current = this.tasksSignal().find((task) => task.id === id);
    if (!current) {
      return;
    }
    const updated = { ...current, progress: clamped };
    this.tasksSignal.update((tasks) => tasks.map((task) => (task.id === id ? updated : task)));
    this.http.put<TaskResponse>(`${this.baseUrl}/${id}`, this.toUpdateRequest(updated)).subscribe({
      error: (err) => console.error('Failed to update task progress', err),
    });
  }

  addSubtask(taskId: string, title: string): void {
    const clean = title.trim();
    if (!clean) {
      return;
    }
    this.mutateSubtasks(taskId, (task) => ({
      ...task,
      subtasks: [
        ...task.subtasks,
        { id: crypto.randomUUID(), title: clean, done: false },
      ],
    }));
  }

  toggleSubtask(taskId: string, subtaskId: string): void {
    this.mutateSubtasks(taskId, (task) => ({
      ...task,
      subtasks: task.subtasks.map((sub) =>
        sub.id === subtaskId ? { ...sub, done: !sub.done } : sub,
      ),
    }));
  }

  removeSubtask(taskId: string, subtaskId: string): void {
    this.mutateSubtasks(taskId, (task) => ({
      ...task,
      subtasks: task.subtasks.filter((sub) => sub.id !== subtaskId),
    }));
  }

  private mutateSubtasks(taskId: string, mutator: (task: Task) => Task): void {
    const current = this.tasksSignal().find((task) => task.id === taskId);
    if (!current) {
      return;
    }
    const updated = mutator(current);
    this.tasksSignal.update((tasks) => tasks.map((task) => (task.id === taskId ? updated : task)));
    this.http.put<TaskResponse>(`${this.baseUrl}/${taskId}`, this.toUpdateRequest(updated)).subscribe({
      next: (res) => {
        const synced = this.fromResponse(res, updated);
        this.tasksSignal.update((tasks) =>
          tasks.map((task) => (task.id === taskId ? synced : task)),
        );
      },
      error: (err) => console.error('Failed to persist subtasks', err),
    });
  }

  subtaskProgress(task: Task): number {
    if (task.subtasks.length === 0) {
      return task.progress;
    }
    const done = task.subtasks.filter((sub: Subtask) => sub.done).length;
    return Math.round((done / task.subtasks.length) * 100);
  }
}
