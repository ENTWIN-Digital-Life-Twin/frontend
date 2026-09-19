import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../../shared/ui/button/button';
import { Modal } from '../../../../shared/ui/modal/modal';
import { LanguageService } from '../../../../core/services/language.service';
import {
  todayISO,
  toMinutes,
  type PlanningCategory,
  type PlanningEntry,
  type PlanningEntryType,
} from '../../models/planning.models';
import { ACTIONS, ERROR_TEXT, FIELD, GRID_2, INPUT, LABEL, TEXTAREA } from './form-styles';

@Component({
  selector: 'app-planning-modal-block',
  imports: [Modal, Button, FormsModule],
  template: `
    <app-modal
      [title]="entry() ? t('planningModal.blockEditTitle') : t('planningModal.blockNewTitle')"
      [subtitle]="t('planningModal.blockSubtitle')"
      (closed)="closed.emit()"
    >
      <form (ngSubmit)="save()" novalidate>
        <div [class]="GRID_2">
          <div [class]="FIELD">
            <label [class]="LABEL" for="block-type">{{ t('planningModal.blockType') }}</label>
            <select
              id="block-type"
              [class]="INPUT"
              [ngModel]="type()"
              name="type"
              (ngModelChange)="type.set($event)"
            >
              <option value="sport">{{ t('categories.sport') }}</option>
              <option value="break">{{ t('planningModal.breakLabel') }}</option>
              <option value="free">{{ t('categories.free') }}</option>
            </select>
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="block-date">{{ t('eventForm.date') }}</label>
            <input
              id="block-date"
              [class]="INPUT"
              type="date"
              [ngModel]="date()"
              name="date"
              (ngModelChange)="date.set($event)"
            />
          </div>
        </div>

        <div [class]="FIELD + ' mt-3'">
          <label [class]="LABEL" for="block-title">{{ t('tasksForm.title') }}</label>
          <input
            id="block-title"
            [class]="INPUT"
            type="text"
            [placeholder]="t('planningModal.blockTitlePlaceholder')"
            autocomplete="off"
            [ngModel]="title()"
            name="title"
            (ngModelChange)="title.set($event)"
          />
        </div>

        <div [class]="FIELD + ' mt-3'">
          <label [class]="LABEL" for="block-desc">{{ t('eventForm.description') }}</label>
          <textarea
            id="block-desc"
            [class]="TEXTAREA"
            rows="2"
            [placeholder]="t('planningModal.blockDescPlaceholder')"
            [ngModel]="description()"
            name="description"
            (ngModelChange)="description.set($event)"
          ></textarea>
        </div>

        <div [class]="GRID_2 + ' mt-3'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="block-start">{{ t('eventForm.start') }}</label>
            <input
              id="block-start"
              [class]="INPUT"
              type="time"
              [ngModel]="start()"
              name="start"
              (ngModelChange)="start.set($event)"
            />
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="block-end">{{ t('eventForm.end') }}</label>
            <input
              id="block-end"
              [class]="INPUT"
              type="time"
              [ngModel]="end()"
              name="end"
              (ngModelChange)="end.set($event)"
            />
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
export class PlanningModalBlock {
  readonly entry = input<PlanningEntry | null>(null);
  readonly saved = output<PlanningEntry>();
  readonly closed = output<void>();

  protected readonly type = signal<PlanningEntryType>('sport');
  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly date = signal(todayISO());
  protected readonly start = signal('18:00');
  protected readonly end = signal('19:00');
  protected readonly submitted = signal(false);

  protected readonly FIELD = FIELD;
  protected readonly LABEL = LABEL;
  protected readonly INPUT = INPUT;
  protected readonly TEXTAREA = TEXTAREA;
  protected readonly GRID_2 = GRID_2;
  protected readonly ACTIONS = ACTIONS;
  protected readonly ERROR_TEXT = ERROR_TEXT;

  private readonly languageService = inject(LanguageService);
  protected readonly t = (key: string, vars?: Record<string, string>) =>
    this.languageService.translate<string>(key, vars);

  constructor() {
    effect(() => {
      const entry = this.entry();
      if (!entry) {
        return;
      }
      this.type.set(entry.type);
      this.title.set(entry.title);
      this.description.set(entry.description ?? '');
      this.date.set(entry.date);
      this.start.set(entry.start);
      this.end.set(entry.end);
    });
  }

  protected save(): void {
    this.submitted.set(true);
    if (!this.title().trim()) {
      return;
    }
    const existing = this.entry();
    const type = this.type();
    const category: PlanningCategory = type === 'sport' ? 'sport' : type === 'break' ? 'meals' : 'free';
    const tone = type === 'sport' ? 'danger' : type === 'break' ? 'warning' : 'primary';
    this.saved.emit({
      id: existing?.id ?? crypto.randomUUID(),
      type,
      title: this.title().trim(),
      description: this.description().trim() || undefined,
      category,
      date: this.date(),
      start: this.start(),
      end: this.end(),
      duration: Math.max(5, toMinutes(this.end()) - toMinutes(this.start())),
      tone,
    });
  }
}
