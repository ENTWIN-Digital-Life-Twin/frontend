import { Component, input, output } from '@angular/core';
import { LucideDynamicIcon, type LucideIcon } from '@lucide/angular';

/**
 * Selectable option card backed by a real radio input. Used for theme, accent,
 * language, timezone, date format, week start, summary frequency and text size.
 */
@Component({
  selector: 'app-settings-option',
  imports: [LucideDynamicIcon],
  template: `
    <label
      class="group relative flex cursor-pointer items-center gap-3 rounded-panel border p-3 transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background"
      [class]="
        selected()
          ? 'border-accent/60 bg-teal-50/40 ring-1 ring-accent/30'
          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted/40'
      "
    >
      <input
        type="radio"
        class="sr-only"
        [name]="group()"
        [value]="value()"
        [checked]="selected()"
        (change)="selectedChange.emit(value())"
      />
      @if (icon()) {
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-panel"
          [class]="iconClass()"
        >
          <svg [lucideIcon]="icon()" class="h-4 w-4" aria-hidden="true"></svg>
        </span>
      }
      <span class="min-w-0 flex-1">
        <span class="block text-sm font-medium text-ink">{{ label() }}</span>
        @if (description()) {
          <span class="mt-0.5 block text-xs text-ink-muted">{{ description() }}</span>
        }
      </span>
      <span
        aria-hidden="true"
        class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200"
        [class]="selected() ? 'border-accent bg-accent' : 'border-line-strong bg-surface'"
      >
        @if (selected()) {
          <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
        }
      </span>
    </label>
  `,
})
export class SettingsOption {
  readonly group = input.required<string>();
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly description = input<string | null>(null);
  readonly icon = input<LucideIcon | null>(null);
  readonly iconClass = input('bg-teal-50 text-accent-dark');
  readonly selected = input(false);
  readonly selectedChange = output<string>();
}
