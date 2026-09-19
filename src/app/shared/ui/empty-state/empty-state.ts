import { Component, input, output } from '@angular/core';
import { LucideDynamicIcon, type LucideIcon } from '@lucide/angular';
import { Button } from '../button/button';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="flex flex-col items-center justify-center gap-4 py-10 text-center">
      @if (icon()) {
        <span
          class="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-accent shadow-sm"
        >
          <svg [lucideIcon]="icon()" class="h-7 w-7" aria-hidden="true"></svg>
        </span>
      }
      <div class="space-y-1.5">
        <h3 class="font-display text-lg font-semibold tracking-tight text-primary">
          {{ title() }}
        </h3>
        @if (description()) {
          <p class="mx-auto max-w-sm text-sm leading-relaxed text-ink-muted">
            {{ description() }}
          </p>
        }
      </div>
      @if (actionLabel()) {
        <button appButton size="sm" (click)="action.emit()">{{ actionLabel() }}</button>
      }
    </div>
  `,
  imports: [LucideDynamicIcon, Button],
})
export class EmptyState {
  readonly icon = input<LucideIcon | null>(null);
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
