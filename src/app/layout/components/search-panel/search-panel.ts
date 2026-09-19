import { Component, computed, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { LucideDynamicIcon, LucideArrowRight, LucideSearchX, LucideSearch } from '@lucide/angular';
import { GlobalSearchService } from '../../../core/services/global-search.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-search-panel',
  template: `
    <div
      class="w-full max-w-lg"
      role="dialog"
      aria-label="{{ searchLabel() }}"
    >
      @if (!searchService.query()) {
        <!-- Empty state: no query yet -->
        <div class="px-4 py-8 text-center">
          <span class="mx-auto flex h-10 w-10 items-center justify-center rounded-panel bg-surface-muted text-ink-faint">
            <svg lucideSearch class="h-5 w-5" aria-hidden="true"></svg>
          </span>
          <p class="mt-3 text-sm font-medium text-ink">{{ placeholderLabel() }}</p>
          <p class="mt-1 text-xs text-ink-muted">{{ hintLabel() }}</p>
        </div>
      } @else if (!searchService.hasResults()) {
        <!-- No results state -->
        <div class="px-4 py-8 text-center">
          <span class="mx-auto flex h-10 w-10 items-center justify-center rounded-panel bg-surface-muted text-ink-faint">
            <svg lucideSearchX class="h-5 w-5" aria-hidden="true"></svg>
          </span>
          <p class="mt-3 text-sm font-medium text-ink">{{ noResultsLabel() }}</p>
          <p class="mt-1 text-xs text-ink-muted">{{ noResultsHintLabel() }}</p>
        </div>
      } @else {
        <!-- Results -->
        <div class="max-h-[min(28rem,70vh)] overflow-y-auto overscroll-contain px-2 pb-2 pt-1">
          @for (group of searchService.results(); track group.category) {
            <div class="mb-1">
              <p class="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {{ t(group.labelKey) }}
              </p>
              @for (item of group.items; track item.id) {
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-panel px-2.5 py-2 text-start transition-colors duration-100 hover:bg-surface-muted"
                  [class.bg-surface-muted]="searchService.flatResults()[searchService.activeIndex()]?.id === item.id"
                  [class.ring-1]="searchService.flatResults()[searchService.activeIndex()]?.id === item.id"
                  [class.ring-accent/30]="searchService.flatResults()[searchService.activeIndex()]?.id === item.id"
                  (click)="onSelect(item.path)"
                  [attr.data-result-id]="item.id"
                  role="option"
                  [attr.aria-selected]="searchService.flatResults()[searchService.activeIndex()]?.id === item.id"
                >
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-muted">
                    <svg [lucideIcon]="item.icon" class="h-4 w-4" aria-hidden="true"></svg>
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-medium text-ink">{{ item.title }}</span>
                    <span class="block truncate text-xs text-ink-muted">{{ item.subtitle }}</span>
                  </span>
                  <svg lucideArrowRight class="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true"></svg>
                </button>
              }
            </div>
          }
        </div>
        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-line px-3 py-2">
          <span class="text-[11px] text-ink-faint">
            {{ resultCountLabel() }}
          </span>
          <span class="text-[11px] text-ink-faint">
            <kbd class="rounded border border-line bg-surface-muted px-1 py-0.5 font-sans text-[10px]">↵</kbd>
            {{ enterLabel() }}
            <span class="mx-1">·</span>
            <kbd class="rounded border border-line bg-surface-muted px-1 py-0.5 font-sans text-[10px]">esc</kbd>
            {{ escLabel() }}
          </span>
        </div>
      }
    </div>
  `,
  imports: [LucideDynamicIcon, LucideArrowRight, LucideSearchX, LucideSearch],
})
export class SearchPanel {
  readonly closed = output<void>();

  readonly searchService = inject(GlobalSearchService);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  private readonly tr = (key: string): string => this.languageService.translate(key);

  protected readonly searchLabel = this.languageService.translateSignal('search.label');
  protected readonly placeholderLabel = this.languageService.translateSignal('search.emptyState.title');
  protected readonly hintLabel = this.languageService.translateSignal('search.emptyState.hint');
  protected readonly noResultsLabel = this.languageService.translateSignal('search.noResults.title');
  protected readonly noResultsHintLabel = this.languageService.translateSignal('search.noResults.hint');
  protected readonly resultCountLabel = computed(() =>
    this.languageService.translate('search.resultCount', {
      count: String(this.searchService.totalResults()),
    }),
  );
  protected readonly enterLabel = this.languageService.translateSignal('search.keyboard.open');
  protected readonly escLabel = this.languageService.translateSignal('search.keyboard.close');

  protected t(key: string): string {
    return this.tr(key);
  }

  onSelect(path: string): void {
    this.searchService.close();
    void this.router.navigate([path]);
    this.closed.emit();
  }
}
