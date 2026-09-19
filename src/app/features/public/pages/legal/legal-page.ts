import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { LucideScale, LucideShieldCheck } from '@lucide/angular';
import { Reveal } from '../../../../shared/directives/reveal/reveal';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-legal-page',
  imports: [Reveal, LucideScale, LucideShieldCheck],
  template: `
    <section class="relative overflow-hidden bg-primary-darker text-white">
      <div class="absolute inset-0 bg-grid-light opacity-40" aria-hidden="true"></div>
      <div class="relative mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pb-20 lg:pt-40">
        <div class="mx-auto max-w-3xl text-center" appReveal>
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-teal-200">
            @if (kind() === 'terms') {
              <svg lucideScale class="h-3.5 w-3.5" aria-hidden="true"></svg>
            } @else {
              <svg lucideShieldCheck class="h-3.5 w-3.5" aria-hidden="true"></svg>
            }
            {{ badge() }}
          </span>
          <h1 class="mt-6 font-display text-display leading-[1.05] tracking-tight text-white">{{ title() }}</h1>
          <p class="mx-auto mt-4 max-w-2xl text-sm text-white/70">{{ updated() }}</p>
        </div>
      </div>
    </section>

    <article class="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p class="text-base leading-relaxed text-ink-muted" appReveal>{{ intro() }}</p>
      <div class="mt-10 space-y-8">
        @for (section of sections(); track section.heading) {
          <section appReveal>
            <h2 class="font-display text-xl font-semibold tracking-tight text-primary">{{ section.heading }}</h2>
            <p class="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">{{ section.body }}</p>
          </section>
        }
      </div>
    </article>
  `,
})
export class LegalPageComponent {
  private readonly languageService = inject(LanguageService);
  private readonly routeData = toSignal(inject(ActivatedRoute).data, { initialValue: {} as Record<string, unknown> });

  protected readonly kind = computed(() =>
    this.routeData()['kind'] === 'privacy' ? 'privacy' : 'terms',
  );

  protected readonly badge = computed(() => this.t('public.legal.badge'));
  protected readonly title = computed(() => this.t(`public.legal.${this.kind()}.title`));
  protected readonly updated = computed(() => this.t(`public.legal.${this.kind()}.updated`));
  protected readonly intro = computed(() => this.t(`public.legal.${this.kind()}.intro`));
  protected readonly sections = computed(() => {
    this.languageService.activeLanguage();
    const value = this.languageService.translate<{ heading: string; body: string }[]>(
      `public.legal.${this.kind()}.sections`,
    );
    return Array.isArray(value) ? value : [];
  });

  private t(key: string): string {
    return this.languageService.translate(key);
  }
}
