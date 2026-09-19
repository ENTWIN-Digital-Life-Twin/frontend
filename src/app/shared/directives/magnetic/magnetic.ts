import { AfterViewInit, Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';

/**
 * Very subtle magnetic pull toward the pointer. Only active on fine pointers
 * with motion enabled. Keep the strength low for a premium feel.
 * GSAP is dynamically imported only on capable devices.
 *
 * Pointer events are coalesced into one requestAnimationFrame tick that reads
 * the rect once and then feeds the tweens, avoiding alternating read/write
 * cycles (forced synchronous layouts) on every pointermove.
 */
@Directive({
  selector: '[appMagnetic]',
  host: {
    '(pointermove)': 'onPointerMove($event)',
    '(pointerleave)': 'onPointerLeave()',
  },
})
export class Magnetic implements AfterViewInit, OnDestroy {
  /** Movement strength in percent of the distance to the center (0.15 = 15%). */
  readonly strength = input(0.15, { alias: 'appMagneticStrength' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private gsap: typeof import('gsap')['default'] | null = null;
  private xTo: ((value: number) => void) | null = null;
  private yTo: ((value: number) => void) | null = null;
  private enabled = false;
  private frame: number | null = null;
  private pendingEvent: PointerEvent | null = null;

  ngAfterViewInit(): void {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    import('gsap').then((gsapModule) => {
      this.gsap = gsapModule.default;
      this.enabled = true;
      this.xTo = this.gsap.quickTo(this.host.nativeElement, 'x', {
        duration: 0.4,
        ease: 'power3.out',
      });
      this.yTo = this.gsap.quickTo(this.host.nativeElement, 'y', {
        duration: 0.4,
        ease: 'power3.out',
      });
    });
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.enabled) {
      return;
    }
    this.pendingEvent = event;
    this.schedule();
  }

  onPointerLeave(): void {
    if (this.frame !== null && this.pendingEvent) {
      // Flush the pending position so the release starts from it.
      this.applyPending();
    }
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    this.pendingEvent = null;
    this.xTo?.(0);
    this.yTo?.(0);
  }

  private schedule(): void {
    if (this.frame !== null) {
      return;
    }
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.applyPending();
    });
  }

  private applyPending(): void {
    const event = this.pendingEvent;
    this.pendingEvent = null;
    if (!event) {
      return;
    }
    // Single layout read per frame, followed by tween writes only.
    const el = this.host.nativeElement;
    const rect = el.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    this.xTo?.(relX * this.strength());
    this.yTo?.(relY * this.strength());
  }

  ngOnDestroy(): void {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    if (this.gsap) {
      this.gsap.killTweensOf(this.host.nativeElement);
    }
  }
}
