import { Component, inject, signal } from '@angular/core';
import { LucideAlertTriangle, LucideRotateCcw } from '@lucide/angular';
import { Button } from '../../shared/ui/button/button';
import { Modal } from '../../shared/ui/modal/modal';
import { Toast, type ToastTone } from '../../shared/ui/toast/toast';
import { SettingsService } from './services/settings.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-settings-danger-zone',
  imports: [Button, Modal, Toast, LucideAlertTriangle, LucideRotateCcw],
  template: `
    <section
      class="rounded-card border border-danger/25 bg-danger-light/30 p-5 shadow-card sm:p-6"
    >
      <div class="flex items-center gap-2.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-panel bg-danger/10 text-danger">
          <svg lucideAlertTriangle class="h-5 w-5" aria-hidden="true"></svg>
        </span>
        <div>
          <h2 class="font-display text-base font-semibold tracking-tight text-primary">
            {{ title() }}
          </h2>
          <p class="text-xs text-ink-muted">
            {{ subtitle() }}
          </p>
        </div>
      </div>

      <div
        class="mt-4 flex flex-col gap-4 rounded-panel border border-danger/20 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-sm leading-relaxed text-ink">
          {{ description() }}
        </p>
        <button
          appButton
          variant="danger"
          size="md"
          class="shrink-0"
          (click)="confirmOpen.set(true)"
        >
          <svg lucideRotateCcw class="h-4 w-4" aria-hidden="true"></svg>
          {{ resetAllLabel() }}
        </button>
      </div>
    </section>

    @if (confirmOpen()) {
      <app-modal
        [title]="resetAllLabel()"
        [subtitle]="title()"
        (closed)="confirmOpen.set(false)"
      >
        <div class="flex items-start gap-3 rounded-panel border border-danger/20 bg-danger-light/40 p-4">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-danger/10 text-danger">
            <svg lucideAlertTriangle class="h-5 w-5" aria-hidden="true"></svg>
          </span>
          <p class="text-sm leading-relaxed text-ink">
            {{ confirmDescription() }}
          </p>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button
            appButton
            variant="ghost"
            size="md"
            type="button"
            (click)="confirmOpen.set(false)"
          >
            {{ cancelLabel() }}
          </button>
          <button
            appButton
            variant="danger"
            size="md"
            type="button"
            (click)="confirmReset()"
          >
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
export class SettingsDangerZone {
  private readonly service = inject(SettingsService);
  private readonly languageService = inject(LanguageService);

  protected readonly confirmOpen = signal(false);
  protected readonly toast = signal<string | null>(null);
  protected readonly toastTone = signal<ToastTone>('primary');

  private readonly t = (key: string) => this.languageService.translate<string>(key);

  protected readonly title = this.languageService.translateSignal('settings.dangerZone.title');
  protected readonly subtitle = this.languageService.translateSignal('settings.dangerZone.subtitle');
  protected readonly description = this.languageService.translateSignal('settings.dangerZone.description');
  protected readonly resetAllLabel = this.languageService.translateSignal('settings.dangerZone.resetAll');
  protected readonly confirmDescription = this.languageService.translateSignal('settings.dangerZone.confirmDescription');
  protected readonly cancelLabel = this.languageService.translateSignal('common.cancel');
  protected readonly resetLabel = this.languageService.translateSignal('common.reset');

  protected confirmReset(): void {
    this.confirmOpen.set(false);
    this.service.resetPreferences();
    this.toastTone.set('success');
    this.toast.set(this.t('settings.dangerZone.toastReset'));
  }
}
