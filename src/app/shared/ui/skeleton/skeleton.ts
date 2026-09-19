import { Component, input } from '@angular/core';

function toCssSize(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

@Component({
  selector: 'app-skeleton',
  template: `
    <div
      class="animate-pulse bg-surface-strong"
      [class.rounded-full]="variant() === 'circle'"
      [class.rounded-card]="variant() !== 'circle'"
      [style.width]="toCssSize(width())"
      [style.height]="toCssSize(height())"
      aria-hidden="true"
    ></div>
  `,
})
export class Skeleton {
  readonly variant = input<'text' | 'circle' | 'rect'>('text');
  readonly width = input<string | number>('100%');
  readonly height = input<string | number>('1rem');

  protected readonly toCssSize = toCssSize;
}
