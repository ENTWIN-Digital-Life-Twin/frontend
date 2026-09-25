import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideEye, LucideEyeOff, LucideInfo, LucideLock, LucideMail } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { Button } from '../../../shared/ui/button/button';
import { Checkbox } from '../../../shared/ui/checkbox/checkbox';
import { Field } from '../../../shared/ui/field/field';
import { InputDirective } from '../../../shared/directives/field-control/field-control';
import { AuthShell } from '../components/auth-shell/auth-shell';
import { AuthPageShell } from '../components/auth-page-shell/auth-page-shell';
import { AuthHeading } from '../components/auth-heading/auth-heading';

type FormStatus = 'idle' | 'loading' | 'error';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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

  private readonly trSignal = (key: string) => this.languageService.translateSignal(key);
  private readonly tr = <T = string>(key: string): T => this.languageService.translate<T>(key);

  // Translation signals
  protected readonly eyebrow = this.trSignal('auth.login.eyebrow');
  protected readonly title = this.trSignal('auth.login.title');
  protected readonly subtitle = this.trSignal('auth.login.subtitle');
  protected readonly emailLabel = this.trSignal('auth.login.emailLabel');
  protected readonly emailPlaceholder = this.trSignal('auth.login.emailPlaceholder');
  protected readonly passwordLabel = this.trSignal('auth.login.passwordLabel');
  protected readonly passwordPlaceholder = this.trSignal('auth.login.passwordPlaceholder');
  protected readonly showPasswordLabel = this.trSignal('auth.login.showPassword');
  protected readonly hidePassword = this.trSignal('auth.login.hidePassword');
  protected readonly rememberMeText = this.trSignal('auth.login.rememberMe');
  protected readonly forgotPassword = this.trSignal('auth.login.forgotPassword');
  protected readonly submit = this.trSignal('auth.login.submit');
  protected readonly orContinueWith = this.trSignal('auth.login.orContinueWith');
  protected readonly noAccount = this.trSignal('auth.login.noAccount');
  protected readonly createAccount = this.trSignal('auth.login.createAccount');
  protected readonly errorMessage = this.trSignal('auth.login.error');

  // Form and state
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly rememberMe = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly status = signal<FormStatus>('idle');

  /**
   * Get validation error message for a form control
   */
  protected errorFor(control: keyof typeof this.form.controls): string | null {
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

  /**
   * Toggle password visibility
   */
  protected togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Handle form submission
   */
  protected onSubmit(): void {
    // Mark all fields as touched to show validation errors
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Set loading state
    this.status.set('loading');

    const { email, password } = this.form.getRawValue();

    // Call authentication service
    this.authService
      .login({ email, password, rememberMe: this.rememberMe() })
      .subscribe({
        next: (user) => {
          // Set current user
          this.authService.setCurrentUser(user);
          
          // Reset form state
          this.status.set('idle');
          
          // Navigate to dashboard
          void this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          // Set error state
          this.status.set('error');
          
          // Log error for debugging
          console.error('Login failed:', error);
          
          // Reset form password for security
          this.form.controls.password.reset();
        },
      });
  }
}
