import { Component, computed, inject, input } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideGlobe } from '@lucide/angular';
import { LanguageService } from '../../../core/services/language.service';
import {
  Dropdown,
  DropdownMenu,
  DropdownTrigger,
  DropdownItem,
} from '../../ui/dropdown/dropdown';

type LanguageSelectorTone = 'surface' | 'dark';

const SURFACE_TRIGGER =
  'border border-line bg-surface text-ink shadow-sm hover:border-accent/40 hover:bg-surface-muted';
const DARK_TRIGGER =
  'border border-white/15 bg-white/5 text-white/80 shadow-none hover:bg-white/10 hover:text-white';

@Component({
  selector: 'app-language-selector',
  template: `
    <app-dropdown #langDropdown="dropdown">
      <button
        appDropdownTrigger
        type="button"
        class="relative inline-flex h-9 items-center gap-1.5 rounded-panel px-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        [class]="triggerClasses()"
        [attr.aria-label]="languageLabel()"
      >
        <svg lucideGlobe class="h-4 w-4" [class]="globeClasses()" aria-hidden="true"></svg>
        <span class="text-xs font-bold uppercase tracking-wide" [class]="codeClasses()">{{
          languageCode()
        }}</span>
        <svg
          lucideChevronDown
          class="h-3.5 w-3.5 transition-transform duration-200"
          [class.rotate-180]="langDropdown.open()"
          [class]="chevronClasses()"
          aria-hidden="true"
        ></svg>
      </button>
      <app-dropdown-menu panelClass="w-60" ariaLabel="Language">
        <p
          class="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint"
        >
          {{ languageLabel() }}
        </p>
        <div class="h-px bg-line" aria-hidden="true"></div>
        @for (lang of languageOptions; track lang.code) {
          <button
            appDropdownItem
            type="button"
            class="mt-1 w-full items-center gap-3 rounded-panel px-3 py-2.5 text-sm transition-colors duration-200"
            [class.text-primary]="isActive(lang.code)"
            [class.text-ink-muted]="!isActive(lang.code)"
            [attr.aria-pressed]="isActive(lang.code)"
            (click)="setLanguage(lang.code)"
          >
            <span class="text-base leading-none" aria-hidden="true">{{ lang.flag }}</span>
            <span class="flex-1 text-start">{{ lang.name }}</span>
            @if (isActive(lang.code)) {
              <svg lucideCheck class="h-4 w-4 text-accent" aria-hidden="true"></svg>
            }
          </button>
        }
      </app-dropdown-menu>
    </app-dropdown>
  `,
  imports: [
    Dropdown,
    DropdownMenu,
    DropdownTrigger,
    DropdownItem,
    LucideCheck,
    LucideChevronDown,
    LucideGlobe,
  ],
})
export class LanguageSelector {
  readonly tone = input<LanguageSelectorTone>('surface');

  private readonly languageService = inject(LanguageService);

  protected readonly languageOptions = this.languageService.languageOptions;

  protected readonly languageLabel = this.languageService.translateSignal('header.language');

  protected readonly languageCode = computed(() =>
    this.languageService.activeLanguage().toUpperCase(),
  );

  protected readonly triggerClasses = computed(() =>
    this.tone() === 'dark' ? DARK_TRIGGER : SURFACE_TRIGGER,
  );

  protected readonly globeClasses = computed(() =>
    this.tone() === 'dark' ? 'text-teal-300' : 'text-accent-dark',
  );

  protected readonly codeClasses = computed(() =>
    this.tone() === 'dark' ? 'text-white' : 'text-primary',
  );

  protected readonly chevronClasses = computed(() =>
    this.tone() === 'dark' ? 'text-white/50' : 'text-ink-faint',
  );

  protected isActive(lang: 'fr' | 'en' | 'ar'): boolean {
    return this.languageService.activeLanguage() === lang;
  }

  protected setLanguage(lang: 'fr' | 'en' | 'ar'): void {
    this.languageService.setLanguage(lang);
  }
}
