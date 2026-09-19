import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { delay, of } from 'rxjs';
import {
  LucideCheck,
  LucideClock,
  LucideMail,
  LucideMapPin,
  LucideMessageCircle,
  LucideSparkles,
} from '@lucide/angular';
import { Button } from '../../../../shared/ui/button/button';
import { Field } from '../../../../shared/ui/field/field';
import {
  InputDirective,
  SelectDirective,
  TextareaDirective,
} from '../../../../shared/directives/field-control/field-control';
import { Reveal } from '../../../../shared/directives/reveal/reveal';
import { LanguageService } from '../../../../core/services/language.service';

type FormStatus = 'idle' | 'loading' | 'success';

@Component({
  selector: 'app-contact',
  template: `
    <section class="relative overflow-hidden bg-primary-darker text-white">
      <div class="absolute inset-0 bg-grid-light opacity-40" aria-hidden="true"></div>
      <div
        class="animate-glow-pulse pointer-events-none absolute -right-32 top-[-8rem] h-96 w-96 rounded-full bg-accent/25 blur-[120px]"
        aria-hidden="true"
      ></div>
      <div class="relative mx-auto max-w-7xl px-4 pb-20 pt-36 sm:px-6 lg:px-8 lg:pb-24 lg:pt-44">
        <div class="mx-auto max-w-3xl text-center" appReveal>
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-teal-200">
            <svg lucideSparkles class="h-3.5 w-3.5 text-accent-lighter" aria-hidden="true"></svg>
            {{ badge() }}
          </span>
          <h1 class="mt-6 font-display text-display leading-[1.05] tracking-tight text-white">
            {{ titleA() }} <span class="text-gradient-light">{{ titleB() }}</span>
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-white/70">
            {{ description() }}
          </p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div class="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div appReveal>
          <h2 class="font-display text-h1 tracking-tight text-primary">{{ coordinatesTitle() }}</h2>
          <p class="mt-4 text-body-lg leading-relaxed text-ink-muted">
            {{ coordinatesText() }}
          </p>

          <ul class="mt-9 space-y-4">
            <li class="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-accent-dark">
                <svg lucideMail class="h-5 w-5" aria-hidden="true"></svg>
              </span>
              <div>
                <p class="text-sm font-semibold text-primary">{{ emailLabel() }}</p>
                <p class="mt-0.5 text-sm text-ink-muted">contact@digital-life-twin.app</p>
              </div>
            </li>
            <li class="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-accent-dark">
                <svg lucideClock class="h-5 w-5" aria-hidden="true"></svg>
              </span>
              <div>
                <p class="text-sm font-semibold text-primary">{{ availabilityLabel() }}</p>
                <p class="mt-0.5 text-sm text-ink-muted">{{ availabilityValue() }}</p>
              </div>
            </li>
            <li class="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-accent-dark">
                <svg lucideMapPin class="h-5 w-5" aria-hidden="true"></svg>
              </span>
              <div>
                <p class="text-sm font-semibold text-primary">{{ teamLabel() }}</p>
                <p class="mt-0.5 text-sm text-ink-muted">{{ teamValue() }}</p>
              </div>
            </li>
          </ul>

          <div class="mt-6 flex items-start gap-3 rounded-panel border border-line bg-surface-muted/70 p-4">
            <svg lucideMessageCircle class="mt-0.5 h-5 w-5 shrink-0 text-accent-dark" aria-hidden="true"></svg>
            <p class="text-sm leading-relaxed text-ink-muted">
              {{ responseTime() }}
            </p>
          </div>
        </div>

        <div appReveal>
          @if (status() !== 'success') {
            <form
              [formGroup]="form"
              (ngSubmit)="onSubmit()"
              class="rounded-[1.5rem] border border-line bg-surface p-6 shadow-card sm:p-9"
              novalidate
            >
              <h2 class="font-display text-h2 tracking-tight text-primary">{{ formTitle() }}</h2>
              <p class="mt-1.5 text-sm text-ink-muted">{{ formHint() }}</p>

              <div class="mt-7 grid gap-5 sm:grid-cols-2">
                <app-field [label]="nameLabel()" [id]="'contact-name'" [error]="errorFor('name')">
                  <input
                    appInput
                    id="contact-name"
                    type="text"
                    formControlName="name"
                    [placeholder]="namePlaceholder()"
                    autocomplete="name"
                    [appInputInvalid]="form.controls.name.touched && form.controls.name.invalid"
                  />
                </app-field>
                <app-field [label]="emailLabel()" [id]="'contact-email'" [error]="errorFor('email')">
                  <input
                    appInput
                    id="contact-email"
                    type="email"
                    formControlName="email"
                    [placeholder]="emailPlaceholder()"
                    autocomplete="email"
                    [appInputInvalid]="form.controls.email.touched && form.controls.email.invalid"
                  />
                </app-field>
              </div>

              <div class="mt-5">
                <app-field [label]="subjectLabel()" [id]="'contact-subject'" [error]="errorFor('subject')">
                  <select
                    appSelect
                    id="contact-subject"
                    formControlName="subject"
                    [appSelectInvalid]="form.controls.subject.touched && form.controls.subject.invalid"
                  >
                    <option value="" disabled>{{ subjectPlaceholder() }}</option>
                    @for (subject of subjects(); track subject) {
                      <option [value]="subject">{{ subject }}</option>
                    }
                  </select>
                </app-field>
              </div>

              <div class="mt-5">
                <app-field [label]="messageLabel()" [id]="'contact-message'" [error]="errorFor('message')">
                  <textarea
                    appTextarea
                    id="contact-message"
                    formControlName="message"
                    [placeholder]="messagePlaceholder()"
                    rows="5"
                    [appTextareaInvalid]="form.controls.message.touched && form.controls.message.invalid"
                  ></textarea>
                </app-field>
              </div>

              <button
                appButton
                variant="primary"
                type="submit"
                class="mt-7 w-full sm:w-auto"
                [loading]="status() === 'loading'"
                [disabled]="status() === 'loading'"
              >
                {{ submit() }}
              </button>
            </form>
          } @else {
            <div
              class="flex min-h-[28rem] flex-col items-center justify-center gap-5 rounded-[1.5rem] border border-line bg-surface p-9 text-center shadow-card"
            >
              <span class="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-accent-dark">
                <svg lucideCheck class="h-8 w-8" stroke-width="2.5" aria-hidden="true"></svg>
              </span>
              <div>
                <h2 class="font-display text-h2 tracking-tight text-primary">{{ successTitle() }}</h2>
                <p class="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                  {{ successText() }}
                </p>
              </div>
              <button appButton variant="secondary" (click)="resetForm()">
                {{ successAction() }}
              </button>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  imports: [
    ReactiveFormsModule,
    Button,
    Field,
    InputDirective,
    SelectDirective,
    TextareaDirective,
    Reveal,
    LucideCheck,
    LucideClock,
    LucideMail,
    LucideMapPin,
    LucideMessageCircle,
    LucideSparkles,
  ],
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly languageService = inject(LanguageService);

  private readonly tr = <T = string>(key: string): T => this.languageService.translate<T>(key);
  private readonly trSignal = (key: string) => this.languageService.translateSignal(key);

  protected readonly badge = this.trSignal('public.contact.badge');
  protected readonly titleA = this.trSignal('public.contact.titleA');
  protected readonly titleB = this.trSignal('public.contact.titleB');
  protected readonly description = this.trSignal('public.contact.description');

  protected readonly coordinatesTitle = this.trSignal('public.contact.coordinatesTitle');
  protected readonly coordinatesText = this.trSignal('public.contact.coordinatesText');
  protected readonly emailLabel = this.trSignal('public.contact.emailLabel');
  protected readonly availabilityLabel = this.trSignal('public.contact.availabilityLabel');
  protected readonly availabilityValue = this.trSignal('public.contact.availabilityValue');
  protected readonly teamLabel = this.trSignal('public.contact.teamLabel');
  protected readonly teamValue = this.trSignal('public.contact.teamValue');
  protected readonly responseTime = this.trSignal('public.contact.responseTime');

  protected readonly formTitle = this.trSignal('public.contact.formTitle');
  protected readonly formHint = this.trSignal('public.contact.formHint');
  protected readonly nameLabel = this.trSignal('public.contact.nameLabel');
  protected readonly namePlaceholder = this.trSignal('public.contact.namePlaceholder');
  protected readonly emailPlaceholder = this.trSignal('public.contact.emailPlaceholder');
  protected readonly subjectLabel = this.trSignal('public.contact.subjectLabel');
  protected readonly subjectPlaceholder = this.trSignal('public.contact.subjectPlaceholder');
  protected readonly messageLabel = this.trSignal('public.contact.messageLabel');
  protected readonly messagePlaceholder = this.trSignal('public.contact.messagePlaceholder');
  protected readonly submit = this.trSignal('public.contact.submit');
  protected readonly subjects = computed(() => this.tr<string[]>('public.contact.subjects'));

  protected readonly successTitle = this.trSignal('public.contact.successTitle');
  protected readonly successText = this.trSignal('public.contact.successText');
  protected readonly successAction = this.trSignal('public.contact.successAction');

  protected readonly status = signal<FormStatus>('idle');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected errorFor(control: keyof ContactComponent['form']['controls']): string | null {
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

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('loading');
    of(null)
      .pipe(delay(1100))
      .subscribe(() => {
        this.status.set('success');
      });
  }

  protected resetForm(): void {
    this.form.reset();
    this.status.set('idle');
  }
}
