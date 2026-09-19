import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { Modal } from '../../../../shared/ui/modal/modal';
import {
  CATEGORY_KEYS,
  CATEGORY_ORDER,
  REMINDER_LABEL_KEYS,
  eventTitle,
  toMinutes,
  todayISO,
  type CalendarEvent,
  type EventCategory,
  type ReminderKey,
} from '../../models/calendar.models';
import { ACTIONS, ERROR_TEXT, FIELD, GRID_2, INPUT, LABEL } from './form-styles';

@Component({
  selector: 'app-event-form',
  imports: [Modal, Button, FormsModule],
  template: `
    <app-modal
      [title]="titleLabel()"
      [subtitle]="subtitle()"
      (closed)="closed.emit()"
    >
      <form (ngSubmit)="save()" novalidate>
        <div [class]="FIELD">
          <label [class]="LABEL" for="event-title">{{ titleFieldLabel() }}</label>
          <input
            id="event-title"
            [class]="INPUT"
            type="text"
            [placeholder]="titlePlaceholder()"
            autocomplete="off"
            [ngModel]="title()"
            name="title"
            (ngModelChange)="title.set($event)"
          />
        </div>

        <div [class]="GRID_2 + ' mt-3'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="event-date">{{ dateLabel() }}</label>
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
            <label [class]="LABEL" for="event-cat">{{ categoryLabel() }}</label>
            <select
              id="event-cat"
              [class]="INPUT"
              [ngModel]="category()"
              name="category"
              (ngModelChange)="category.set($event)"
            >
              @for (category of CATEGORY_ORDER; track category) {
                <option [value]="category">{{ categoryValue(category) }}</option>
              }
            </select>
          </div>
        </div>

        <div [class]="GRID_2 + ' mt-3'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="event-start">{{ startLabel() }}</label>
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
            <label [class]="LABEL" for="event-end">{{ endLabel() }}</label>
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

        @if (submitted() && !isValidDuration()) {
          <p [class]="ERROR_TEXT + ' mt-2'">{{ invalidDuration() }}</p>
        }

        <div [class]="FIELD + ' mt-3'">
          <label [class]="LABEL" for="event-location">{{ locationLabel() }}</label>
          <input
            id="event-location"
            [class]="INPUT"
            type="text"
            [placeholder]="locationPlaceholder()"
            autocomplete="off"
            [ngModel]="location()"
            name="location"
            (ngModelChange)="location.set($event)"
          />
        </div>

        <div [class]="FIELD + ' mt-3'">
          <label [class]="LABEL" for="event-participants">{{ participantsLabel() }}</label>
          <input
            id="event-participants"
            [class]="INPUT"
            type="text"
            [placeholder]="participantsPlaceholder()"
            autocomplete="off"
            [ngModel]="participantsText()"
            name="participants"
            (ngModelChange)="participantsText.set($event)"
          />
        </div>

        <div [class]="GRID_2 + ' mt-3'">
          <div [class]="FIELD">
            <label [class]="LABEL" for="event-desc">{{ descriptionLabel() }}</label>
            <input
              id="event-desc"
              [class]="INPUT"
              type="text"
              [placeholder]="descriptionPlaceholder()"
              autocomplete="off"
              [ngModel]="description()"
              name="description"
              (ngModelChange)="description.set($event)"
            />
          </div>
          <div [class]="FIELD">
            <label [class]="LABEL" for="event-reminder">{{ reminderLabel() }}</label>
            <select
              id="event-reminder"
              [class]="INPUT"
              [ngModel]="reminder()"
              name="reminder"
              (ngModelChange)="reminder.set($event)"
            >
              @for (key of REMINDER_KEYS; track key) {
                <option [value]="key">{{ reminderValue(key) }}</option>
              }
            </select>
          </div>
        </div>

        @if (submitted() && !title().trim()) {
          <p [class]="ERROR_TEXT + ' mt-3'">{{ titleRequired() }}</p>
        }

        <div [class]="ACTIONS">
          <button appButton variant="ghost" size="md" type="button" (click)="closed.emit()">
            {{ cancelLabel() }}
          </button>
          <button appButton variant="primary" size="md" type="submit">
            {{ submitLabel() }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class EventForm {
  readonly event = input<CalendarEvent | null>(null);
  readonly initialDate = input(todayISO());
  readonly saved = output<CalendarEvent>();
  readonly closed = output<void>();

  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly date = signal(todayISO());
  protected readonly start = signal('09:00');
  protected readonly end = signal('10:00');
  protected readonly category = signal<EventCategory>('work');
  protected readonly location = signal('');
  protected readonly participantsText = signal('');
  protected readonly reminder = signal<ReminderKey>('15');
  protected readonly submitted = signal(false);

  protected readonly CATEGORY_ORDER = CATEGORY_ORDER;
  protected readonly REMINDER_KEYS: ReminderKey[] = ['none', '5', '10', '15', '30', '60', '1440'];

  private readonly languageService = inject(LanguageService);

  protected readonly titleLabel = computed(() =>
    this.event()
      ? this.languageService.translate('eventForm.editTitle')
      : this.languageService.translate('eventForm.newTitle'),
  );
  protected readonly subtitle = this.languageService.translateSignal('eventForm.subtitle');
  protected readonly titleFieldLabel = this.languageService.translateSignal('eventForm.title');
  protected readonly titlePlaceholder = this.languageService.translateSignal(
    'eventForm.titlePlaceholder',
  );
  protected readonly dateLabel = this.languageService.translateSignal('eventForm.date');
  protected readonly categoryLabel = this.languageService.translateSignal('eventForm.category');
  protected readonly startLabel = this.languageService.translateSignal('eventForm.start');
  protected readonly endLabel = this.languageService.translateSignal('eventForm.end');
  protected readonly invalidDuration = this.languageService.translateSignal(
    'eventForm.invalidDuration',
  );
  protected readonly locationLabel = this.languageService.translateSignal('eventForm.location');
  protected readonly locationPlaceholder = this.languageService.translateSignal(
    'eventForm.locationPlaceholder',
  );
  protected readonly participantsLabel = this.languageService.translateSignal(
    'eventForm.participants',
  );
  protected readonly participantsPlaceholder = this.languageService.translateSignal(
    'eventForm.participantsPlaceholder',
  );
  protected readonly descriptionLabel = this.languageService.translateSignal(
    'eventForm.description',
  );
  protected readonly descriptionPlaceholder = this.languageService.translateSignal(
    'eventForm.descriptionPlaceholder',
  );
  protected readonly reminderLabel = this.languageService.translateSignal('eventForm.reminder');
  protected readonly titleRequired = this.languageService.translateSignal(
    'eventForm.titleRequired',
  );
  protected readonly cancelLabel = this.languageService.translateSignal('common.cancel');
  protected readonly submitLabel = computed(() =>
    this.event()
      ? this.languageService.translate('eventForm.save')
      : this.languageService.translate('eventForm.create'),
  );

  protected readonly FIELD = FIELD;
  protected readonly LABEL = LABEL;
  protected readonly INPUT = INPUT;
  protected readonly GRID_2 = GRID_2;
  protected readonly ACTIONS = ACTIONS;
  protected readonly ERROR_TEXT = ERROR_TEXT;

  protected categoryValue(value: EventCategory): string {
    return this.languageService.translate(CATEGORY_KEYS[value]);
  }

  protected reminderValue(value: ReminderKey): string {
    return this.languageService.translate(REMINDER_LABEL_KEYS[value]);
  }

  constructor() {
    effect(() => {
      const entry = this.event();
      if (!entry) {
        this.title.set('');
        this.description.set('');
        this.date.set(this.initialDate());
        this.start.set('09:00');
        this.end.set('10:00');
        this.category.set('work');
        this.location.set('');
        this.participantsText.set('');
        this.reminder.set('15');
        this.submitted.set(false);
        return;
      }
      this.title.set(eventTitle(entry, (key, vars) => this.languageService.translate(key, vars)));
      this.description.set(entry.description ?? '');
      this.date.set(entry.date);
      this.start.set(entry.start);
      this.end.set(entry.end);
      this.category.set(entry.category);
      this.location.set(entry.location ?? '');
      this.participantsText.set((entry.participants ?? []).join(', '));
      this.reminder.set(entry.reminder ?? '15');
      this.submitted.set(false);
    });
  }

  protected isValidDuration(): boolean {
    return toMinutes(this.end()) - toMinutes(this.start()) >= 5;
  }

  protected save(): void {
    this.submitted.set(true);
    if (!this.title().trim() || !this.isValidDuration()) {
      return;
    }
    const existing = this.event();
    const participants = this.participantsText()
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    this.saved.emit({
      id: existing?.id ?? crypto.randomUUID(),
      title: this.title().trim(),
      description: this.description().trim() || undefined,
      date: this.date(),
      start: this.start(),
      end: this.end(),
      duration: Math.max(5, toMinutes(this.end()) - toMinutes(this.start())),
      category: this.category(),
      location: this.location().trim() || undefined,
      participants: participants.length ? participants : undefined,
      reminder: this.reminder(),
    });
  }
}
