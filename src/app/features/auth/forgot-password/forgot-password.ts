import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideInfo, LucideMail } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { Button } from '../../../shared/ui/button/button';
import { Field } from '../../../shared/ui/field/field';
import { InputDirective } from '../../../shared/directives/field-control/field-control';
import { AuthShell } from '../components/auth-shell/auth-shell';
import { AuthPageShell } from '../components/auth-page-shell/auth-page-shell';
import { AuthHeading } from '../components/auth-heading/auth-heading';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    Field,
    InputDirective,
    AuthShell,
    AuthPageShell,
    AuthHeading,
    LucideInfo,
    LucideMail,
  ],
  template: `
    <app-auth-shell>
      <app-auth-page-shell>
        <app-auth-heading [eyebrow]="eyebrow()" [title]="title()" [subtitle]="subtitle()" />

        @if (status() === 'success') {
          <div class="mt-7 rounded-panel border border-accent/30 bg-teal-50 px-4 py-3 text-sm text-primary">
            {{ success() }}
          </div>
          @if (resetPath(); as path) {
            <button appButton variant="primary" class="mt-5 w-full" type="button" (click)="goReset(path)">
              {{ continueReset() }}
            </button>
          }
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-7 space-y-5" novalidate>
            @if (status() === 'error') {
              <div class="flex items-start gap-3 rounded-panel border border-danger/30 bg-danger-light px-4 py-3" role="alert">
                <svg lucideInfo class="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true"></svg>
                <p class="text-sm text-danger">{{ error() }}</p>
              </div>
            }
            <app-field [label]="emailLabel()" [id]="'forgot-email'" [error]="emailError()">
              <div class="relative">
                <svg lucideMail class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true"></svg>
                <input
                  appInput
                  id="forgot-email"
                  type="email"
                  formControlName="email"
                  [placeholder]="emailPlaceholder()"
                  autocomplete="email"
                  class="pl-10"
                  [appInputInvalid]="form.controls.email.touched && form.controls.email.invalid"
                />
              </div>
            </app-field>
            <button appButton variant="primary" type="submit" class="w-full" size="lg" [loading]="status() === 'loading'">
              {{ submit() }}
            </button>
          </form>
        }

        <p class="mt-7 text-center text-sm text-ink-muted">
          <a routerLink="/login" class="font-semibold text-accent-dark hover:text-accent">{{ backToLogin() }}</a>
        </p>
      </app-auth-page-shell>
    </app-auth-shell>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  private readonly trSignal = (key: string) => this.languageService.translateSignal(key);

  protected readonly eyebrow = this.trSignal('auth.forgot.eyebrow');
  protected readonly title = this.trSignal('auth.forgot.title');
  protected readonly subtitle = this.trSignal('auth.forgot.subtitle');
  protected readonly emailLabel = this.trSignal('auth.login.emailLabel');
  protected readonly emailPlaceholder = this.trSignal('auth.login.emailPlaceholder');
  protected readonly submit = this.trSignal('auth.forgot.submit');
  protected readonly success = this.trSignal('auth.forgot.success');
  protected readonly continueReset = this.trSignal('auth.forgot.continue');
  protected readonly backToLogin = this.trSignal('auth.forgot.back');
  protected readonly error = this.trSignal('auth.forgot.error');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  protected readonly resetPath = signal<string | null>(null);

  protected emailError(): string | null {
    const field = this.form.controls.email;
    if (!field.touched || field.valid) {
      return null;
    }
    return this.languageService.translate('auth.errors.invalidEmail');
  }

  protected goReset(path: string): void {
    void this.router.navigateByUrl(path);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('loading');
    this.auth.forgotPassword(this.form.controls.email.value).subscribe({
      next: (res) => {
        this.status.set('success');
        if (!environment.production && res.resetToken) {
          this.resetPath.set(`/reset-password?token=${encodeURIComponent(res.resetToken)}`);
        }
      },
      error: () => this.status.set('error'),
    });
  }
}
