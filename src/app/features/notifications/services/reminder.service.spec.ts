import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { TokenStorageService } from '../../../core/services/auth/token-storage.service';
import { ReminderService } from './reminder.service';

describe('ReminderService', () => {
  let service: ReminderService;
  let httpMock: HttpTestingController;
  let tokenStorage: { getAccessToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    tokenStorage = { getAccessToken: vi.fn().mockReturnValue(null) };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ReminderService,
        { provide: TokenStorageService, useValue: tokenStorage },
      ],
    });
    service = TestBed.inject(ReminderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('does not call the API without a token', () => {
    service.startSession();
    httpMock.verify();
  });

  it('seeds daily water, meal, sleep and planning reminders after login', () => {
    tokenStorage.getAccessToken.mockReturnValue('jwt');
    service.startSession();

    httpMock
      .expectOne(
        (req) => req.method === 'GET' && req.url === `${environment.notificationApiUrl}/reminders`,
      )
      .flush({ content: [] });

    const created = httpMock.match(
      (req) => req.method === 'POST' && req.url === `${environment.notificationApiUrl}/reminders`,
    );
    expect(created).toHaveLength(11);
    const types = created.map((req) => req.request.body.reminderType);
    expect(types.filter((type) => type === 'WATER')).toHaveLength(3);
    expect(types.filter((type) => type === 'MEAL')).toHaveLength(3);
    expect(types).toContain('SLEEP');
    expect(types).toContain('WORKOUT');
    expect(types).toContain('CUSTOM');
    created.forEach((req, index) => {
      req.flush({
        id: `r-${index}`,
        title: req.request.body.title,
        message: req.request.body.message,
        reminderType: req.request.body.reminderType,
        triggerDateTime: req.request.body.triggerDateTime,
        recurring: true,
        recurrenceType: 'DAILY',
        enabled: true,
        sourceType: 'WELLNESS_GOAL',
        sourceResourceId: null,
        advanceMinutes: 0,
        nextTriggerAt: req.request.body.triggerDateTime,
        lastTriggeredAt: null,
      });
    });
    httpMock.verify();
  });
});
