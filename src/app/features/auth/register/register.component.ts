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
  LucideUser,
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { Button } from '../../../shared/ui/button/button';
import { Checkbox } from '../../../shared/ui/checkbox/checkbox';
import { Field } from '../../../shared/ui/field/field';
import { InputDirective } from '../../../shared/directives/field-control/field-control';
import { AuthShell } from '../components/auth-shell/auth-shell';
import { AuthPageShell } from '../components/auth-page-shell/auth-page-shell';
import { AuthHeading } from '../components/auth-heading/auth-heading';

type FormStatus = 'idle' | 'loading' | 'success';
type StepField = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword';

const STEP_COUNT = 4;
const STEP_KEYS = ['identity', 'account', 'security', 'terms'] as const;
const STEP_INDEXES = [0, 1, 2, 3];

const STEP_FIELDS: Record<number, StepField[]> = {
  0: ['firstName', 'lastName'],
  1: ['email'],
  2: ['password', 'confirmPassword'],
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
    LucideArrowLeft,
    LucideCheck,
    LucideEye,
    LucideEyeOff,
    LucideInfo,
    LucideLock,
    LucideMail,
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

  // Translation signals
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

  protected readonly termsAria = this.trSignal('auth.register.termsAria');
  protected readonly termsPrefix = this.trSignal('auth.register.termsPrefix');
  protected readonly termsLink = this.trSignal('auth.register.termsLink');
  protected readonly termsAnd = this.trSignal('auth.register.termsAnd');
  protected readonly privacyLink = this.trSignal('auth.register.privacyLink');
  protected readonly termsErrorMessage = this.trSignal('auth.register.termsError');

  protected readonly summaryName = this.trSignal('auth.register.summary.name');
  protected readonly summaryEmail = this.trSignal('auth.register.summary.email');
  protected readonly summaryPassword = this.trSignal('auth.register.summary.password');

  protected readonly haveAccount = this.trSignal('auth.register.haveAccount');
  protected readonly loginLink = this.trSignal('auth.register.loginLink');

  protected readonly successTitle = this.trSignal('auth.register.successTitle');
  protected readonly goDashboard = this.trSignal('auth.register.goDashboard');

  protected readonly successText = computed(() => {
    const name = this.form.controls.firstName.value || this.tr('auth.register.firstNamePlaceholder');
    return this.languageService.translate('auth.register.successText', { name });
  });

  protected readonly currentStepTitle = computed(() => {
    const step = this.step();
    if (step === STEP_COUNT) {
      return this.tr('auth.register.confirm.title');
    }
    return this.tr(`auth.register.steps.${STEP_KEYS[step]}.title`);
  });

  protected readonly currentStepSubtitle = computed(() => {
    const step = this.step();
    if (step === STEP_COUNT) {
      return this.tr('auth.register.confirm.subtitle');
    }
    return this.tr(`auth.register.steps.${STEP_KEYS[step]}.subtitle`);
  });

  protected readonly displayedStep = computed(() =>
    this.step() < STEP_COUNT ? this.step() + 1 : STEP_COUNT,
  );

  protected readonly primaryLabel = computed(() =>
    this.step() === STEP_COUNT ? this.tr('auth.register.submit') : this.nextLabel(),
  );

  // Form definition
  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  // Component state
  protected readonly showPassword = signal(false);
  protected readonly termsAccepted = signal(false);
  protected readonly termsError = signal(false);
  protected readonly step = signal(0);
  protected readonly direction = signal<'forward' | 'back'>('forward');
  protected readonly status = signal<FormStatus>('idle');

  /**
   * Check if a progress segment is active
   */
  protected segmentActive(index: number): boolean {
    return index < this.displayedStep();
  }

  /**
   * Get validation error message for a form control
   */
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
    if (field.hasError('minlength')) {
      return this.tr('auth.errors.tooShort');
    }
    return this.tr('auth.errors.invalid');
  }

  /**
   * Check if confirm password field is invalid
   */
  protected confirmInvalid(): boolean {
    const confirm = this.form.controls.confirmPassword;
    const mismatch = confirm.touched && confirm.value !== this.form.controls.password.value;
    return (confirm.touched && confirm.invalid) || mismatch;
  }

  /**
   * Get error message for confirm password field
   */
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

  /**
   * Toggle password visibility
   */
  protected togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Handle primary button click (Next or Submit)
   */
  protected onPrimary(): void {
    if (this.status() === 'loading') {
      return;
    }
    if (this.step() < STEP_COUNT) {
      if (!this.validateStep(this.step())) {
        return;
      }
      this.goTo(this.step() + 1);
      return;
    }
    this.submit();
  }

  /**
   * Handle back button click
   */
  protected onBack(): void {
    if (this.step() > 0) {
      this.goTo(this.step() - 1);
    }
  }

  /**
   * Navigate to dashboard after successful registration
   */
  protected goToDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }

  /**
   * Navigate to a specific step
   */
  private goTo(target: number): void {
    this.direction.set(target > this.step() ? 'forward' : 'back');
    this.step.set(target);
  }

  /**
   * Validate the current step
   */
  private validateStep(step: number): boolean {
    // Special validation for terms step
    if (step === 3) {
      if (!this.termsAccepted()) {
        this.termsError.set(true);
        return false;
      }
      this.termsError.set(false);
      return true;
    }

    // Validate form fields for the current step
    const fields = STEP_FIELDS[step] ?? [];
    let valid = true;
    for (const field of fields) {
      const control = this.form.controls[field];
      control.markAsTouched();
      control.updateValueAndValidity();
      if (control.invalid) {
        valid = false;
      }
    }

    // Additional validation for password confirmation
    if (step === 2) {
      const password = this.form.controls.password.value;
      const confirm = this.form.controls.confirmPassword.value;
      if (password !== confirm) {
        this.form.controls.confirmPassword.markAsTouched();
        valid = false;
      }
    }

    return valid;
  }

  /**
   * Submit the registration form
   */
  private submit(): void {
    // Final validation
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Check terms acceptance
    if (!this.termsAccepted()) {
      this.termsError.set(true);
      this.goTo(3);
      return;
    }

    // Set loading state
    this.status.set('loading');

    const { firstName, lastName, email, password } = this.form.getRawValue();

    // Call authentication service
    this.authService.register({ firstName, lastName, email, password }).subscribe({
      next: (user) => {
        // Set current user
        this.authService.setCurrentUser(user);
        
        // Set success state
        this.status.set('success');
      },
      error: (error) => {
        // Reset to idle state
        this.status.set('idle');
        
        // Log error for debugging
        console.error('Registration failed:', error);
        
        // Go back to email step to allow user to try different email
        this.goTo(1);
      },
    });
  }
}
