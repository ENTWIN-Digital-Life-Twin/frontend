import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  LucideCalendarDays,
  LucideCheck,
  LucideClock,
  LucideMapPin,
  LucidePencil,
  LucideTag,
  LucideTimer,
  LucideTrash2,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { Badge } from '../../../../shared/ui/badge/badge';
import {
  CATEGORY_KEYS,
  ENTRY_VISUALS,
  PRIORITY_KEYS,
  formatDayMonth,
  getEntryVisual,
  minutesToLabel,
  type PlanningEntry,
} from '../../models/planning.models';
import { PlanningService } from '../../services/planning.service';

@Component({
  selector: 'app-entry-details',
  imports: [
    Button,
    Badge,
    LucideX,
    LucideCalendarDays,
    LucideClock,
    LucideTimer,
    LucideMapPin,
    LucideUsers,
    LucideTag,
    LucideCheck,
    LucidePencil,
    LucideTrash2,
  ],
  template: `
    <div class="fixed inset-0 z-40" role="dialog" aria-modal="true" [attr.aria-label]="entryTitle(entry())">
      <div class="absolute inset-0 bg-navy-900/40 backdrop-blur-[2px]" (click)="closed.emit()"></div>
      <aside
        class="details-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-background shadow-drawer"
      >
        <header class="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              @if (entry()) {
                <app-badge [variant]="badgeVariant()">{{ visual()?.label }}</app-badge>
              }
              @if (entry()?.status === 'done') {
                <app-badge variant="success">{{ t('statuses.done') }}</app-badge>
              }
            </div>
            <h3 class="mt-1.5 font-display text-lg font-semibold tracking-tight text-primary">
              {{ entryTitle(entry()) }}
            </h3>
          </div>
          <button
            type="button"
            appButton
            variant="ghost"
            size="icon"
            aria-label="{{ t('eventDetails.close') }}"
            (click)="closed.emit()"
          >
            <svg lucideX class="h-4 w-4" aria-hidden="true"></svg>
          </button>
        </header>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          @if (entry(); as entry) {
            @if (entry.description) {
              <p class="text-sm leading-relaxed text-ink-muted">{{ entryDesc(entry) }}</p>
            }

            <dl class="mt-5 space-y-3 text-sm">
              <div class="flex items-start gap-3">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-primary/10 text-primary">
                  <svg lucideCalendarDays class="h-4 w-4" aria-hidden="true"></svg>
                </span>
                <div>
                  <dt class="text-xs font-semibold text-ink-muted">{{ t('eventDetails.date') }}</dt>
                  <dd class="font-medium text-primary">{{ formatDayMonth(entry.date) }}</dd>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-accent/10 text-accent-dark">
                  <svg lucideClock class="h-4 w-4" aria-hidden="true"></svg>
                </span>
                <div>
                  <dt class="text-xs font-semibold text-ink-muted">{{ t('eventDetails.time') }}</dt>
                  <dd class="font-medium text-primary">
                    {{ entry.start }} – {{ entry.end }}
                    <span class="text-ink-faint">· {{ minutesLabel(entry.duration) }}</span>
                  </dd>
                </div>
              </div>

              @if (entry.category) {
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-warning/15 text-amber-700">
                    <svg lucideTag class="h-4 w-4" aria-hidden="true"></svg>
                  </span>
                  <div>
                    <dt class="text-xs font-semibold text-ink-muted">{{ t('eventDetails.category') }}</dt>
                    <dd class="font-medium text-primary">{{ categoryLabel(entry.category) }}</dd>
                  </div>
                </div>
              }

              @if (entry.priority) {
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-danger/10 text-danger">
                    <svg lucideTimer class="h-4 w-4" aria-hidden="true"></svg>
                  </span>
                  <div>
                    <dt class="text-xs font-semibold text-ink-muted">{{ t('planningDetails.priority') }}</dt>
                    <dd class="font-medium text-primary">{{ priorityLabel(entry.priority) }}</dd>
                  </div>
                </div>
              }

              @if (entry.location) {
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-navy-100 text-navy-700">
                    <svg lucideMapPin class="h-4 w-4" aria-hidden="true"></svg>
                  </span>
                  <div>
                    <dt class="text-xs font-semibold text-ink-muted">{{ t('eventDetails.location') }}</dt>
                    <dd class="font-medium text-primary">{{ entryLocation(entry) }}</dd>
                  </div>
                </div>
              }

              @if (entry.participants && entry.participants.length) {
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-surface-muted text-ink-muted">
                    <svg lucideUsers class="h-4 w-4" aria-hidden="true"></svg>
                  </span>
                  <div>
                    <dt class="text-xs font-semibold text-ink-muted">{{ t('eventDetails.participants') }}</dt>
                    <dd class="font-medium text-primary">{{ entry.participants.map(p => participantName(p)).join(', ') }}</dd>
                  </div>
                </div>
              }
            </dl>

            <div class="mt-6 space-y-2">
              @if (entry.type === 'task') {
                <button appButton variant="secondary" size="md" class="w-full" (click)="service.toggleComplete(entry.id)">
                  <svg lucideCheck class="h-4 w-4" aria-hidden="true"></svg>
                  {{ entry.status === 'done' ? t('tasksDetail.markUndone') : t('tasksDetail.markDone') }}
                </button>
              }
              @if (entry.type !== 'free') {
                <button appButton variant="outline" size="md" class="w-full" (click)="edit.emit(entry)">
                  <svg lucidePencil class="h-4 w-4" aria-hidden="true"></svg>
                  {{ t('common.edit') }}
                </button>
              }
              <button
                appButton
                variant="danger"
                size="md"
                class="w-full"
                (click)="service.deleteEntry(entry.id)"
              >
                <svg lucideTrash2 class="h-4 w-4" aria-hidden="true"></svg>
                {{ t('common.delete') }}
              </button>
            </div>
          }
        </div>
      </aside>
    </div>
  `,
})
export class EntryDetails {
  readonly entry = input.required<PlanningEntry | null>();
  readonly closed = output<void>();
  readonly edit = output<PlanningEntry>();

  protected readonly service = inject(PlanningService);

  private readonly languageService = inject(LanguageService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  t = (key: string, vars?: Record<string, string>) => this.languageService.translate<string>(key, vars);

  protected readonly visual = computed(() =>
    this.entry() ? getEntryVisual(this.entry()!.type, (key) => this.languageService.translate(key)) : null,
  );

  protected readonly badgeVariant = computed(() =>
    this.entry()?.tone === 'danger'
      ? 'danger'
      : this.entry()?.tone === 'warning'
        ? 'warning'
        : this.entry()?.tone === 'accent'
          ? 'accent'
          : 'primary',
  );

  protected readonly CATEGORY_KEYS = CATEGORY_KEYS;
  protected readonly PRIORITY_KEYS = PRIORITY_KEYS;
  protected readonly minutesToLabel = minutesToLabel;

  protected formatDayMonth(iso: string): string {
    return formatDayMonth(iso, this.languageService.getLocale());
  }

  protected categoryLabel(value: PlanningEntry['category']): string {
    return this.languageService.translate(CATEGORY_KEYS[value]);
  }

  protected priorityLabel(value: PlanningEntry['priority']): string {
    return value ? this.languageService.translate(PRIORITY_KEYS[value]) : '';
  }

  protected entryTitle(entry: PlanningEntry | null): string {
    return entry ? this.languageService.translate(entry.title) : '';
  }

  protected entryDesc(entry: PlanningEntry): string {
    return entry.description ? this.languageService.translate(entry.description) : '';
  }

  protected entryLocation(entry: PlanningEntry): string {
    return entry.location ? this.languageService.translate(entry.location) : '';
  }

  protected participantName(name: string): string {
    return this.languageService.translate(name);
  }

  protected minutesLabel(minutes: number): string {
    return minutesToLabel(minutes, (key) => this.languageService.translate(key));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  constructor() {
    effect(() => {
      void this.entry();
      if (this.reduced) {
        return;
      }
      requestAnimationFrame(() => {
        const panel = this.host.nativeElement.querySelector<HTMLElement>('.details-panel');
        const overlay = this.host.nativeElement.querySelector<HTMLElement>('.fixed');
        import('gsap').then(({ default: gsap }) => {
          if (panel) {
            gsap.fromTo(panel, { x: 48, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
          }
          if (overlay) {
            gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
          }
        });
      });
    });
  }
}
