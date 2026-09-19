import { Directive, computed, input } from '@angular/core';

const CONTROL_BASE =
  'w-full rounded-panel border bg-surface px-3.5 text-sm text-ink shadow-soft transition-all duration-200 placeholder:text-ink-faint focus:border-accent/60 focus:outline-none focus:ring-4 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60';

const INVALID_CLASSES =
  'border-danger/50 focus:border-danger focus:ring-danger/15';

@Directive({
  selector: '[appInput]',
  host: {
    '[class]': 'classes()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class InputDirective {
  readonly invalid = input(false, { alias: 'appInputInvalid' });
  protected readonly classes = computed(() =>
    [CONTROL_BASE, 'h-10', this.invalid() ? INVALID_CLASSES : 'border-line'].join(' '),
  );
}

@Directive({
  selector: '[appSelect]',
  host: {
    '[class]': 'classes()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class SelectDirective {
  readonly invalid = input(false, { alias: 'appSelectInvalid' });
  protected readonly classes = computed(() =>
    [CONTROL_BASE, 'h-10 cursor-pointer appearance-none bg-no-repeat pr-10', this.invalid() ? INVALID_CLASSES : 'border-line'].join(' '),
  );
}

@Directive({
  selector: 'textarea[appTextarea]',
  host: {
    '[class]': 'classes()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class TextareaDirective {
  readonly invalid = input(false, { alias: 'appTextareaInvalid' });
  protected readonly classes = computed(() =>
    [CONTROL_BASE, 'min-h-28 py-2.5', this.invalid() ? INVALID_CLASSES : 'border-line'].join(' '),
  );
}
