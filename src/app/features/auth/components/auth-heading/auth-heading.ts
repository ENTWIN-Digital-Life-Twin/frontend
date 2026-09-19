import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-heading',
  template: `
    <div class="flex flex-col gap-2">
      @if (eyebrow()) {
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">
          {{ eyebrow() }}
        </p>
      }
      <h1 class="font-display text-h1 tracking-tight text-primary">{{ title() }}</h1>
      @if (subtitle()) {
        <p class="mt-1 text-body-sm leading-relaxed text-ink-muted">{{ subtitle() }}</p>
      }
    </div>
  `,
})
export class AuthHeading {
  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
