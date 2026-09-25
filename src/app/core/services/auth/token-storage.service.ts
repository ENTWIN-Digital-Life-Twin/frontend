import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'dlt_access_token';
const REFRESH_TOKEN_KEY = 'dlt_refresh_token';
const REMEMBER_KEY = 'dlt_remember';

/**
 * Wraps storage access for JWT tokens so the rest of the app never
 * touches the storage keys directly.
 * `rememberMe` uses localStorage; otherwise tokens live in sessionStorage.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getAccessToken(): string | null {
    return this.read(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.read(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string, rememberMe = this.shouldRemember()): void {
    this.clear();
    const store = rememberMe ? localStorage : sessionStorage;
    store.setItem(ACCESS_TOKEN_KEY, accessToken);
    store.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(REMEMBER_KEY, rememberMe ? '1' : '0');
  }

  private shouldRemember(): boolean {
    return localStorage.getItem(REMEMBER_KEY) !== '0';
  }

  setAccessToken(accessToken: string): void {
    const store = this.activeStore();
    store.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private read(key: string): string | null {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  }

  private activeStore(): Storage {
    if (localStorage.getItem(ACCESS_TOKEN_KEY)) {
      return localStorage;
    }
    if (sessionStorage.getItem(ACCESS_TOKEN_KEY)) {
      return sessionStorage;
    }
    return localStorage.getItem(REMEMBER_KEY) === '0' ? sessionStorage : localStorage;
  }
}
