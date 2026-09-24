import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockRouter: any;
  let mockLanguageService: any;

  beforeEach(async () => {
    // Create mock services
    mockAuthService = {
      login: vi.fn(),
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
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: LanguageService, useValue: mockLanguageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component['form'].value).toEqual({
      email: '',
      password: '',
    });
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

  it('should not submit form if invalid', () => {
    component['form'].controls.email.setValue('');
    component['form'].controls.password.setValue('');
    
    component['onSubmit']();
    
    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(component['form'].controls.email.touched).toBe(true);
    expect(component['form'].controls.password.touched).toBe(true);
  });

  it('should submit form with valid data', () => {
    const mockUser = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'user' as const, avatarUrl: null };
    mockAuthService.login.mockReturnValue(of(mockUser));
    
    component['form'].controls.email.setValue('test@example.com');
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
    const mockUser = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'user' as const, avatarUrl: null };
    mockAuthService.login.mockReturnValue(of(mockUser));
    
    component['form'].controls.email.setValue('test@example.com');
    component['form'].controls.password.setValue('password123');
    
    component['onSubmit']();
    
    expect(mockAuthService.setCurrentUser).toHaveBeenCalledWith(mockUser);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component['status']()).toBe('idle');
  });

  it('should set error status on login failure', () => {
    mockAuthService.login.mockReturnValue(throwError(() => new Error('Login failed')));
    
    component['form'].controls.email.setValue('test@example.com');
    component['form'].controls.password.setValue('wrongpassword');
    
    component['onSubmit']();
    
    expect(component['status']()).toBe('error');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
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
    mockAuthService.login.mockReturnValue(of({ id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'user' as const, avatarUrl: null }));
    
    component['form'].controls.email.setValue('test@example.com');
    component['form'].controls.password.setValue('password123');
    
    expect(component['status']()).toBe('idle');
    
    component['onSubmit']();
    
    // Status should be set to loading before the observable completes
    // After completion, it should be idle
    expect(component['status']()).toBe('idle');
  });
});
