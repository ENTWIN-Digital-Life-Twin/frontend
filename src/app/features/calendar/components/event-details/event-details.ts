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
  LucideBellRing,
  LucideCalendarDays,
  LucideClock,
  LucideDynamicIcon,
  LucideMapPin,
  LucidePencil,
  LucideTag,
  LucideTrash2,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import {
  CATEGORY_KEYS,
  CATEGORY_VISUALS,
  REMINDER_LABEL_KEYS,
  durationLabel,
  eventDetail,
  eventLocation,
  eventParticipants,
  eventTitle,
  formatLongDate,
  type CalendarEvent,
  type EventCategory,
  type ReminderKey,
} from '../../models/calendar.models';

@Component({
  selector: 'app-event-details',
  imports: [
    Button,
    LucideDynamicIcon,
    LucideX,
    LucideCalendarDays,
    LucideClock,
    LucideMapPin,
    LucideUsers,
    LucideTag,
    LucideBellRing,
    LucidePencil,
    LucideTrash2,
  ],
  template: `
    @if (event(); as event) {
      <div class="fixed inset-0 z-40" role="dialog" aria-modal="true" [attr.aria-label]="title()">
        <div class="absolute inset-0 bg-navy-900/40 backdrop-blur-[2px]" (click)="closed.emit()"></div>
        <aside
          class="details-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-background shadow-drawer"
        >
          <header class="border-b border-line px-5 py-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-panel" [class]="visual().chip">
                    <svg [lucideIcon]="visual().icon" class="h-4 w-4" aria-hidden="true"></svg>
                  </span>
                  <div class="min-w-0">
                    <span class="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                      {{ categoryLabel() }}
                    </span>
                    <h3 class="truncate font-display text-lg font-semibold tracking-tight text-primary">
                      {{ title() }}
                    </h3>
                  </div>
                </div>
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
            </div>
          </header>

          <div class="flex-1 overflow-y-auto px-5 py-4">
            @if (description()) {
              <p class="text-sm leading-relaxed text-ink-muted">{{ description() }}</p>
            }

            <dl class="mt-5 space-y-3 text-sm">
              <div class="flex items-start gap-3">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-primary/10 text-primary">
                  <svg lucideCalendarDays class="h-4 w-4" aria-hidden="true"></svg>
                </span>
                <div>
                  <dt class="text-xs font-semibold text-ink-muted">{{ dateLabel() }}</dt>
                  <dd class="font-medium text-primary">{{ formatLongDate(event.date) }}</dd>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-accent/10 text-accent-dark">
                  <svg lucideClock class="h-4 w-4" aria-hidden="true"></svg>
                </span>
                <div>
                  <dt class="text-xs font-semibold text-ink-muted">{{ timeLabel() }}</dt>
                  <dd class="font-medium text-primary">
                    {{ event.start }} – {{ event.end }}
                    <span class="text-ink-faint">· {{ duration() }}</span>
                  </dd>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-warning/15 text-amber-700">
                  <svg lucideTag class="h-4 w-4" aria-hidden="true"></svg>
                </span>
                <div>
                  <dt class="text-xs font-semibold text-ink-muted">{{ categoryLabel() }}</dt>
                  <dd class="font-medium text-primary">{{ categoryValue() }}</dd>
                </div>
              </div>

              @if (location()) {
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-navy-100 text-navy-700">
                    <svg lucideMapPin class="h-4 w-4" aria-hidden="true"></svg>
                  </span>
                  <div>
                    <dt class="text-xs font-semibold text-ink-muted">{{ locationLabel() }}</dt>
                    <dd class="font-medium text-primary">{{ location() }}</dd>
                  </div>
                </div>
              }

              @if (participants().length) {
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-surface-muted text-ink-muted">
                    <svg lucideUsers class="h-4 w-4" aria-hidden="true"></svg>
                  </span>
                  <div>
                    <dt class="text-xs font-semibold text-ink-muted">{{ participantsLabel() }}</dt>
                    <dd class="font-medium text-primary">{{ participants().join(', ') }}</dd>
                  </div>
                </div>
              }

              <div class="flex items-start gap-3">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-panel bg-amber-50 text-amber-600">
                  <svg lucideBellRing class="h-4 w-4" aria-hidden="true"></svg>
                </span>
                <div>
                  <dt class="text-xs font-semibold text-ink-muted">{{ reminderLabel() }}</dt>
                  <dd class="font-medium text-primary">{{ reminderValue() }}</dd>
                </div>
              </div>
            </dl>
          </div>

          <footer class="flex items-center gap-2 border-t border-line px-5 py-4">
            <button appButton variant="outline" size="md" class="flex-1" (click)="edit.emit(event)">
              <svg lucidePencil class="h-4 w-4" aria-hidden="true"></svg>
              {{ editLabel() }}
            </button>
            <button appButton variant="danger" size="md" class="flex-1" (click)="delete.emit(event)">
              <svg lucideTrash2 class="h-4 w-4" aria-hidden="true"></svg>
              {{ deleteLabel() }}
            </button>
          </footer>
        </aside>
      </div>
    }
  `,
})
export class EventDetails {
  readonly event = input.required<CalendarEvent | null>();
  readonly closed = output<void>();
  readonly edit = output<CalendarEvent>();
  readonly delete = output<CalendarEvent>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly languageService = inject(LanguageService);

  private readonly translate = (key: string, vars?: Record<string, string>) =>
    this.languageService.translate(key, vars);

  protected readonly visual = computed(() =>
    this.event() ? CATEGORY_VISUALS[this.event()!.category] : CATEGORY_VISUALS.work,
  );

  protected readonly title = computed(() =>
    this.event() ? eventTitle(this.event()!, this.translate) : '',
  );
  protected readonly description = computed(() =>
    this.event() ? eventDetail(this.event()!, this.translate) : '',
  );
  protected readonly location = computed(() =>
    this.event() ? eventLocation(this.event()!, this.translate) : '',
  );
  protected readonly participants = computed(() =>
    this.event() ? eventParticipants(this.event()!, this.translate) : [],
  );
  protected readonly duration = computed(() =>
    this.event() ? durationLabel(this.event()!, this.translate) : '',
  );

  protected readonly closeLabel = this.languageService.translateSignal('eventDetails.close');
  protected readonly dateLabel = this.languageService.translateSignal('eventDetails.date');
  protected readonly timeLabel = this.languageService.translateSignal('eventDetails.time');
  protected readonly categoryLabel = this.languageService.translateSignal('eventDetails.category');
  protected readonly locationLabel = this.languageService.translateSignal('eventDetails.location');
  protected readonly participantsLabel = this.languageService.translateSignal(
    'eventDetails.participants',
  );
  protected readonly reminderLabel = this.languageService.translateSignal('eventDetails.reminder');
  protected readonly editLabel = this.languageService.translateSignal('common.edit');
  protected readonly deleteLabel = this.languageService.translateSignal('common.delete');

  protected categoryValue(): string {
    return this.event()
      ? this.languageService.translate(CATEGORY_KEYS[this.event()!.category])
      : '';
  }

  protected reminderValue(): string {
    const event = this.event();
    if (!event) {
      return '';
    }
    const key: ReminderKey = event.reminder ?? 'none';
    return this.languageService.translate(REMINDER_LABEL_KEYS[key]);
  }

  protected formatLongDate(iso: string): string {
    return formatLongDate(iso, this.languageService.getLocale());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  constructor() {
    effect(() => {
      void this.event();
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
