import { Component, input, model } from '@angular/core';

/**
 * Accessible switch used across the settings page.
 * A real button with `role="switch"` so it is keyboard- and screen-reader
 * friendly without sacrificing the visual toggle.
 */
@Component({
  selector: 'app-settings-toggle',
  template: `
    <div class="flex items-center justify-between gap-4">
      <div class="min-w-0">
        <label [for]="id()" class="block text-sm font-medium text-ink">{{ label() }}</label>
        @if (description()) {
          <p class="mt-0.5 text-xs leading-relaxed text-ink-muted">{{ description() }}</p>
        }
      </div>
      <button
        type="button"
        role="switch"
        [id]="id()"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="ariaLabel() ?? label()"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        [class.bg-accent]="checked()"
        [class.border-accent]="checked()"
        [class.bg-surface-strong]="!checked()"
        [class.border-line-strong]="!checked()"
        (click)="checked.set(!checked())"
      >
        <span
          aria-hidden="true"
          class="pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200"
          [class.translate-x-[1.375rem]]="checked()"
          [class.translate-x-0.5]="!checked()"
        ></span>
      </button>
    </div>
  `,
})
export class SettingsToggle {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly description = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly checked = model(false);
}
