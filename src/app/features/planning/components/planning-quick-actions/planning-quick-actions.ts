import { Component, inject, output } from '@angular/core';
import {
  LucideCalendarClock,
  LucideCalendarPlus,
  LucideClock,
  LucidePlus,
} from '@lucide/angular';
import { Button } from '../../../../shared/ui/button/button';
import { LanguageService } from '../../../../core/services/language.service';

export type QuickActionKind = 'task' | 'event' | 'block' | 'plan';

@Component({
  selector: 'app-planning-quick-actions',
  imports: [Button, LucidePlus, LucideCalendarPlus, LucideClock, LucideCalendarClock],
  template: `
    <div class="grid grid-cols-2 gap-2">
      <button appButton variant="secondary" size="md" (click)="create.emit('task')">
        <svg lucidePlus class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
        {{ t('dashboard.quickActions.newTask') }}
      </button>
      <button appButton variant="secondary" size="md" (click)="create.emit('event')">
        <svg lucideCalendarPlus class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
        {{ t('dashboard.quickActions.newEvent') }}
      </button>
      <button appButton variant="secondary" size="md" (click)="create.emit('block')">
        <svg lucideClock class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
        {{ t('planningExtended.timeBlock') }}
      </button>
      <button appButton variant="primary" size="md" (click)="create.emit('plan')">
        <svg lucideCalendarClock class="h-4 w-4" aria-hidden="true"></svg>
        {{ t('dashboard.quickActions.planDay') }}
      </button>
    </div>
  `,
})
export class PlanningQuickActions {
  private readonly languageService = inject(LanguageService);
  protected readonly t = (key: string) => this.languageService.translate<string>(key);
  readonly create = output<QuickActionKind>();
}
