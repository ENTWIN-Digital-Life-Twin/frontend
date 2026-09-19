import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../../shared/ui/button/button';
import { Modal } from '../../../../shared/ui/modal/modal';
import { LanguageService } from '../../../../core/services/language.service';
import {
  todayISO,
  toMinutes,
  type PlanningCategory,
  type PlanningEntry,
  type PlanningPriority,
  type TaskStatus,
} from '../../models/planning.models';
import { ACTIONS, ERROR_TEXT, FIELD, GRID_2, INPUT, LABEL, TEXTAREA } from './form-styles';

@Component({
  selector: 'app-planning-modal-task',
  imports: [Modal, Button, FormsModule],
  template: `
    <app-modal
      [title]="entry() ? t('tasksForm.editTitle') : t('tasksForm.newTitle')"
      [subtitle]="t('planningModal.taskSubtitle')"
      (closed)="closed.emit()"
    >
      <form (ngSubmit)="save()" novalidate>
        <div [class]="FIELD">
          <label [class]="LABEL" for="task-title">{{ t('tasksForm.title') }}</label>
          <input
            id="task-title"
            [class]="INPUT"
            type="text"
            [placeholder]="t('planningModal.taskTitlePlaceholder')"
            autocomplete="off"
            [ngModel]="title()"
            name="title"
            (ngModelChange)="title.set($event)"
          />
        </div>

        <div [class]="FIELD + ' mt-3'">
          <label [class]="LABEL" for="task-desc">{{ t('tasksForm.description') }}</label>
          <textarea
            id="task-desc"
            [class]="TEXTAREA"
            rows="3"
            [placeholder]="t('tasksForm.descriptionPlaceholder')"
            [ngModel]="description()"
            name="description"
            (ngModelChange)="description.set($event)"
          ></textarea>
        </div>

        <div [class]="GRID_2 + ' mt-3'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="task-date">{{ t('eventForm.date') }}</label>
            <input
              id="task-date"
              [class]="INPUT"
              type="date"
              [ngModel]="date()"
              name="date"
              (ngModelChange)="date.set($event)"
            />
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="task-cat">{{ t('tasksForm.category') }}</label>
            <select
              id="task-cat"
              [class]="INPUT"
              [ngModel]="category()"
              name="category"
              (ngModelChange)="category.set($event)"
            >
              @for (opt of categoryOptions(); track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>
        </div>

        <div [class]="GRID_2 + ' mt-3'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="task-start">{{ t('eventForm.start') }}</label>
            <input
              id="task-start"
              [class]="INPUT"
              type="time"
              [ngModel]="start()"
              name="start"
              (ngModelChange)="start.set($event)"
            />
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="task-end">{{ t('eventForm.end') }}</label>
            <input
              id="task-end"
              [class]="INPUT"
              type="time"
              [ngModel]="end()"
              name="end"
              (ngModelChange)="end.set($event)"
            />
          </div>
        </div>

        <div [class]="GRID_2 + ' mt-3'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="task-priority">{{ t('tasksForm.priority') }}</label>
            <select
              id="task-priority"
              [class]="INPUT"
              [ngModel]="priority()"
              name="priority"
              (ngModelChange)="priority.set($event)"
            >
              @for (opt of priorityOptions(); track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="task-status">{{ t('tasksForm.status') }}</label>
            <select
              id="task-status"
              [class]="INPUT"
              [ngModel]="status()"
              name="status"
              (ngModelChange)="status.set($event)"
            >
              @for (opt of statusOptions(); track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>
        </div>

        @if (submitted() && !title().trim()) {
          <p [class]="ERROR_TEXT + ' mt-3'">{{ t('tasksForm.titleRequired') }}</p>
        }

        <div [class]="ACTIONS">
          <button appButton variant="ghost" size="md" type="button" (click)="closed.emit()">{{ t('common.cancel') }}</button>
          <button appButton variant="primary" size="md" type="submit">{{ t('common.save') }}</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class PlanningModalTask {
  readonly entry = input<PlanningEntry | null>(null);
  readonly saved = output<PlanningEntry>();
  readonly closed = output<void>();

  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly date = signal(todayISO());
  protected readonly start = signal('09:00');
  protected readonly end = signal('10:00');
  protected readonly category = signal<PlanningCategory>('work');
  protected readonly priority = signal<PlanningPriority>('medium');
  protected readonly status = signal<TaskStatus>('todo');
  protected readonly submitted = signal(false);

  protected readonly FIELD = FIELD;
  protected readonly LABEL = LABEL;
  protected readonly INPUT = INPUT;
  protected readonly TEXTAREA = TEXTAREA;
  protected readonly GRID_2 = GRID_2;
  protected readonly ACTIONS = ACTIONS;
  protected readonly ERROR_TEXT = ERROR_TEXT;

  readonly t = (key: string, vars?: Record<string, string>) =>
    this.languageService.translate<string>(key, vars);

  categoryOptions = () => [
    { value: 'work', label: this.t('categories.work') },
    { value: 'personal', label: this.t('categories.personal') },
    { value: 'sport', label: this.t('categories.sport') },
    { value: 'meals', label: this.t('categories.meals') },
  ];

  priorityOptions = () => [
    { value: 'low', label: this.t('priorities.low') },
    { value: 'medium', label: this.t('priorities.medium') },
    { value: 'high', label: this.t('priorities.high') },
  ];

  statusOptions = () => [
    { value: 'todo', label: this.t('statuses.todo') },
    { value: 'in-progress', label: this.t('statuses.inProgress') },
    { value: 'done', label: this.t('statuses.done') },
  ];

  constructor(private readonly languageService: LanguageService) {
    effect(() => {
      const entry = this.entry();
      if (!entry) {
        return;
      }
      this.title.set(entry.title);
      this.description.set(entry.description ?? '');
      this.date.set(entry.date);
      this.start.set(entry.start);
      this.end.set(entry.end);
      this.category.set(entry.category);
      this.priority.set(entry.priority ?? 'medium');
      this.status.set(entry.status ?? 'todo');
    });
  }

  protected save(): void {
    this.submitted.set(true);
    if (!this.title().trim()) {
      return;
    }
    const existing = this.entry();
    this.saved.emit({
      id: existing?.id ?? crypto.randomUUID(),
      type: 'task',
      title: this.title().trim(),
      description: this.description().trim() || undefined,
      category: this.category(),
      date: this.date(),
      start: this.start(),
      end: this.end(),
      duration: Math.max(5, toMinutes(this.end()) - toMinutes(this.start())),
      status: this.status(),
      priority: this.priority(),
      tone: 'primary',
    });
  }
}
