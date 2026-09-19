import { Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { LucideCheck, LucideSparkles, LucideX } from '@lucide/angular';
import { LanguageService } from '../../../core/services/language.service';
import { Button } from '../button/button';

export type ToastTone = 'success' | 'primary';

@Component({
  selector: 'app-toast',
  imports: [Button, LucideCheck, LucideSparkles],
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        class="toast pointer-events-auto flex items-center gap-3 rounded-card border px-4 py-3 shadow-popover"
        [class.border-accent/30]="tone() === 'success'"
        [class.bg-background]="tone() === 'success'"
        [class.border-line]="tone() !== 'success'"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-panel"
          [class.bg-accent/10]="tone() === 'success'"
          [class.text-accent-dark]="tone() === 'success'"
          [class.bg-primary/10]="tone() !== 'success'"
          [class.text-primary]="tone() !== 'success'"
        >
          @if (tone() === 'success') {
            <svg lucideCheck class="h-4 w-4" aria-hidden="true"></svg>
          } @else {
            <svg lucideSparkles class="h-4 w-4" aria-hidden="true"></svg>
          }
        </span>
        <p class="text-sm font-medium text-primary">{{ message() }}</p>
        <button
          type="button"
          appButton
          variant="ghost"
          size="icon"
          [attr.aria-label]="closeLabel()"
          (click)="closed.emit()"
        >
          <svg lucideX class="h-4 w-4" aria-hidden="true"></svg>
        </button>
      </div>
    </div>
  `,
})
export class Toast {
  readonly message = input.required<string>();
  readonly tone = input<ToastTone>('primary');
  readonly closed = output<void>();

  private readonly languageService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly closeLabel = this.languageService.translateSignal('common.close');

  constructor() {
    effect(() => {
      void this.message();
      const timeout = setTimeout(() => this.closed.emit(), 4000);
      this.destroyRef.onDestroy(() => clearTimeout(timeout));
    });
  }
}
