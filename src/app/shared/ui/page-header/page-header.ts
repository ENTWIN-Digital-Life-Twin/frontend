import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="flex flex-col gap-1.5">
      @if (eyebrow()) {
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-accent-dark">
          {{ eyebrow() }}
        </p>
      }
      <h1
        class="font-display text-2xl font-semibold leading-tight tracking-tight text-primary sm:text-3xl"
      >
        {{ title() }}
      </h1>
      @if (subtitle()) {
        <p class="max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          {{ subtitle() }}
        </p>
      }
    </div>
  `,
})
export class PageHeader {
  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
