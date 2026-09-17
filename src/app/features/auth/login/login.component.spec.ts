import { provideLocationMocks } from '@angular/common/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { GoogleIdentityService } from '../../../core/services/auth/google-identity.service';
import { LanguageService } from '../../../core/services/language.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockRouter: Router;

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn(),
      setCurrentUser: vi.fn(),
      loginWithGoogle: vi.fn(),
      afterAuthPath: vi.fn().mockReturnValue('/dashboard'),
      needsOnboarding: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: {}, params: {} },
            queryParams: of({}),
            params: of({}),
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: GoogleIdentityService,
          useValue: { requestIdToken: vi.fn() },
        },
        {
          provide: LanguageService,
          useValue: {
            translate: vi.fn((key: string) =>
              key === 'auth.brand.stories' || key === 'auth.brand.stats' ? [] : 'Translated',
            ),
            translateSignal: vi.fn().mockReturnValue(() => 'Translated'),
            activeLanguage: vi.fn().mockReturnValue('en'),
            languageOptions: [],
            setLanguage: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    mockRouter = TestBed.inject(Router);
    vi.spyOn(mockRouter, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function goToPasswordStep(): void {
    component['form'].controls.email.setValue('test@example.com');
    component['onSubmit']();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component['form'].value).toEqual({
      email: '',
      password: '',
    });
  });

  it('should start on the email step', () => {
    expect(component['step']()).toBe(0);
  });

  it('should validate email format', () => {
    const emailControl = component['form'].controls.email;

    emailControl.setValue('invalid-email');
    expect(emailControl.hasError('email')).toBe(true);

    emailControl.setValue('valid@email.com');
    expect(emailControl.hasError('email')).toBe(false);
  });

  it('should validate password minimum length', () => {
    const passwordControl = component['form'].controls.password;

    passwordControl.setValue('12345');
    expect(passwordControl.hasError('minlength')).toBe(true);

    passwordControl.setValue('123456');
    expect(passwordControl.hasError('minlength')).toBe(false);
  });

  it('should not leave the email step when the email is invalid', () => {
    component['form'].controls.email.setValue('');

    component['onSubmit']();

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(component['step']()).toBe(0);
    expect(component['form'].controls.email.touched).toBe(true);
  });

  it('should advance to the password step without logging in', () => {
    goToPasswordStep();

    expect(component['step']()).toBe(1);
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should not submit from the password step if the password is invalid', () => {
    goToPasswordStep();
    component['form'].controls.password.setValue('');

    component['onSubmit']();

    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(component['form'].controls.password.touched).toBe(true);
    expect(component['step']()).toBe(1);
  });

  it('should submit form with valid data on the password step', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user' as const,
      avatarUrl: null,
    };
    mockAuthService.login.mockReturnValue(of(mockUser));
    goToPasswordStep();
    component['form'].controls.password.setValue('password123');
    component['rememberMe'].set(true);

    component['onSubmit']();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    });
  });

  it('should navigate to dashboard on successful login', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user' as const,
      avatarUrl: null,
    };
    mockAuthService.login.mockReturnValue(of(mockUser));
    goToPasswordStep();
    component['form'].controls.password.setValue('password123');

    component['onSubmit']();

    expect(mockAuthService.setCurrentUser).toHaveBeenCalledWith(mockUser);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component['status']()).toBe('idle');
  });

  it('should set error status on login failure', () => {
    mockAuthService.login.mockReturnValue(throwError(() => new Error('Login failed')));
    goToPasswordStep();
    component['form'].controls.password.setValue('wrongpassword');

    component['onSubmit']();

    expect(component['status']()).toBe('error');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should go back from the password step to the email step', () => {
    goToPasswordStep();

    component['onBack']();

    expect(component['step']()).toBe(0);
    expect(component['direction']()).toBe('back');
  });

  it('should toggle password visibility', () => {
    expect(component['showPassword']()).toBe(false);

    component['togglePasswordVisibility']();
    expect(component['showPassword']()).toBe(true);

    component['togglePasswordVisibility']();
    expect(component['showPassword']()).toBe(false);
  });

  it('should return correct error messages', () => {
    const emailControl = component['form'].controls.email;

    emailControl.setValue('');
    emailControl.markAsTouched();
    expect(component['errorFor']('email')).toBe('Translated');

    emailControl.setValue('invalid');
    expect(component['errorFor']('email')).toBe('Translated');
  });

  it('should set loading status during login', () => {
    mockAuthService.login.mockReturnValue(
      of({
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user' as const,
        avatarUrl: null,
      }),
    );
    goToPasswordStep();
    component['form'].controls.password.setValue('password123');

    expect(component['status']()).toBe('idle');

    component['onSubmit']();

    expect(component['status']()).toBe('idle');
  });

  it('should navigate to onboarding after Google sign-in when profile is incomplete', () => {
    mockAuthService.afterAuthPath.mockReturnValue('/onboarding');
    const mockUser = {
      id: '1',
      email: 'google@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      role: 'user' as const,
      avatarUrl: null,
    };

    component['onGoogleSignedIn'](mockUser);

    expect(mockAuthService.setCurrentUser).toHaveBeenCalledWith(mockUser);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/onboarding']);
    expect(component['status']()).toBe('idle');
  });

  it('should show an error when Google authentication fails', () => {
    component['onGoogleFailed']('google_popup_closed');

    expect(component['status']()).toBe('error');
    expect(component['googleError']()).toBe('google_popup_closed');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should show an error when Google backend login fails', () => {
    component['onGoogleFailed']('account_linking_required');

    expect(component['status']()).toBe('error');
    expect(component['googleError']()).toBe('account_linking_required');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
