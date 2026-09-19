import { Injectable, signal, computed, type Signal } from '@angular/core';

import { FR_PUBLIC } from '../i18n/fr-public';

export type AppLanguage = 'fr' | 'en' | 'ar';

/**
 * Central language management service.
 * Handles language selection, persistence, and translation lookup.
 * All components react via the `activeLanguage` signal.
 *
 * FR translations are split: the public-facing subset (FR_PUBLIC) is
 * bundled eagerly for fast first paint on the homepage. The full FR file
 * and EN/AR translations are lazy-loaded after first paint.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'digital-life-twin-language';
  private readonly availableLanguages = ['fr', 'en', 'ar'] as const;

  private readonly translations: Record<AppLanguage, Record<string, unknown>> = {
    fr: FR_PUBLIC,
    en: null as unknown as Record<string, unknown>,
    ar: null as unknown as Record<string, unknown>,
  };

  private readonly loadedLanguages = new Set<AppLanguage>(['fr']);
  private frFullLoaded = false;

  /** Bumped when lazy translations finish loading so computed signals re-evaluate. */
  private readonly translationsReady = signal(0);

  /** The currently active language code (reactive). */
  readonly activeLanguage = signal<AppLanguage>('fr');

  /** The currently active language display name (reactive). */
  readonly activeLanguageName = signal<string>('Français');

  constructor() {
    const stored = this.readStoredLanguage();
    this.applyLanguage(stored);
    this.preloadOtherLanguages(stored);
  }

  private preloadOtherLanguages(active: AppLanguage): void {
    const toLoad = this.availableLanguages.filter((l) => l !== active);
    // Defer non-critical translation loading well after first paint.
    // Using setTimeout(10s) instead of requestIdleCallback to prevent the
    // browser from discovering lazy chunks during the critical request chain.
    setTimeout(() => {
      toLoad.forEach((l) => this.loadLanguage(l));
      // Also load the full FR translations in background so authenticated
      // features have all keys available when the user navigates there.
      this.loadFullFrTranslations();
    }, 10_000);
  }

  /** Replace the public-only FR subset with the complete FR translations. */
  private loadFullFrTranslations(): void {
    if (this.frFullLoaded) return;
    this.frFullLoaded = true;
    import('../i18n/fr').then((m) => {
      this.translations.fr = m.FR_TRANSLATIONS;
      this.translationsReady.update((v) => v + 1);
    });
  }

  private loadLanguage(lang: AppLanguage): void {
    if (this.loadedLanguages.has(lang)) return;
    this.loadedLanguages.add(lang);

    const apply = () => {
      // Only invalidate every translated binding when the loaded language can
      // change what is currently displayed. Loading en/ar in the background
      // while FR is active must not re-render the whole page.
      if (lang === this.activeLanguage()) {
        this.translationsReady.update((v) => v + 1);
      }
    };

    if (lang === 'en') {
      import('../i18n/en').then((m) => {
        this.translations.en = m.EN_TRANSLATIONS;
        apply();
      });
    } else {
      import('../i18n/ar').then((m) => {
        this.translations.ar = m.AR_TRANSLATIONS;
        apply();
      });
    }
  }

  /** All available languages with their display names and flags. */
  readonly languageOptions: ReadonlyArray<{
    code: AppLanguage;
    name: string;
    flag: string;
  }> = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  /** Get the HTML lang attribute value based on active language. */
  getLangAttr(): string {
    return this.activeLanguage();
  }

  /** Get the document direction (rtl for Arabic, ltr otherwise). */
  getDir(): 'ltr' | 'rtl' {
    return this.activeLanguage() === 'ar' ? 'rtl' : 'ltr';
  }

  /** Get the BCP 47 locale tag used for Intl formatting of the active language. */
  getLocale(): string {
    const locales: Record<AppLanguage, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      ar: 'ar-EG',
    };
    return locales[this.activeLanguage()];
  }

  /** Set the active language code. Persists and applies document attributes. */
  setLanguage(value: AppLanguage): void {
    if (value === this.activeLanguage()) {
      return;
    }
    if (!this.loadedLanguages.has(value)) {
      this.loadLanguage(value);
    }
    this.applyLanguage(value);
  }

  /** Toggle to the next available language. */
  toggleLanguage(): AppLanguage {
    const current = this.activeLanguage();
    const next =
      this.availableLanguages.find((l) => l !== current) ?? 'fr';
    this.setLanguage(next);
    return next;
  }

  /** Translate a key using hierarchical dot notation. */
  translate<T = string>(key: string, vars?: Record<string, string>): T {
    // Subscribe to translationsReady so computed() re-evaluates when lazy chunks load
    void this.translationsReady();

    const lang = this.activeLanguage();
    let result: unknown = this.translations[lang];

    const parts = key.split('.');
    for (const part of parts) {
      if (result && typeof result === 'object') {
        result = (result as Record<string, unknown>)[part];
      } else {
        return key as unknown as T;
      }
    }

    if (typeof result === 'string' && vars) {
      Object.entries(vars).forEach(([k, v]) => {
        result = (result as string).replace(
          new RegExp(`{{${k}}}`, 'g'),
          v,
        );
      });
    }

    return result as T;
  }

  /** Reactive translation lookup — returns a signal that updates with the language. */
  translateSignal(key: string, vars?: Record<string, string>): Signal<string> {
    return computed(() => this.translate<string>(key, vars));
  }

  /**
   * Reactive translation of a list of items that each carry a `labelKey`.
   * Returns a signal that re-maps the labels whenever the language changes.
   */
  translateArray<T extends { labelKey: string }>(
    items: ReadonlyArray<T>,
  ): Signal<Array<Omit<T, 'labelKey'> & { label: string }>> {
    return computed(() =>
      items.map((item) => {
        const { labelKey, ...rest } = item;
        return { ...rest, label: this.translate<string>(labelKey) };
      }),
    );
  }

  private readStoredLanguage(): AppLanguage {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && this.availableLanguages.includes(stored as AppLanguage)) {
        return stored as AppLanguage;
      }
    } catch {
      // storage unavailable — fall back to French
    }
    return 'fr';
  }

  private applyLanguage(lang: AppLanguage): void {
    this.activeLanguage.set(lang);
    this.activeLanguageName.set(this.getLanguageName(lang));

    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch {
      // storage unavailable — keep in-memory only
    }

    const doc = document.documentElement;
    doc.setAttribute('lang', lang);
    doc.setAttribute('dir', this.getDir());
  }

  private getLanguageName(lang: AppLanguage): string {
    const map: Record<AppLanguage, string> = {
      fr: 'Français',
      en: 'English',
      ar: 'العربية',
    };
    return map[lang];
  }
}
