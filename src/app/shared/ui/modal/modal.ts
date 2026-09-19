import { Component, HostListener, inject, input, output } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { LanguageService } from '../../../core/services/language.service';
import { Button } from '../button/button';

@Component({
  selector: 'app-modal',
  imports: [Button, LucideX],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="title()"
    >
      <div class="absolute inset-0 bg-navy-900/50 backdrop-blur-[2px]" (click)="closed.emit()"></div>
      <div
        class="relative w-full max-h-[90vh] overflow-y-auto rounded-card border border-line bg-background shadow-popover"
        [class.max-w-xl]="!wide()"
        [class.max-w-3xl]="wide()"
      >
        <header class="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h3 class="font-display text-lg font-semibold tracking-tight text-primary">{{ title() }}</h3>
            @if (subtitle()) {
              <p class="mt-0.5 text-xs text-ink-muted">{{ subtitle() }}</p>
            }
          </div>
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
        </header>
        <div class="px-6 py-5">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class Modal {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly wide = input(false);
  readonly closed = output<void>();

  private readonly languageService = inject(LanguageService);

  protected readonly closeLabel = this.languageService.translateSignal('common.close');

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }
}
