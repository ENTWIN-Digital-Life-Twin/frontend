import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), DashboardService],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('treats an empty upcoming event as loaded, not an error', () => {
    let result: unknown = 'unset';
    service.loadUpcomingEvent().subscribe((event) => {
      result = event;
    });

    httpMock
      .expectOne(`${environment.planningApiUrl}/dashboard/upcoming`)
      .flush(null, { status: 204, statusText: 'No Content' });

    expect(result).toBeNull();
    expect(service.upcomingEvent()).toBeNull();
    expect(service.state().upcoming).toBe('loaded');
  });

  it('stores an upcoming event body', () => {
    const event = {
      id: 'evt-1',
      time: '14:00 - 15:00',
      title: 'Sprint',
      location: 'Room A',
      eventType: 'APPOINTMENT',
    };

    service.loadUpcomingEvent().subscribe();
    httpMock.expectOne(`${environment.planningApiUrl}/dashboard/upcoming`).flush(event);

    expect(service.upcomingEvent()).toEqual(event);
    expect(service.state().upcoming).toBe('loaded');
  });
});
