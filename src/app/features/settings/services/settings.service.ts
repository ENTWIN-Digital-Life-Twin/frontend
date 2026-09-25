import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';

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
      firstName: '',
      lastName: '',
      email: '',
      timezone: 'Africa/Casablanca',
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
      timezone: 'Africa/Casablanca',
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
  private readonly auth = inject(AuthService);
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
      const profile = this.auth.profile();
      const user = this.auth.currentUser();
      if (!profile && !user) {
        return;
      }
      this.stateSignal.update((current) => ({
        ...current,
        profile: {
          firstName: profile?.firstName || user?.firstName || current.profile.firstName,
          lastName: profile?.lastName || user?.lastName || current.profile.lastName,
          email: profile?.email || user?.email || current.profile.email,
          timezone: profile?.timezone || current.profile.timezone,
          language: profile?.preferredLanguage || current.profile.language,
        },
        preferences: {
          ...current.preferences,
          language: (profile?.preferredLanguage as LanguageCode) || current.preferences.language,
          timezone: (profile?.timezone as TimezoneCode) || current.preferences.timezone,
        },
      }));
    }, { allowSignalWrites: true });

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

  saveProfile(profile: ProfileSettings): Observable<unknown> {
    this.patch({ profile });
    if (!this.auth.currentUser()) {
      return of(null);
    }
    return this.auth
      .updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        preferredLanguage: profile.language,
        timezone: profile.timezone,
      })
      .pipe(tap(() => this.patch({ profile })));
  }

  persistLocale(language?: LanguageCode, timezone?: TimezoneCode): void {
    if (!this.auth.currentUser()) {
      return;
    }
    this.auth
      .updateProfile({
        preferredLanguage: language ?? this.stateSignal().preferences.language,
        timezone: timezone ?? this.stateSignal().preferences.timezone,
      })
      .subscribe({ error: () => void 0 });
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
