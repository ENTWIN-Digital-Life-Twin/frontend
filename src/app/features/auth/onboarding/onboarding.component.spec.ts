import { provideLocationMocks } from '@angular/common/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { OnboardingComponent } from './onboarding.component';

describe('OnboardingComponent', () => {
  let component: OnboardingComponent;
  let fixture: ComponentFixture<OnboardingComponent>;
  let mockAuthService: {
    profile: ReturnType<typeof vi.fn>;
    updateProfile: ReturnType<typeof vi.fn>;
    updatePreferences: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    mockAuthService = {
      profile: vi.fn().mockReturnValue(null),
      updateProfile: vi.fn().mockReturnValue(of({})),
      updatePreferences: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [OnboardingComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: LanguageService,
          useValue: {
            translate: vi.fn((key: string) =>
              key.includes('Options') ? [] : 'Translated',
            ),
            translateSignal: vi.fn().mockReturnValue(() => 'Translated'),
            activeLanguage: vi.fn().mockReturnValue('en'),
            languageOptions: [],
            setLanguage: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(OnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('stays on step 0 until sex, height and weight are filled', () => {
    component['onPrimary']();
    expect(component['step']()).toBe(0);

    component['form'].controls.gender.setValue('FEMALE');
    component['form'].controls.heightCm.setValue(168);
    component['form'].controls.weightKg.setValue(62);
    component['onPrimary']();
    expect(component['step']()).toBe(1);
  });

  it('saves profile, goals and continues to the dashboard', () => {
    component['form'].controls.gender.setValue('FEMALE');
    component['form'].controls.heightCm.setValue(168);
    component['form'].controls.weightKg.setValue(62);
    component['form'].controls.occupationType.setValue('STUDENT');

    component['onSubmit']();

    expect(mockAuthService.updateProfile).toHaveBeenCalledWith({
      gender: 'FEMALE',
      dateOfBirth: null,
      heightCm: 168,
      weightKg: 62,
      occupationType: 'STUDENT',
    });
    expect(mockAuthService.updatePreferences).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('shows an error when the profile cannot be saved', () => {
    mockAuthService.updateProfile.mockReturnValue(throwError(() => new Error('fail')));
    component['form'].controls.gender.setValue('MALE');
    component['form'].controls.heightCm.setValue(180);
    component['form'].controls.weightKg.setValue(75);

    component['onSubmit']();

    expect(component['errorBanner']()).toBe('Translated');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
