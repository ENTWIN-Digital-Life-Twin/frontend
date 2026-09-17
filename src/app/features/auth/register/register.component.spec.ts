import { provideLocationMocks } from '@angular/common/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { GoogleIdentityService } from '../../../core/services/auth/google-identity.service';
import { LanguageService } from '../../../core/services/language.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: any;
  let mockRouter: Router;

  beforeEach(async () => {
    mockAuthService = {
      register: vi.fn(),
      sendRegisterCode: vi.fn().mockReturnValue(of({ message: 'sent' })),
      setCurrentUser: vi.fn(),
      loginWithGoogle: vi.fn(),
      updatePreferences: vi.fn().mockReturnValue(of({})),
      afterAuthPath: vi.fn().mockReturnValue('/dashboard'),
      needsOnboarding: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
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
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillAccount(): void {
    component['form'].controls.firstName.setValue('John');
    component['form'].controls.lastName.setValue('Doe');
    component['form'].controls.email.setValue('john@example.com');
    component['form'].controls.password.setValue('password123');
    component['form'].controls.confirmPassword.setValue('password123');
    component['termsAccepted'].set(true);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize a compact account form without profile fields', () => {
    expect(component['form'].value).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      verificationCode: '',
    });
  });

  it('should start at step 0', () => {
    expect(component['step']()).toBe(0);
  });

  it('should validate first name minimum length', () => {
    const firstNameControl = component['form'].controls.firstName;

    firstNameControl.setValue('A');
    expect(firstNameControl.hasError('minlength')).toBe(true);

    firstNameControl.setValue('John');
    expect(firstNameControl.hasError('minlength')).toBe(false);
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

    passwordControl.setValue('1234567');
    expect(passwordControl.hasError('minlength')).toBe(true);

    passwordControl.setValue('12345678');
    expect(passwordControl.hasError('minlength')).toBe(false);
  });

  it('should detect password mismatch', () => {
    component['form'].controls.password.setValue('password123');
    component['form'].controls.confirmPassword.setValue('different');
    component['form'].controls.confirmPassword.markAsTouched();

    expect(component['confirmInvalid']()).toBe(true);
    expect(component['confirmError']()).toBe('Translated');
  });

  it('should require terms on the account step', () => {
    fillAccount();
    component['termsAccepted'].set(false);

    expect(component['validateStep'](0)).toBe(false);
    expect(component['termsError']()).toBe(true);
    expect(mockAuthService.sendRegisterCode).not.toHaveBeenCalled();
  });

  it('should not send a code when the account step is invalid', () => {
    component['onPrimary']();

    expect(mockAuthService.sendRegisterCode).not.toHaveBeenCalled();
    expect(component['step']()).toBe(0);
    expect(component['form'].controls.firstName.touched).toBe(true);
  });

  it('should send an SMTP code and advance to verification', () => {
    fillAccount();

    component['onPrimary']();

    expect(mockAuthService.sendRegisterCode).toHaveBeenCalledWith('john@example.com');
    expect(component['step']()).toBe(1);
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should stay on the account step when sending the code fails', () => {
    mockAuthService.sendRegisterCode.mockReturnValue(throwError(() => new Error('mail')));
    fillAccount();

    component['onPrimary']();

    expect(component['step']()).toBe(0);
    expect(component['status']()).toBe('idle');
    expect(component['formError']()).toBe('Translated');
  });

  it('should go back from verification to the account step', () => {
    component['step'].set(1);

    component['onBack']();

    expect(component['step']()).toBe(0);
    expect(component['direction']()).toBe('back');
  });

  it('should not go back from step 0', () => {
    component['step'].set(0);

    component['onBack']();

    expect(component['step']()).toBe(0);
  });

  it('should toggle password visibility', () => {
    expect(component['showPassword']()).toBe(false);

    component['togglePasswordVisibility']();
    expect(component['showPassword']()).toBe(true);

    component['togglePasswordVisibility']();
    expect(component['showPassword']()).toBe(false);
  });

  it('should submit registration with the verification code', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user' as const,
      avatarUrl: null,
    };
    mockAuthService.register.mockReturnValue(of(mockUser));
    fillAccount();
    component['form'].controls.email.setValue('test@example.com');
    component['form'].controls.verificationCode.setValue('123456');
    component['step'].set(1);

    component['onPrimary']();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
      verificationCode: '123456',
    });
    expect(mockAuthService.setCurrentUser).toHaveBeenCalledWith(mockUser);
    expect(component['status']()).toBe('success');
  });

  it('should not submit with an invalid verification code', () => {
    fillAccount();
    component['form'].controls.verificationCode.setValue('12');
    component['step'].set(1);

    component['onPrimary']();

    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(component['form'].controls.verificationCode.touched).toBe(true);
  });

  it('should stay on the verification step when registration fails', () => {
    mockAuthService.register.mockReturnValue(throwError(() => new Error('Registration failed')));
    fillAccount();
    component['form'].controls.verificationCode.setValue('123456');
    component['step'].set(1);

    component['onPrimary']();

    expect(component['status']()).toBe('idle');
    expect(component['step']()).toBe(1);
    expect(component['formError']()).toBe('Translated');
  });

  it('should resend the verification code without changing step', () => {
    fillAccount();
    component['step'].set(1);

    component['resendCode']();

    expect(mockAuthService.sendRegisterCode).toHaveBeenCalledWith('john@example.com');
    expect(component['step']()).toBe(1);
  });

  it('should navigate to dashboard on success', () => {
    component['goToDashboard']();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should calculate displayed step correctly', () => {
    component['step'].set(0);
    expect(component['displayedStep']()).toBe(1);

    component['step'].set(1);
    expect(component['displayedStep']()).toBe(2);
  });

  it('should determine segment active state', () => {
    component['step'].set(1);

    expect(component['segmentActive'](0)).toBe(true);
    expect(component['segmentActive'](1)).toBe(true);
  });

  it('navigates to onboarding after Google sign-in when profile is incomplete', () => {
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
  });

  it('stores a Google authentication error without navigating', () => {
    component['onGoogleFailed']('google_login_failed');

    expect(component['googleError']()).toBe('google_login_failed');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
