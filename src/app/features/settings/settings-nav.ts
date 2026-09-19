import { Component, computed, inject, input, output } from '@angular/core';
import {
  LucideAccessibility,
  LucideBell,
  LucideDynamicIcon,
  LucidePalette,
  LucideShield,
  LucideSlidersHorizontal,
  LucideUserRound,
  type LucideIcon,
} from '@lucide/angular';
import { LanguageService } from '../../core/services/language.service';

export type SettingsSectionId =
  | 'account'
  | 'appearance'
  | 'notifications'
  | 'preferences'
  | 'privacy'
  | 'accessibility';

interface SettingsNavItem {
  id: SettingsSectionId;
  labelKey: string;
  icon: LucideIcon;
}

const NAV_ITEMS: SettingsNavItem[] = [
  { id: 'account', labelKey: 'settings.nav.account', icon: LucideUserRound },
  { id: 'appearance', labelKey: 'settings.nav.appearance', icon: LucidePalette },
  { id: 'notifications', labelKey: 'settings.nav.notifications', icon: LucideBell },
  { id: 'preferences', labelKey: 'settings.nav.preferences', icon: LucideSlidersHorizontal },
  { id: 'privacy', labelKey: 'settings.nav.privacy', icon: LucideShield },
  { id: 'accessibility', labelKey: 'settings.nav.accessibility', icon: LucideAccessibility },
];

@Component({
  selector: 'app-settings-nav',
  imports: [LucideDynamicIcon],
  template: `
    <nav [attr.aria-label]="settingsNavAria()">
      <!-- Mobile : navigation horizontale -->
      <div class="no-scrollbar -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden">
        <div class="flex gap-2 pb-1">
          @for (item of items(); track item.id) {
            <button
              type="button"
              (click)="select(item.id)"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/50"
              [class]="
                active() === item.id
                  ? 'bg-primary/5 text-primary ring-1 ring-line-strong'
                  : 'text-ink-muted hover:bg-surface-muted hover:text-primary'
              "
              [attr.aria-current]="active() === item.id ? 'true' : null"
            >
              <svg [lucideIcon]="item.icon" class="h-4 w-4" aria-hidden="true"></svg>
              {{ item.label }}
            </button>
          }
        </div>
      </div>

      <!-- Desktop : navigation verticale -->
      <div class="hidden lg:block">
        <ul class="space-y-1">
          @for (item of items(); track item.id) {
            <li>
              <button
                type="button"
                (click)="select(item.id)"
                class="group relative flex w-full items-center gap-3 rounded-panel px-3.5 py-2.5 text-start text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent/50"
                [class]="
                  active() === item.id
                    ? 'bg-primary/5 text-primary'
                    : 'text-ink-muted hover:bg-surface-muted hover:text-primary'
                "
                [attr.aria-current]="active() === item.id ? 'true' : null"
              >
                <span
                  aria-hidden="true"
                  class="absolute start-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent transition-all duration-200"
                  [class.opacity-100]="active() === item.id"
                  [class.opacity-0]="active() !== item.id"
                ></span>
                <svg
                  [lucideIcon]="item.icon"
                  class="h-[18px] w-[18px] shrink-0 transition-colors duration-200"
                  [class]="active() === item.id ? 'text-accent-dark' : 'text-ink-faint group-hover:text-accent-dark'"
                  aria-hidden="true"
                ></svg>
                {{ item.label }}
              </button>
            </li>
          }
        </ul>
      </div>
    </nav>
  `,
})
export class SettingsNav {
  readonly active = input<SettingsSectionId>('account');
  readonly selected = output<SettingsSectionId>();

  private readonly languageService = inject(LanguageService);
  protected readonly settingsNavAria = this.languageService.translateSignal('settings.nav.ariaLabel');

  protected readonly items = computed(() =>
    NAV_ITEMS.map((item) => ({
      id: item.id,
      icon: item.icon,
      label: this.languageService.translate<string>(item.labelKey),
    })),
  );

  protected select(id: SettingsSectionId): void {
    this.selected.emit(id);
  }
}
