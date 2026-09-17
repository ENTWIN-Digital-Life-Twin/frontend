import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideEye, LucideEyeOff, LucideInfo, LucideLock, LucideMail } from '@lucide/angular';
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
    AuthSocialButtons,
    AuthSocialDivider,
    LucideArrowLeft,
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

  protected readonly STEP_COUNT = 2;
  protected readonly STEP_INDEXES = [0, 1];

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
  protected readonly continueLabel = this.trSignal('auth.login.continue');
  protected readonly backLabel = this.trSignal('auth.register.nav.back');
  protected readonly stepLabel = this.trSignal('auth.register.steps.label');
  protected readonly stepOf = this.trSignal('auth.register.steps.of');
  protected readonly noAccount = this.trSignal('auth.login.noAccount');
  protected readonly createAccount = this.trSignal('auth.login.createAccount');
  protected readonly errorMessage = this.trSignal('auth.login.error');
  protected readonly socialLabel = this.trSignal('auth.social.label');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly rememberMe = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly status = signal<FormStatus>('idle');
  protected readonly googleError = signal<string | null>(null);
  protected readonly step = signal(0);
  protected readonly direction = signal<'forward' | 'back'>('forward');

  protected readonly displayedStep = computed(() => this.step() + 1);
  protected readonly currentStepTitle = computed(() =>
    this.tr(this.step() === 0 ? 'auth.login.steps.email.title' : 'auth.login.steps.password.title'),
  );
  protected readonly currentStepSubtitle = computed(() =>
    this.tr(this.step() === 0 ? 'auth.login.steps.email.subtitle' : 'auth.login.steps.password.subtitle'),
  );
  protected readonly primaryLabel = computed(() =>
    this.step() === 0 ? this.continueLabel() : this.submit(),
  );

  protected segmentActive(index: number): boolean {
    return index < this.displayedStep();
  }

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

  protected togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  protected onBack(): void {
    if (this.step() > 0) {
      this.direction.set('back');
      this.step.set(0);
    }
  }

  protected onSubmit(): void {
    if (this.step() === 0) {
      this.form.controls.email.markAsTouched();
      this.form.controls.email.updateValueAndValidity();
      if (this.form.controls.email.invalid) {
        return;
      }
      this.direction.set('forward');
      this.step.set(1);
      return;
    }

    this.form.controls.password.markAsTouched();
    this.form.controls.password.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('loading');
    this.googleError.set(null);
    const { email, password } = this.form.getRawValue();
    this.authService.login({ email, password, rememberMe: this.rememberMe() }).subscribe({
      next: (user) => {
        this.authService.setCurrentUser(user);
        this.status.set('idle');
        void this.router.navigate([this.authService.afterAuthPath()]);
      },
      error: (error) => {
        this.status.set('error');
        console.error('Login failed:', error);
        this.form.controls.password.reset();
      },
    });
  }

  protected bannerMessage(): string {
    const code = this.googleError();
    if (code) {
      return this.tr(`auth.social.errors.${code}`);
    }
    return this.errorMessage();
  }

  protected onGoogleSignedIn(user: User): void {
    this.googleError.set(null);
    this.authService.setCurrentUser(user);
    this.status.set('idle');
    void this.router.navigate([this.authService.afterAuthPath()]);
  }

  protected onGoogleFailed(code: string): void {
    this.googleError.set(code);
    this.status.set('error');
  }
}
