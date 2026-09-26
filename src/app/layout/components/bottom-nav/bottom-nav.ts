import { Component, computed, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import {
  LucideDynamicIcon,
  LucideEllipsis,
  LucideHeartPulse,
  LucideCalendarDays,
  LucideLayoutDashboard,
  LucideListTodo,
} from '@lucide/angular';
import type { LucideIcon } from '@lucide/angular';
import { LanguageService } from '../../../core/services/language.service';

interface BottomTab {
  path: string;
  labelKey: string;
  icon: LucideIcon;
}

const TABS: BottomTab[] = [
  { path: '/dashboard', labelKey: 'sidebar.nav.dashboard', icon: LucideLayoutDashboard },
  { path: '/planning', labelKey: 'sidebar.nav.planning', icon: LucideCalendarDays },
  { path: '/tasks', labelKey: 'sidebar.nav.tasks', icon: LucideListTodo },
  { path: '/wellness', labelKey: 'sidebar.wellbeing.title', icon: LucideHeartPulse },
];

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, LucideDynamicIcon, LucideEllipsis],
  template: `
    <nav
      class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-lg lg:hidden"
      [style.padding-bottom]="'env(safe-area-inset-bottom)'"
      [attr.aria-label]="menuLabel()"
    >
      <ul class="grid h-16 grid-cols-5">
        @for (tab of tabs(); track tab.path) {
          <li>
            <a
              [routerLink]="tab.path"
              class="flex h-full flex-col items-center justify-center gap-1 text-[10px] font-semibold"
              [class.text-accent-dark]="tab.active"
              [class.text-ink-muted]="!tab.active"
              [attr.aria-current]="tab.active ? 'page' : null"
            >
              <svg [lucideIcon]="tab.icon" class="h-5 w-5" aria-hidden="true"></svg>
              <span class="max-w-full truncate px-1">{{ tab.label }}</span>
            </a>
          </li>
        }
        <li>
          <button
            type="button"
            class="flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] font-semibold text-ink-muted"
            (click)="more.emit()"
          >
            <svg lucideEllipsis class="h-5 w-5" aria-hidden="true"></svg>
            <span>{{ moreLabel() }}</span>
          </button>
        </li>
      </ul>
    </nav>
  `,
})
export class BottomNav {
  readonly more = output<void>();

  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly menuLabel = this.languageService.translateSignal('sidebar.sections.navigation');
  protected readonly moreLabel = this.languageService.translateSignal('sidebar.bottom.more');

  protected readonly tabs = computed(() => {
    const current = this.url().split('?')[0];
    return TABS.map((tab) => ({
      ...tab,
      label: this.languageService.translate<string>(tab.labelKey),
      active: current === tab.path || current.startsWith(`${tab.path}/`),
    }));
  });
}
