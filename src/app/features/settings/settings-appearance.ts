import { Component, computed, inject } from '@angular/core';
import {
  LucideMonitor,
  LucideMoon,
  LucidePalette,
  LucideSun,
  type LucideIcon,
} from '@lucide/angular';
import {
  SettingsService,
  type AccentPreference,
  type ThemePreference,
} from './services/settings.service';
import { LanguageService } from '../../core/services/language.service';
import { SettingsOption } from './settings-option';

@Component({
  selector: 'app-settings-appearance',
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
        <h3 class="font-display text-base font-semibold tracking-tight text-primary">
          {{ themeTitle() }}
        </h3>
        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
@for (option of themeOptions(); track option.value) {
              <app-settings-option
                group="st-theme"
                [value]="option.value"
                [label]="option.label"
                [description]="option.description"
                [icon]="option.icon"
                [selected]="appearance().theme === option.value"
                (selectedChange)="onThemeChange($event)"
              />
            }
        </div>

        <div class="mt-6 border-t border-line pt-6">
          <h3 class="font-display text-base font-semibold tracking-tight text-primary">
            {{ accentTitle() }}
          </h3>
          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
@for (option of accentOptions(); track option.value) {
                <app-settings-option
                  group="st-accent"
                  [value]="option.value"
                  [label]="option.label"
                  [description]="option.description"
                  [icon]="option.icon"
                  [iconClass]="option.value === 'navy' ? 'bg-primary/10 text-primary' : 'bg-teal-50 text-accent-dark'"
                  [selected]="appearance().accent === option.value"
                  (selectedChange)="onAccentChange($event)"
                />
              }
          </div>
        </div>

        <div class="mt-6 border-t border-line pt-6">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
            {{ preview() }}
          </p>
          <div
            class="mt-3 overflow-hidden rounded-card border border-line shadow-card"
            aria-hidden="true"
          >
            <div [class]="chromeClass()" class="flex items-center gap-1.5 px-3.5 py-2.5">
              <span class="h-2.5 w-2.5 rounded-full bg-red-400/80"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-yellow-400/80"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-green-400/80"></span>
              <span [class]="addressBar()" class="ml-2 h-2 flex-1 rounded-panel"></span>
            </div>
            <div class="flex" [class]="bodyClass()">
              <div class="w-20 shrink-0 space-y-2.5 p-3" [class]="sidebarClass()">
                <div [class]="sidebarLine()" class="h-1.5 w-12 rounded-full"></div>
                <div [class]="sidebarLineDim()" class="h-1.5 w-9 rounded-full"></div>
                <div [class]="sidebarLineDim()" class="h-1.5 w-10 rounded-full"></div>
                <div [class]="sidebarLineDim()" class="h-1.5 w-8 rounded-full"></div>
              </div>
              <div class="min-w-0 flex-1 space-y-3 p-3">
                <div [class]="contentTitle()" class="h-2 w-28 rounded-full"></div>
                <div class="grid grid-cols-3 gap-2">
                  <div [class]="cardClass()" class="h-12 rounded-panel"></div>
                  <div [class]="cardClass()" class="h-12 rounded-panel"></div>
                  <div [class]="cardAccent()" class="h-12 rounded-panel"></div>
                </div>
                <div class="space-y-1.5">
                  <div [class]="lineClass()" class="h-1.5 w-full rounded-full"></div>
                  <div [class]="lineClass()" class="h-1.5 w-4/5 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class SettingsAppearance {
  protected readonly service = inject(SettingsService);
  protected readonly languageService = inject(LanguageService);

  protected readonly appearance = computed(() => this.service.state().appearance);
  protected readonly appliedTheme = this.service.appliedTheme;

  protected readonly title = this.languageService.translateSignal('settings.nav.appearance');
  protected readonly subtitle = this.languageService.translateSignal('settings.appearance.subtitle');
  protected readonly themeTitle = this.languageService.translateSignal('settings.appearance.themeTitle');
  protected readonly accentTitle = this.languageService.translateSignal('settings.appearance.accentTitle');
  protected readonly preview = this.languageService.translateSignal('settings.appearance.preview');

  protected readonly themeOptions = computed(() => [
    { value: 'light' as ThemePreference, label: this.languageService.translate('settings.appearance.lightLabel'), description: this.languageService.translate('settings.appearance.lightDesc'), icon: LucideSun },
    { value: 'dark' as ThemePreference, label: this.languageService.translate('settings.appearance.darkLabel'), description: this.languageService.translate('settings.appearance.darkDesc'), icon: LucideMoon },
    { value: 'system' as ThemePreference, label: this.languageService.translate('settings.appearance.systemLabel'), description: this.languageService.translate('settings.appearance.systemDesc'), icon: LucideMonitor },
  ]);

  protected readonly accentOptions = computed(() => [
    { value: 'teal' as AccentPreference, label: this.languageService.translate('settings.appearance.tealLabel'), description: this.languageService.translate('settings.appearance.tealDesc'), icon: LucidePalette },
    { value: 'navy' as AccentPreference, label: this.languageService.translate('settings.appearance.navyLabel'), description: this.languageService.translate('settings.appearance.navyDesc'), icon: LucidePalette },
  ]);

  private readonly isDark = computed(() => this.appliedTheme() === 'dark');
  private readonly isNavyAccent = computed(
    () => this.service.state().appearance.accent === 'navy',
  );

  protected onThemeChange(value: string): void {
    this.service.setTheme(value as ThemePreference);
  }

  protected onAccentChange(value: string): void {
    this.service.setAccent(value as AccentPreference);
  }

  protected readonly chromeClass = computed(() =>
    this.isDark() ? 'bg-surface-muted/70 border-b border-line' : 'bg-surface-muted/50 border-b border-line',
  );
  protected readonly addressBar = computed(() =>
    this.isDark() ? 'bg-surface' : 'bg-surface-muted',
  );
  protected readonly bodyClass = computed(() =>
    this.isDark() ? 'bg-background' : 'bg-surface-muted/30',
  );
  protected readonly sidebarClass = computed(() =>
    this.isDark() ? 'bg-primary-darker' : 'bg-primary',
  );
  protected readonly sidebarLine = computed(() =>
    this.isDark() ? 'bg-white/40' : 'bg-white/70',
  );
  protected readonly sidebarLineDim = computed(() =>
    this.isDark() ? 'bg-white/15' : 'bg-white/30',
  );
  protected readonly contentTitle = computed(() =>
    this.isDark() ? 'bg-ink/70' : 'bg-ink/15',
  );
  protected readonly cardClass = computed(() =>
    this.isDark()
      ? 'border border-line bg-surface'
      : 'border border-line bg-white shadow-sm',
  );
  protected readonly cardAccent = computed(() =>
    this.isNavyAccent()
      ? 'bg-gradient-to-br from-primary to-primary-light'
      : 'bg-gradient-to-br from-accent to-accent-light',
  );
  protected readonly lineClass = computed(() =>
    this.isDark() ? 'bg-line-strong' : 'bg-surface-strong',
  );
}
