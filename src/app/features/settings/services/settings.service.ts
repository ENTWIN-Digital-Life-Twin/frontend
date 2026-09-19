import { Injectable, computed, effect, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';
export type AccentPreference = 'teal' | 'navy';
export type LanguageCode = 'fr' | 'en' | 'ar';
export type TimezoneCode = 'Europe/Paris' | 'Africa/Casablanca' | 'UTC';
export type DateFormatId = 'long' | 'short' | 'iso';
export type WeekStart = 'monday' | 'sunday';
export type SummaryFrequency = 'never' | 'morning' | 'evening';
export type TextSize = 'normal' | 'large' | 'xlarge';

export interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  timezone: string;
  language: string;
}

export interface AppearanceSettings {
  theme: ThemePreference;
  accent: AccentPreference;
}

export interface NotificationSettings {
  taskReminders: boolean;
  eventReminders: boolean;
  wellnessReminders: boolean;
  aiInsights: boolean;
  dailySummary: boolean;
  summaryFrequency: SummaryFrequency;
}

export interface PreferencesSettings {
  language: LanguageCode;
  timezone: TimezoneCode;
  dateFormat: DateFormatId;
  weekStart: WeekStart;
}

export interface PrivacySettings {
  analytics: boolean;
  personalization: boolean;
  aiContext: boolean;
}

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  textSize: TextSize;
  focusKeyboard: boolean;
}

export interface SettingsState {
  profile: ProfileSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  preferences: PreferencesSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export const STORAGE_KEY = 'digital-life-twin-settings';

function defaults(): SettingsState {
  return {
    profile: {
      firstName: 'Sarah',
      lastName: 'Martin',
      email: 'sarah.martin@example.com',
      timezone: 'Europe/Paris',
      language: 'fr',
    },
    appearance: {
      theme: 'system',
      accent: 'teal',
    },
    notifications: {
      taskReminders: true,
      eventReminders: true,
      wellnessReminders: true,
      aiInsights: true,
      dailySummary: true,
      summaryFrequency: 'morning',
    },
    preferences: {
      language: 'fr',
      timezone: 'Europe/Paris',
      dateFormat: 'long',
      weekStart: 'monday',
    },
    privacy: {
      analytics: true,
      personalization: true,
      aiContext: true,
    },
    accessibility: {
      reduceMotion: false,
      highContrast: false,
      textSize: 'normal',
      focusKeyboard: true,
    },
  };
}

function read(): SettingsState {
  const fallback = defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return {
      profile: { ...fallback.profile, ...(parsed.profile ?? {}) },
      appearance: { ...fallback.appearance, ...(parsed.appearance ?? {}) },
      notifications: { ...fallback.notifications, ...(parsed.notifications ?? {}) },
      preferences: { ...fallback.preferences, ...(parsed.preferences ?? {}) },
      privacy: { ...fallback.privacy, ...(parsed.privacy ?? {}) },
      accessibility: { ...fallback.accessibility, ...(parsed.accessibility ?? {}) },
    };
  } catch {
    return fallback;
  }
}

/**
 * Central settings layer.
 * Persists every change under `digital-life-twin-settings` and reflects
 * theme / accent / motion / text-scale preferences on the document root so
 * the whole application reacts instantly.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly stateSignal = signal<SettingsState>(read());
  readonly state = this.stateSignal.asReadonly();

  /** The theme actually applied once `system` has been resolved. */
  readonly appliedTheme = computed<ThemePreference>(() => {
    const theme = this.stateSignal().appearance.theme;
    if (theme !== 'system') {
      return theme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  constructor() {
    effect(() => {
      const state = this.stateSignal();
      const root = document.documentElement;

      root.dataset['theme'] = this.appliedTheme();
      root.style.colorScheme = this.appliedTheme();

      root.dataset['accent'] = state.appearance.accent;
      root.dataset['motion'] = state.accessibility.reduceMotion ? 'reduced' : 'normal';
      root.dataset['textScale'] = state.accessibility.textSize;
      root.dataset['contrast'] = state.accessibility.highContrast ? 'high' : 'normal';
      root.dataset['focus'] = state.accessibility.focusKeyboard ? 'strong' : 'default';

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // storage unavailable — keep the in-memory state
      }
    });
  }

  // ------------------------------------------------------------- Apparence

  setTheme(theme: ThemePreference): void {
    this.patch({ appearance: { ...this.stateSignal().appearance, theme } });
  }

  setAccent(accent: AccentPreference): void {
    this.patch({ appearance: { ...this.stateSignal().appearance, accent } });
  }

  // ---------------------------------------------------------- Notifications

  toggleNotification(key: keyof NotificationSettings): void {
    const notifications = this.stateSignal().notifications;
    this.patch({ notifications: { ...notifications, [key]: !notifications[key] } });
  }

  setSummaryFrequency(frequency: SummaryFrequency): void {
    this.patch({
      notifications: { ...this.stateSignal().notifications, summaryFrequency: frequency },
    });
  }

  // ------------------------------------------------------------ Préférences

  setLanguage(language: LanguageCode): void {
    this.patch({ preferences: { ...this.stateSignal().preferences, language } });
  }

  setTimezone(timezone: TimezoneCode): void {
    this.patch({ preferences: { ...this.stateSignal().preferences, timezone } });
  }

  setDateFormat(dateFormat: DateFormatId): void {
    this.patch({ preferences: { ...this.stateSignal().preferences, dateFormat } });
  }

  setWeekStart(weekStart: WeekStart): void {
    this.patch({ preferences: { ...this.stateSignal().preferences, weekStart } });
  }

  // ---------------------------------------------------------- Confidentialité

  togglePrivacy(key: keyof PrivacySettings): void {
    const privacy = this.stateSignal().privacy;
    this.patch({ privacy: { ...privacy, [key]: !privacy[key] } });
  }

  // ---------------------------------------------------------- Accessibilité

  toggleAccessibility(key: keyof AccessibilitySettings): void {
    const accessibility = this.stateSignal().accessibility;
    this.patch({ accessibility: { ...accessibility, [key]: !accessibility[key] } });
  }

  setTextSize(textSize: TextSize): void {
    this.patch({ accessibility: { ...this.stateSignal().accessibility, textSize } });
  }

  // ----------------------------------------------------------------- Compte

  saveProfile(profile: ProfileSettings): void {
    this.patch({ profile });
  }

  // ------------------------------------------------------------------ Export

  /** Serializes the local settings/profile state for the user to download. */
  exportData(): string {
    return JSON.stringify(
      { ...this.stateSignal(), exportedAt: new Date().toISOString() },
      null,
      2,
    );
  }

  /**
   * Resets every preference to its default. The account and demo data are
   * intentionally kept — this only clears local settings.
   */
  resetPreferences(): void {
    const fallback = defaults();
    this.stateSignal.set({
      ...fallback,
      profile: this.stateSignal().profile,
    });
  }

  private patch(patch: Partial<SettingsState>): void {
    this.stateSignal.update((current) => ({ ...current, ...patch }));
  }
}
