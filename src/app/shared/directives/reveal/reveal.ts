import {
  AfterViewInit,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';

/**
 * Scroll-triggered reveal using GSAP + IntersectionObserver.
 * Apply on a section/card to reveal it on scroll; pass `revealStagger`
 * (a CSS selector) to stagger its direct children instead.
 * GSAP is dynamically imported only on capable devices.
 *
 * The "already visible at load" decision runs inside the IntersectionObserver's
 * first callback (async, post-layout) instead of reading getBoundingClientRect
 * during startup: a synchronous layout read right after Angular mounts the page
 * forced a full-page reflow on the critical rendering path.
 */
@Directive({
  selector: '[appReveal]',
})
export class Reveal implements AfterViewInit {
  readonly stagger = input<string | null>(null, { alias: 'revealStagger' });
  readonly delay = input(0, { alias: 'revealDelay' });
  readonly distance = input(24, { alias: 'revealDistance' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const selector = this.stagger();
    const targets: HTMLElement[] = selector
      ? Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(selector))
      : [this.host.nativeElement];
    if (!targets.length) {
      return;
    }

    // Content is never opacity-hidden: it stays fully readable at all times
    // (including fast scroll and page captures). Elements that start below the
    // fold get a subtle slide-up as the user scrolls, via transform only.
    const distance = this.distance();
    const delayMs = this.delay();

    import('gsap').then((gsapModule) => {
      const gsap = gsapModule.default;

      let decided = false;
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) {
            return;
          }
          if (!decided) {
            decided = true;
            // Mirror the previous startup check: elements already (nearly)
            // visible must NOT animate. The rect read here runs after layout,
            // so it never forces a synchronous reflow.
            if (entry.boundingClientRect.top < window.innerHeight * 0.9) {
              observer.disconnect();
              return;
            }
            gsap.set(targets, { y: distance });
          }
          if (!entry.isIntersecting) {
            return;
          }
          observer.disconnect();
          gsap.to(targets, {
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            stagger: selector ? 0.08 : 0,
            delay: delayMs / 1000,
            clearProps: 'transform',
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      );
      observer.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
