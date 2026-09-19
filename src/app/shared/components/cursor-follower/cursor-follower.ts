import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, label, summary, [data-cursor]';

/**
 * Premium cursor-following ring driven by GSAP quickTo.
 * Disabled automatically on touch devices and with prefers-reduced-motion.
 * GSAP is dynamically imported only when the feature is active.
 */
@Component({
  selector: 'app-cursor-follower',
  template: ` @if (enabled()) {
    <div #ring class="cursor-ring" aria-hidden="true"></div>
  }`,
  styles: [
    `
      :host {
        display: block;
      }
      .cursor-ring {
        position: fixed;
        top: 0;
        left: 0;
        width: 28px;
        height: 28px;
        margin: -14px 0 0 -14px;
        border-radius: 9999px;
        border: 1px solid rgb(42 157 157 / 0.35);
        background: radial-gradient(circle at center, rgb(42 157 157 / 0.08), transparent 70%);
        box-shadow: 0 0 14px rgb(42 157 157 / 0.1);
        pointer-events: none;
        z-index: 999;
        will-change: transform;
        opacity: 0;
      }
      .cursor-ring.is-hover {
        border-color: rgb(42 157 157 / 0.7);
        background: radial-gradient(circle at center, rgb(42 157 157 / 0.12), transparent 70%);
      }
    `,
  ],
})
export class CursorFollower implements AfterViewInit, OnDestroy {
  readonly enabled = signal(true);

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ring = viewChild<ElementRef<HTMLElement>>('ring');

  private gsap: typeof import('gsap')['default'] | null = null;
  private xTo: ((value: number) => void) | null = null;
  private yTo: ((value: number) => void) | null = null;
  private hovered = false;

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.xTo?.(event.clientX);
    this.yTo?.(event.clientY);
    const interactive = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest(INTERACTIVE_SELECTOR);
    this.setHover(Boolean(interactive));
  };

  private readonly onPointerLeave = (): void => {
    this.setHover(false);
  };

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) {
      this.setHover(false);
    }
  };

  constructor() {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduced) {
      this.enabled.set(false);
    }
  }

  ngAfterViewInit(): void {
    if (!this.enabled()) {
      return;
    }
    const ring = this.ring()?.nativeElement;
    if (!ring) {
      return;
    }
    import('gsap').then((gsapModule) => {
      this.gsap = gsapModule.default;
      this.gsap.set(ring, { x: -100, y: -100 });
      this.xTo = this.gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
      this.yTo = this.gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      window.addEventListener('pointerleave', this.onPointerLeave);
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    });
  }

  private setHover(value: boolean): void {
    if (this.hovered === value) {
      return;
    }
    this.hovered = value;
    const ring = this.ring()?.nativeElement;
    if (!ring || !this.gsap) {
      return;
    }
    this.gsap.to(ring, {
      opacity: value ? 0.9 : 0.35,
      scale: value ? 1.6 : 1,
      duration: 0.35,
      ease: 'power2.out',
    });
    ring.classList.toggle('is-hover', value);
  }

  ngOnDestroy(): void {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerleave', this.onPointerLeave);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    const ring = this.ring()?.nativeElement;
    if (ring && this.gsap) {
      this.gsap.killTweensOf(ring);
    }
  }
}
