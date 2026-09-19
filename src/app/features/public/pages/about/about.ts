import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCompass,
  LucideEye,
  LucideHeartPulse,
  LucideLayers,
  LucideLock,
  LucideShieldCheck,
  LucideSparkles,
  LucideTarget,
} from '@lucide/angular';
import { Reveal } from '../../../../shared/directives/reveal/reveal';
import { LanguageService } from '../../../../core/services/language.service';

interface Value {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  template: `
    <section class="relative overflow-hidden bg-primary-darker text-white">
      <div class="absolute inset-0 bg-grid-light opacity-40" aria-hidden="true"></div>
      <div
        class="animate-glow-pulse pointer-events-none absolute -right-32 top-[-8rem] h-96 w-96 rounded-full bg-accent/25 blur-[120px]"
        aria-hidden="true"
      ></div>
      <div class="relative mx-auto max-w-7xl px-4 pb-24 pt-36 sm:px-6 lg:px-8 lg:pb-32 lg:pt-44">
        <div class="mx-auto max-w-3xl text-center" appReveal>
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-teal-200">
            <svg lucideSparkles class="h-3.5 w-3.5 text-accent-lighter" aria-hidden="true"></svg>
            {{ badge() }}
          </span>
          <h1 class="mt-6 font-display text-display leading-[1.05] tracking-tight text-white">
            {{ titleA() }} <span class="text-gradient-light">{{ titleB() }}</span> {{ titleC() }}
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-white/70">
            {{ description() }}
          </p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32" aria-labelledby="concept-title">
      <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div appReveal>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ conceptEyebrow() }}</p>
          <h2 id="concept-title" class="mt-3 font-display text-h1 tracking-tight text-primary">
            {{ conceptTitle() }}
          </h2>
          <p class="mt-5 leading-relaxed text-ink-muted">
            {{ conceptText1() }}
          </p>
          <p class="mt-4 leading-relaxed text-ink-muted">
            {{ conceptText2() }}
          </p>
          <a routerLink="/features" class="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-dark transition-colors hover:text-accent">
            {{ conceptLink() }}
            <svg lucideArrowRight class="mirror-rtl h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden="true"></svg>
          </a>
        </div>

        <div appReveal class="grid grid-cols-2 gap-4" aria-hidden="true">
          <div class="rounded-2xl border border-line bg-surface p-6 shadow-soft">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
              <svg lucideLayers class="h-5 w-5" aria-hidden="true"></svg>
            </span>
            <p class="mt-4 font-display text-3xl font-semibold tracking-tight text-primary">4</p>
            <p class="mt-1 text-sm text-ink-muted">{{ conceptDomains() }}</p>
          </div>
          <div class="rounded-2xl border border-line bg-surface p-6 shadow-soft">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-teal-400 text-white">
              <svg lucideTarget class="h-5 w-5" aria-hidden="true"></svg>
            </span>
            <p class="mt-4 font-display text-3xl font-semibold tracking-tight text-primary">100%</p>
            <p class="mt-1 text-sm text-ink-muted">{{ conceptUserCentered() }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-line bg-surface-muted/60" aria-labelledby="vision-title">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div class="mx-auto max-w-2xl text-center" appReveal>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ visionEyebrow() }}</p>
          <h2 id="vision-title" class="mt-3 font-display text-h1 tracking-tight text-primary">
            {{ visionTitle() }}
          </h2>
          <p class="mt-4 text-body-lg leading-relaxed text-ink-muted">
            {{ visionDescription() }}
          </p>
        </div>

        <div appReveal revealStagger=".value-card" class="mt-14 grid gap-6 md:grid-cols-3">
          @for (value of values(); track value.title) {
            <article class="value-card rounded-2xl border border-line bg-surface p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
              <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-accent-dark">
                @switch (value.icon) {
                  @case ('eye') {
                    <svg lucideEye class="h-6 w-6" aria-hidden="true"></svg>
                  }
                  @case ('heartPulse') {
                    <svg lucideHeartPulse class="h-6 w-6" aria-hidden="true"></svg>
                  }
                  @case ('lock') {
                    <svg lucideLock class="h-6 w-6" aria-hidden="true"></svg>
                  }
                }
              </span>
              <h3 class="mt-5 font-display text-h3 text-primary">{{ value.title }}</h3>
              <p class="mt-2.5 text-sm leading-relaxed text-ink-muted">{{ value.description }}</p>
            </article>
          }
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32" aria-labelledby="data-title">
      <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div appReveal class="order-2 lg:order-1 rounded-2xl border border-line bg-surface p-8 shadow-card">
          <div class="flex items-center gap-3">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <svg lucideShieldCheck class="h-5 w-5" aria-hidden="true"></svg>
            </span>
            <h3 class="font-display text-h3 text-primary">{{ dataCardTitle() }}</h3>
          </div>
          <ul class="mt-6 space-y-3.5">
            @for (point of dataPoints(); track point) {
              <li class="flex items-start gap-3 text-sm leading-relaxed text-ink">
                <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
                {{ point }}
              </li>
            }
          </ul>
        </div>

        <div class="order-1 lg:order-2" appReveal>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">{{ dataEyebrow() }}</p>
          <h2 id="data-title" class="mt-3 font-display text-h1 tracking-tight text-primary">
            {{ dataTitle() }}
          </h2>
          <p class="mt-4 text-body-lg leading-relaxed text-ink-muted">
            {{ dataDescription() }}
          </p>
          <div class="mt-8 flex items-start gap-3 rounded-panel border border-line bg-surface p-4">
            <svg lucideCompass class="mt-0.5 h-5 w-5 shrink-0 text-accent-dark" aria-hidden="true"></svg>
            <p class="text-sm leading-relaxed text-ink-muted">
              {{ dataNote() }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="relative overflow-hidden" aria-labelledby="about-cta-title">
      <div class="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div appReveal class="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-darker via-primary to-primary-dark px-6 py-16 text-center shadow-card-hover sm:px-12">
          <div class="absolute inset-0 bg-grid-light opacity-40" aria-hidden="true"></div>
          <div class="animate-glow-pulse pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-[100px]" aria-hidden="true"></div>
          <div class="relative mx-auto max-w-xl">
            <h2 id="about-cta-title" class="font-display text-h1 tracking-tight text-white">
              {{ ctaTitle() }}
            </h2>
            <p class="mx-auto mt-4 max-w-lg text-body-lg leading-relaxed text-white/70">
              {{ ctaDescription() }}
            </p>
            <a routerLink="/register" class="group mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-panel bg-accent-dark px-7 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:bg-accent-darker active:scale-[0.98]">
              {{ ctaPrimary() }}
              <svg lucideArrowRight class="mirror-rtl h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden="true"></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  imports: [
    RouterLink,
    Reveal,
    LucideArrowRight,
    LucideCompass,
    LucideEye,
    LucideHeartPulse,
    LucideLayers,
    LucideLock,
    LucideShieldCheck,
    LucideSparkles,
    LucideTarget,
  ],
})
export class AboutComponent {
  private readonly languageService = inject(LanguageService);

  private readonly tr = <T = string>(key: string): T => this.languageService.translate<T>(key);
  private readonly trSignal = (key: string) => this.languageService.translateSignal(key);

  protected readonly badge = this.trSignal('public.about.badge');
  protected readonly titleA = this.trSignal('public.about.titleA');
  protected readonly titleB = this.trSignal('public.about.titleB');
  protected readonly titleC = this.trSignal('public.about.titleC');
  protected readonly description = this.trSignal('public.about.description');

  protected readonly conceptEyebrow = this.trSignal('public.about.concept.eyebrow');
  protected readonly conceptTitle = this.trSignal('public.about.concept.title');
  protected readonly conceptText1 = this.trSignal('public.about.concept.text1');
  protected readonly conceptText2 = this.trSignal('public.about.concept.text2');
  protected readonly conceptLink = this.trSignal('public.about.concept.link');
  protected readonly conceptDomains = this.trSignal('public.about.concept.domains');
  protected readonly conceptUserCentered = this.trSignal('public.about.concept.userCentered');

  protected readonly visionEyebrow = this.trSignal('public.about.vision.eyebrow');
  protected readonly visionTitle = this.trSignal('public.about.vision.title');
  protected readonly visionDescription = this.trSignal('public.about.vision.description');

  protected readonly values = computed<Value[]>(() => [
    {
      icon: 'eye',
      title: this.tr('public.about.vision.values.clarity.title'),
      description: this.tr('public.about.vision.values.clarity.description'),
    },
    {
      icon: 'heartPulse',
      title: this.tr('public.about.vision.values.balance.title'),
      description: this.tr('public.about.vision.values.balance.description'),
    },
    {
      icon: 'lock',
      title: this.tr('public.about.vision.values.trust.title'),
      description: this.tr('public.about.vision.values.trust.description'),
    },
  ]);

  protected readonly dataEyebrow = this.trSignal('public.about.data.eyebrow');
  protected readonly dataTitle = this.trSignal('public.about.data.title');
  protected readonly dataDescription = this.trSignal('public.about.data.description');
  protected readonly dataCardTitle = this.trSignal('public.about.data.cardTitle');
  protected readonly dataPoints = computed(() => this.tr<string[]>('public.about.data.points'));
  protected readonly dataNote = this.trSignal('public.about.data.note');

  protected readonly ctaTitle = this.trSignal('public.about.cta.title');
  protected readonly ctaDescription = this.trSignal('public.about.cta.description');
  protected readonly ctaPrimary = this.trSignal('public.about.cta.primary');
}
