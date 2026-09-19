import {
  Component,
  AfterViewInit,
  ElementRef,
  inject,
  input,
  viewChildren,
} from '@angular/core';
import {
  LucideDynamicIcon,
  type LucideIcon,
} from '@lucide/angular';
import { Badge } from '../../ui/badge/badge';
import { PageHeader } from '../../ui/page-header/page-header';
import { Skeleton } from '../../ui/skeleton/skeleton';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-feature-placeholder',
  template: `
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <app-page-header
        eyebrow="Digital Life Twin"
        [title]="title()"
        [subtitle]="description()"
      />

      <div
        class="ph-item rounded-card border border-dashed border-line-strong bg-surface/60 p-6 shadow-card sm:p-10"
      >
        <div class="flex flex-col items-center gap-4 text-center">
          <span
            class="ph-item flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-card"
          >
            <svg [lucideIcon]="icon()" class="h-8 w-8" aria-hidden="true"></svg>
          </span>
          <div class="space-y-1.5">
            <h2 class="font-display text-xl font-semibold tracking-tight text-primary">
              {{ title() }}
            </h2>
            <p class="mx-auto max-w-md text-sm leading-relaxed text-ink-muted">
              {{ description() }}
            </p>
          </div>
          <app-badge variant="accent" [dot]="true">{{ badgeText() }}</app-badge>
        </div>

        <div class="mt-10 grid gap-3 sm:grid-cols-3">
          <div class="ph-item rounded-panel border border-line bg-surface p-4">
            <app-skeleton width="40%" height="0.75rem" />
            <app-skeleton class="mt-3 block" width="90%" height="2.5rem" />
          </div>
          <div class="ph-item rounded-panel border border-line bg-surface p-4">
            <app-skeleton width="55%" height="0.75rem" />
            <app-skeleton class="mt-3 block" width="75%" height="2.5rem" />
          </div>
          <div class="ph-item rounded-panel border border-line bg-surface p-4">
            <app-skeleton width="35%" height="0.75rem" />
            <app-skeleton class="mt-3 block" width="85%" height="2.5rem" />
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [LucideDynamicIcon, Badge, PageHeader, Skeleton],
})
export class FeaturePlaceholder implements AfterViewInit {
  readonly icon = input.required<LucideIcon>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();

  private readonly languageService = inject(LanguageService);
  protected readonly badgeText = this.languageService.translateSignal('common.comingSoon');

  private readonly items = viewChildren<ElementRef<HTMLElement>>('.ph-item');

  ngAfterViewInit(): void {
    const nodes = this.items().map((ref) => ref.nativeElement);
    if (!nodes.length) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        nodes,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'power2.out', clearProps: 'transform' },
      );
    });
  }
}
