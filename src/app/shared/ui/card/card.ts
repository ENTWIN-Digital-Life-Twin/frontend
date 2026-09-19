import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div
      class="h-full overflow-hidden rounded-card border border-line bg-surface shadow-card transition-all duration-300"
      [class.hover:-translate-y-0.5]="hoverable()"
      [class.hover:shadow-card-hover]="hoverable()"
    >
      @if (title() || subtitle()) {
        <header class="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div class="min-w-0">
            @if (title()) {
              <h3 class="font-display text-base font-semibold tracking-tight text-primary">
                {{ title() }}
              </h3>
            }
            @if (subtitle()) {
              <p class="mt-0.5 text-xs leading-relaxed text-ink-muted">{{ subtitle() }}</p>
            }
          </div>
          <ng-content select="[appCardActions]" />
        </header>
      }
      <div [class.p-5]="!flush()" [class.py-1]="flush()">
        <ng-content />
      </div>
      <ng-content select="[appCardFooter]" />
    </div>
  `,
})
export class Card {
  readonly title = input<string | null>(null);
  readonly subtitle = input<string | null>(null);
  readonly flush = input(false);
  readonly hoverable = input(false);
}
