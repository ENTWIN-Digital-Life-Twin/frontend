import { Component, computed, input } from '@angular/core';

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'outline';

const BASE_CLASSES =
  'inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-muted text-ink-muted',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-teal-50 text-accent-dark',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
  outline: 'border-line-strong text-ink-muted',
};

@Component({
  selector: 'app-badge',
  template: `
    @if (dot()) {
      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-current"></span>
    }
    <ng-content />
  `,
  host: {
    '[class]': 'classes()',
  },
})
export class Badge {
  readonly variant = input<BadgeVariant>('neutral');
  readonly dot = input(false);

  protected readonly classes = computed(() =>
    [BASE_CLASSES, VARIANT_CLASSES[this.variant()]].join(' '),
  );
}
