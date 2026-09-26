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

describe('AuthService admin API', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const profileBody = {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    dateOfBirth: null,
    gender: null,
    heightCm: null,
    weightKg: null,
    occupationType: null,
    preferredLanguage: 'en',
    timezone: 'UTC',
    accountStatus: 'ACTIVE',
    emailVerified: true,
    roles: ['USER'],
    bio: null,
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: TokenStorageService, useValue: { setTokens: vi.fn() } },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('maps createdAt when listing admin users', () => {
    let createdAt = '';
    service.adminUsers().subscribe((users) => {
      createdAt = users[0]?.createdAt ?? '';
    });

    httpMock.expectOne(`${environment.authApiUrl}/users/admin/users`).flush([profileBody]);
    expect(createdAt).toBe('2026-01-01T00:00:00Z');
  });

  it('patches a user role', () => {
    let roles: string[] = [];
    service.updateUserRole('user-2', 'ADMIN').subscribe((user) => {
      roles = user.roles;
    });

    const req = httpMock.expectOne(`${environment.authApiUrl}/users/admin/users/user-2/role`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ role: 'ADMIN' });
    req.flush({ ...profileBody, roles: ['ADMIN', 'USER'] });
    expect(roles).toEqual(['ADMIN', 'USER']);
  });

  it('deletes a contact message', () => {
    let completed = false;
    service.deleteContact('msg-1').subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(`${environment.authApiUrl}/users/admin/contacts/msg-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(completed).toBe(true);
  });
});
