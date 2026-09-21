import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideKeyRound, LucideLock } from '@lucide/angular';
import { AuthService } from '../../core/services/auth/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { Button } from '../../shared/ui/button/button';
import { Field } from '../../shared/ui/field/field';
import { InputDirective } from '../../shared/directives/field-control/field-control';
import { Toast, type ToastTone } from '../../shared/ui/toast/toast';

@Component({
  selector: 'app-settings-security',
  imports: [FormsModule, Button, Field, InputDirective, Toast, LucideKeyRound, LucideLock],
  template: `
    <div class="space-y-5">
      <header>
        <h2 class="font-display text-xl font-semibold tracking-tight text-primary">
          {{ t('settings.nav.security') }}
        </h2>
        <p class="mt-1 text-sm leading-relaxed text-ink-muted">{{ t('settings.security.subtitle') }}</p>
      </header>

      <section class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div class="mb-5 flex items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-panel bg-primary/10 text-primary">
            <svg lucideLock class="h-5 w-5" aria-hidden="true"></svg>
          </span>
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              {{ t('settings.security.passwordTitle') }}
            </p>
            <h3 class="font-display text-base font-semibold tracking-tight text-primary">
              {{ t('settings.security.changePassword') }}
            </h3>
          </div>
        </div>

        <form (ngSubmit)="save()" class="grid gap-4" novalidate>
          <app-field id="sec-current" [label]="t('settings.security.currentPassword')" [error]="currentError()">
            <input
              id="sec-current"
              appInput
              type="password"
              autocomplete="current-password"
              [ngModel]="currentPassword()"
              name="currentPassword"
              (ngModelChange)="currentPassword.set($event)"
              [appInputInvalid]="!!currentError()"
            />
          </app-field>
          <div class="grid gap-4 sm:grid-cols-2">
            <app-field id="sec-new" [label]="t('settings.security.newPassword')" [error]="newError()">
              <input
                id="sec-new"
                appInput
                type="password"
                autocomplete="new-password"
                [ngModel]="newPassword()"
                name="newPassword"
                (ngModelChange)="newPassword.set($event)"
                [appInputInvalid]="!!newError()"
              />
            </app-field>
            <app-field id="sec-confirm" [label]="t('settings.security.confirmPassword')" [error]="confirmError()">
              <input
                id="sec-confirm"
                appInput
                type="password"
                autocomplete="new-password"
                [ngModel]="confirmPassword()"
                name="confirmPassword"
                (ngModelChange)="confirmPassword.set($event)"
                [appInputInvalid]="!!confirmError()"
              />
            </app-field>
          </div>
          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button appButton variant="primary" size="md" type="submit" [loading]="saving()" [disabled]="saving()">
              {{ t('settings.security.savePassword') }}
            </button>
          </div>
        </form>
      </section>

      <section class="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-navy-50 text-primary">
              <svg lucideKeyRound class="h-5 w-5" aria-hidden="true"></svg>
            </span>
            <div>
              <h3 class="font-display text-base font-semibold tracking-tight text-primary">
                {{ t('settings.security.resetTitle') }}
              </h3>
              <p class="mt-1 text-sm leading-relaxed text-ink-muted">{{ t('settings.security.resetHint') }}</p>
            </div>
          </div>
          <button appButton variant="outline" size="md" type="button" class="w-full sm:w-auto" (click)="goReset()">
            {{ t('settings.security.resetAction') }}
          </button>
        </div>
      </section>
    </div>

    @if (toast(); as message) {
      <app-toast [message]="message" [tone]="toastTone()" (closed)="toast.set(null)" />
    }
  `,
})
export class SettingsSecurity {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  t = (key: string) => this.languageService.translate<string>(key);

  protected readonly currentPassword = signal('');
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly toast = signal<string | null>(null);
  protected readonly toastTone = signal<ToastTone>('primary');

  protected currentError(): string | null {
    if (!this.submitted()) {
      return null;
    }
    return this.currentPassword().trim() ? null : this.t('auth.errors.required');
  }

  protected newError(): string | null {
    if (!this.submitted()) {
      return null;
    }
    return this.newPassword().trim().length >= 8 ? null : this.t('auth.errors.passwordHint');
  }

  protected confirmError(): string | null {
    if (!this.submitted()) {
      return null;
    }
    return this.newPassword() === this.confirmPassword() ? null : this.t('auth.errors.passwordMismatch');
  }

  protected goReset(): void {
    void this.router.navigate(['/forgot-password']);
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.currentError() || this.newError() || this.confirmError()) {
      return;
    }
    this.saving.set(true);
    this.auth.changePassword(this.currentPassword(), this.newPassword()).subscribe({
      next: () => {
        this.saving.set(false);
        this.submitted.set(false);
        this.currentPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
        this.toastTone.set('success');
        this.toast.set(this.t('settings.security.toastUpdated'));
      },
      error: () => {
        this.saving.set(false);
        this.toastTone.set('primary');
        this.toast.set(this.t('settings.security.toastFailed'));
      },
    });
  }
}
