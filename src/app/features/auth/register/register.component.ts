import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCheck,
  LucideEye,
  LucideEyeOff,
  LucideInfo,
  LucideLock,
  LucideMail,
  LucideShieldCheck,
  LucideUser,
} from '@lucide/angular';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { User } from '../../../core/models/user';
import { Button } from '../../../shared/ui/button/button';
import { Checkbox } from '../../../shared/ui/checkbox/checkbox';
import { Field } from '../../../shared/ui/field/field';
import { InputDirective } from '../../../shared/directives/field-control/field-control';
import { AuthShell } from '../components/auth-shell/auth-shell';
import { AuthPageShell } from '../components/auth-page-shell/auth-page-shell';
import { AuthHeading } from '../components/auth-heading/auth-heading';
import { AuthSocialButtons } from '../components/auth-social-buttons/auth-social-buttons';
import { AuthSocialDivider } from '../components/auth-social-divider/auth-social-divider';

type FormStatus = 'idle' | 'loading' | 'success';
type StepField = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword' | 'verificationCode';

const STEP_COUNT = 2;
const STEP_KEYS = ['account', 'verify'] as const;
const STEP_INDEXES = [0, 1];
const STEP_FIELDS: Record<number, StepField[]> = {
  0: ['firstName', 'lastName', 'email', 'password', 'confirmPassword'],
  1: ['verificationCode'],
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
    AuthSocialButtons,
    AuthSocialDivider,
    LucideArrowLeft,
    LucideCheck,
    LucideEye,
    LucideEyeOff,
    LucideInfo,
    LucideLock,
    LucideMail,
    LucideShieldCheck,
    LucideUser,
  ],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  private readonly tr = <T = string>(key: string): T => this.languageService.translate<T>(key);
  private readonly trSignal = (key: string) => this.languageService.translateSignal(key);

  protected readonly STEP_COUNT = STEP_COUNT;
  protected readonly STEP_INDEXES = STEP_INDEXES;

  protected readonly eyebrow = this.trSignal('auth.register.eyebrow');
  protected readonly title = this.trSignal('auth.register.title');
  protected readonly subtitle = this.trSignal('auth.register.subtitle');
  protected readonly stepLabel = this.trSignal('auth.register.steps.label');
  protected readonly stepOf = this.trSignal('auth.register.steps.of');
  protected readonly backLabel = this.trSignal('auth.register.nav.back');
  protected readonly nextLabel = this.trSignal('auth.register.nav.next');
  protected readonly firstNameLabel = this.trSignal('auth.register.firstNameLabel');
  protected readonly firstNamePlaceholder = this.trSignal('auth.register.firstNamePlaceholder');
  protected readonly lastNameLabel = this.trSignal('auth.register.lastNameLabel');
  protected readonly lastNamePlaceholder = this.trSignal('auth.register.lastNamePlaceholder');
  protected readonly emailLabel = this.trSignal('auth.register.emailLabel');
  protected readonly emailPlaceholder = this.trSignal('auth.register.emailPlaceholder');
  protected readonly passwordLabel = this.trSignal('auth.register.passwordLabel');
  protected readonly passwordHint = this.trSignal('auth.errors.passwordHint');
  protected readonly showPasswordLabel = this.trSignal('auth.login.showPassword');
  protected readonly hidePassword = this.trSignal('auth.login.hidePassword');
  protected readonly confirmLabel = this.trSignal('auth.register.confirmLabel');
  protected readonly codeLabel = this.trSignal('auth.register.codeLabel');
  protected readonly codePlaceholder = this.trSignal('auth.register.codePlaceholder');
  protected readonly codeHint = this.trSignal('auth.register.codeHint');
  protected readonly resendLabel = this.trSignal('auth.register.resend');
  protected readonly termsAria = this.trSignal('auth.register.termsAria');
  protected readonly termsPrefix = this.trSignal('auth.register.termsPrefix');
  protected readonly termsLink = this.trSignal('auth.register.termsLink');
  protected readonly termsAnd = this.trSignal('auth.register.termsAnd');
  protected readonly privacyLink = this.trSignal('auth.register.privacyLink');
  protected readonly termsErrorMessage = this.trSignal('auth.register.termsError');
  protected readonly haveAccount = this.trSignal('auth.register.haveAccount');
  protected readonly socialLabel = this.trSignal('auth.social.label');
  protected readonly loginLink = this.trSignal('auth.register.loginLink');
  protected readonly successTitle = this.trSignal('auth.register.successTitle');
  protected readonly goDashboard = this.trSignal('auth.register.goDashboard');

  protected readonly successText = computed(() => {
    const name = this.form.controls.firstName.value || this.tr('auth.register.firstNamePlaceholder');
    return this.languageService.translate('auth.register.successText', { name });
  });
  protected readonly currentStepTitle = computed(() =>
    this.tr(`auth.register.steps.${STEP_KEYS[this.step()]}.title`),
  );
  protected readonly currentStepSubtitle = computed(() =>
    this.tr(`auth.register.steps.${STEP_KEYS[this.step()]}.subtitle`),
  );
  protected readonly displayedStep = computed(() => this.step() + 1);
  protected readonly primaryLabel = computed(() =>
    this.step() === STEP_COUNT - 1 ? this.tr('auth.register.submit') : this.nextLabel(),
  );

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  protected readonly showPassword = signal(false);
  protected readonly termsAccepted = signal(false);
  protected readonly termsError = signal(false);
  protected readonly step = signal(0);
  protected readonly direction = signal<'forward' | 'back'>('forward');
  protected readonly status = signal<FormStatus>('idle');
  protected readonly googleError = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);

  protected segmentActive(index: number): boolean {
    return index < this.displayedStep();
  }

  protected errorFor(control: StepField): string | null {
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
    if (field.hasError('minlength') || field.hasError('pattern')) {
      return this.tr('auth.errors.tooShort');
    }
    return this.tr('auth.errors.invalid');
  }

  protected confirmInvalid(): boolean {
    const confirm = this.form.controls.confirmPassword;
    const mismatch = confirm.touched && confirm.value !== this.form.controls.password.value;
    return (confirm.touched && confirm.invalid) || mismatch;
  }

  protected confirmError(): string | null {
    const confirm = this.form.controls.confirmPassword;
    if (confirm.touched && confirm.value !== this.form.controls.password.value) {
      return this.tr('auth.errors.passwordMismatch');
    }
    if (confirm.touched && confirm.invalid) {
      return this.tr('auth.errors.required');
    }
    return null;
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  protected onPrimary(): void {
    if (this.status() === 'loading') {
      return;
    }
    if (this.step() === 0) {
      if (!this.validateStep(0)) {
        return;
      }
      this.sendCode(true);
      return;
    }
    this.submit();
  }

  protected resendCode(): void {
    if (this.status() === 'loading') {
      return;
    }
    this.sendCode(false);
  }

  protected onBack(): void {
    if (this.step() > 0) {
      this.goTo(this.step() - 1);
    }
  }

  protected goToDashboard(): void {
    void this.router.navigate([this.authService.afterAuthPath()]);
  }

  protected googleErrorMessage(): string {
    const code = this.googleError();
    return code ? this.tr(`auth.social.errors.${code}`) : '';
  }

  protected onGoogleSignedIn(user: User): void {
    this.googleError.set(null);
    this.authService.setCurrentUser(user);
    this.status.set('idle');
    void this.router.navigate([this.authService.afterAuthPath()]);
  }

  protected onGoogleFailed(code: string): void {
    this.googleError.set(code);
  }

  private goTo(target: number): void {
    this.direction.set(target > this.step() ? 'forward' : 'back');
    this.step.set(target);
  }

  private validateStep(step: number): boolean {
    let valid = true;
    if (step === 0 && !this.termsAccepted()) {
      this.termsError.set(true);
      valid = false;
    } else {
      this.termsError.set(false);
    }
    const fields = STEP_FIELDS[step] ?? [];
    for (const field of fields) {
      const control = this.form.controls[field];
      control.markAsTouched();
      control.updateValueAndValidity();
      if (control.invalid) {
        valid = false;
      }
    }
    if (step === 0) {
      const password = this.form.controls.password.value;
      const confirm = this.form.controls.confirmPassword.value;
      if (password !== confirm) {
        this.form.controls.confirmPassword.markAsTouched();
        valid = false;
      }
    }
    return valid;
  }

  private sendCode(advance: boolean): void {
    this.status.set('loading');
    this.formError.set(null);
    this.authService.sendRegisterCode(this.form.controls.email.value).subscribe({
      next: () => {
        this.status.set('idle');
        if (advance) {
          this.goTo(1);
        }
      },
      error: (error: unknown) => {
        this.status.set('idle');
        this.formError.set(this.messageFor(error));
      },
    });
  }

  private submit(): void {
    if (!this.validateStep(1)) {
      return;
    }
    this.status.set('loading');
    this.formError.set(null);
    const raw = this.form.getRawValue();
    this.authService
      .register({
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: raw.email,
        password: raw.password,
        verificationCode: raw.verificationCode,
      })
      .pipe(catchError((error: unknown) => {
        this.status.set('idle');
        this.formError.set(this.messageFor(error));
        return of(null);
      }))
      .subscribe((user) => {
        if (!user) {
          return;
        }
        this.authService.setCurrentUser(user);
        this.status.set('success');
      });
  }

  private messageFor(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) {
        return this.tr('auth.register.emailTaken');
      }
      if (error.status === 400) {
        return this.tr('auth.register.codeInvalid');
      }
      if (error.status === 503) {
        return this.tr('auth.register.mailFailed');
      }
    }
    return this.tr('auth.register.error');
  }
}
