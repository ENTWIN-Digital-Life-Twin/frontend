import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: any;
  let mockRouter: any;
  let mockLanguageService: any;

  beforeEach(async () => {
    // Create mock services
    mockAuthService = {
      register: vi.fn(),
      setCurrentUser: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };
    mockLanguageService = {
      translate: vi.fn().mockReturnValue('Translated'),
      translateSignal: vi.fn().mockReturnValue(() => 'Translated'),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: LanguageService, useValue: mockLanguageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component['form'].value).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
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

  it('should validate step 0 (identity)', () => {
    component['form'].controls.firstName.setValue('');
    component['form'].controls.lastName.setValue('');
    
    const result = component['validateStep'](0);
    
    expect(result).toBe(false);
    expect(component['form'].controls.firstName.touched).toBe(true);
    expect(component['form'].controls.lastName.touched).toBe(true);
  });

  it('should validate step 1 (email)', () => {
    component['form'].controls.email.setValue('invalid');
    
    const result = component['validateStep'](1);
    
    expect(result).toBe(false);
    expect(component['form'].controls.email.touched).toBe(true);
  });

  it('should validate step 2 (password)', () => {
    component['form'].controls.password.setValue('pass');
    component['form'].controls.confirmPassword.setValue('pass');
    
    const result = component['validateStep'](2);
    
    expect(result).toBe(false);
  });

  it('should validate step 3 (terms)', () => {
    component['termsAccepted'].set(false);
    
    const result = component['validateStep'](3);
    
    expect(result).toBe(false);
    expect(component['termsError']()).toBe(true);
  });

  it('should advance to next step on valid data', () => {
    component['form'].controls.firstName.setValue('John');
    component['form'].controls.lastName.setValue('Doe');
    
    component['onPrimary']();
    
    expect(component['step']()).toBe(1);
  });

  it('should go back to previous step', () => {
    component['step'].set(2);
    
    component['onBack']();
    
    expect(component['step']()).toBe(1);
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

  it('should submit registration with valid data', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user' as const,
      avatarUrl: null,
    };
    mockAuthService.register.mockReturnValue(of(mockUser));
    
    component['form'].controls.firstName.setValue('John');
    component['form'].controls.lastName.setValue('Doe');
    component['form'].controls.email.setValue('test@example.com');
    component['form'].controls.password.setValue('password123');
    component['form'].controls.confirmPassword.setValue('password123');
    component['termsAccepted'].set(true);
    component['step'].set(4);
    
    component['onPrimary']();
    
    expect(mockAuthService.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should set success status on successful registration', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user' as const,
      avatarUrl: null,
    };
    mockAuthService.register.mockReturnValue(of(mockUser));
    
    component['form'].controls.firstName.setValue('John');
    component['form'].controls.lastName.setValue('Doe');
    component['form'].controls.email.setValue('test@example.com');
    component['form'].controls.password.setValue('password123');
    component['form'].controls.confirmPassword.setValue('password123');
    component['termsAccepted'].set(true);
    component['step'].set(4);
    
    component['onPrimary']();
    
    expect(mockAuthService.setCurrentUser).toHaveBeenCalledWith(mockUser);
    expect(component['status']()).toBe('success');
  });

  it('should handle registration error', () => {
    mockAuthService.register.mockReturnValue(throwError(() => new Error('Registration failed')));
    
    component['form'].controls.firstName.setValue('John');
    component['form'].controls.lastName.setValue('Doe');
    component['form'].controls.email.setValue('test@example.com');
    component['form'].controls.password.setValue('password123');
    component['form'].controls.confirmPassword.setValue('password123');
    component['termsAccepted'].set(true);
    component['step'].set(4);
    
    component['onPrimary']();
    
    expect(component['status']()).toBe('idle');
    expect(component['step']()).toBe(1); // Should go back to email step
  });

  it('should navigate to dashboard on success', () => {
    component['goToDashboard']();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should calculate displayed step correctly', () => {
    component['step'].set(0);
    expect(component['displayedStep']()).toBe(1);
    
    component['step'].set(3);
    expect(component['displayedStep']()).toBe(4);
    
    component['step'].set(4);
    expect(component['displayedStep']()).toBe(4);
  });

  it('should determine segment active state', () => {
    component['step'].set(2);
    
    expect(component['segmentActive'](0)).toBe(true);
    expect(component['segmentActive'](1)).toBe(true);
    expect(component['segmentActive'](2)).toBe(true);
    expect(component['segmentActive'](3)).toBe(false);
  });

  it('should not submit without terms acceptance', () => {
    component['form'].controls.firstName.setValue('John');
    component['form'].controls.lastName.setValue('Doe');
    component['form'].controls.email.setValue('test@example.com');
    component['form'].controls.password.setValue('password123');
    component['form'].controls.confirmPassword.setValue('password123');
    component['termsAccepted'].set(false);
    component['step'].set(4);
    
    component['onPrimary']();
    
    expect(mockAuthService.register).not.toHaveBeenCalled();
    expect(component['termsError']()).toBe(true);
    expect(component['step']()).toBe(3);
  });
});
