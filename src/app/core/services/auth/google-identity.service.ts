import { Injectable, NgZone, inject } from '@angular/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { Observable, from, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { isNativeApp } from '../../platform';

const GIS_SCRIPT_ID = 'google-gis-client';
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleCredentialResponse {
  credential?: string;
}

interface GooglePromptMoment {
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
  isDismissedMoment(): boolean;
  getDismissedReason?(): string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    ux_mode?: 'popup' | 'redirect';
    use_fedcm_for_prompt?: boolean;
    context?: 'signin' | 'signup' | 'use';
  }): void;
  prompt(listener?: (notification: GooglePromptMoment) => void): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  cancel(): void;
}

@Injectable({ providedIn: 'root' })
export class GoogleIdentityService {
  private readonly zone = inject(NgZone);
  private scriptPromise?: Promise<void>;
  private nativeReady?: Promise<void>;

  requestIdToken(): Observable<string> {
    if (!environment.googleClientId) {
      return throwError(() => new Error('google_not_configured'));
    }
    if (isNativeApp()) {
      return from(this.nativeIdToken());
    }
    return from(this.ensureScript()).pipe(switchMap(() => this.promptForCredential()));
  }

  private async nativeIdToken(): Promise<string> {
    this.nativeReady ??= GoogleSignIn.initialize({
      clientId: environment.googleClientId,
    });
    await this.nativeReady;
    try {
      const result = await GoogleSignIn.signIn();
      if (!result.idToken) {
        throw new Error('google_auth_failed');
      }
      return result.idToken;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('google_')) {
        throw error;
      }
      const code = (error as { code?: string }).code;
      if (code === 'SIGN_IN_CANCELED') {
        throw new Error('google_popup_closed');
      }
      throw new Error('google_login_failed');
    }
  }

  private promptForCredential(): Observable<string> {
    return new Observable<string>((subscriber) => {
      const accounts = this.accountsId();
      if (!accounts) {
        subscriber.error(new Error('google_script_failed'));
        return;
      }

      let completed = false;
      const finish = (credential: string) => {
        if (completed) {
          return;
        }
        completed = true;
        this.zone.run(() => {
          subscriber.next(credential);
          subscriber.complete();
        });
      };
      const fail = (code: string) => {
        if (completed) {
          return;
        }
        completed = true;
        this.zone.run(() => subscriber.error(new Error(code)));
      };

      accounts.initialize({
        client_id: environment.googleClientId,
        callback: (response) => {
          if (response?.credential) {
            finish(response.credential);
            return;
          }
          fail('google_auth_failed');
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: 'popup',
        use_fedcm_for_prompt: true,
        context: 'signin',
      });

      accounts.prompt((notification) => {
        if (completed) {
          return;
        }
        if (notification.isDismissedMoment()) {
          if (notification.getDismissedReason?.() === 'credential_returned') {
            return;
          }
          fail('google_popup_closed');
          return;
        }
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          this.clickRenderedButton(accounts, fail);
        }
      });
    });
  }

  private clickRenderedButton(accounts: GoogleAccountsId, fail: (code: string) => void): void {
    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.position = 'fixed';
    host.style.left = '-9999px';
    host.style.width = '1px';
    host.style.height = '1px';
    host.style.overflow = 'hidden';
    document.body.appendChild(host);
    accounts.renderButton(host, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
    });
    const button = host.querySelector('div[role="button"]') as HTMLElement | null;
    if (!button) {
      host.remove();
      fail('google_auth_failed');
      return;
    }
    button.click();
    window.setTimeout(() => host.remove(), 5000);
  }

  private ensureScript(): Promise<void> {
    if (this.accountsId()) {
      return Promise.resolve();
    }
    if (this.scriptPromise) {
      return this.scriptPromise;
    }
    this.scriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.getElementById(GIS_SCRIPT_ID) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('google_script_failed')));
        return;
      }
      const script = document.createElement('script');
      script.id = GIS_SCRIPT_ID;
      script.src = GIS_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        this.scriptPromise = undefined;
        reject(new Error('google_script_failed'));
      };
      document.head.appendChild(script);
    });
    return this.scriptPromise;
  }

  private accountsId(): GoogleAccountsId | null {
    const google = (window as Window & { google?: { accounts?: { id?: GoogleAccountsId } } }).google;
    return google?.accounts?.id ?? null;
  }
}
