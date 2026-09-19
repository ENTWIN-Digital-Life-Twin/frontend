import { Component, computed, inject } from '@angular/core';
import {
  LucideBrain,
  LucideCalendarDays,
  LucideHeartPulse,
  LucideSparkles,
  LucideDynamicIcon,
  type LucideIcon,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { BrandLogo } from '../../../../shared/components/brand-logo/brand-logo';

interface BrandStory {
  title: string;
  description: string;
}

interface BrandStat {
  value: string;
  label: string;
}

const STORY_ICONS: readonly LucideIcon[] = [
  LucideCalendarDays,
  LucideHeartPulse,
  LucideBrain,
];

@Component({
  selector: 'app-auth-brand-panel',
  template: `
    <aside
      class="relative hidden min-h-dvh overflow-hidden bg-primary-darker text-white lg:block"
      aria-label="Digital Life Twin"
    >
      <div class="absolute inset-0 bg-grid-light opacity-50" aria-hidden="true"></div>
      <div
        class="animate-glow-pulse pointer-events-none absolute -left-40 top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-[120px]"
        aria-hidden="true"
      ></div>
      <div
        class="animate-glow-pulse pointer-events-none absolute -bottom-40 -right-32 h-[26rem] w-[26rem] rounded-full bg-primary-light/40 blur-[120px]"
        style="animation-delay: -3s"
        aria-hidden="true"
      ></div>

      <div class="relative flex h-full min-h-dvh flex-col justify-between gap-6 px-8 py-10 xl:px-14">
        <app-brand-logo tone="light" size="lg" />

        <div class="max-w-lg">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-teal-200 backdrop-blur"
          >
            <svg lucideSparkles class="h-3.5 w-3.5 text-accent-lighter" aria-hidden="true"></svg>
            {{ badge() }}
          </span>
          <h2 class="mt-5 font-display text-h1 tracking-tight text-white">{{ headline() }}</h2>
          <p class="mt-3 text-body-lg leading-relaxed text-white/70">{{ description() }}</p>

          <ul class="mt-7 grid gap-3 sm:grid-cols-3">
            @for (story of stories(); track story.title) {
              <li
                class="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur transition-colors duration-300 hover:border-accent/30 hover:bg-white/10"
              >
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent-lighter"
                >
                  <svg [lucideIcon]="story.icon" class="h-4 w-4" aria-hidden="true"></svg>
                </span>
                <h3 class="mt-2.5 text-[13px] font-semibold leading-tight text-white">
                  {{ story.title }}
                </h3>
                <p class="mt-1 text-[11px] leading-relaxed text-white/65">
                  {{ story.description }}
                </p>
              </li>
            }
          </ul>

          <dl class="mt-7 grid grid-cols-3 gap-6 border-t border-white/10 pt-5">
            @for (stat of stats(); track stat.label) {
              <div>
                <dt class="text-xs leading-relaxed text-white/65">{{ stat.label }}</dt>
                <dd class="mt-1 font-display text-2xl font-semibold tracking-tight text-white">
                  {{ stat.value }}
                </dd>
              </div>
            }
          </dl>
        </div>

        <p class="max-w-md text-xs leading-relaxed text-white/55">{{ disclaimer() }}</p>
      </div>
    </aside>
  `,
  imports: [BrandLogo, LucideDynamicIcon, LucideSparkles],
})
export class AuthBrandPanel {
  private readonly languageService = inject(LanguageService);

  private readonly tr = <T = string>(key: string): T => this.languageService.translate<T>(key);
  private readonly trSignal = (key: string) => this.languageService.translateSignal(key);

  protected readonly badge = this.trSignal('auth.brand.badge');
  protected readonly headline = this.trSignal('auth.brand.headline');
  protected readonly description = this.trSignal('auth.brand.description');
  protected readonly disclaimer = this.trSignal('auth.brand.disclaimer');

  protected readonly stories = computed(() => {
    const stories = this.tr<BrandStory[]>('auth.brand.stories');
    return stories.map((story, index) => ({
      ...story,
      icon: STORY_ICONS[index] ?? LucideSparkles,
    }));
  });

  protected readonly stats = computed<BrandStat[]>(() => this.tr<BrandStat[]>('auth.brand.stats'));
}
