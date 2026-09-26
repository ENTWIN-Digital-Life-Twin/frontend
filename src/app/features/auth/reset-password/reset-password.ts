import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideInfo, LucideLock } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { Button } from '../../../shared/ui/button/button';
import { Field } from '../../../shared/ui/field/field';
import { InputDirective } from '../../../shared/directives/field-control/field-control';
import { AuthShell } from '../components/auth-shell/auth-shell';
import { AuthPageShell } from '../components/auth-page-shell/auth-page-shell';
import { AuthHeading } from '../components/auth-heading/auth-heading';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    Button,
    Field,
    InputDirective,
    AuthShell,
    AuthPageShell,
    AuthHeading,
    LucideInfo,
    LucideLock,
  ],
  template: `
    <app-auth-shell>
      <app-auth-page-shell>
        <app-auth-heading [eyebrow]="eyebrow()" [title]="title()" [subtitle]="subtitle()" />

        @if (!token) {
          <div class="mt-7 flex items-start gap-3 rounded-panel border border-danger/30 bg-danger-light px-4 py-3" role="alert">
            <svg lucideInfo class="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true"></svg>
            <p class="text-sm text-danger">{{ missingToken() }}</p>
          </div>
        } @else if (status() === 'success') {
          <div class="mt-7 rounded-panel border border-accent/30 bg-teal-50 px-4 py-3 text-sm text-primary">
            {{ success() }}
          </div>
          <button appButton variant="primary" class="mt-5 w-full" type="button" (click)="goLogin()">
            {{ backToLogin() }}
          </button>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-7 flex flex-col gap-5" novalidate>
            @if (status() === 'error') {
              <div class="flex items-start gap-3 rounded-panel border border-danger/30 bg-danger-light px-4 py-3" role="alert">
                <svg lucideInfo class="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true"></svg>
                <p class="text-sm text-danger">{{ error() }}</p>
              </div>
            }
            <app-field [label]="passwordLabel()" [id]="'reset-password'" [error]="passwordError()">
              <div class="relative">
                <svg lucideLock class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true"></svg>
                <input
                  appInput
                  id="reset-password"
                  type="password"
                  formControlName="password"
                  [placeholder]="passwordPlaceholder()"
                  autocomplete="new-password"
                  class="pl-10"
                  [appInputInvalid]="form.controls.password.touched && form.controls.password.invalid"
                />
              </div>
            </app-field>
            <app-field [label]="confirmLabel()" [id]="'reset-confirm'" [error]="confirmError()">
              <div class="relative">
                <svg lucideLock class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true"></svg>
                <input
                  appInput
                  id="reset-confirm"
                  type="password"
                  formControlName="confirmPassword"
                  [placeholder]="confirmLabel()"
                  autocomplete="new-password"
                  class="pl-10"
                  [appInputInvalid]="confirmInvalid()"
                />
              </div>
            </app-field>
            <button
              appButton
              variant="primary"
              type="submit"
              class="w-full"
              size="lg"
              [loading]="status() === 'loading'"
              [disabled]="!token"
            >
              {{ submit() }}
            </button>
          </form>
        }
      </app-auth-page-shell>
    </app-auth-shell>
  `,
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);

  private readonly trSignal = (key: string) => this.languageService.translateSignal(key);

  protected readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  private readonly router = inject(Router);
  protected readonly eyebrow = this.trSignal('auth.reset.eyebrow');
  protected readonly title = this.trSignal('auth.reset.title');
  protected readonly subtitle = this.trSignal('auth.reset.subtitle');
  protected readonly passwordLabel = this.trSignal('auth.reset.passwordLabel');
  protected readonly passwordPlaceholder = this.trSignal('auth.reset.passwordPlaceholder');
  protected readonly confirmLabel = this.trSignal('auth.reset.confirmLabel');
  protected readonly missingToken = this.trSignal('auth.reset.missingToken');
  protected readonly submit = this.trSignal('auth.reset.submit');
  protected readonly success = this.trSignal('auth.reset.success');
  protected readonly backToLogin = this.trSignal('auth.forgot.back');
  protected readonly error = this.trSignal('auth.reset.error');

  protected readonly form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });
  protected readonly status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');

  protected confirmInvalid(): boolean {
    const confirm = this.form.controls.confirmPassword;
    const mismatch = confirm.touched && confirm.value !== this.form.controls.password.value;
    return (confirm.touched && confirm.invalid) || mismatch;
  }

  protected confirmError(): string | null {
    const confirm = this.form.controls.confirmPassword;
    if (confirm.touched && confirm.value !== this.form.controls.password.value) {
      return this.languageService.translate('auth.errors.passwordMismatch');
    }
    if (confirm.touched && confirm.invalid) {
      return this.languageService.translate('auth.errors.required');
    }
    return null;
  }

  protected passwordError(): string | null {
    const field = this.form.controls.password;
    if (!field.touched || field.valid) {
      return null;
    }
    return this.languageService.translate('auth.errors.min6');
  }

  protected goLogin(): void {
    void this.router.navigate(['/login']);
  }

  protected onSubmit(): void {
    if (this.form.invalid || !this.token || this.form.controls.password.value !== this.form.controls.confirmPassword.value) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('loading');
    this.auth.resetPassword(this.token, this.form.controls.password.value).subscribe({
      next: () => this.status.set('success'),
      error: () => this.status.set('error'),
    });
  }
}
