import { Component, computed, inject } from '@angular/core';
import { LucideBellRing } from '@lucide/angular';
import {
  SettingsService,
  type SummaryFrequency,
} from './services/settings.service';
import { SettingsToggle } from './settings-toggle';
import { SettingsOption } from './settings-option';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-settings-notifications',
  imports: [SettingsToggle, SettingsOption, LucideBellRing],
  template: `
    <div class="space-y-5">
      <header>
        <h2 class="font-display text-xl font-semibold tracking-tight text-primary">
          {{ pageTitle() }}
        </h2>
        <p class="mt-1 text-sm leading-relaxed text-ink-muted">
          {{ pageSubtitle() }}
        </p>
      </header>

      <section class="rounded-card border border-line bg-surface shadow-card">
        <header class="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-6">
          <span class="flex h-9 w-9 items-center justify-center rounded-panel bg-teal-50 text-accent-dark">
            <svg lucideBellRing class="h-5 w-5" aria-hidden="true"></svg>
          </span>
          <div>
            <h3 class="font-display text-base font-semibold tracking-tight text-primary">
              {{ sectionTitle() }}
            </h3>
            <p class="text-xs text-ink-muted">{{ channelsHint() }}</p>
          </div>
        </header>

        <div class="divide-y divide-line px-5 sm:px-6">
          @for (row of rows(); track row.key) {
            <div class="py-4">
              <app-settings-toggle
                [id]="'st-notif-' + row.key"
                [label]="row.label"
                [description]="row.description"
                [checked]="notifications()[row.key]"
                (checkedChange)="service.toggleNotification(row.key)"
              />
            </div>
          }
        </div>

        <div class="border-t border-line px-5 py-5 sm:px-6">
          <p class="text-sm font-medium text-ink">{{ summaryFrequencyLabel() }}</p>
          <p class="mt-0.5 text-xs text-ink-muted">{{ summaryQuestion() }}</p>
          <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            @for (frequency of frequencies(); track frequency.value) {
              <app-settings-option
                group="st-summary"
                [value]="frequency.value"
                [label]="frequency.label"
                [description]="frequency.description"
                [selected]="notifications().summaryFrequency === frequency.value"
                (selectedChange)="onFrequencyChange($event)"
              />
            }
          </div>
        </div>
      </section>
    </div>
  `,
})
export class SettingsNotifications {
  protected readonly service = inject(SettingsService);
  private readonly languageService = inject(LanguageService);

  protected readonly notifications = computed(() => this.service.state().notifications);

  private readonly t = (key: string) => this.languageService.translate<string>(key);

  protected readonly pageTitle = this.languageService.translateSignal('settings.nav.notifications');
  protected readonly pageSubtitle = this.languageService.translateSignal('settings.notificationsSettings.subtitle');
  protected readonly sectionTitle = this.languageService.translateSignal('settings.notificationsSettings.sectionTitle');
  protected readonly channelsHint = this.languageService.translateSignal('settingsExtras.channelsHint');
  protected readonly summaryFrequencyLabel = this.languageService.translateSignal('settingsExtras.summaryFrequency');
  protected readonly summaryQuestion = this.languageService.translateSignal('settingsExtras.summaryQuestion');

  protected readonly rows = computed(() => [
    {
      key: 'taskReminders' as const,
      label: this.t('settings.notificationsSettings.taskRemindersLabel'),
      description: this.t('settings.notificationsSettings.taskRemindersDesc'),
    },
    {
      key: 'eventReminders' as const,
      label: this.t('settings.notificationsSettings.eventRemindersLabel'),
      description: this.t('settings.notificationsSettings.eventRemindersDesc'),
    },
    {
      key: 'wellnessReminders' as const,
      label: this.t('settings.notificationsSettings.wellnessRemindersLabel'),
      description: this.t('settings.notificationsSettings.wellnessRemindersDesc'),
    },
    {
      key: 'aiInsights' as const,
      label: this.t('settings.notificationsSettings.aiInsightsLabel'),
      description: this.t('settings.notificationsSettings.aiInsightsDesc'),
    },
    {
      key: 'dailySummary' as const,
      label: this.t('settings.notificationsSettings.dailySummaryLabel'),
      description: this.t('settings.notificationsSettings.dailySummaryDesc'),
    },
  ]);

  protected readonly frequencies = computed(() => [
    { value: 'never' as SummaryFrequency, label: this.t('settings.notificationsSettings.never'), description: this.t('settings.notificationsSettings.neverDesc') },
    { value: 'morning' as SummaryFrequency, label: this.t('settings.notificationsSettings.morning'), description: this.t('settings.notificationsSettings.morningDesc') },
    { value: 'evening' as SummaryFrequency, label: this.t('settings.notificationsSettings.evening'), description: this.t('settings.notificationsSettings.eveningDesc') },
  ]);

  protected onFrequencyChange(value: string): void {
    this.service.setSummaryFrequency(value as SummaryFrequency);
  }
}
