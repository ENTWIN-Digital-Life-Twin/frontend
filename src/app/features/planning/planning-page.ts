import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { Button } from '../../shared/ui/button/button';
import { Toast, type ToastTone } from '../../shared/ui/toast/toast';
import { EntryDetails } from './components/entry-details/entry-details';
import { PlanningFilters } from './components/planning-filters/planning-filters';
import { PlanningHeader } from './components/planning-header/planning-header';
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

type PlanningModal = 'task' | 'event' | null;

@Component({
  selector: 'app-planning-page',
  imports: [
    Button,
    PlanningHeader,
    PlanningSummary,
    PlanningWeek,
    PlanningFilters,
    PlanningQuickActions,
    PlanningTimeline,
    PlanningSidebar,
    PlanningModalTask,
    PlanningModalEvent,
    EntryDetails,
    Toast,
  ],
  templateUrl: './planning-page.html',
  styleUrl: './planning-page.scss',
})
export class PlanningPage implements OnInit {
  protected readonly service = inject(PlanningService);
  private readonly languageService = inject(LanguageService);
  private readonly route = inject(ActivatedRoute);

  protected readonly modal = signal<PlanningModal>(null);
  protected readonly editing = signal<PlanningEntry | null>(null);
  protected readonly toast = signal<string | null>(null);
  protected readonly toastTone = signal<ToastTone>('primary');
  protected readonly loadingLabel = this.languageService.translateSignal('common.loading');
  protected readonly retryLabel = this.languageService.translateSignal('common.retry');
  protected readonly loadError = this.languageService.translateSignal('planning.loadError');

  ngOnInit(): void {
    const modal = this.route.snapshot.queryParamMap.get('modal');
    if (modal === 'task' || modal === 'event') {
      this.openModal(modal);
    }
    this.service.load();
  }

  protected onQuickAction(kind: QuickActionKind): void {
    this.openModal(kind);
  }

  protected onAdd(): void {
    this.openModal('task');
  }

  protected onRefresh(): void {
    this.service.load();
    this.toastTone.set('primary');
    this.toast.set(this.languageService.translate('planning.toasts.refreshed'));
  }

  protected openModal(kind: Exclude<PlanningModal, null>): void {
    this.editing.set(null);
    this.modal.set(kind);
  }

  protected onEdit(entry: PlanningEntry): void {
    this.editing.set(entry);
    this.modal.set(entry.type === 'task' ? 'task' : 'event');
  }

  protected onSaved(entry: PlanningEntry): void {
    const operation = this.editing()
      ? this.service.updateEntry(entry)
      : this.service.addEntry(entry);
    operation.subscribe({
      next: () => {
        this.toastTone.set('success');
        this.toast.set(
          this.languageService.translate(
            this.editing() ? 'planning.toasts.updated' : 'planning.toasts.added',
          ),
        );
        this.onClose();
      },
      error: () => {
        this.toastTone.set('primary');
        this.toast.set(this.languageService.translate('planning.operationError'));
      },
    });
  }

  protected onClose(): void {
    this.modal.set(null);
    this.editing.set(null);
  }
}
