import { Component, input } from '@angular/core';
import { LucideCircleAlert } from '@lucide/angular';

@Component({
  selector: 'app-field',
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label class="text-sm font-medium text-ink" [for]="id() ?? null">{{ label() }}</label>
      }
      <ng-content />
      @if (hint() && !error()) {
        <p class="text-xs leading-relaxed text-ink-faint">{{ hint() }}</p>
      }
      @if (error()) {
        <p class="flex items-center gap-1.5 text-xs font-medium text-danger">
          <svg lucideCircleAlert class="h-3.5 w-3.5 shrink-0" aria-hidden="true"></svg>
          {{ error() }}
        </p>
      }
    </div>
  `,
  imports: [LucideCircleAlert],
})
export class Field {
  readonly id = input<string | null>(null);
  readonly label = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
}
