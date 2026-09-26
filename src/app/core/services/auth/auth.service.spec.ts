import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

describe('AuthService Google login', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenStorage: { setTokens: ReturnType<typeof vi.fn> };

  const authBody = {
    accessToken: 'entwin-access',
    refreshToken: 'entwin-refresh',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@gmail.com',
      roles: ['USER'],
    },
  };

  beforeEach(() => {
    tokenStorage = {
      setTokens: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: TokenStorageService, useValue: tokenStorage },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('stores ENTWIN tokens and returns the user after Google login', () => {
    let userEmail = '';
    service.loginWithGoogle('google-id-token', true).subscribe((user) => {
      userEmail = user.email;
    });

    const googleReq = httpMock.expectOne(`${environment.authApiUrl}/auth/google`);
    expect(googleReq.request.body).toEqual({ credential: 'google-id-token' });
    expect(googleReq.request.headers.get('X-Device-Id')).toBeTruthy();
    googleReq.flush(authBody);

    httpMock.expectOne(`${environment.authApiUrl}/users/me`).flush({
      ...authBody.user,
      dateOfBirth: null,
      gender: null,
      heightCm: null,
      weightKg: null,
      occupationType: null,
      preferredLanguage: 'en',
      timezone: 'UTC',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      bio: null,
    });

    expect(tokenStorage.setTokens).toHaveBeenCalledWith('entwin-access', 'entwin-refresh', true);
    expect(userEmail).toBe('ada@gmail.com');
  });

  it('maps a 409 backend rejection to account linking required', () => {
    let code = '';
    service.loginWithGoogle('google-id-token').subscribe({
      error: (error: Error) => {
        code = error.message;
      },
    });

    httpMock.expectOne(`${environment.authApiUrl}/auth/google`).flush(
      { message: 'An account already exists for this email. Sign in with your password.' },
      { status: 409, statusText: 'Conflict' },
    );

    expect(code).toBe('account_linking_required');
    expect(tokenStorage.setTokens).not.toHaveBeenCalled();
  });

  it('maps a 401 backend rejection to an invalid Google token', () => {
    let code = '';
    service.loginWithGoogle('bad-token').subscribe({
      error: (error: Error) => {
        code = error.message;
      },
    });

    httpMock.expectOne(`${environment.authApiUrl}/auth/google`).flush(
      { message: 'Invalid Google credential' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(code).toBe('invalid_google_token');
  });
});
