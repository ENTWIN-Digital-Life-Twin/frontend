import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';

type BrandLogoSize = 'sm' | 'md' | 'lg';
type BrandLogoTone = 'light' | 'dark';

const TILE_SIZE: Record<BrandLogoSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
};

const NAME_SIZE: Record<BrandLogoSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const SUBTITLE_SIZE: Record<BrandLogoSize, string> = {
  sm: 'text-[10px] tracking-[0.16em]',
  md: 'text-[11px] tracking-[0.18em]',
  lg: 'text-[11px] tracking-[0.18em]',
};

const GAP_SIZE: Record<BrandLogoSize, string> = {
  sm: 'gap-2.5',
  md: 'gap-3',
  lg: 'gap-3.5',
};

@Component({
  selector: 'app-brand-logo',
  template: `
    <a
      [routerLink]="link()"
      class="group inline-flex items-center rounded-panel focus-visible:ring-2 focus-visible:ring-accent/50"
      [class]="gapClass()"
      [attr.aria-label]="ariaLabel()"
    >
      <span class="shrink-0 rounded-panel p-1 ring-1 transition-opacity duration-200 group-hover:opacity-90" [class]="tileClass()">
        <img src="brand/logo-mark.png" alt="" class="h-full w-full object-contain" />
      </span>
      <span class="flex min-w-0 flex-col">
        <span class="truncate font-display font-semibold leading-tight tracking-tight" [class]="nameClass()">
          Digital Life Twin
        </span>
        @if (!subtitleHidden()) {
          <span class="truncate font-medium uppercase" [class]="subtitleClass()">
            {{ subtitle() }}
          </span>
        }
      </span>
    </a>
  `,
  imports: [RouterLink],
})
export class BrandLogo {
  readonly tone = input<BrandLogoTone>('dark');
  readonly size = input<BrandLogoSize>('md');
  readonly link = input<string>('/');
  readonly subtitleHidden = input(false);

  private readonly languageService = inject(LanguageService);

  protected readonly subtitle = this.languageService.translateSignal('sidebar.subtitle');

  protected readonly gapClass = computed(() => GAP_SIZE[this.size()]);

  protected readonly tileClass = computed(() => {
    const tone =
      this.tone() === 'light'
        ? 'bg-white/10 ring-white/10'
        : 'bg-navy-50 ring-navy-200';
    return `${TILE_SIZE[this.size()]} flex items-center justify-center overflow-hidden ${tone}`;
  });

  protected readonly nameClass = computed(() => {
    const tone = this.tone() === 'light' ? 'text-white' : 'text-primary';
    return `${NAME_SIZE[this.size()]} ${tone}`;
  });

  protected readonly subtitleClass = computed(() => {
    const tone =
      this.tone() === 'light' ? 'text-teal-300/80' : 'text-accent-dark';
    return `${SUBTITLE_SIZE[this.size()]} ${tone}`;
  });

  protected readonly ariaLabel = computed(() =>
    `Digital Life Twin — ${this.languageService.translate<string>('public.nav.home')}`,
  );
}
