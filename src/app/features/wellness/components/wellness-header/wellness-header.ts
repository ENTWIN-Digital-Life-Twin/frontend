import { Component, computed, inject, output } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { type WellnessPeriod } from '../../models/wellness.models';
import { WellnessService } from '../../services/wellness.service';

@Component({
  selector: 'app-wellness-header',
  imports: [Button, LucidePlus],
  template: `
    <header class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-xl">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">
          {{ todayLabel() }}
        </p>
        <h1 class="mt-2 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {{ title() }}
        </h1>
        <p class="mt-1.5 text-sm text-ink-muted sm:text-base">
          {{ subtitle() }}
        </p>
      </div>

      <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div
          role="group"
          [attr.aria-label]="periodAria()"
          class="inline-flex self-start rounded-full border border-line bg-surface p-1 shadow-soft"
        >
          @for (period of PERIODS(); track period.value) {
            <button
              type="button"
              class="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150"
              [class.bg-primary]="service.period() === period.value"
              [class.text-white]="service.period() === period.value"
              [class.shadow-soft]="service.period() === period.value"
              [class.text-ink-muted]="service.period() !== period.value"
              [class.hover:text-primary]="service.period() !== period.value"
              [attr.aria-pressed]="service.period() === period.value"
              (click)="service.setPeriod(period.value)"
            >
              {{ period.label }}
            </button>
          }
        </div>

        <button appButton variant="primary" size="md" (click)="add.emit()">
          <svg lucidePlus class="h-4 w-4" aria-hidden="true"></svg>
          {{ addData() }}
        </button>
      </div>
    </header>
  `,
})
export class WellnessHeader {
  readonly add = output<void>();

  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly todayLabel = computed(() =>
    new Intl.DateTimeFormat(this.locale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
  );

  private readonly locale = computed(() =>
    this.languageService.activeLanguage() === 'fr'
      ? 'fr-FR'
      : this.languageService.activeLanguage() === 'en'
        ? 'en-US'
        : 'ar-EG',
  );

  protected readonly title = this.languageService.translateSignal('wellnessPage.title');
  protected readonly subtitle = this.languageService.translateSignal('wellnessPage.subtitle');
  protected readonly periodAria = this.languageService.translateSignal('wellnessPage.periodAria');
  protected readonly addData = this.languageService.translateSignal('wellnessPage.addData');

  protected readonly PERIODS = computed<{ value: WellnessPeriod; label: string }[]>(() => [
    { value: 'today', label: this.languageService.translate('wellnessPage.period.today') },
    { value: '7d', label: this.languageService.translate('wellnessPage.period.week7') },
    { value: '30d', label: this.languageService.translate('wellnessPage.period.days30') },
  ]);
}
