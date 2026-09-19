import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { Modal } from '../../../../shared/ui/modal/modal';
import {
  todayISO,
  toMinutes,
  type PlanningCategory,
  type PlanningEntry,
} from '../../models/planning.models';
import { ACTIONS, ERROR_TEXT, FIELD, GRID_2, INPUT, LABEL, TEXTAREA } from './form-styles';

@Component({
  selector: 'app-planning-modal-event',
  imports: [Modal, Button, FormsModule],
  template: `
    <app-modal
      [title]="entry() ? t('eventForm.editTitle') : t('eventForm.newTitle')"
      [subtitle]="t('planningModal.eventSubtitle')"
      (closed)="closed.emit()"
    >
      <form (ngSubmit)="save()" novalidate>
        <div [class]="FIELD">
          <label [class]="LABEL" for="event-title">{{ t('eventForm.title') }}</label>
          <input
            id="event-title"
            [class]="INPUT"
            type="text"
            [placeholder]="t('eventForm.titlePlaceholder')"
            autocomplete="off"
            [ngModel]="title()"
            name="title"
            (ngModelChange)="title.set($event)"
          />
        </div>

        <div [class]="FIELD + ' mt-3'">
          <label [class]="LABEL" for="event-desc">{{ t('eventForm.description') }}</label>
          <textarea
            id="event-desc"
            [class]="TEXTAREA"
            rows="3"
            [placeholder]="t('planningModal.eventDescPlaceholder')"
            [ngModel]="description()"
            name="description"
            (ngModelChange)="description.set($event)"
          ></textarea>
        </div>

        <div [class]="GRID_2 + ' mt-3'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="event-date">{{ t('eventForm.date') }}</label>
            <input
              id="event-date"
              [class]="INPUT"
              type="date"
              [ngModel]="date()"
              name="date"
              (ngModelChange)="date.set($event)"
            />
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="event-cat">{{ t('eventForm.category') }}</label>
            <select
              id="event-cat"
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
            <label [class]="LABEL" for="event-start">{{ t('eventForm.start') }}</label>
            <input
              id="event-start"
              [class]="INPUT"
              type="time"
              [ngModel]="start()"
              name="start"
              (ngModelChange)="start.set($event)"
            />
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="event-end">{{ t('eventForm.end') }}</label>
            <input
              id="event-end"
              [class]="INPUT"
              type="time"
              [ngModel]="end()"
              name="end"
              (ngModelChange)="end.set($event)"
            />
          </div>
        </div>

        <div [class]="FIELD + ' mt-3'">
          <label [class]="LABEL" for="event-location">{{ t('eventForm.location') }}</label>
          <input
            id="event-location"
            [class]="INPUT"
            type="text"
            [placeholder]="t('eventForm.locationPlaceholder')"
            autocomplete="off"
            [ngModel]="location()"
            name="location"
            (ngModelChange)="location.set($event)"
          />
        </div>

        <div [class]="FIELD + ' mt-3'">
          <label [class]="LABEL" for="event-participants">{{ t('eventForm.participants') }}</label>
          <input
            id="event-participants"
            [class]="INPUT"
            type="text"
            [placeholder]="t('eventForm.participantsPlaceholder')"
            autocomplete="off"
            [ngModel]="participantsText()"
            name="participants"
            (ngModelChange)="participantsText.set($event)"
          />
        </div>

        @if (submitted() && !title().trim()) {
          <p [class]="ERROR_TEXT + ' mt-3'">{{ t('eventForm.titleRequired') }}</p>
        }

        <div [class]="ACTIONS">
          <button appButton variant="ghost" size="md" type="button" (click)="closed.emit()">{{ t('common.cancel') }}</button>
          <button appButton variant="primary" size="md" type="submit">{{ t('common.save') }}</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class PlanningModalEvent {
  readonly entry = input<PlanningEntry | null>(null);
  readonly saved = output<PlanningEntry>();
  readonly closed = output<void>();

  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly date = signal(todayISO());
  protected readonly start = signal('10:00');
  protected readonly end = signal('11:00');
  protected readonly category = signal<PlanningCategory>('work');
  protected readonly location = signal('');
  protected readonly participantsText = signal('');
  protected readonly submitted = signal(false);

  protected readonly FIELD = FIELD;
  protected readonly LABEL = LABEL;
  protected readonly INPUT = INPUT;
  protected readonly TEXTAREA = TEXTAREA;
  protected readonly GRID_2 = GRID_2;
  protected readonly ACTIONS = ACTIONS;
  protected readonly ERROR_TEXT = ERROR_TEXT;

  private readonly languageService = inject(LanguageService);

  t = (key: string, vars?: Record<string, string>) => this.languageService.translate<string>(key, vars);

  protected categoryOptions(): { value: PlanningCategory; label: string }[] {
    return [
      { value: 'work', label: this.t('categories.work') },
      { value: 'personal', label: this.t('categories.personal') },
      { value: 'sport', label: this.t('categories.sport') },
      { value: 'meals', label: this.t('categories.meals') },
    ];
  }

  constructor() {
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
      this.location.set(entry.location ?? '');
      this.participantsText.set((entry.participants ?? []).join(', '));
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
      type: 'event',
      title: this.title().trim(),
      description: this.description().trim() || undefined,
      category: this.category(),
      date: this.date(),
      start: this.start(),
      end: this.end(),
      duration: Math.max(5, toMinutes(this.end()) - toMinutes(this.start())),
      location: this.location().trim() || undefined,
      participants: this.participantsText()
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
      tone: 'accent',
    });
  }
}
