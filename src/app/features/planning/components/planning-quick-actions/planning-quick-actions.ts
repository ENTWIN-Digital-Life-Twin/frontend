import { Component, inject, output } from '@angular/core';
import { LucideCalendarPlus, LucidePlus } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';

export type QuickActionKind = 'task' | 'event';

@Component({
  selector: 'app-planning-quick-actions',
  imports: [Button, LucidePlus, LucideCalendarPlus],
  template: `
    <div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-auto">
      <button appButton variant="secondary" size="md" class="min-w-0 justify-center" (click)="create.emit('task')">
        <svg lucidePlus class="h-4 w-4 shrink-0 text-accent-dark" aria-hidden="true"></svg>
        <span class="truncate">{{ t('dashboard.quickActions.newTask') }}</span>
      </button>
      <button appButton variant="secondary" size="md" class="min-w-0 justify-center" (click)="create.emit('event')">
        <svg lucideCalendarPlus class="h-4 w-4 shrink-0 text-accent-dark" aria-hidden="true"></svg>
        <span class="truncate">{{ t('dashboard.quickActions.newEvent') }}</span>
      </button>
    </div>
  `,
})
export class PlanningQuickActions {
  private readonly languageService = inject(LanguageService);
  protected readonly t = (key: string) => this.languageService.translate<string>(key);
  readonly create = output<QuickActionKind>();
}
