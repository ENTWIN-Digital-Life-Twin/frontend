import { Component, computed, inject } from '@angular/core';
import { LucideLightbulb, LucideSparkles } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { WellnessService } from '../../services/wellness.service';

@Component({
  selector: 'app-ai-wellness-insight',
  imports: [LucideLightbulb, LucideSparkles],
  template: `
    <section
      class="relative flex h-full flex-col overflow-hidden rounded-card bg-gradient-to-br from-primary via-primary-light to-primary-dark p-5 text-white shadow-card sm:p-6"
    >
      <div class="bg-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"></div>
      <div
        class="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/25 blur-3xl"
        aria-hidden="true"
      ></div>

      <div class="relative flex items-start justify-between gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-white/10">
          <svg lucideSparkles class="h-4 w-4 text-teal-200" aria-hidden="true"></svg>
        </span>
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-teal-100"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-teal-300"></span>
          {{ insight().confidence }}
        </span>
      </div>

      <h2 class="relative mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
        {{ analysisLabel() }}
      </h2>
      <p class="relative mt-1 font-display text-lg font-semibold tracking-tight">
        {{ insight().title }}
      </p>
      <p class="relative mt-2 text-sm leading-relaxed text-white/75">
        {{ insight().message }}
      </p>

      <div class="relative mt-4 flex gap-2.5 rounded-panel bg-white/10 p-3">
        <svg lucideLightbulb class="mt-0.5 h-4 w-4 shrink-0 text-teal-200" aria-hidden="true"></svg>
        <p class="text-xs leading-relaxed text-white/90">
          {{ insight().recommendation }}
        </p>
      </div>

      <div class="relative mt-4 flex flex-wrap gap-1.5">
        @for (factor of insight().factors; track factor.label) {
          <span class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/80">
            {{ factor.label }} :
            <span class="font-semibold text-white">{{ factor.value }}</span>
          </span>
        }
      </div>
    </section>
  `,
})
export class AiWellnessInsight {
  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly analysisLabel = this.languageService.translateSignal('wellness.insight.analysis');

  protected readonly insight = computed(() => {
    const raw = this.service.insight();
    return {
      title: this.languageService.translate(raw.titleKey),
      message: this.languageService.translate(raw.messageKey),
      recommendation: this.languageService.translate(raw.recommendationKey),
      confidence: this.languageService.translate('wellness.insight.confidence', {
        value: String(raw.confidence),
      }),
      factors: raw.factors.map((factor) => ({
        label: this.languageService.translate(factor.labelKey),
        value: factor.valueKey
          ? this.languageService.translate(factor.valueKey, factor.valueArgs)
          : factor.value ?? '',
      })),
    };
  });
}
