import { Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';

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

const STORAGE_KEY = 'dlt.profile';
const STORAGE_PREFS = 'dlt.profile.prefs';
const STORAGE_WELLNESS = 'dlt.profile.wellness';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — keep in-memory state
  }
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly auth = inject(AuthService);

  private readonly defaults: ProfileState = {
    firstName: this.auth.currentUser()?.firstName ?? 'Sarah',
    lastName: this.auth.currentUser()?.lastName ?? 'Martin',
    email: this.auth.currentUser()?.email ?? 'sarah.martin@example.com',
    timezone: 'Europe/Paris (UTC+1)',
    language: 'fr',
    bio: 'mock.profile.bio',
  };

  readonly state = signal<ProfileState>(read(STORAGE_KEY, this.defaults));
  readonly prefs = signal<ProfilePreferences>(
    read<ProfilePreferences>(STORAGE_PREFS, {
      activitySummary: true,
      wellnessReminders: true,
      quietHoursEnabled: false,
      quietStart: '22:00',
      quietEnd: '07:00',
    }),
  );
  readonly wellness = signal<WellnessPreferences>(
    read<WellnessPreferences>(STORAGE_WELLNESS, {
      sleepTarget: 7.5,
      waterTarget: 2.5,
      activeMinutesTarget: 45,
    }),
  );

  saveProfile(profile: ProfileState): void {
    this.state.set(profile);
    write(STORAGE_KEY, profile);
  }

  savePrefs(prefs: ProfilePreferences): void {
    this.prefs.set(prefs);
    write(STORAGE_PREFS, prefs);
  }

  saveWellness(wellness: WellnessPreferences): void {
    this.wellness.set(wellness);
    write(STORAGE_WELLNESS, wellness);
  }
}
