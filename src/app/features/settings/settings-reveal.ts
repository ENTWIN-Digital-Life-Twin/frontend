import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';
import { SettingsService } from './services/settings.service';

/**
 * Entrance animation for settings sections. Respects both the OS
 * prefers-reduced-motion setting and the in-app "Réduire les animations"
 * preference.
 */
@Directive({
  selector: '[appSettingsReveal]',
})
export class SettingsReveal implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly settings = inject(SettingsService);

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (this.settings.state().accessibility.reduceMotion) {
      return;
    }
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        this.host.nativeElement,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
          clearProps: 'transform',
        },
      );
    });
  }
}
