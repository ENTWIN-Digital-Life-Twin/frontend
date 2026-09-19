import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { Toast, type ToastTone } from '../../shared/ui/toast/toast';
import { EntryDetails } from './components/entry-details/entry-details';
import { PlanningFilters } from './components/planning-filters/planning-filters';
import { PlanningHeader } from './components/planning-header/planning-header';
import { PlanningModalBlock } from './components/planning-modals/planning-modal-block';
import { PlanningModalEvent } from './components/planning-modals/planning-modal-event';
import { PlanningModalTask } from './components/planning-modals/planning-modal-task';
import {
  PlanningQuickActions,
  type QuickActionKind,
} from './components/planning-quick-actions/planning-quick-actions';
import { PlanningSidebar } from './components/planning-sidebar/planning-sidebar';
import { PlanningSummary } from './components/planning-summary/planning-summary';
import { PlanningTimeline } from './components/planning-timeline/planning-timeline';
import { PlanningWeek } from './components/planning-week/planning-week';
import type { PlanningEntry } from './models/planning.models';
import { PlanningService } from './services/planning.service';

type PlanningModal = 'task' | 'event' | 'block' | null;

@Component({
  selector: 'app-planning-page',
  imports: [
    PlanningHeader,
    PlanningSummary,
    PlanningWeek,
    PlanningFilters,
    PlanningQuickActions,
    PlanningTimeline,
    PlanningSidebar,
    PlanningModalTask,
    PlanningModalEvent,
    PlanningModalBlock,
    EntryDetails,
    Toast,
  ],
  template: `
    <div class="space-y-6">
      <app-planning-header />

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div class="min-w-0 space-y-6">
          <app-planning-summary />

          <app-planning-week />

          <div class="flex flex-wrap items-center justify-between gap-3">
            <app-planning-filters />
            <app-planning-quick-actions (create)="onQuickAction($event)" />
          </div>

          <app-planning-timeline (edit)="onEdit($event)" />
        </div>

        <app-planning-sidebar
          class="w-full lg:sticky lg:top-6 lg:self-start"
          (plan)="onPlan()"
          (create)="onAdd()"
        />
      </div>
    </div>

    @if (modal() === 'task') {
      <app-planning-modal-task [entry]="editing()" (saved)="onSaved($event)" (closed)="onClose()" />
    }
    @if (modal() === 'event') {
      <app-planning-modal-event [entry]="editing()" (saved)="onSaved($event)" (closed)="onClose()" />
    }
    @if (modal() === 'block') {
      <app-planning-modal-block [entry]="editing()" (saved)="onSaved($event)" (closed)="onClose()" />
    }

    @if (service.selectedEntry(); as entry) {
      <app-entry-details [entry]="entry" (closed)="service.closeEntry()" (edit)="onEdit($event)" />
    }

    @if (toast(); as message) {
      <app-toast [message]="message" [tone]="toastTone()" (closed)="toast.set(null)" />
    }
  `,
})
export class PlanningPage {
  protected readonly service = inject(PlanningService);
  private readonly languageService = inject(LanguageService);

  protected readonly modal = signal<PlanningModal>(null);
  protected readonly editing = signal<PlanningEntry | null>(null);
  protected readonly toast = signal<string | null>(null);
  protected readonly toastTone = signal<ToastTone>('primary');

  protected onQuickAction(kind: QuickActionKind): void {
    if (kind === 'plan') {
      this.onPlan();
      return;
    }
    this.openModal(kind);
  }

  protected onAdd(): void {
    this.openModal('task');
  }

  protected onPlan(): void {
    this.service.planDay();
    this.toastTone.set('primary');
    this.toast.set(this.languageService.translate('planning.toasts.autoPlanned'));
  }

  protected openModal(kind: Exclude<PlanningModal, null>): void {
    this.editing.set(null);
    this.modal.set(kind);
  }

  protected onEdit(entry: PlanningEntry): void {
    this.editing.set(entry);
    this.modal.set(entry.type === 'task' ? 'task' : entry.type === 'event' ? 'event' : 'block');
  }

  protected onSaved(entry: PlanningEntry): void {
    if (this.editing()) {
      this.service.updateEntry(entry);
      this.toastTone.set('success');
      this.toast.set(this.languageService.translate('planning.toasts.updated'));
    } else {
      this.service.addEntry(entry);
      this.toastTone.set('success');
      this.toast.set(this.languageService.translate('planning.toasts.added'));
    }
    this.onClose();
  }

  protected onClose(): void {
    this.modal.set(null);
    this.editing.set(null);
  }
}
