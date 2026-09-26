import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, UserRole } from '../../models/user';
import { TokenStorageService } from './token-storage.service';
import { captureNewDeviceFlag, deviceHeaders } from './device-id';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  verificationCode: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  occupationType?: string | null;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  occupationType: string | null;
  preferredLanguage: string | null;
  timezone: string | null;
  accountStatus: string | null;
  emailVerified: boolean;
  roles: string[];
  bio: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  occupationType?: string | null;
  preferredLanguage?: string | null;
  timezone?: string | null;
  bio?: string | null;
}

interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

interface UserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  occupationType: string | null;
  preferredLanguage: string | null;
  timezone: string | null;
  accountStatus: string | null;
  emailVerified: boolean;
  roles: string[];
  bio?: string | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
  newDevice?: boolean;
}

export interface UserPreferencesPayload {
  bio?: string | null;
  dailyWaterGoalMl?: number | null;
  appearance?: { theme: string; accent: string };
  notifications?: {
    taskReminders: boolean;
    eventReminders: boolean;
    wellnessReminders: boolean;
    aiInsights: boolean;
    dailySummary: boolean;
    summaryFrequency: string;
  };
  preferences?: { dateFormat: string; weekStart: string };
  privacy?: { analytics: boolean; personalization: boolean; aiContext: boolean };
  accessibility?: {
    reduceMotion: boolean;
    highContrast: boolean;
    textSize: string;
    focusKeyboard: boolean;
  };
  profilePrefs?: {
    activitySummary: boolean;
    wellnessReminders: boolean;
    quietHoursEnabled: boolean;
    quietStart: string;
    quietEnd: string;
  };
  wellnessTargets?: {
    sleepTarget: number;
    waterTarget: number;
    activeMinutesTarget: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  contactMessages: number;
}

export interface AdminContact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

function toUser(response: UserResponse): User {
  const role: UserRole = response.roles.some((r) => r.toUpperCase().includes('ADMIN'))
    ? 'admin'
    : 'user';
  return {
    id: response.id,
    firstName: response.firstName,
    lastName: response.lastName,
    email: response.email,
    role,
    avatarUrl: null,
  };
}

function toProfile(response: UserProfileResponse): UserProfile {
  return {
    id: response.id,
    firstName: response.firstName,
    lastName: response.lastName,
    email: response.email,
    dateOfBirth: response.dateOfBirth ?? null,
    gender: response.gender ?? null,
    heightCm: response.heightCm ?? null,
    weightKg: response.weightKg ?? null,
    occupationType: response.occupationType ?? null,
    preferredLanguage: response.preferredLanguage ?? null,
    timezone: response.timezone ?? null,
    accountStatus: response.accountStatus ?? null,
    emailVerified: Boolean(response.emailVerified),
    roles: response.roles ?? [],
    bio: response.bio ?? null,
    createdAt: response.createdAt ?? null,
    lastLoginAt: response.lastLoginAt ?? null,
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly baseUrl = `${environment.authApiUrl}/auth`;
  private readonly usersUrl = `${environment.authApiUrl}/users`;

  private readonly user = signal<User | null>(null);
  private readonly profileSignal = signal<UserProfile | null>(null);
  readonly currentUser = this.user.asReadonly();
  readonly profile = this.profileSignal.asReadonly();

  login(payload: LoginPayload): Observable<User> {
    return this.http
      .post<AuthResponse>(
        `${this.baseUrl}/login`,
        {
          email: payload.email,
          password: payload.password,
        },
        { headers: deviceHeaders() },
      )
      .pipe(
        tap((res) => {
          this.tokenStorage.setTokens(res.accessToken, res.refreshToken, payload.rememberMe);
          captureNewDeviceFlag(res.newDevice);
        }),
        switchMap((res) =>
          this.loadProfile().pipe(
            map(() => toUser(res.user)),
            catchError(() => of(toUser(res.user))),
          ),
        ),
        tap((user) => this.user.set(user)),
        catchError(() => throwError(() => new Error('invalid_credentials'))),
      );
  }

  loginWithGoogle(credential: string, rememberMe = true): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/google`, { credential }, { headers: deviceHeaders() })
      .pipe(
        tap((res) => {
          this.tokenStorage.setTokens(res.accessToken, res.refreshToken, rememberMe);
          captureNewDeviceFlag(res.newDevice);
        }),
      switchMap((res) =>
        this.loadProfile().pipe(
          map(() => toUser(res.user)),
          catchError(() => of(toUser(res.user))),
        ),
      ),
      tap((user) => this.user.set(user)),
      catchError((error: unknown) => throwError(() => new Error(googleLoginErrorCode(error)))),
    );
  }

  sendRegisterCode(email: string): Observable<{ message: string; verificationCode?: string | null }> {
    return this.http.post<{ message: string; verificationCode?: string | null }>(
      `${this.baseUrl}/register/send-code`,
      { email },
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<UserResponse>(`${this.baseUrl}/register`, payload).pipe(
      switchMap(() =>
        this.login({
          email: payload.email,
          password: payload.password,
          rememberMe: true,
        }),
      ),
    );
  }

  /** Refreshes the access token using the stored refresh token. */
  refresh(): Observable<string> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('no_refresh_token'));
    }
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap((res) => this.tokenStorage.setTokens(res.accessToken, res.refreshToken)),
      map((res) => res.accessToken),
    );
  }

  /** Attempts to restore the session from a stored token on app start. */
  restoreSession(): Observable<User | null> {
    if (!this.tokenStorage.getAccessToken()) {
      return of(null);
    }
    return this.loadProfile().pipe(
      tap((profile) => this.user.set(toUser(profile))),
      map((profile) => toUser(profile)),
      catchError(() => {
        this.tokenStorage.clear();
        this.user.set(null);
        this.profileSignal.set(null);
        return of(null);
      }),
    );
  }

  updateProfile(payload: UpdateProfilePayload): Observable<UserProfile> {
    return this.http.put<UserProfileResponse>(`${this.usersUrl}/me`, payload).pipe(
      map(toProfile),
      tap((profile) => {
        this.profileSignal.set(profile);
        this.user.set(toUser(profile));
      }),
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http
      .put<{ message: string }>(`${this.usersUrl}/me/password`, {
        currentPassword,
        newPassword,
      })
      .pipe(map(() => void 0));
  }

  getPreferences(): Observable<UserPreferencesPayload> {
    return this.http.get<UserPreferencesPayload>(`${this.usersUrl}/me/preferences`);
  }

  updatePreferences(payload: Partial<UserPreferencesPayload>): Observable<UserPreferencesPayload> {
    return this.http.put<UserPreferencesPayload>(`${this.usersUrl}/me/preferences`, payload);
  }

  getAssistantConversations(): Observable<unknown[]> {
    return this.http
      .get<{ conversations: unknown[] }>(`${this.usersUrl}/me/assistant-conversations`)
      .pipe(map((res) => res.conversations ?? []));
  }

  saveAssistantConversations(conversations: unknown[]): Observable<unknown[]> {
    return this.http
      .put<{ conversations: unknown[] }>(`${this.usersUrl}/me/assistant-conversations`, {
        conversations,
      })
      .pipe(map((res) => res.conversations ?? []));
  }

  forgotPassword(email: string): Observable<{ message: string; resetToken?: string | null }> {
    return this.http.post<{ message: string; resetToken?: string | null }>(
      `${this.baseUrl}/forgot-password`,
      { email },
    );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/reset-password`, { token, newPassword })
      .pipe(map(() => void 0));
  }

  submitContact(payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Observable<void> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/contact`, payload)
      .pipe(map(() => void 0));
  }

  adminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.usersUrl}/admin/stats`);
  }

  adminUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfileResponse[]>(`${this.usersUrl}/admin/users`).pipe(
      map((users) => users.map(toProfile)),
    );
  }

  adminContacts(): Observable<AdminContact[]> {
    return this.http.get<AdminContact[]>(`${this.usersUrl}/admin/contacts`);
  }

  updateAccountStatus(userId: string, accountStatus: string): Observable<UserProfile> {
    return this.http
      .patch<UserProfileResponse>(`${this.usersUrl}/admin/users/${userId}/status`, {
        accountStatus,
      })
      .pipe(map(toProfile));
  }

  updateUserRole(userId: string, role: 'ADMIN' | 'USER'): Observable<UserProfile> {
    return this.http
      .patch<UserProfileResponse>(`${this.usersUrl}/admin/users/${userId}/role`, { role })
      .pipe(map(toProfile));
  }

  deleteContact(contactId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.usersUrl}/admin/contacts/${contactId}`)
      .pipe(map(() => void 0));
  }

  setCurrentUser(user: User | null): void {
    this.user.set(user);
  }

  needsOnboarding(): boolean {
    const profile = this.profileSignal();
    if (!profile) {
      return true;
    }
    return !profile.gender || profile.heightCm == null || profile.weightKg == null;
  }

  afterAuthPath(): string {
    return this.needsOnboarding() ? '/onboarding' : '/dashboard';
  }

  logout(): void {
    const refreshToken = this.tokenStorage.getRefreshToken();
    this.user.set(null);
    this.profileSignal.set(null);

    if (!refreshToken) {
      this.tokenStorage.clear();
      return;
    }

    this.http
      .post(`${this.baseUrl}/logout`, { refreshToken })
      .pipe(finalize(() => this.tokenStorage.clear()))
      .subscribe({ error: () => void 0 });
  }

  clearSession(): void {
    this.tokenStorage.clear();
    this.user.set(null);
    this.profileSignal.set(null);
  }

  private loadProfile(): Observable<UserProfile> {
    return this.http.get<UserProfileResponse>(`${this.usersUrl}/me`).pipe(
      map(toProfile),
      tap((profile) => this.profileSignal.set(profile)),
    );
  }
}

function googleLoginErrorCode(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 409) {
      return 'account_linking_required';
    }
    if (error.status === 401) {
      return 'invalid_google_token';
    }
    if (error.status === 400) {
      return 'google_email_unverified';
    }
    if (error.status === 503) {
      return 'google_not_configured';
    }
  }
  return 'google_login_failed';
}
