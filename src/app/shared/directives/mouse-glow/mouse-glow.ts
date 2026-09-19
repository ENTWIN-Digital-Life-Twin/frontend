import { Directive, ElementRef, HostListener, OnDestroy, inject, input } from '@angular/core';

/**
 * Subtle pointer-following glow for hero / showcase surfaces.
 * The directive exposes `--glow-x` / `--glow-y` CSS variables on its host;
 * a descendant overlay can read them via a radial-gradient.
 *
 * Pointer events are coalesced into one requestAnimationFrame tick that reads
 * the rect once and then writes both CSS variables, avoiding alternating
 * read/write cycles (forced synchronous layouts) on every pointermove.
 */
@Directive({
  selector: '[appMouseGlow]',
})
export class MouseGlow implements OnDestroy {
  readonly strength = input(1, { alias: 'appMouseGlowStrength' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private frame: number | null = null;
  private pendingEvent: PointerEvent | null = null;
  private leavePending = false;

  private get finePointer(): boolean {
    return !window.matchMedia('(pointer: coarse)').matches;
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.finePointer) {
      return;
    }
    this.pendingEvent = event;
    this.schedule();
  }

  @HostListener('pointerleave')
  onPointerLeave(): void {
    this.leavePending = true;
    this.schedule();
  }

  private schedule(): void {
    if (this.frame !== null) {
      return;
    }
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      const el = this.host.nativeElement;
      if (this.leavePending && !this.pendingEvent) {
        this.leavePending = false;
        el.style.setProperty('--glow-x', '50%');
        el.style.setProperty('--glow-y', '50%');
        return;
      }
      const event = this.pendingEvent;
      this.pendingEvent = null;
      this.leavePending = false;
      if (!event) {
        return;
      }
      // Single layout read per frame, followed by style writes only.
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      el.style.setProperty('--glow-x', `${x}px`);
      el.style.setProperty('--glow-y', `${y}px`);
    });
  }

  ngOnDestroy(): void {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }
}
