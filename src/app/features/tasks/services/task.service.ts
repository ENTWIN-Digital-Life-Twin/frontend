import { Injectable, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import {
  CATEGORY_KEYS,
  MOCK_TASKS,
  compareTasks,
  isOverdue,
  todayISO,
  type Subtask,
  type Task,
  type TaskCategoryFilter,
  type TaskPriorityFilter,
  type TaskSort,
  type TaskStatusFilter,
} from '../models/task.models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly languageService = inject(LanguageService);

  private readonly tasksSignal = signal<Task[]>(MOCK_TASKS);

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

  toggleComplete(id: string): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === 'done' ? 'todo' : 'done',
              progress: task.status === 'done' ? task.progress : 100,
            }
          : task,
      ),
    );
  }

  addTask(task: Task): void {
    this.tasksSignal.update((tasks) => [
      ...tasks,
      {
        ...task,
        activity: [{ id: `a-${Date.now()}`, label: this.languageService.translate('mock.activity.createdToday') }, ...task.activity],
        createdAt: todayISO(),
      },
    ]);
    this.selectTask(task.id);
  }

  updateTask(task: Task): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((item) =>
        item.id === task.id
          ? {
              ...task,
              activity: [{ id: `a-${Date.now()}`, label: this.languageService.translate('mock.activity.modifiedToday') }, ...task.activity],
            }
          : item,
      ),
    );
    this.selectTask(task.id);
  }

  deleteTask(id: string): void {
    this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
    if (this.selectedTaskId() === id) {
      this.selectedTaskId.set(null);
    }
  }

  updateNotes(id: string, notes: string): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, notes } : task)),
    );
  }

  updateProgress(id: string, progress: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(progress)));
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, progress: clamped } : task)),
    );
  }

  addSubtask(taskId: string, title: string): void {
    const clean = title.trim();
    if (!clean) {
      return;
    }
    this.tasksSignal.update((tasks) =>
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...task.subtasks,
                { id: `s-${Date.now()}`, title: clean, done: false },
              ],
            }
          : task,
      ),
    );
  }

  toggleSubtask(taskId: string, subtaskId: string): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((sub) =>
                sub.id === subtaskId ? { ...sub, done: !sub.done } : sub,
              ),
            }
          : task,
      ),
    );
  }

  removeSubtask(taskId: string, subtaskId: string): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, subtasks: task.subtasks.filter((sub) => sub.id !== subtaskId) }
          : task,
      ),
    );
  }

  subtaskProgress(task: Task): number {
    if (task.subtasks.length === 0) {
      return task.progress;
    }
    const done = task.subtasks.filter((sub: Subtask) => sub.done).length;
    return Math.round((done / task.subtasks.length) * 100);
  }
}
