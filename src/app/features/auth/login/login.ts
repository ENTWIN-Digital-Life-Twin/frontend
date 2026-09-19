import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideEye, LucideEyeOff, LucideInfo, LucideLock, LucideMail } from '@lucide/angular';
import {
  AuthService,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { Button } from '../../../shared/ui/button/button';
import { Checkbox } from '../../../shared/ui/checkbox/checkbox';
import { Field } from '../../../shared/ui/field/field';
import { InputDirective } from '../../../shared/directives/field-control/field-control';
import { AuthShell } from '../components/auth-shell/auth-shell';
import { AuthPageShell } from '../components/auth-page-shell/auth-page-shell';
import { AuthHeading } from '../components/auth-heading/auth-heading';
import { AuthSocialDivider } from '../components/auth-social-divider/auth-social-divider';
import { AuthSocialButtons } from '../components/auth-social-buttons/auth-social-buttons';

type FormStatus = 'idle' | 'loading' | 'error';

@Component({
  selector: 'app-login',
  template: `
    <app-auth-shell>
      <app-auth-page-shell>
        <app-auth-heading [eyebrow]="eyebrow()" [title]="title()" [subtitle]="subtitle()" />

        <div
          class="mt-7 flex items-start gap-3 rounded-panel border border-accent/25 bg-teal-50 px-4 py-3"
          role="status"
        >
          <svg lucideInfo class="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" aria-hidden="true"></svg>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-accent-dark">{{ demoTitle() }}</p>
            <p class="mt-0.5 text-xs leading-relaxed text-ink-muted">
              {{ demoDescription() }}
              <span class="font-medium text-ink">{{ demoEmail }} / {{ demoPassword }}</span>
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-panel px-2 py-1 text-xs font-semibold text-accent-dark transition-colors duration-200 hover:bg-accent/10"
            (click)="fillDemo()"
          >
            {{ demoFill() }}
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-7 space-y-5" novalidate>
          @if (status() === 'error') {
            <div
              class="flex items-start gap-3 rounded-panel border border-danger/30 bg-danger-light px-4 py-3"
              role="alert"
            >
              <svg lucideInfo class="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true"></svg>
              <p class="text-sm leading-relaxed text-danger">{{ error() }}</p>
            </div>
          }

          <app-field [label]="emailLabel()" [id]="'login-email'" [error]="errorFor('email')">
            <div class="relative">
              <svg
                lucideMail
                class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              ></svg>
              <input
                appInput
                id="login-email"
                type="email"
                formControlName="email"
                [placeholder]="emailPlaceholder()"
                autocomplete="email"
                class="pl-10"
                [appInputInvalid]="form.controls.email.touched && form.controls.email.invalid"
              />
            </div>
          </app-field>

          <app-field
            [label]="passwordLabel()"
            [id]="'login-password'"
            [error]="errorFor('password')"
          >
            <div class="relative">
              <svg
                lucideLock
                class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              ></svg>
              <input
                appInput
                id="login-password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                [placeholder]="passwordPlaceholder()"
                autocomplete="current-password"
                class="pl-10 pr-11"
                [appInputInvalid]="form.controls.password.touched && form.controls.password.invalid"
              />
              <button
                type="button"
                class="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-panel text-ink-faint transition-colors duration-200 hover:bg-surface-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? hidePassword() : showPasswordLabel()"
              >
                @if (showPassword()) {
                  <svg lucideEyeOff class="h-4 w-4" aria-hidden="true"></svg>
                } @else {
                  <svg lucideEye class="h-4 w-4" aria-hidden="true"></svg>
                }
              </button>
            </div>
          </app-field>

          <div class="flex items-center justify-between gap-4">
            <app-checkbox [(checked)]="rememberMe" [ariaLabel]="rememberMeText()">
              {{ rememberMeText() }}
            </app-checkbox>
            <button
              type="button"
              class="text-sm font-medium text-accent-dark transition-colors hover:text-accent"
              (click)="forgotHint.set(!forgotHint())"
            >
              {{ forgotPassword() }}
            </button>
          </div>

          @if (forgotHint()) {
            <p class="rounded-panel bg-teal-50 px-4 py-2.5 text-xs leading-relaxed text-accent-dark">
              {{ forgotHintText() }}
            </p>
          }

          <button
            appButton
            variant="primary"
            type="submit"
            class="w-full"
            size="lg"
            [loading]="status() === 'loading'"
            [disabled]="status() === 'loading'"
          >
            {{ submit() }}
          </button>
        </form>

        <app-auth-social-divider [label]="socialLabel()" class="mt-7" />
        <app-auth-social-buttons class="mt-5" />

        <p class="mt-7 text-center text-sm text-ink-muted">
          {{ noAccount() }}
          <a
            routerLink="/register"
            class="font-semibold text-accent-dark transition-colors hover:text-accent"
          >
            {{ createAccount() }}
          </a>
        </p>
      </app-auth-page-shell>
    </app-auth-shell>
  `,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    Checkbox,
    Field,
    InputDirective,
    AuthShell,
    AuthPageShell,
    AuthHeading,
    AuthSocialDivider,
    AuthSocialButtons,
    LucideEye,
    LucideEyeOff,
    LucideInfo,
    LucideLock,
    LucideMail,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  private readonly tr = <T = string>(key: string): T => this.languageService.translate<T>(key);
  private readonly trSignal = (key: string) => this.languageService.translateSignal(key);

  protected readonly eyebrow = this.trSignal('auth.login.eyebrow');
  protected readonly title = this.trSignal('auth.login.title');
  protected readonly subtitle = this.trSignal('auth.login.subtitle');
  protected readonly demoTitle = this.trSignal('auth.login.demoTitle');
  protected readonly demoDescription = this.trSignal('auth.login.demoDescription');
  protected readonly demoFill = this.trSignal('auth.login.demoFill');

  protected readonly emailLabel = this.trSignal('auth.login.emailLabel');
  protected readonly emailPlaceholder = this.trSignal('auth.login.emailPlaceholder');
  protected readonly passwordLabel = this.trSignal('auth.login.passwordLabel');
  protected readonly passwordPlaceholder = this.trSignal('auth.login.passwordPlaceholder');
  protected readonly showPasswordLabel = this.trSignal('auth.login.showPassword');
  protected readonly hidePassword = this.trSignal('auth.login.hidePassword');
  protected readonly rememberMeText = this.trSignal('auth.login.rememberMe');
  protected readonly forgotPassword = this.trSignal('auth.login.forgotPassword');
  protected readonly forgotHintText = this.trSignal('auth.login.forgotHint');
  protected readonly submit = this.trSignal('auth.login.submit');
  protected readonly socialLabel = this.trSignal('auth.social.label');
  protected readonly noAccount = this.trSignal('auth.login.noAccount');
  protected readonly createAccount = this.trSignal('auth.login.createAccount');
  protected readonly error = this.trSignal('auth.login.error');

  protected readonly demoEmail = DEMO_EMAIL;
  protected readonly demoPassword = DEMO_PASSWORD;

  protected readonly form = this.fb.nonNullable.group({
    email: [DEMO_EMAIL, [Validators.required, Validators.email]],
    password: [DEMO_PASSWORD, [Validators.required, Validators.minLength(6)]],
  });

  protected readonly rememberMe = signal(true);
  protected readonly showPassword = signal(false);
  protected readonly forgotHint = signal(false);
  protected readonly status = signal<FormStatus>('idle');

  protected errorFor(control: keyof LoginComponent['form']['controls']): string | null {
    const field = this.form.controls[control];
    if (!field.touched || !field.invalid) {
      return null;
    }
    if (field.hasError('required')) {
      return this.tr('auth.errors.required');
    }
    if (field.hasError('email')) {
      return this.tr('auth.errors.invalidEmail');
    }
    if (field.hasError('minlength')) {
      return this.tr('auth.errors.min6');
    }
    return this.tr('auth.errors.invalid');
  }

  protected fillDemo(): void {
    this.form.controls.email.setValue(DEMO_EMAIL);
    this.form.controls.password.setValue(DEMO_PASSWORD);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('loading');
    const { email, password } = this.form.getRawValue();
    this.authService
      .login({ email, password, rememberMe: this.rememberMe() })
      .subscribe({
        next: (user) => {
          this.authService.setCurrentUser(user);
          this.status.set('idle');
          void this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.status.set('error');
        },
      });
  }
}
