import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { AuthService, type UserPreferencesPayload, type UserProfile } from '../../../core/services/auth/auth.service';
import { LanguageService, type AppLanguage } from '../../../core/services/language.service';

export interface ProfilePreferences {
  activitySummary: boolean;
  wellnessReminders: boolean;
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
}

export interface WellnessPreferences {
  sleepTarget: number;
  waterTarget: number;
  activeMinutesTarget: number;
}

export interface ProfileState {
  firstName: string;
  lastName: string;
  email: string;
  timezone: string;
  language: string;
  bio: string;
}

const DEFAULT_PREFS: ProfilePreferences = {
  activitySummary: true,
  wellnessReminders: true,
  quietHoursEnabled: false,
  quietStart: '22:00',
  quietEnd: '07:00',
};

const DEFAULT_WELLNESS: WellnessPreferences = {
  sleepTarget: 8,
  waterTarget: 2.5,
  activeMinutesTarget: 45,
};

function fromAuthProfile(profile: UserProfile | null, fallback: ProfileState): ProfileState {
  if (!profile) {
    return fallback;
  }
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    timezone: profile.timezone || fallback.timezone,
    language: profile.preferredLanguage || fallback.language,
    bio: profile.bio || fallback.bio,
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly auth = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private loadedUserId: string | null = null;

  private readonly defaults: ProfileState = {
    firstName: '',
    lastName: '',
    email: '',
    timezone: 'Africa/Casablanca',
    language: 'fr',
    bio: '',
  };

  readonly state = signal<ProfileState>(
    fromAuthProfile(this.auth.profile(), {
      ...this.defaults,
      firstName: this.auth.currentUser()?.firstName ?? '',
      lastName: this.auth.currentUser()?.lastName ?? '',
      email: this.auth.currentUser()?.email ?? '',
    }),
  );
  readonly prefs = signal<ProfilePreferences>({ ...DEFAULT_PREFS });
  readonly wellness = signal<WellnessPreferences>({ ...DEFAULT_WELLNESS });

  readonly languageName = computed(() => {
    const code = this.state().language;
    return this.languageService.languageOptions.find((option) => option.code === code)?.name ?? code;
  });

  constructor() {
    effect(() => {
      const profile = this.auth.profile();
      const user = this.auth.currentUser();
      this.state.update((current) =>
        fromAuthProfile(profile, {
          ...current,
          firstName: user?.firstName ?? current.firstName,
          lastName: user?.lastName ?? current.lastName,
          email: user?.email ?? current.email,
        }),
      );
      const language = profile?.preferredLanguage;
      if (language === 'fr' || language === 'en' || language === 'ar') {
        this.languageService.setLanguage(language);
      }
      if (user && this.loadedUserId !== user.id) {
        this.loadedUserId = user.id;
        this.auth.getPreferences().subscribe({
          next: (payload) => this.applyRemote(payload),
          error: () => void 0,
        });
      }
      if (!user) {
        this.loadedUserId = null;
      }
    }, { allowSignalWrites: true });
  }

  saveProfile(profile: ProfileState): Observable<UserProfile | null> {
    this.state.set(profile);
    if (profile.language === 'fr' || profile.language === 'en' || profile.language === 'ar') {
      this.languageService.setLanguage(profile.language as AppLanguage);
    }
    if (!this.auth.currentUser()) {
      return of(null);
    }
    return this.auth
      .updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        preferredLanguage: profile.language,
        timezone: profile.timezone,
        bio: profile.bio,
      })
      .pipe(tap(() => this.state.update((current) => ({ ...current, ...profile }))));
  }

  savePrefs(prefs: ProfilePreferences): void {
    this.prefs.set(prefs);
    this.persistExtras();
  }

  saveWellness(wellness: WellnessPreferences): void {
    this.wellness.set(wellness);
    this.persistExtras();
  }

  private applyRemote(payload: UserPreferencesPayload): void {
    if (payload.bio) {
      this.state.update((current) => ({ ...current, bio: payload.bio ?? current.bio }));
    }
    if (payload.profilePrefs) {
      this.prefs.set({ ...DEFAULT_PREFS, ...payload.profilePrefs });
    }
    if (payload.wellnessTargets) {
      this.wellness.set({ ...DEFAULT_WELLNESS, ...payload.wellnessTargets });
    }
  }

  private persistExtras(): void {
    if (!this.auth.currentUser()) {
      return;
    }
    this.auth
      .updatePreferences({
        profilePrefs: this.prefs(),
        wellnessTargets: this.wellness(),
      })
      .subscribe({ error: () => void 0 });
  }
}
