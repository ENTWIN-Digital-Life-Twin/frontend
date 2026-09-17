import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleIdentityService } from './google-identity.service';

describe('GoogleIdentityService', () => {
  let service: GoogleIdentityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoogleIdentityService],
    });
    service = TestBed.inject(GoogleIdentityService);
  });

  it('returns a Google ID token from the GIS callback', async () => {
    const initialize = vi.fn((config: { callback: (response: { credential: string }) => void }) => {
      config.callback({ credential: 'gis-id-token' });
    });
    const prompt = vi.fn();
    (window as Window & { google?: unknown }).google = {
      accounts: {
        id: {
          initialize,
          prompt,
          renderButton: vi.fn(),
          cancel: vi.fn(),
        },
      },
    };

    const credential = await new Promise<string>((resolve, reject) => {
      service.requestIdToken().subscribe({ next: resolve, error: reject });
    });

    expect(initialize).toHaveBeenCalled();
    expect(prompt).toHaveBeenCalled();
    expect(credential).toBe('gis-id-token');
  });

  it('maps a dismissed Google popup to google_popup_closed', async () => {
    const initialize = vi.fn();
    const prompt = vi.fn((listener: (notification: {
      isNotDisplayed: () => boolean;
      isSkippedMoment: () => boolean;
      isDismissedMoment: () => boolean;
      getDismissedReason?: () => string;
    }) => void) => {
      listener({
        isNotDisplayed: () => false,
        isSkippedMoment: () => false,
        isDismissedMoment: () => true,
        getDismissedReason: () => 'cancel_called',
      });
    });
    (window as Window & { google?: unknown }).google = {
      accounts: {
        id: {
          initialize,
          prompt,
          renderButton: vi.fn(),
          cancel: vi.fn(),
        },
      },
    };

    const code = await new Promise<string>((resolve) => {
      service.requestIdToken().subscribe({
        next: () => resolve('unexpected-success'),
        error: (error: Error) => resolve(error.message),
      });
    });

    expect(code).toBe('google_popup_closed');
  });
});
