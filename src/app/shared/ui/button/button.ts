import { Component, computed, input } from '@angular/core';
import { LucideLoader2 } from '@lucide/angular';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-panel font-medium select-none whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-55 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary-light hover:shadow-card active:bg-primary-dark',
  accent:
    'bg-accent-dark text-white shadow-sm hover:bg-accent-darker hover:shadow-card active:bg-accent-darker',
  secondary:
    'border border-line-strong bg-surface text-ink shadow-sm hover:border-navy-300 hover:bg-surface-muted hover:text-primary',
  outline: 'border border-primary/25 text-primary hover:border-primary/50 hover:bg-primary/5',
  ghost: 'text-ink-muted hover:bg-surface-muted hover:text-primary',
  danger:
    'bg-danger text-white shadow-sm hover:bg-red-700 hover:shadow-card active:bg-red-800',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-5 text-sm',
  icon: 'h-10 w-10 p-0',
};

@Component({
  selector: 'button[appButton]',
  template: `
    @if (loading()) {
      <svg lucideLoader2 class="h-4 w-4 animate-spin" aria-hidden="true"></svg>
    }
    <ng-content />
  `,
  imports: [LucideLoader2],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type()',
    '[attr.disabled]': 'disabled() || loading() ? true : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.aria-disabled]': 'disabled() || loading() ? "true" : null',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  protected readonly classes = computed(() => {
    const parts = [BASE_CLASSES, VARIANT_CLASSES[this.variant()], SIZE_CLASSES[this.size()]];
    if (this.loading()) {
      parts.push('cursor-wait');
    }
    return parts.join(' ');
  });
}
