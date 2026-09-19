import { Component, input } from '@angular/core';

@Component({
  selector: 'app-settings-section',
  template: `
    <header class="mb-5">
      <h2 class="font-display text-xl font-semibold tracking-tight text-primary">
        {{ title() }}
      </h2>
      @if (subtitle()) {
        <p class="mt-1 text-sm leading-relaxed text-ink-muted">{{ subtitle() }}</p>
      }
    </header>
  `,
})
export class SettingsSection {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
