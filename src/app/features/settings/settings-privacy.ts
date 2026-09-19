import { Component, computed, inject, signal } from '@angular/core';
import {
  LucideDownload,
  LucideInfo,
  LucideRotateCcw,
} from '@lucide/angular';
import { Button } from '../../shared/ui/button/button';
import { Modal } from '../../shared/ui/modal/modal';
import { Toast, type ToastTone } from '../../shared/ui/toast/toast';
import { SettingsService } from './services/settings.service';
import { SettingsToggle } from './settings-toggle';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-settings-privacy',
  imports: [
    Button,
    Modal,
    Toast,
    SettingsToggle,
    LucideInfo,
    LucideDownload,
    LucideRotateCcw,
  ],
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

      <section class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div class="flex items-start gap-3 rounded-panel border border-line bg-surface-muted/50 p-4">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-primary/10 text-primary">
            <svg lucideInfo class="h-5 w-5" aria-hidden="true"></svg>
          </span>
          <div>
            <p class="text-sm font-semibold text-primary">{{ personalDataLabel() }}</p>
            <p class="mt-0.5 text-xs leading-relaxed text-ink-muted">
              {{ localNotice() }}
            </p>
          </div>
        </div>

        <div class="mt-5 space-y-0 divide-y divide-line">
          @for (row of rows(); track row.key) {
            <div class="py-4">
              <app-settings-toggle
                [id]="'st-privacy-' + row.key"
                [label]="row.label"
                [description]="row.description"
                [checked]="service.state().privacy[row.key]"
                (checkedChange)="service.togglePrivacy(row.key)"
              />
            </div>
          }
        </div>

        <div class="mt-5 flex flex-col gap-2 border-t border-line pt-5 sm:flex-row">
          <button appButton variant="outline" size="md" (click)="exportData()">
            <svg lucideDownload class="h-4 w-4" aria-hidden="true"></svg>
            {{ exportDataLabel() }}
          </button>
          <button appButton variant="ghost" size="md" (click)="resetOpen.set(true)">
            <svg lucideRotateCcw class="h-4 w-4" aria-hidden="true"></svg>
            {{ resetPrefsLabel() }}
          </button>
        </div>
      </section>
    </div>

    @if (resetOpen()) {
      <app-modal
        [title]="resetPrefsLabel()"
        [subtitle]="resetSubtitle()"
        (closed)="resetOpen.set(false)"
      >
        <p class="text-sm leading-relaxed text-ink">
          {{ resetDescription() }}
        </p>
        <div class="mt-6 flex justify-end gap-2">
          <button appButton variant="ghost" size="md" type="button" (click)="resetOpen.set(false)">
            {{ cancelLabel() }}
          </button>
          <button appButton variant="primary" size="md" type="button" (click)="confirmReset()">
            {{ resetLabel() }}
          </button>
        </div>
      </app-modal>
    }

    @if (toast(); as message) {
      <app-toast [message]="message" [tone]="toastTone()" (closed)="toast.set(null)" />
    }
  `,
})
export class SettingsPrivacy {
  protected readonly service = inject(SettingsService);
  private readonly languageService = inject(LanguageService);

  protected readonly resetOpen = signal(false);
  protected readonly toast = signal<string | null>(null);
  protected readonly toastTone = signal<ToastTone>('primary');

  private readonly t = (key: string) => this.languageService.translate<string>(key);

  protected readonly pageTitle = this.languageService.translateSignal('settings.nav.privacy');
  protected readonly pageSubtitle = this.languageService.translateSignal('settings.privacy.subtitle');
  protected readonly personalDataLabel = this.languageService.translateSignal('settingsExtras.personalData');
  protected readonly localNotice = this.languageService.translateSignal('settings.privacy.localNotice');
  protected readonly exportDataLabel = this.languageService.translateSignal('settings.privacy.exportData');
  protected readonly resetPrefsLabel = this.languageService.translateSignal('settings.privacy.resetPrefs');
  protected readonly resetSubtitle = this.languageService.translateSignal('settings.privacy.resetSubtitle');
  protected readonly resetDescription = this.languageService.translateSignal('settings.privacy.resetDescription');
  protected readonly cancelLabel = this.languageService.translateSignal('common.cancel');
  protected readonly resetLabel = this.languageService.translateSignal('common.reset');

  protected readonly rows = computed(() => [
    {
      key: 'analytics' as const,
      label: this.t('settings.privacy.analyticsLabel'),
      description: this.t('settings.privacy.analyticsDesc'),
    },
    {
      key: 'personalization' as const,
      label: this.t('settings.privacy.personalizationLabel'),
      description: this.t('settings.privacy.personalizationDesc'),
    },
    {
      key: 'aiContext' as const,
      label: this.t('settings.privacy.aiContextLabel'),
      description: this.t('settings.privacy.aiContextDesc'),
    },
  ]);

  protected exportData(): void {
    const json = this.service.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `digital-life-twin-preferences-${date}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    this.toastTone.set('success');
    this.toast.set(this.t('settings.privacy.toastExported'));
  }

  protected confirmReset(): void {
    this.resetOpen.set(false);
    this.service.resetPreferences();
    this.toastTone.set('success');
    this.toast.set(this.t('settings.privacy.toastReset'));
  }
}
