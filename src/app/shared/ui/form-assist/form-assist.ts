import { Component, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import {
  FormAssistService,
  type FormAssistType,
  type FormSuggestion,
} from '../../../core/services/ai/form-assist.service';

@Component({
  selector: 'app-form-assist',
  template: `
    @if (enabled() && items().length) {
      <div class="mt-3 rounded-panel border border-accent/30 bg-teal-50/60 p-3">
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-dark">
          {{ heading() }}
        </p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          @for (item of items(); track item.field + item.value) {
            <button
              type="button"
              class="rounded-full border border-accent/40 bg-surface px-3 py-1 text-xs font-medium text-primary transition-colors hover:border-accent hover:bg-accent/10"
              (click)="applied.emit(item)"
            >
              {{ item.label }}
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class FormAssist {
  readonly formType = input.required<FormAssistType>();
  readonly title = input('');
  readonly category = input('');
  readonly description = input('');
  readonly enabled = input(true);
  readonly applied = output<FormSuggestion>();

  private readonly assist = inject(FormAssistService);
  private readonly languageService = inject(LanguageService);
  private readonly requests = new Subject<{
    formType: FormAssistType;
    title: string;
    category: string;
    description: string;
  }>();

  protected readonly items = signal<FormSuggestion[]>([]);
  protected readonly heading = this.languageService.translateSignal('formAssist.heading');

  constructor() {
    this.requests
      .pipe(
        debounceTime(500),
        switchMap((payload) => this.assist.suggest(payload)),
        takeUntilDestroyed(),
      )
      .subscribe((items) => this.items.set(items));

    effect(() => {
      if (!this.enabled()) {
        this.items.set([]);
        return;
      }
      this.requests.next({
        formType: this.formType(),
        title: this.title(),
        category: this.category(),
        description: this.description(),
      });
    });
  }
}
