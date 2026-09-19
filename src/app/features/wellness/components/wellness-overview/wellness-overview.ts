import { Component, ElementRef, computed, effect, inject, viewChild } from '@angular/core';
import { LucideHeartPulse, LucideTrendingUp } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { WellnessService } from '../../services/wellness.service';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-wellness-overview',
  imports: [LucideHeartPulse, LucideTrendingUp],
  template: `
    <section
      class="relative flex h-full flex-col overflow-hidden rounded-card bg-gradient-to-br from-primary-darker via-primary to-primary-light p-5 text-white shadow-card sm:p-6"
    >
      <div
        class="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-accent/25 blur-3xl"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-teal-300/15 blur-3xl"
        aria-hidden="true"
      ></div>
      <div class="bg-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"></div>

      <div class="relative flex items-start justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel bg-white/10">
            <svg lucideHeartPulse class="h-4 w-4 text-teal-200" aria-hidden="true"></svg>
          </span>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">{{ balanceLabel() }}</p>
            <p class="text-sm text-white/70">{{ service.balanceSubtitle() }}</p>
          </div>
        </div>
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-teal-100"
        >
          <svg lucideTrendingUp class="h-3.5 w-3.5 text-teal-300" aria-hidden="true"></svg>
          {{ deltaText() }}
        </span>
      </div>

      <div class="relative flex flex-1 items-center justify-center py-4">
        <svg
          viewBox="0 0 120 120"
          class="h-40 w-40"
          role="img"
          [attr.aria-label]="ariaLabel()"
        >
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            stroke-width="10"
          />
          <circle
            #ringRef
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="url(#overviewGrad)"
            stroke-width="10"
            stroke-linecap="round"
            [attr.stroke-dasharray]="CIRCUMFERENCE"
            [attr.stroke-dashoffset]="CIRCUMFERENCE"
            transform="rotate(-90 60 60)"
          />
          <defs>
            <linearGradient id="overviewGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#7FD1D1"></stop>
              <stop offset="100%" stop-color="#2A9D9D"></stop>
            </linearGradient>
          </defs>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <p class="flex items-start font-display text-5xl font-bold tracking-tight">
            <span #valueRef class="tabular-nums">82</span>
            <span class="mt-1 text-xl text-teal-200">%</span>
          </p>
          <p class="mt-1 text-xs font-medium text-white/70">{{ goodDynamics() }}</p>
        </div>
      </div>

      <div class="relative flex items-center gap-2 text-xs text-white/75">
        <span class="flex items-center gap-1.5">
          <svg lucideTrendingUp class="h-4 w-4 text-teal-300" aria-hidden="true"></svg>
          {{ deltaText() }}
        </span>
        <span class="text-white/65">·</span>
        <span>{{ objective() }}</span>
      </div>
    </section>
  `,
})
export class WellnessOverview {
  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);
  protected readonly CIRCUMFERENCE = CIRCUMFERENCE;

  protected readonly balanceLabel = this.languageService.translateSignal('wellness.balance');
  protected readonly ariaLabel = this.languageService.translateSignal('wellness.overview.aria');
  protected readonly goodDynamics = this.languageService.translateSignal('wellness.overview.goodDynamics');
  protected readonly objective = this.languageService.translateSignal('wellness.overview.objective');

  private readonly ring = viewChild<ElementRef<SVGCircleElement>>('ringRef');
  private readonly value = viewChild<ElementRef<HTMLSpanElement>>('valueRef');

  protected readonly deltaText = computed(() => {
    const delta = this.service.balanceDelta();
    const plural = Math.abs(delta) > 1;
    return this.languageService.translate('wellness.overview.delta', {
      sign: delta >= 0 ? '+' : '−',
      value: String(Math.abs(delta)),
      unit: this.languageService.translate(plural ? 'wellness.overview.points' : 'wellness.overview.point'),
    });
  });

  constructor() {
    effect((onCleanup) => {
      const target = this.service.balance();
      const ring = this.ring()?.nativeElement;
      const value = this.value()?.nativeElement;
      if (!ring || !value) {
        return;
      }
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const targetOffset = CIRCUMFERENCE * (1 - target / 100);
      if (reduced) {
        ring.style.strokeDashoffset = String(targetOffset);
        value.textContent = String(target);
        return;
      }
      value.textContent = '0';
      ring.style.strokeDashoffset = String(CIRCUMFERENCE);
      const proxy = { value: 0 };
      import('gsap').then(({ default: gsap }) => {
        const numberTween = gsap.to(proxy, {
          value: target,
          duration: 1.1,
          ease: 'power3.out',
          onUpdate: () => {
            value.textContent = String(Math.round(proxy.value));
          },
        });
        const ringTween = gsap.to(ring, {
          strokeDashoffset: targetOffset,
          duration: 1.1,
          ease: 'power3.out',
        });
        onCleanup(() => {
          numberTween.kill();
          ringTween.kill();
        });
      });
    });
  }
}
