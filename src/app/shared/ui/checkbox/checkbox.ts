import { Component, input, model } from '@angular/core';
import { LucideCheck } from '@lucide/angular';

@Component({
  selector: 'app-checkbox',
  template: `
    <label class="group inline-flex cursor-pointer select-none items-start gap-3">
      <input
        type="checkbox"
        class="sr-only"
        [checked]="checked()"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel() ?? null"
        (change)="onChange($event)"
      />
      <span
        aria-hidden="true"
        class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200"
        [class.bg-accent]="checked()"
        [class.border-accent]="checked()"
        [class.ring-4]="checked()"
        [class.ring-accent/15]="checked()"
        [class.border-line-strong]="!checked()"
        [class.group-hover:border-accent/50]="!checked() && !disabled()"
      >
        @if (checked()) {
          <svg lucideCheck class="h-3.5 w-3.5 text-white" stroke-width="3" aria-hidden="true"></svg>
        }
      </span>
      <span
        class="text-sm leading-relaxed"
        [class.text-ink-muted]="disabled()"
        [class.text-ink]="!disabled()"
      >
        <ng-content />
      </span>
    </label>
  `,
  imports: [LucideCheck],
})
export class Checkbox {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly ariaLabel = input<string | null>(null);

  onChange(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
