import { Injectable, signal } from '@angular/core';
import { delay, of, throwError } from 'rxjs';
import { MOCK_USER, User } from '../../models/user';

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

export const DEMO_EMAIL = 'demo@dlt.app';
export const DEMO_PASSWORD = 'password';

/**
 * Mock authentication layer.
 * Replace the internals with real HTTP calls (POST /api/auth/login …) later
 * without touching the components that consume it.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly user = signal<User | null>(null);
  readonly currentUser = this.user.asReadonly();

  login(payload: LoginPayload) {
    const valid =
      payload.email.toLowerCase() === DEMO_EMAIL && payload.password === DEMO_PASSWORD;
    if (!valid) {
      return throwError(() => new Error('invalid_credentials')).pipe(delay(900));
    }
    void payload;
    return of(MOCK_USER).pipe(delay(900));
  }

  register(payload: RegisterPayload) {
    void payload;
    return of(MOCK_USER).pipe(delay(1000));
  }

  setCurrentUser(user: User | null): void {
    this.user.set(user);
  }

  logout(): void {
    this.user.set(null);
  }
}
