import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-auth-footer',
  template: `
    <footer class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-faint">
      <a href="#" class="transition-colors duration-200 hover:text-primary" (click)="$event.preventDefault()">
        {{ terms() }}
      </a>
      <a href="#" class="transition-colors duration-200 hover:text-primary" (click)="$event.preventDefault()">
        {{ privacy() }}
      </a>
      <a href="#" class="transition-colors duration-200 hover:text-primary" (click)="$event.preventDefault()">
        {{ help() }}
      </a>
      <span class="w-full text-center sm:w-auto">{{ copyright() }}</span>
    </footer>
  `,
})
export class AuthFooter {
  private readonly languageService = inject(LanguageService);

  protected readonly terms = this.languageService.translateSignal('auth.footer.terms');
  protected readonly privacy = this.languageService.translateSignal('auth.footer.privacy');
  protected readonly help = this.languageService.translateSignal('auth.footer.help');

  protected readonly copyright = computed(() =>
    this.languageService.translate('auth.footer.copyright', {
      year: String(new Date().getFullYear()),
    }),
  );
}
