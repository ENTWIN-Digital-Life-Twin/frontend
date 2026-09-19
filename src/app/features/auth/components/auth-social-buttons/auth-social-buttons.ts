import { Component, inject, signal } from '@angular/core';
import { LucideApple, LucideInfo } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';

const BUTTON_CLASSES =
  'inline-flex h-11 items-center justify-center gap-2.5 rounded-panel border border-line bg-surface text-sm font-medium text-ink shadow-soft transition-all duration-200 hover:border-accent/40 hover:bg-surface-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.98]';

@Component({
  selector: 'app-auth-social-buttons',
  template: `
    <div class="grid grid-cols-2 gap-3">
      <button type="button" [class]="BUTTON_CLASSES" (click)="onSocial()">
        <svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
          />
        </svg>
        {{ google() }}
      </button>

      <button type="button" [class]="BUTTON_CLASSES" (click)="onSocial()">
        <svg lucideApple class="h-4 w-4" aria-hidden="true"></svg>
        {{ apple() }}
      </button>
    </div>

    @if (noticeOpen()) {
      <p
        class="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-accent-dark"
        role="status"
      >
        <svg lucideInfo class="h-3.5 w-3.5 shrink-0" aria-hidden="true"></svg>
        {{ notice() }}
      </p>
    }
  `,
  imports: [LucideApple, LucideInfo],
})
export class AuthSocialButtons {
  private readonly languageService = inject(LanguageService);

  protected readonly BUTTON_CLASSES = BUTTON_CLASSES;
  protected readonly google = this.languageService.translateSignal('auth.social.google');
  protected readonly apple = this.languageService.translateSignal('auth.social.apple');
  protected readonly notice = this.languageService.translateSignal('auth.social.notice');

  protected readonly noticeOpen = signal(false);

  protected onSocial(): void {
    this.noticeOpen.set(true);
  }
}
