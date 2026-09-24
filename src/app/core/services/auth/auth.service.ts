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


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly baseUrl = `${environment.authApiUrl}/auth`;
  private readonly usersUrl = `${environment.authApiUrl}/users`;

  private readonly user = signal<User | null>(null);
  readonly currentUser = this.user.asReadonly();

  login(payload: LoginPayload): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, {
        email: payload.email,
        password: payload.password,
      })
      .pipe(
        tap((res) => this.tokenStorage.setTokens(res.accessToken, res.refreshToken)),
        map((res) => toUser(res.user)),
        catchError(() => throwError(() => new Error('invalid_credentials'))),
      );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<UserResponse>(`${this.baseUrl}/register`, payload)
      .pipe(
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
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken })
      .pipe(
        tap((res) => this.tokenStorage.setTokens(res.accessToken, res.refreshToken)),
        map((res) => res.accessToken),
      );
  }

  /** Attempts to restore the session from a stored token on app start. */
  restoreSession(): Observable<User | null> {
    if (!this.tokenStorage.getAccessToken()) {
      return of(null);
    }
    return this.http.get<UserProfileResponse>(`${this.usersUrl}/me`).pipe(
      map((profile) => toUser(profile)),
      tap((user) => this.user.set(user)),
      catchError(() => {
        this.tokenStorage.clear();
        this.user.set(null);
        return of(null);
      }),
    );
  }

  setCurrentUser(user: User | null): void {
    this.user.set(user);
  }

  logout(): void {
    const refreshToken = this.tokenStorage.getRefreshToken();
    this.user.set(null);

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
  }
}
