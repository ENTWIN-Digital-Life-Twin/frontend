import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { TokenStorageService } from '../../../core/services/auth/token-storage.service';
import { LanguageService } from '../../../core/services/language.service';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  let tokenStorage: { getAccessToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    tokenStorage = { getAccessToken: vi.fn().mockReturnValue(null) };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NotificationService,
        { provide: TokenStorageService, useValue: tokenStorage },
        { provide: LanguageService, useValue: { translate: (key: string) => key } },
      ],
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.stopSession();
  });

  it('does not poll without a token', () => {
    service.startSession();
    httpMock.verify();
  });

  it('loads notifications once a token is present', () => {
    tokenStorage.getAccessToken.mockReturnValue('jwt');
    service.startSession();

    httpMock
      .expectOne(
        (req) =>
          req.method === 'POST' && req.url === `${environment.notificationApiUrl}/notifications/bootstrap`,
      )
      .flush({ created: 9 });
    httpMock
      .expectOne(
        (req) =>
          req.method === 'GET' && req.url === `${environment.notificationApiUrl}/notifications`,
      )
      .flush({
        content: [
          {
            id: 'n-1',
            userId: 'u-1',
            notificationType: 'REMINDER',
            title: 'Drink water',
            message: 'Hydrate',
            channel: 'IN_APP',
            status: 'SENT',
            scheduledAt: new Date().toISOString(),
            sentAt: new Date().toISOString(),
            readAt: null,
            retryCount: 0,
            reminderId: null,
            sourceType: 'WELLNESS_GOAL',
            sourceResourceId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
      });

    expect(service.unreadCount()).toBe(1);
    service.stopSession();
    httpMock.verify();
  });
});
