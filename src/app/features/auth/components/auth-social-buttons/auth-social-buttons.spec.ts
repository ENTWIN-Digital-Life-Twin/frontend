import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { GoogleIdentityService } from '../../../../core/services/auth/google-identity.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthSocialButtons } from './auth-social-buttons';

describe('AuthSocialButtons', () => {
  let fixture: ComponentFixture<AuthSocialButtons>;
  let component: AuthSocialButtons;
  let googleIdentity: { requestIdToken: ReturnType<typeof vi.fn> };
  let authService: { loginWithGoogle: ReturnType<typeof vi.fn> };

  const user = {
    id: '1',
    email: 'ada@gmail.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    role: 'user' as const,
    avatarUrl: null,
  };

  beforeEach(async () => {
    googleIdentity = { requestIdToken: vi.fn() };
    authService = { loginWithGoogle: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [AuthSocialButtons],
      providers: [
        { provide: GoogleIdentityService, useValue: googleIdentity },
        { provide: AuthService, useValue: authService },
        {
          provide: LanguageService,
          useValue: {
            translateSignal: vi.fn().mockReturnValue(() => 'Translated'),
            translate: vi.fn().mockReturnValue('Translated'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthSocialButtons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits signedIn after Google success and backend login', () => {
    googleIdentity.requestIdToken.mockReturnValue(of('gis-id-token'));
    authService.loginWithGoogle.mockReturnValue(of(user));
    const signedIn = vi.fn();
    component.signedIn.subscribe(signedIn);

    component['onGoogle']();

    expect(authService.loginWithGoogle).toHaveBeenCalledWith('gis-id-token', true);
    expect(signedIn).toHaveBeenCalledWith(user);
  });

  it('emits failed when the Google popup is closed', () => {
    googleIdentity.requestIdToken.mockReturnValue(throwError(() => new Error('google_popup_closed')));
    const failed = vi.fn();
    component.failed.subscribe(failed);

    component['onGoogle']();

    expect(authService.loginWithGoogle).not.toHaveBeenCalled();
    expect(failed).toHaveBeenCalledWith('google_popup_closed');
  });

  it('emits failed when the backend rejects Google login', () => {
    googleIdentity.requestIdToken.mockReturnValue(of('gis-id-token'));
    authService.loginWithGoogle.mockReturnValue(
      throwError(() => new Error('account_linking_required')),
    );
    const failed = vi.fn();
    component.failed.subscribe(failed);

    component['onGoogle']();

    expect(failed).toHaveBeenCalledWith('account_linking_required');
  });
});
