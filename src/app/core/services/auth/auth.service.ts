import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, UserRole } from '../../models/user';
import { TokenStorageService } from './token-storage.service';

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
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
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
      .post<AuthResponse>(`${this.baseUrl}/login`, {
        email: payload.email,
        password: payload.password,
      })
      .pipe(
        tap((res) =>
          this.tokenStorage.setTokens(res.accessToken, res.refreshToken, payload.rememberMe),
        ),
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

  setCurrentUser(user: User | null): void {
    this.user.set(user);
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
