import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCheck,
  LucideChevronDown,
  LucideDroplets,
  LucideEye,
  LucideEyeOff,
  LucideFootprints,
  LucideInfo,
  LucideLock,
  LucideMail,
  LucideMoon,
  LucideUser,
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { Button } from '../../../shared/ui/button/button';
import { Checkbox } from '../../../shared/ui/checkbox/checkbox';
import { Field } from '../../../shared/ui/field/field';
import {
  InputDirective,
  SelectDirective,
} from '../../../shared/directives/field-control/field-control';
import { AuthShell } from '../components/auth-shell/auth-shell';
import { AuthPageShell } from '../components/auth-page-shell/auth-page-shell';
import { AuthHeading } from '../components/auth-heading/auth-heading';
import { AuthSocialDivider } from '../components/auth-social-divider/auth-social-divider';
import { AuthSocialButtons } from '../components/auth-social-buttons/auth-social-buttons';

type FormStatus = 'idle' | 'loading' | 'success';

interface Option {
  value: string;
  label: string;
}

const STEP_COUNT = 5;
const STEP_KEYS = ['identity', 'account', 'security', 'terms', 'personalization'] as const;
const STEP_INDEXES = [0, 1, 2, 3, 4];

const DEFAULT_SLEEP = '7h30';
const DEFAULT_WATER = '2000';
const DEFAULT_ACTIVITY = '30';

type StepField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'sleepTarget'
  | 'waterTarget'
  | 'activityGoal';

const STEP_FIELDS: Record<number, StepField[]> = {
  0: ['firstName', 'lastName'],
  1: ['email'],
  2: ['password', 'confirmPassword'],
  4: ['sleepTarget', 'waterTarget', 'activityGoal'],
};

@Component({
  selector: 'app-register',
  template: `
    <app-auth-shell>
      <app-auth-page-shell>
        @if (status() === 'success') {
          <div class="step-forward flex flex-col items-center gap-5 py-8 text-center">
            <span
              class="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-accent-dark"
            >
              <svg lucideCheck class="h-8 w-8" stroke-width="2.5" aria-hidden="true"></svg>
            </span>
            <div>
              <h1 class="font-display text-h1 tracking-tight text-primary">
                {{ successTitle() }}
              </h1>
              <p class="mx-auto mt-2 max-w-sm text-body-sm leading-relaxed text-ink-muted">
                {{ successText() }}
              </p>
            </div>
            <button appButton variant="primary" size="lg" (click)="goToDashboard()">
              {{ goDashboard() }}
            </button>
          </div>
        } @else {
          <app-auth-heading [eyebrow]="eyebrow()" [title]="title()" [subtitle]="subtitle()" />

          <div class="mt-7" [attr.aria-label]="currentStepTitle()">
            <div class="flex items-center justify-between gap-3" aria-live="polite">
              <p class="text-sm font-semibold text-primary">{{ currentStepTitle() }}</p>
              <p class="shrink-0 text-xs font-medium text-ink-faint">
                {{ stepLabel() }} {{ displayedStep() }} {{ stepOf() }} {{ STEP_COUNT }}
              </p>
            </div>
            <div
              class="mt-2.5 flex gap-1.5"
              role="progressbar"
              aria-valuemin="1"
              [attr.aria-valuemax]="STEP_COUNT"
              [attr.aria-valuenow]="displayedStep()"
            >
              @for (index of STEP_INDEXES; track index) {
                <span
                  class="h-1.5 flex-1 rounded-full transition-colors duration-300"
                  [class.bg-accent]="segmentActive(index)"
                  [class.bg-line]="!segmentActive(index)"
                ></span>
              }
            </div>
            <p class="mt-2 text-xs leading-relaxed text-ink-muted">
              {{ currentStepSubtitle() }}
            </p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onPrimary()" class="mt-6" novalidate>
            <div
              [class.step-forward]="direction() === 'forward'"
              [class.step-back]="direction() === 'back'"
            >
              @switch (step()) {
                @case (0) {
                  <div class="grid gap-5 sm:grid-cols-2">
                    <app-field
                      [label]="firstNameLabel()"
                      [id]="'register-first'"
                      [error]="errorFor('firstName')"
                    >
                      <div class="relative">
                        <svg
                          lucideUser
                          class="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                          aria-hidden="true"
                        ></svg>
                        <input
                          appInput
                          id="register-first"
                          type="text"
                          formControlName="firstName"
                          [placeholder]="firstNamePlaceholder()"
                          autocomplete="given-name"
                          class="ps-10"
                          [appInputInvalid]="
                            form.controls.firstName.touched && form.controls.firstName.invalid
                          "
                        />
                      </div>
                    </app-field>
                    <app-field
                      [label]="lastNameLabel()"
                      [id]="'register-last'"
                      [error]="errorFor('lastName')"
                    >
                      <div class="relative">
                        <svg
                          lucideUser
                          class="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                          aria-hidden="true"
                        ></svg>
                        <input
                          appInput
                          id="register-last"
                          type="text"
                          formControlName="lastName"
                          [placeholder]="lastNamePlaceholder()"
                          autocomplete="family-name"
                          class="ps-10"
                          [appInputInvalid]="
                            form.controls.lastName.touched && form.controls.lastName.invalid
                          "
                        />
                      </div>
                    </app-field>
                  </div>
                }
                @case (1) {
                  <div>
                    <app-field
                      [label]="emailLabel()"
                      [id]="'register-email'"
                      [error]="errorFor('email')"
                    >
                      <div class="relative">
                        <svg
                          lucideMail
                          class="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                          aria-hidden="true"
                        ></svg>
                        <input
                          appInput
                          id="register-email"
                          type="email"
                          formControlName="email"
                          [placeholder]="emailPlaceholder()"
                          autocomplete="email"
                          class="ps-10"
                          [appInputInvalid]="
                            form.controls.email.touched && form.controls.email.invalid
                          "
                        />
                      </div>
                    </app-field>
                  </div>
                }
                @case (2) {
                  <div class="grid gap-5 sm:grid-cols-2">
                    <app-field
                      [label]="passwordLabel()"
                      [id]="'register-password'"
                      [hint]="passwordHint()"
                      [error]="errorFor('password')"
                    >
                      <div class="relative">
                        <svg
                          lucideLock
                          class="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                          aria-hidden="true"
                        ></svg>
                        <input
                          appInput
                          id="register-password"
                          [type]="showPassword() ? 'text' : 'password'"
                          formControlName="password"
                          placeholder="••••••••"
                          autocomplete="new-password"
                          class="ps-10 pe-11"
                          [appInputInvalid]="
                            form.controls.password.touched && form.controls.password.invalid
                          "
                        />
                        <button
                          type="button"
                          class="absolute end-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-panel text-ink-faint transition-colors duration-200 hover:bg-surface-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
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
                    <app-field
                      [label]="confirmLabel()"
                      [id]="'register-confirm'"
                      [error]="confirmError()"
                    >
                      <div class="relative">
                        <svg
                          lucideLock
                          class="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                          aria-hidden="true"
                        ></svg>
                        <input
                          appInput
                          id="register-confirm"
                          [type]="showPassword() ? 'text' : 'password'"
                          formControlName="confirmPassword"
                          placeholder="••••••••"
                          autocomplete="new-password"
                          class="ps-10 pe-11"
                          [appInputInvalid]="confirmInvalid()"
                        />
                        <button
                          type="button"
                          class="absolute end-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-panel text-ink-faint transition-colors duration-200 hover:bg-surface-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
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
                  </div>
                }
                @case (3) {
                  <div class="rounded-panel border border-line bg-surface-muted/40 p-5">
                    <app-checkbox [(checked)]="termsAccepted" [ariaLabel]="termsAria()">
                      <span>
                        {{ termsPrefix() }}
                        <span class="font-medium text-accent-dark">{{ termsLink() }}</span>
                        {{ termsAnd() }}
                        <span class="font-medium text-accent-dark">{{ privacyLink() }}</span>.
                      </span>
                    </app-checkbox>
                    @if (termsError()) {
                      <p
                        class="mt-3 flex items-center gap-1.5 text-xs font-medium text-danger"
                        role="alert"
                      >
                        <svg lucideInfo class="h-3.5 w-3.5 shrink-0" aria-hidden="true"></svg>
                        {{ termsErrorMessage() }}
                      </p>
                    }
                  </div>
                }
                @case (4) {
                  <div class="space-y-5">
                    <div class="grid gap-5 sm:grid-cols-2">
                      <app-field [label]="sleepLabel()" [hint]="sleepHint()">
                        <div class="relative">
                          <svg
                            lucideMoon
                            class="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                            aria-hidden="true"
                          ></svg>
                          <select
                            appSelect
                            formControlName="sleepTarget"
                            [attr.aria-label]="sleepLabel()"
                            class="ps-10"
                          >
                            @for (option of sleepOptions(); track option.value) {
                              <option [value]="option.value">{{ option.label }}</option>
                            }
                          </select>
                          <svg
                            lucideChevronDown
                            class="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                            aria-hidden="true"
                          ></svg>
                        </div>
                      </app-field>
                      <app-field [label]="waterLabel()" [hint]="waterHint()">
                        <div class="relative">
                          <svg
                            lucideDroplets
                            class="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                            aria-hidden="true"
                          ></svg>
                          <select
                            appSelect
                            formControlName="waterTarget"
                            [attr.aria-label]="waterLabel()"
                            class="ps-10"
                          >
                            @for (option of waterOptions(); track option.value) {
                              <option [value]="option.value">{{ option.label }}</option>
                            }
                          </select>
                          <svg
                            lucideChevronDown
                            class="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                            aria-hidden="true"
                          ></svg>
                        </div>
                      </app-field>
                      <app-field [label]="activityLabel()" [hint]="activityHint()">
                        <div class="relative">
                          <svg
                            lucideFootprints
                            class="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                            aria-hidden="true"
                          ></svg>
                          <select
                            appSelect
                            formControlName="activityGoal"
                            [attr.aria-label]="activityLabel()"
                            class="ps-10"
                          >
                            @for (option of activityOptions(); track option.value) {
                              <option [value]="option.value">{{ option.label }}</option>
                            }
                          </select>
                          <svg
                            lucideChevronDown
                            class="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                            aria-hidden="true"
                          ></svg>
                        </div>
                      </app-field>
                      <div class="flex items-end pb-1.5">
                        <app-checkbox [(checked)]="dailySummary" [ariaLabel]="summaryLabel()">
                          <span class="block">
                            <span class="font-medium text-ink">{{ summaryLabel() }}</span>
                            <span class="block text-xs text-ink-muted">{{ summaryHint() }}</span>
                          </span>
                        </app-checkbox>
                      </div>
                    </div>
                  </div>
                }
                @default {
                  <div>
                    <div class="rounded-panel border border-line bg-surface-muted/40 p-4 sm:p-5">
                      <dl class="divide-y divide-line">
                        <div class="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                          <dt class="text-xs font-medium text-ink-muted">{{ summaryName() }}</dt>
                          <dd class="truncate text-sm font-semibold text-ink">
                            {{ form.controls.firstName.value }} {{ form.controls.lastName.value }}
                          </dd>
                        </div>
                        <div class="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                          <dt class="text-xs font-medium text-ink-muted">{{ summaryEmail() }}</dt>
                          <dd class="truncate text-sm font-semibold text-ink">
                            {{ form.controls.email.value }}
                          </dd>
                        </div>
                        <div class="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                          <dt class="text-xs font-medium text-ink-muted">{{ summaryPassword() }}</dt>
                          <dd class="text-sm font-semibold text-ink">••••••••</dd>
                        </div>
                        <div class="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                          <dt class="text-xs font-medium text-ink-muted">{{ summarySleep() }}</dt>
                          <dd class="text-sm font-semibold text-ink">
                            {{ labelFor(sleepOptions(), form.controls.sleepTarget.value) }}
                          </dd>
                        </div>
                        <div class="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                          <dt class="text-xs font-medium text-ink-muted">{{ summaryWater() }}</dt>
                          <dd class="text-sm font-semibold text-ink">
                            {{ labelFor(waterOptions(), form.controls.waterTarget.value) }}
                          </dd>
                        </div>
                        <div class="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                          <dt class="text-xs font-medium text-ink-muted">{{ summaryActivity() }}</dt>
                          <dd class="text-sm font-semibold text-ink">
                            {{ labelFor(activityOptions(), form.controls.activityGoal.value) }}
                          </dd>
                        </div>
                        <div class="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                          <dt class="text-xs font-medium text-ink-muted">
                            {{ summaryDailySummary() }}
                          </dt>
                          <dd class="text-sm font-semibold text-ink">
                            {{ dailySummary() ? yes() : no() }}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <p class="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                      <svg
                        lucideCheck
                        class="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        stroke-width="2.5"
                        aria-hidden="true"
                      ></svg>
                      <span>
                        {{ termsPrefix() }} {{ termsLink() }} {{ termsAnd() }}
                        {{ privacyLink() }}.
                      </span>
                    </p>
                  </div>
                }
              }
            </div>

            <div class="mt-8 flex items-center justify-between gap-3">
              <button
                appButton
                variant="secondary"
                type="button"
                class="min-w-28"
                [class.invisible]="step() === 0"
                (click)="onBack()"
              >
                <svg lucideArrowLeft class="mirror-rtl h-4 w-4" aria-hidden="true"></svg>
                {{ backLabel() }}
              </button>
              <button
                appButton
                [variant]="step() === STEP_COUNT ? 'accent' : 'primary'"
                type="submit"
                class="min-w-40 flex-1 sm:flex-none"
                size="lg"
                [loading]="status() === 'loading'"
                [disabled]="status() === 'loading'"
              >
                {{ primaryLabel() }}
              </button>
            </div>
          </form>

          <app-auth-social-divider [label]="socialLabel()" class="mt-7" />
          <app-auth-social-buttons class="mt-5" />

          <p class="mt-7 text-center text-sm text-ink-muted">
            {{ haveAccount() }}
            <a
              routerLink="/login"
              class="font-semibold text-accent-dark transition-colors hover:text-accent"
            >
              {{ loginLink() }}
            </a>
          </p>
        }
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
    SelectDirective,
    AuthShell,
    AuthPageShell,
    AuthHeading,
    AuthSocialDivider,
    AuthSocialButtons,
    LucideArrowLeft,
    LucideCheck,
    LucideChevronDown,
    LucideDroplets,
    LucideEye,
    LucideEyeOff,
    LucideFootprints,
    LucideInfo,
    LucideLock,
    LucideMail,
    LucideMoon,
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

  protected readonly termsAria = this.trSignal('auth.register.termsAria');
  protected readonly termsPrefix = this.trSignal('auth.register.termsPrefix');
  protected readonly termsLink = this.trSignal('auth.register.termsLink');
  protected readonly termsAnd = this.trSignal('auth.register.termsAnd');
  protected readonly privacyLink = this.trSignal('auth.register.privacyLink');
  protected readonly termsErrorMessage = this.trSignal('auth.register.termsError');

  protected readonly sleepLabel = this.trSignal('auth.register.personalization.sleepLabel');
  protected readonly sleepHint = this.trSignal('auth.register.personalization.sleepHint');
  protected readonly waterLabel = this.trSignal('auth.register.personalization.waterLabel');
  protected readonly waterHint = this.trSignal('auth.register.personalization.waterHint');
  protected readonly activityLabel = this.trSignal('auth.register.personalization.activityLabel');
  protected readonly activityHint = this.trSignal('auth.register.personalization.activityHint');
  protected readonly summaryLabel = this.trSignal('auth.register.personalization.summaryLabel');
  protected readonly summaryHint = this.trSignal('auth.register.personalization.summaryHint');

  protected readonly summaryName = this.trSignal('auth.register.summary.name');
  protected readonly summaryEmail = this.trSignal('auth.register.summary.email');
  protected readonly summaryPassword = this.trSignal('auth.register.summary.password');
  protected readonly summarySleep = this.trSignal('auth.register.summary.sleep');
  protected readonly summaryWater = this.trSignal('auth.register.summary.water');
  protected readonly summaryActivity = this.trSignal('auth.register.summary.activity');
  protected readonly summaryDailySummary = this.trSignal('auth.register.summary.dailySummary');
  protected readonly yes = this.trSignal('common.yes');
  protected readonly no = this.trSignal('common.no');

  protected readonly socialLabel = this.trSignal('auth.social.label');
  protected readonly haveAccount = this.trSignal('auth.register.haveAccount');
  protected readonly loginLink = this.trSignal('auth.register.loginLink');

  protected readonly successTitle = this.trSignal('auth.register.successTitle');
  protected readonly goDashboard = this.trSignal('auth.register.goDashboard');

  protected readonly successText = computed(() => {
    const name = this.form.controls.firstName.value || this.tr('auth.register.firstNamePlaceholder');
    return this.languageService.translate('auth.register.successText', { name });
  });

  protected readonly sleepOptions = computed<Option[]>(() =>
    this.tr<Option[]>('auth.register.personalization.sleepOptions'),
  );
  protected readonly waterOptions = computed<Option[]>(() =>
    this.tr<Option[]>('auth.register.personalization.waterOptions'),
  );
  protected readonly activityOptions = computed<Option[]>(() =>
    this.tr<Option[]>('auth.register.personalization.activityOptions'),
  );

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

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    sleepTarget: [DEFAULT_SLEEP, [Validators.required]],
    waterTarget: [DEFAULT_WATER, [Validators.required]],
    activityGoal: [DEFAULT_ACTIVITY, [Validators.required]],
  });

  protected readonly showPassword = signal(false);
  protected readonly termsAccepted = signal(false);
  protected readonly dailySummary = signal(true);
  protected readonly termsError = signal(false);
  protected readonly step = signal(0);
  protected readonly direction = signal<'forward' | 'back'>('forward');
  protected readonly status = signal<FormStatus>('idle');

  protected segmentActive(index: number): boolean {
    return index < this.displayedStep();
  }

  protected labelFor(options: Option[], value: string): string {
    return options.find((option) => option.value === value)?.label ?? value;
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
    if (field.hasError('minlength')) {
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

  protected onBack(): void {
    if (this.step() > 0) {
      this.goTo(this.step() - 1);
    }
  }

  private goTo(target: number): void {
    this.direction.set(target > this.step() ? 'forward' : 'back');
    this.step.set(target);
  }

  private validateStep(step: number): boolean {
    if (step === 3) {
      if (!this.termsAccepted()) {
        this.termsError.set(true);
        return false;
      }
      this.termsError.set(false);
      return true;
    }
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
    return valid;
  }

  private submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.termsAccepted()) {
      this.termsError.set(true);
      this.goTo(3);
      return;
    }
    this.status.set('loading');

    const { firstName, lastName, email, password } = this.form.getRawValue();
    this.authService.register({ firstName, lastName, email, password }).subscribe({
      next: (user) => {
        this.authService.setCurrentUser(user);
        this.status.set('success');
      },
      error: () => {
        this.status.set('idle');
      },
    });
  }

  protected goToDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }
}
