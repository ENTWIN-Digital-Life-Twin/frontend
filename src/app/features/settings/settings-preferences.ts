import { Component, computed, inject, signal } from '@angular/core';
import {
  LucideCalendarDays,
  LucideFlag,
  LucideGlobe,
  LucideLanguages,
} from '@lucide/angular';
import {
  SettingsService,
  type DateFormatId,
  type LanguageCode,
  type TimezoneCode,
  type WeekStart,
} from './services/settings.service';
import { LanguageService } from '../../core/services/language.service';
import { SettingsOption } from './settings-option';

interface DateFormatOption {
  value: DateFormatId;
  label: string;
  description: string;
}

function longDate(date: Date, locale = 'fr-FR'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function shortDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function isoDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

@Component({
  selector: 'app-settings-preferences',
  imports: [SettingsOption],
  template: `
    <div class="space-y-5">
      <header>
        <h2 class="font-display text-xl font-semibold tracking-tight text-primary">
          {{ title() }}
        </h2>
        <p class="mt-1 text-sm leading-relaxed text-ink-muted">
          {{ subtitle() }}
        </p>
      </header>

      <section class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <h3 class="font-display text-base font-semibold tracking-tight text-primary">{{ languageLabel() }}</h3>
        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          @for (option of languages; track option.value) {
            <app-settings-option
              group="st-language"
              [value]="option.value"
              [label]="option.label"
              [icon]="LucideLanguages"
              [selected]="prefs().language === option.value"
              (selectedChange)="onLanguageChange($event)"
            />
          }
        </div>

        <div class="mt-6 border-t border-line pt-6">
          <h3 class="font-display text-base font-semibold tracking-tight text-primary">
            {{ timezoneLabel() }}
          </h3>
          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            @for (option of timezones(); track option.value) {
              <app-settings-option
                group="st-timezone"
                [value]="option.value"
                [label]="option.label"
                [description]="option.description"
                [icon]="LucideGlobe"
                [selected]="prefs().timezone === option.value"
                (selectedChange)="onTimezoneChange($event)"
              />
            }
          </div>
        </div>

        <div class="mt-6 border-t border-line pt-6">
          <h3 class="font-display text-base font-semibold tracking-tight text-primary">
            {{ dateFormatLabel() }}
          </h3>
          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            @for (option of dateFormats(); track option.value) {
              <app-settings-option
                group="st-date-format"
                [value]="option.value"
                [label]="option.label"
                [description]="option.description"
                [icon]="LucideCalendarDays"
                [selected]="prefs().dateFormat === option.value"
                (selectedChange)="onDateFormatChange($event)"
              />
            }
          </div>
        </div>

        <div class="mt-6 border-t border-line pt-6">
          <h3 class="font-display text-base font-semibold tracking-tight text-primary">
            {{ weekStartLabel() }}
          </h3>
          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
@for (option of weekStarts(); track option.value) {
            <app-settings-option
              group="st-week-start"
              [value]="option.value"
              [label]="option.label"
              [icon]="LucideFlag"
              [selected]="prefs().weekStart === option.value"
              (selectedChange)="onWeekStartChange($event)"
            />
          }
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-1.5" aria-hidden="true">
            @for (day of weekPreview(); track day.label; let i = $index) {
              <span
                class="flex h-8 w-8 items-center justify-center rounded-panel text-[11px] font-semibold"
                [class]="
                  i === 0
                    ? 'bg-accent-dark text-white'
                    : 'bg-surface-muted text-ink-muted'
                "
              >
                {{ day.label }}
              </span>
            }
          </div>
        </div>
      </section>
    </div>
  `,
})
export class SettingsPreferences {
  protected readonly service = inject(SettingsService);
  protected readonly languageService = inject(LanguageService);
  protected readonly prefs = computed(() => this.service.state().preferences);

  protected readonly title = this.languageService.translateSignal('settings.preferences.title');
  protected readonly subtitle = this.languageService.translateSignal('settings.preferences.subtitle');
  protected readonly languageLabel = this.languageService.translateSignal('settings.preferences.language');
  protected readonly timezoneLabel = this.languageService.translateSignal('settings.preferences.timezone');
  protected readonly dateFormatLabel = this.languageService.translateSignal('settings.preferences.dateFormat');
  protected readonly weekStartLabel = this.languageService.translateSignal('settings.preferences.weekStart');

  protected readonly LucideLanguages = LucideLanguages;
  protected readonly LucideGlobe = LucideGlobe;
  protected readonly LucideCalendarDays = LucideCalendarDays;
  protected readonly LucideFlag = LucideFlag;

  protected readonly languages: { value: LanguageCode; label: string }[] =
    this.languageService.languageOptions.map((l) => ({ value: l.code, label: l.name }));

  protected readonly timezones = computed<{ value: TimezoneCode; label: string; description: string }[]>(() => [
    { value: 'Europe/Paris', label: 'Europe/Paris', description: 'UTC+1' },
    { value: 'Africa/Casablanca', label: 'Africa/Casablanca', description: 'UTC+1' },
    { value: 'UTC', label: 'UTC', description: this.languageService.translate('settings.preferences.utcDescription') },
  ]);

  protected readonly weekStarts = computed<{ value: WeekStart; label: string }[]>(() => [
    { value: 'monday', label: this.languageService.translate('settings.preferences.monday') },
    { value: 'sunday', label: this.languageService.translate('settings.preferences.sunday') },
  ]);

  protected readonly dateFormats = computed<DateFormatOption[]>(() => {
    const now = new Date();
    const locale = this.languageService.getLocale();
    return [
      { value: 'long', label: this.languageService.translate('settings.preferences.dateFormatLong'), description: longDate(now, locale) },
      { value: 'short', label: this.languageService.translate('settings.preferences.dateFormatShort'), description: shortDate(now) },
      { value: 'iso', label: 'ISO', description: isoDate(now) },
    ];
  });

  protected readonly weekPreview = computed<{ label: string }[]>(() => {
    const locale = this.languageService.getLocale();
    const startDay = this.prefs().weekStart === 'monday' ? 1 : 0;
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - date.getDay() + startDay + i);
      const label = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
      return { label: label.charAt(0).toUpperCase() + label.slice(1) };
    });
  });

  protected onLanguageChange(value: string): void {
    this.languageService.setLanguage(value as LanguageCode);
    this.service.setLanguage(value as LanguageCode);
  }

  protected onTimezoneChange(value: string): void {
    this.service.setTimezone(value as TimezoneCode);
  }

  protected onDateFormatChange(value: string): void {
    this.service.setDateFormat(value as DateFormatId);
  }

  protected onWeekStartChange(value: string): void {
    this.service.setWeekStart(value as WeekStart);
  }
}
