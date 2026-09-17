import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { Button } from '../../../shared/ui/button/button';
import { Field } from '../../../shared/ui/field/field';
import { InputDirective, SelectDirective } from '../../../shared/directives/field-control/field-control';
import { AuthShell } from '../components/auth-shell/auth-shell';
import { AuthPageShell } from '../components/auth-page-shell/auth-page-shell';
import { AuthHeading } from '../components/auth-heading/auth-heading';

const STEP_COUNT = 2;
const STEP_KEYS = ['profile', 'goals'] as const;
const STEP_INDEXES = [0, 1];

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  imports: [
    ReactiveFormsModule,
    Button,
    Field,
    InputDirective,
    SelectDirective,
    AuthShell,
    AuthPageShell,
    AuthHeading,
  ],
})
export class OnboardingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  private readonly tr = <T = string>(key: string): T => this.languageService.translate<T>(key);
  private readonly trSignal = (key: string) => this.languageService.translateSignal(key);

  protected readonly STEP_COUNT = STEP_COUNT;
  protected readonly STEP_INDEXES = STEP_INDEXES;

  protected readonly eyebrow = this.trSignal('auth.onboarding.eyebrow');
  protected readonly title = this.trSignal('auth.onboarding.title');
  protected readonly subtitle = this.trSignal('auth.onboarding.subtitle');
  protected readonly stepLabel = this.trSignal('auth.register.steps.label');
  protected readonly stepOf = this.trSignal('auth.register.steps.of');
  protected readonly backLabel = this.trSignal('auth.register.nav.back');
  protected readonly nextLabel = this.trSignal('auth.register.nav.next');
  protected readonly genderLabel = this.trSignal('auth.register.profile.gender');
  protected readonly dobLabel = this.trSignal('auth.register.profile.dateOfBirth');
  protected readonly heightLabel = this.trSignal('auth.register.profile.height');
  protected readonly weightLabel = this.trSignal('auth.register.profile.weight');
  protected readonly occupationLabel = this.trSignal('auth.register.profile.occupation');
  protected readonly sleepLabel = this.trSignal('auth.register.personalization.sleepLabel');
  protected readonly sleepHint = this.trSignal('auth.register.personalization.sleepHint');
  protected readonly waterLabel = this.trSignal('auth.register.personalization.waterLabel');
  protected readonly waterHint = this.trSignal('auth.register.personalization.waterHint');
  protected readonly activityLabel = this.trSignal('auth.register.personalization.activityLabel');
  protected readonly activityHint = this.trSignal('auth.register.personalization.activityHint');
  protected readonly submitLabel = this.trSignal('auth.onboarding.submit');
  protected readonly errorBanner = signal<string | null>(null);
  protected readonly status = signal<'idle' | 'loading'>('idle');
  protected readonly step = signal(0);

  protected readonly genderOptions = computed(() => this.options('auth.register.profile.genderOptions'));
  protected readonly occupationOptions = computed(() =>
    this.options('auth.register.profile.occupationOptions'),
  );
  protected readonly sleepOptions = computed(() => this.options('auth.register.personalization.sleepOptions'));
  protected readonly waterOptions = computed(() => this.options('auth.register.personalization.waterOptions'));
  protected readonly activityOptions = computed(() =>
    this.options('auth.register.personalization.activityOptions'),
  );

  protected readonly currentStepTitle = computed(() =>
    this.tr(`auth.register.steps.${STEP_KEYS[this.step()]}.title`),
  );
  protected readonly currentStepSubtitle = computed(() =>
    this.tr(`auth.register.steps.${STEP_KEYS[this.step()]}.subtitle`),
  );
  protected readonly displayedStep = computed(() => this.step() + 1);
  protected readonly primaryLabel = computed(() =>
    this.step() === STEP_COUNT - 1 ? this.submitLabel() : this.nextLabel(),
  );

  protected readonly form = this.fb.nonNullable.group({
    gender: ['', Validators.required],
    dateOfBirth: [''],
    heightCm: [null as number | null, [Validators.required, Validators.min(50), Validators.max(250)]],
    weightKg: [null as number | null, [Validators.required, Validators.min(20), Validators.max(400)]],
    occupationType: [''],
    sleepTarget: ['8h'],
    waterTarget: ['2500'],
    activeMinutesTarget: ['45'],
  });

  constructor() {
    const profile = this.authService.profile();
    if (profile) {
      this.form.patchValue({
        gender: profile.gender ?? '',
        dateOfBirth: profile.dateOfBirth ?? '',
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        occupationType: profile.occupationType ?? '',
      });
    }
  }

  protected segmentActive(index: number): boolean {
    return index < this.displayedStep();
  }

  protected errorFor(control: 'gender' | 'heightCm' | 'weightKg'): string | null {
    const field = this.form.controls[control];
    if (!field.touched || !field.invalid) {
      return null;
    }
    if (field.hasError('required')) {
      return this.tr('auth.errors.required');
    }
    if (field.hasError('min') || field.hasError('max')) {
      return this.tr('auth.register.profile.range');
    }
    return this.tr('auth.errors.invalid');
  }

  protected onBack(): void {
    if (this.step() > 0) {
      this.step.set(this.step() - 1);
    }
  }

  protected onPrimary(): void {
    if (this.status() === 'loading') {
      return;
    }
    if (this.step() === 0) {
      if (!this.validateProfile()) {
        return;
      }
      this.step.set(1);
      return;
    }
    this.onSubmit();
  }

  protected onSubmit(): void {
    if (!this.validateProfile()) {
      this.step.set(0);
      return;
    }
    this.status.set('loading');
    this.errorBanner.set(null);
    const raw = this.form.getRawValue();
    const sleepTarget = this.parseSleepHours(raw.sleepTarget);
    const waterTarget = Number(raw.waterTarget) / 1000;
    const activeMinutesTarget = Number(raw.activeMinutesTarget);

    this.authService
      .updateProfile({
        gender: raw.gender,
        dateOfBirth: raw.dateOfBirth || null,
        heightCm: Number(raw.heightCm),
        weightKg: Number(raw.weightKg),
        occupationType: raw.occupationType || null,
      })
      .pipe(
        switchMap(() =>
          this.authService
            .updatePreferences({
              wellnessTargets: { sleepTarget, waterTarget, activeMinutesTarget },
            })
            .pipe(catchError(() => of(null))),
        ),
      )
      .subscribe({
        next: () => {
          this.status.set('idle');
          void this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.status.set('idle');
          this.errorBanner.set(this.tr('auth.onboarding.error'));
        },
      });
  }

  private validateProfile(): boolean {
    let valid = true;
    for (const name of ['gender', 'heightCm', 'weightKg'] as const) {
      const control = this.form.controls[name];
      control.markAsTouched();
      control.updateValueAndValidity();
      if (control.invalid) {
        valid = false;
      }
    }
    return valid;
  }

  private options(key: string): { value: string; label: string }[] {
    const value = this.tr<{ value: string; label: string }[]>(key);
    return Array.isArray(value) ? value : [];
  }

  private parseSleepHours(value: string): number {
    switch (value) {
      case '7h':
        return 7;
      case '7h30':
        return 7.5;
      case '8h30':
        return 8.5;
      default:
        return 8;
    }
  }
}
