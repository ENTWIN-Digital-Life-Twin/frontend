import { Component, computed, effect, ElementRef, inject, Output, EventEmitter, signal, viewChild, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideBell,
  LucideChevronDown,
  LucideLogOut,
  LucideMenu,
  LucideSearch,
  LucideSettings,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { Avatar } from '../../../shared/ui/avatar/avatar';
import { Button } from '../../../shared/ui/button/button';
import {
  Dropdown,
  DropdownMenu,
  DropdownTrigger,
  DropdownItem,
} from '../../../shared/ui/dropdown/dropdown';
import { LanguageSelector } from '../../../shared/components/language-selector/language-selector';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { GlobalSearchService } from '../../../core/services/global-search.service';
import { SearchPanel } from '../search-panel/search-panel';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    Button,
    Avatar,
    Dropdown,
    DropdownMenu,
    DropdownTrigger,
    DropdownItem,
    LanguageSelector,
    SearchPanel,
    LucideBell,
    LucideChevronDown,
    LucideLogOut,
    LucideMenu,
    LucideSearch,
    LucideSettings,
    LucideUser,
    LucideX,
  ],
  template: `
    <header
      class="sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur-lg"
    >
      <div
        class="flex h-[64px] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8"
      >
        <button
          appButton
          variant="secondary"
          size="icon"
          class="shrink-0 lg:hidden"
          (click)="menu.emit()"
          [attr.aria-label]="openMenuLabel()"
        >
          <svg lucideMenu class="h-5 w-5" aria-hidden="true"></svg>
        </button>

        <!-- Mobile search button -->
        <button
          appButton
          variant="secondary"
          size="icon"
          class="shrink-0 md:hidden"
          (click)="openSearch()"
          [attr.aria-label]="searchPlaceholder()"
        >
          <svg lucideSearch class="h-5 w-5" aria-hidden="true"></svg>
        </button>

        <!-- Desktop search input + panel -->
        <div class="relative hidden min-w-0 flex-1 md:block md:max-w-sm" #searchWrapper>
          <label class="relative block">
            <svg
              lucideSearch
              class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            ></svg>
            <input
              #searchInput
              type="search"
              [placeholder]="searchPlaceholder()"
              [attr.aria-label]="searchPlaceholder()"
              class="h-9 w-full rounded-panel border bg-surface ps-9 text-sm text-ink shadow-sm transition-all duration-200 placeholder:text-ink-faint focus:outline-none"
              [class.border-accent/50]="searchService.isOpen()"
              [class.ring-2]="searchService.isOpen()"
              [class.ring-accent/20]="searchService.isOpen()"
              [class.border-line]="!searchService.isOpen()"
              [value]="searchService.query()"
              [attr.aria-expanded]="searchService.isOpen()"
              [attr.aria-controls]="'search-panel'"
              [attr.aria-activedescendant]="activeDescendant()"
              role="combobox"
              autocomplete="off"
              (input)="onSearchInput($event)"
              (focus)="onSearchFocus()"
              (keydown)="onSearchKeydown($event)"
              (blur)="onSearchBlur()"
            />
            @if (searchService.query()) {
              <button
                type="button"
                class="absolute end-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
                (mousedown)="onClear($event)"
                [attr.aria-label]="clearLabel()"
              >
                <svg lucideX class="h-3.5 w-3.5" aria-hidden="true"></svg>
              </button>
            } @else {
              <kbd
                class="pointer-events-none absolute end-3 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-surface-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-ink-faint lg:block"
              >
                ⌘K
              </kbd>
            }
          </label>

          <!-- Search results panel -->
          @if (searchService.isOpen()) {
            <div
              id="search-panel"
              role="listbox"
              class="absolute end-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
            >
              <app-search-panel (closed)="onSearchClosed()" />
            </div>
          }
        </div>

        <!-- Mobile search overlay -->
        @if (mobileSearchOpen()) {
          <div class="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
            <div class="flex h-[64px] items-center gap-2 border-b border-line px-4">
              <label class="relative flex min-w-0 flex-1 items-center">
                <svg
                  lucideSearch
                  class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                  aria-hidden="true"
                ></svg>
                <input
                  #mobileSearchInput
                  type="search"
                  [placeholder]="searchPlaceholder()"
                  [attr.aria-label]="searchPlaceholder()"
                  class="h-9 w-full rounded-panel border border-line bg-surface ps-9 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  [value]="searchService.query()"
                  [attr.aria-expanded]="searchService.isOpen()"
                  role="combobox"
                  autocomplete="off"
                  (input)="onSearchInput($event)"
                  (keydown)="onSearchKeydown($event)"
                />
                @if (searchService.query()) {
                  <button
                    type="button"
                    class="absolute end-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
                    (mousedown)="onClear($event)"
                  >
                    <svg lucideX class="h-3.5 w-3.5" aria-hidden="true"></svg>
                  </button>
                }
              </label>
              <button
                appButton
                variant="ghost"
                size="sm"
                (mousedown)="closeMobileSearch($event)"
                class="shrink-0"
              >
                {{ cancelLabel() }}
              </button>
            </div>
            @if (searchService.query()) {
              <div class="flex-1 overflow-y-auto">
                <app-search-panel (closed)="closeMobileSearch()" />
              </div>
            } @else {
              <div class="flex-1 px-4 py-8 text-center">
                <p class="text-sm text-ink-muted">{{ mobileHintLabel() }}</p>
              </div>
            }
          </div>
        }

        <div class="ms-auto flex items-center gap-1.5 sm:gap-2.5">
          <div class="me-1 hidden flex-col items-end xl:flex">
            <span class="text-sm font-semibold capitalize leading-tight text-primary">
              {{ weekday() }}
            </span>
            <span class="text-[11px] leading-tight text-ink-muted">{{ fullDate() }}</span>
          </div>

          <div class="hidden h-6 w-px bg-line sm:block"></div>

          <a
            routerLink="/notifications"
            class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-panel text-ink-muted transition-colors duration-200 hover:bg-surface-muted hover:text-primary"
            [attr.aria-label]="notificationsLabel()"
          >
            <svg lucideBell class="h-[18px] w-[18px]" aria-hidden="true"></svg>
            <span
              class="absolute end-1.5 top-1.5 flex h-2 w-2 rounded-full bg-accent ring-2 ring-background"
            ></span>
          </a>

          <app-language-selector tone="surface" />

          <app-dropdown #profileDropdown="dropdown">
            <button
              appDropdownTrigger
              type="button"
              class="flex h-9 items-center gap-2 rounded-panel border border-line bg-surface pe-2 ps-1 text-ink shadow-sm transition-colors duration-200 hover:border-accent/40 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              [attr.aria-label]="profileMenuLabel()"
            >
              <app-avatar [name]="userName()" size="sm" [ring]="true" />
              <span
                class="hidden max-w-28 truncate text-sm font-medium text-primary xl:block"
                >{{ userName() }}</span
              >
              <svg
                lucideChevronDown
                class="h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform duration-200"
                [class.rotate-180]="profileDropdown.open()"
                aria-hidden="true"
              ></svg>
            </button>
            <app-dropdown-menu panelClass="w-64" [ariaLabel]="profileMenuLabel()">
              @if (user()) {
                <div class="px-3 pb-1.5 pt-2">
                  <p class="truncate text-sm font-semibold text-primary">{{ userName() }}</p>
                  <p class="truncate text-xs text-ink-muted">{{ user()!.email }}</p>
                  <p
                    class="mt-1.5 inline-flex rounded-panel bg-surface-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-dark"
                  >
                    {{ roleLabel() }}
                  </p>
                </div>
                <div class="h-px bg-line" aria-hidden="true"></div>
              }
              <a routerLink="/profile" appDropdownItem class="mt-1 text-ink-muted">
                <svg lucideUser class="h-4 w-4 shrink-0" aria-hidden="true"></svg>
                <span>{{ profileLabel() }}</span>
              </a>
              <a routerLink="/settings" appDropdownItem class="text-ink-muted">
                <svg lucideSettings class="h-4 w-4 shrink-0" aria-hidden="true"></svg>
                <span>{{ settingsLabel() }}</span>
              </a>
              <div class="my-1 h-px bg-line" aria-hidden="true"></div>
              <button
                type="button"
                class="flex w-full cursor-pointer select-none items-center gap-2.5 rounded-panel px-3 py-2 text-start text-sm font-medium text-danger transition-colors duration-200 hover:bg-danger-light hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50"
                role="menuitem"
                (click)="onLogout()"
              >
                <svg lucideLogOut class="h-4 w-4 shrink-0" aria-hidden="true"></svg>
                <span>{{ logoutLabel() }}</span>
              </button>
            </app-dropdown-menu>
          </app-dropdown>
        </div>
      </div>
    </header>
  `,
})
export class Header {
  @Output() menu = new EventEmitter<void>();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly today = new Date();

  protected readonly searchService = inject(GlobalSearchService);
  protected readonly languageService = inject(LanguageService);

  protected readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  protected readonly mobileSearchInput = viewChild<ElementRef<HTMLInputElement>>('mobileSearchInput');
  protected readonly searchWrapper = viewChild<ElementRef>('searchWrapper');

  protected readonly mobileSearchOpen = signal(false);
  protected readonly searchFocused = signal(false);

  protected readonly user = this.authService.currentUser;

  protected readonly userName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  protected readonly roleLabel = computed(() =>
    this.languageService.translate<string>(
      this.user()?.role === 'admin' ? 'header.roleAdmin' : 'header.roleUser',
    ),
  );

  protected readonly searchPlaceholder = this.languageService.translateSignal('header.search');
  protected readonly notificationsLabel = this.languageService.translateSignal('header.notifications');
  protected readonly openMenuLabel = this.languageService.translateSignal('header.openMenu');
  protected readonly profileMenuLabel = this.languageService.translateSignal('header.profileMenu');
  protected readonly profileLabel = this.languageService.translateSignal('header.profile');
  protected readonly settingsLabel = this.languageService.translateSignal('header.settings');
  protected readonly logoutLabel = this.languageService.translateSignal('header.logout');
  protected readonly clearLabel = this.languageService.translateSignal('search.clear');
  protected readonly cancelLabel = this.languageService.translateSignal('search.cancel');
  protected readonly mobileHintLabel = this.languageService.translateSignal('search.mobileHint');

  protected readonly locale = computed(() =>
    this.languageService.activeLanguage() === 'fr'
      ? 'fr-FR'
      : this.languageService.activeLanguage() === 'en'
        ? 'en-US'
        : 'ar-EG',
  );

  protected readonly weekday = computed(() =>
    this.today.toLocaleDateString(this.locale(), { weekday: 'long' }),
  );

  protected readonly fullDate = computed(() =>
    new Intl.DateTimeFormat(this.locale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.today),
  );

  protected readonly activeDescendant = computed(() => {
    const flat = this.searchService.flatResults();
    const idx = this.searchService.activeIndex();
    const item = flat[idx];
    return item ? `result-${item.id}` : null;
  });

  constructor() {
    effect(() => {
      const idx = this.searchService.activeIndex();
      const flat = this.searchService.flatResults();
      if (flat.length === 0) return;

      const el = document.querySelector(`[data-result-id="${flat[idx]?.id}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    });
  }

  @HostListener('window:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.openSearch();
      return;
    }
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchService.setQuery(value);
    if (!this.searchService.isOpen()) {
      this.searchService.open();
    }
  }

  onSearchFocus(): void {
    this.searchFocused.set(true);
    this.searchService.open();
  }

  onSearchBlur(): void {
    setTimeout(() => this.searchFocused.set(false), 150);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        if (this.searchService.query()) {
          this.searchService.setQuery('');
        } else {
          this.searchService.close();
          this.searchInput()?.nativeElement.blur();
        }
        event.preventDefault();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.searchService.moveDown();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.searchService.moveUp();
        break;
      case 'Enter':
        event.preventDefault();
        this.selectActiveResult();
        break;
    }
  }

  onSearchClosed(): void {
    this.searchInput()?.nativeElement.blur();
  }

  onClear(event: Event): void {
    event.preventDefault();
    this.searchService.setQuery('');
    this.searchInput()?.nativeElement.focus();
  }

  openSearch(): void {
    this.mobileSearchOpen.set(true);
    this.searchService.open();
    setTimeout(() => {
      this.mobileSearchInput()?.nativeElement.focus();
    }, 50);
  }

  closeMobileSearch(event?: Event): void {
    event?.preventDefault();
    this.mobileSearchOpen.set(false);
    this.searchService.close();
  }

  private selectActiveResult(): void {
    const result = this.searchService.getActiveResult();
    if (result) {
      this.searchService.close();
      this.mobileSearchOpen.set(false);
      void this.router.navigate([result.path]);
    }
  }

  protected setLanguage(lang: 'fr' | 'en' | 'ar'): void {
    this.languageService.setLanguage(lang);
  }

  protected onLogout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
