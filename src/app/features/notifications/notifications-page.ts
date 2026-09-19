import { AfterViewInit, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideBell,
  LucideCheck,
  LucideCheckCheck,
  LucideDynamicIcon,
  LucideSettings,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';
import { LanguageService } from '../../core/services/language.service';
import { Button } from '../../shared/ui/button/button';
import { Badge } from '../../shared/ui/badge/badge';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { NotificationService } from './services/notification.service';
import {
  NOTIFICATION_TYPE_CHIP,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_KEYS,
  type NotificationFilter,
  type NotificationSection,
  type NotificationType,
} from './models/notification.models';

type FilterOption = { value: NotificationFilter; label: string };

@Component({
  selector: 'app-notifications-page',
  imports: [
    RouterLink,
    Button,
    Badge,
    EmptyState,
    Drawer,
    LucideDynamicIcon,
    LucideCheck,
    LucideCheckCheck,
    LucideSettings,
    LucideTrash2,
    LucideX,
  ],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            {{ eyebrow() }}
          </p>
          <h1 class="mt-0.5 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {{ title() }}
          </h1>
          <p class="mt-1 text-sm text-ink-muted">
            {{ subtitle() }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <app-badge variant="accent" [dot]="true">
            {{ unreadCount() }}
          </app-badge>
          <button appButton variant="secondary" size="md" (click)="service.markAllRead()">
            <svg lucideCheckCheck class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
            {{ markAllRead() }}
          </button>
          <a appButton variant="ghost" size="md" routerLink="/settings">
            <svg lucideSettings class="h-4 w-4" aria-hidden="true"></svg>
            {{ settings() }}
          </a>
        </div>
      </header>

      <!-- Filtres -->
      <section class="flex flex-wrap gap-1 rounded-card border border-line bg-surface p-2 shadow-card">
        @for (filter of FILTERS(); track filter.value) {
          <button
            type="button"
            class="rounded-panel px-3 py-1.5 text-xs font-semibold transition-all duration-200"
            [class.bg-primary]="service.filter() === filter.value"
            [class.text-white]="service.filter() === filter.value"
            [class.shadow-soft]="service.filter() === filter.value"
            [class.text-ink-muted]="service.filter() !== filter.value"
            [class.hover:text-primary]="service.filter() !== filter.value"
            (click)="service.setFilter(filter.value)"
          >
            {{ filter.label }}
          </button>
        }
      </section>

      <!-- Liste -->
      <section>
        @if (service.grouped().length === 0) {
          <div class="rounded-card border border-dashed border-line-strong bg-surface/60 shadow-card">
            <app-empty-state
              [icon]="LucideBell"
              [title]="emptyTitle()"
              [description]="emptyDescription()"
            />
          </div>
        } @else {
          <div class="flex flex-col gap-6">
            @for (group of groups(); track group.section) {
              <div>
                <div class="mb-2.5 flex items-center justify-between">
                  <h2 class="font-display text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    {{ sectionLabel(group.section) }}
                  </h2>
                  <span class="text-xs text-ink-faint">{{ group.items.length }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  @for (item of group.items; track item.id) {
                    <div
                      class="notification-item group relative flex cursor-pointer items-start gap-3.5 rounded-card border bg-surface p-4 shadow-soft transition-all duration-200 hover:border-accent/40 hover:shadow-card"
                      [class.border-line]="item.read"
                      [class.border-accent/30]="!item.read"
                      (click)="service.select(item.id)"
                      role="button"
                      tabindex="0"
                      (keydown.enter)="service.select(item.id)"
                      (keydown.space)="service.select(item.id)"
                      [attr.aria-label]="openLabel(item.title)"
                    >
                      <span
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-panel"
                        [class]="NOTIFICATION_TYPE_CHIP[item.type]"
                      >
                        <svg [lucideIcon]="NOTIFICATION_TYPE_ICONS[item.type]" class="h-5 w-5" aria-hidden="true"></svg>
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="flex flex-wrap items-center gap-2">
                          <span
                            class="text-[11px] font-semibold uppercase tracking-wide"
                            [class.text-ink-muted]="item.read"
                            [class.text-accent-dark]="!item.read"
                          >
                            {{ NOTIFICATION_TYPE_LABELS()[item.type] }}
                          </span>
                          <span class="text-[11px] tabular-nums text-ink-faint">
                            {{ relativeTimeLabel(item.createdAt) }}
                          </span>
                          @if (!item.read) {
                            <span class="h-2 w-2 rounded-full bg-accent" aria-hidden="true"></span>
                          }
                        </span>
                        <span class="mt-0.5 block truncate text-sm font-semibold text-primary">
                          {{ item.title }}
                        </span>
                        <span class="mt-0.5 block truncate text-xs text-ink-muted">
                          {{ item.message }}
                        </span>
                      </span>
                      <span
                        class="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100"
                      >
                        @if (!item.read) {
                          <button
                            appButton
                            variant="ghost"
                            size="icon"
                            [attr.aria-label]="markRead()"
                            (click)="$event.stopPropagation(); service.markRead(item.id)"
                          >
                            <svg lucideCheck class="h-4 w-4" aria-hidden="true"></svg>
                          </button>
                        }
                        <button
                          appButton
                          variant="ghost"
                          size="icon"
                          [attr.aria-label]="deleteNotification()"
                          (click)="$event.stopPropagation(); onDelete(item)"
                        >
                          <svg lucideTrash2 class="h-4 w-4" aria-hidden="true"></svg>
                        </button>
                      </span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </section>
    </div>

    @if (selected(); as item) {
      <app-drawer [(open)]="detailOpen" side="right">
        <div class="flex min-h-full flex-col bg-gradient-to-b from-surface to-background">
          <header class="border-b border-line p-6">
            <div class="flex items-start justify-between gap-3">
              <span
                class="flex h-12 w-12 items-center justify-center rounded-panel shadow-card"
                [class]="NOTIFICATION_TYPE_CHIP[item.type]"
              >
                <svg [lucideIcon]="NOTIFICATION_TYPE_ICONS[item.type]" class="h-6 w-6" aria-hidden="true"></svg>
              </span>
              <button
                appButton
                variant="ghost"
                size="icon"
                [attr.aria-label]="closeDetails()"
                (click)="detailOpen.set(false)"
              >
                <svg lucideX class="h-4 w-4" aria-hidden="true"></svg>
              </button>
            </div>
            <p class="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              {{ NOTIFICATION_TYPE_LABELS()[item.type] }}
            </p>
            <h2 class="mt-1 font-display text-2xl font-semibold tracking-tight text-primary">
              {{ item.title }}
            </h2>
            <p class="mt-1 text-xs text-ink-faint">{{ relativeTimeLabel(item.createdAt) }}</p>
          </header>

          <div class="flex-1 p-6">
            <p class="text-sm leading-relaxed text-ink">{{ item.message }}</p>
            <div class="mt-5 rounded-panel bg-teal-50/70 p-3.5 text-xs text-accent-dark">
              {{ drawerNote() }}
            </div>
          </div>

          <footer class="flex gap-2 border-t border-line p-4 sm:p-6">
            <button appButton variant="secondary" size="md" class="flex-1" (click)="detailOpen.set(false)">
              <svg lucideCheckCheck class="h-4 w-4" aria-hidden="true"></svg>
              {{ close() }}
            </button>
            <button appButton variant="danger" size="md" class="flex-1" (click)="onDelete(item)">
              <svg lucideTrash2 class="h-4 w-4" aria-hidden="true"></svg>
              {{ delete() }}
            </button>
          </footer>
        </div>
      </app-drawer>
    }
  `,
})
export class NotificationsPage implements AfterViewInit {
  protected readonly service = inject(NotificationService);
  private readonly languageService = inject(LanguageService);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected readonly detailOpen = signal(true);
  protected readonly NOTIFICATION_TYPE_CHIP = NOTIFICATION_TYPE_CHIP;
  protected readonly NOTIFICATION_TYPE_ICONS = NOTIFICATION_TYPE_ICONS;
  protected readonly NOTIFICATION_TYPE_KEYS = NOTIFICATION_TYPE_KEYS;
  protected readonly LucideBell = LucideBell;

  protected readonly eyebrow = this.languageService.translateSignal('notifications.eyebrow');
  protected readonly title = this.languageService.translateSignal('notifications.title');
  protected readonly subtitle = this.languageService.translateSignal('notifications.subtitle');
  protected readonly markAllRead = this.languageService.translateSignal('notifications.markAllRead');
  protected readonly settings = this.languageService.translateSignal('notifications.settings');
  protected readonly emptyTitle = this.languageService.translateSignal('notifications.emptyTitle');
  protected readonly emptyDescription = this.languageService.translateSignal(
    'notifications.emptyDescription',
  );
  protected readonly markRead = this.languageService.translateSignal('notifications.markRead');
  protected readonly deleteNotification = this.languageService.translateSignal(
    'notifications.deleteNotification',
  );
  protected readonly closeDetails = this.languageService.translateSignal(
    'notifications.closeDetails',
  );
  protected readonly drawerNote = this.languageService.translateSignal('notifications.drawerNote');
  protected readonly close = this.languageService.translateSignal('common.close');
  protected readonly delete = this.languageService.translateSignal('common.delete');

  protected readonly unreadCount = computed(() => {
    const count = this.service.unreadCount();
    return this.languageService.translate(
      count > 1 ? 'notifications.unreadMany' : 'notifications.unreadOne',
      { count: String(count) },
    );
  });

  protected readonly FILTERS = computed<FilterOption[]>(() =>
    (
      [
        'all',
        'unread',
        'task',
        'calendar',
        'wellness',
        'ai',
        'system',
      ] as NotificationFilter[]
    ).map((value) => ({
      value,
      label: this.languageService.translate(`notifications.filters.${value}`),
    })),
  );

  protected readonly NOTIFICATION_TYPE_LABELS = computed<Record<NotificationType, string>>(() => ({
    task: this.languageService.translate(NOTIFICATION_TYPE_KEYS.task),
    calendar: this.languageService.translate(NOTIFICATION_TYPE_KEYS.calendar),
    wellness: this.languageService.translate(NOTIFICATION_TYPE_KEYS.wellness),
    ai: this.languageService.translate(NOTIFICATION_TYPE_KEYS.ai),
    system: this.languageService.translate(NOTIFICATION_TYPE_KEYS.system),
  }));

  protected readonly groups = computed(() =>
    this.service.grouped().map((group) => ({
      section: group.section,
      items: group.items.map((item) => ({
        ...item,
        title: this.languageService.translate(item.titleKey),
        message: this.languageService.translate(item.messageKey),
      })),
    })),
  );

  protected readonly selected = computed(() => {
    const item = this.service.selected();
    if (!item) {
      return null;
    }
    return {
      ...item,
      title: this.languageService.translate(item.titleKey),
      message: this.languageService.translate(item.messageKey),
    };
  });

  protected sectionLabel(section: NotificationSection): string {
    return this.languageService.translate(`notifications.sections.${section}`);
  }

  protected relativeTimeLabel(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.round(diff / 60_000);
    const translate = (key: string, vars?: Record<string, string>) =>
      this.languageService.translate(key, vars);
    if (minutes < 1) {
      return translate('notifications.time.justNow');
    }
    if (minutes < 60) {
      return translate('notifications.time.minutesAgo', { count: String(minutes) });
    }
    const hours = Math.round(minutes / 60);
    if (hours < 24) {
      return translate('notifications.time.hoursAgo', { count: String(hours) });
    }
    const days = Math.round(hours / 24);
    if (days === 1) {
      return translate('notifications.time.yesterday');
    }
    if (days < 7) {
      return translate('notifications.time.daysAgo', { count: String(days) });
    }
    const date = new Date(iso);
    return new Intl.DateTimeFormat(this.languageService.getLocale(), {
      day: 'numeric',
      month: 'short',
    }).format(date);
  }

  protected openLabel(title: string): string {
    return this.languageService.translate('notifications.open', { title });
  }

  protected onDelete(item: { id: string }): void {
    this.detailOpen.set(false);
    this.service.delete(item.id);
  }

  ngAfterViewInit(): void {
    if (this.reduced) {
      return;
    }
    const root = this.host.nativeElement;
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('.notification-item'),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out', clearProps: 'transform' },
      );
    });
  }
}
