import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-auth-footer',
  imports: [RouterLink],
  template: `
    <footer class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-1 text-xs text-ink-faint">
      <a routerLink="/terms" class="transition-colors duration-200 hover:text-primary">{{ terms() }}</a>
      <a routerLink="/privacy" class="transition-colors duration-200 hover:text-primary">{{ privacy() }}</a>
      <a routerLink="/contact" class="transition-colors duration-200 hover:text-primary">{{ help() }}</a>
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
