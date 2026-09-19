import { Component, inject, signal } from '@angular/core';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { SettingsNav, type SettingsSectionId } from './settings-nav';
import { SettingsReveal } from './settings-reveal';
import { SettingsAccount } from './settings-account';
import { SettingsAppearance } from './settings-appearance';
import { SettingsNotifications } from './settings-notifications';
import { SettingsPreferences } from './settings-preferences';
import { SettingsPrivacy } from './settings-privacy';
import { SettingsAccessibility } from './settings-accessibility';
import { SettingsDangerZone } from './settings-danger-zone';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-settings-page',
  imports: [
    PageHeader,
    SettingsNav,
    SettingsReveal,
    SettingsAccount,
    SettingsAppearance,
    SettingsNotifications,
    SettingsPreferences,
    SettingsPrivacy,
    SettingsAccessibility,
    SettingsDangerZone,
  ],
  template: `
    <div class="flex flex-col gap-6">
      <header appSettingsReveal>
        <app-page-header
          eyebrow="Digital Life Twin"
          [title]="title()"
          [subtitle]="subtitle()"
        />
      </header>

      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[16.5rem_1fr]">
        <aside class="lg:sticky lg:top-24">
          <app-settings-nav
            [active]="activeSection()"
            (selected)="activeSection.set($event)"
          />
        </aside>

        <div class="min-w-0 space-y-6">
          @switch (activeSection()) {
            @case ('account') {
              <app-settings-account appSettingsReveal />
            }
            @case ('appearance') {
              <app-settings-appearance appSettingsReveal />
            }
            @case ('notifications') {
              <app-settings-notifications appSettingsReveal />
            }
            @case ('preferences') {
              <app-settings-preferences appSettingsReveal />
            }
            @case ('privacy') {
              <app-settings-privacy appSettingsReveal />
            }
            @case ('accessibility') {
              <app-settings-accessibility appSettingsReveal />
            }
          }

          <app-settings-danger-zone appSettingsReveal />
        </div>
      </div>
    </div>
  `,
})
export class SettingsPage {
  protected readonly activeSection = signal<SettingsSectionId>('account');

  private readonly languageService = inject(LanguageService);

  protected readonly title = this.languageService.translateSignal('settings.title');
  protected readonly subtitle = this.languageService.translateSignal('settings.subtitle');
}
