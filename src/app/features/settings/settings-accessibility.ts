import { Component, computed, inject } from '@angular/core';
import { LucideMousePointerClick, LucideType } from '@lucide/angular';
import {
  SettingsService,
  type TextSize,
} from './services/settings.service';
import { LanguageService } from '../../core/services/language.service';
import { SettingsToggle } from './settings-toggle';
import { SettingsOption } from './settings-option';

@Component({
  selector: 'app-settings-accessibility',
  imports: [
    SettingsToggle,
    SettingsOption,
  ],
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
        <div class="space-y-0 divide-y divide-line">
          <div class="py-4">
            <app-settings-toggle
              id="st-a11y-motion"
              [label]="reduceMotionLabel()"
              [description]="reduceMotionDesc()"
              [checked]="a11y().reduceMotion"
              (checkedChange)="service.toggleAccessibility('reduceMotion')"
            />
          </div>
          <div class="py-4">
            <app-settings-toggle
              id="st-a11y-contrast"
              [label]="highContrastLabel()"
              [description]="highContrastDesc()"
              [checked]="a11y().highContrast"
              (checkedChange)="service.toggleAccessibility('highContrast')"
            />
          </div>
          <div class="py-4">
            <app-settings-toggle
              id="st-a11y-focus"
              [label]="focusKeyboardLabel()"
              [description]="focusKeyboardDesc()"
              [checked]="a11y().focusKeyboard"
              (checkedChange)="service.toggleAccessibility('focusKeyboard')"
            />
          </div>
        </div>

        <div class="mt-5 border-t border-line pt-6">
          <h3 class="font-display text-base font-semibold tracking-tight text-primary">
            {{ textSizeTitle() }}
          </h3>
          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            @for (option of textSizes(); track option.value) {
              <app-settings-option
                group="st-text-size"
                [value]="option.value"
                [label]="option.label"
                [description]="option.description"
                [selected]="a11y().textSize === option.value"
                (selectedChange)="onTextSizeChange($event)"
              />
            }
          </div>
        </div>

        <div class="mt-6 rounded-panel border border-accent/25 bg-teal-50/40 p-4">
          <p class="flex items-center gap-2 text-xs font-medium text-accent-dark">
            <svg lucideMousePointerClick class="h-4 w-4" aria-hidden="true"></svg>
            {{ applyNotice() }}
          </p>
        </div>
      </section>
    </div>
  `,
})
export class SettingsAccessibility {
  protected readonly service = inject(SettingsService);
  protected readonly languageService = inject(LanguageService);
  protected readonly a11y = computed(() => this.service.state().accessibility);

  protected readonly title = this.languageService.translateSignal('settings.nav.accessibility');
  protected readonly subtitle = this.languageService.translateSignal('settings.accessibility.subtitle');
  protected readonly reduceMotionLabel = this.languageService.translateSignal('settings.accessibility.reduceMotion');
  protected readonly reduceMotionDesc = this.languageService.translateSignal('settings.accessibility.reduceMotionDesc');
  protected readonly highContrastLabel = this.languageService.translateSignal('settings.accessibility.highContrast');
  protected readonly highContrastDesc = this.languageService.translateSignal('settings.accessibility.highContrastDesc');
  protected readonly focusKeyboardLabel = this.languageService.translateSignal('settings.accessibility.focusKeyboard');
  protected readonly focusKeyboardDesc = this.languageService.translateSignal('settings.accessibility.focusKeyboardDesc');
  protected readonly textSizeTitle = this.languageService.translateSignal('settings.accessibility.textSizeTitle');
  protected readonly applyNotice = this.languageService.translateSignal('settings.accessibility.applyNotice');

  protected readonly textSizes = computed(() => [
    { value: 'normal' as TextSize, label: this.languageService.translate('settings.accessibility.normalLabel'), description: this.languageService.translate('settings.accessibility.normalDesc') },
    { value: 'large' as TextSize, label: this.languageService.translate('settings.accessibility.largeLabel'), description: this.languageService.translate('settings.accessibility.largeDesc') },
    { value: 'xlarge' as TextSize, label: this.languageService.translate('settings.accessibility.xlargeLabel'), description: this.languageService.translate('settings.accessibility.xlargeDesc') },
  ]);

  protected onTextSizeChange(value: string): void {
    this.service.setTextSize(value as TextSize);
  }
}
