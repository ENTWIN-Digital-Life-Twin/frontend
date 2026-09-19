import {
  Component,
  HostListener,
  effect,
  inject,
  input,
  model,
  viewChild,
  ElementRef,
} from '@angular/core';

@Component({
  selector: 'app-drawer',
  template: `
    <div
      class="fixed inset-0 z-40 bg-primary-darker/50 backdrop-blur-sm transition-opacity duration-300"
      [class.opacity-100]="open()"
      [class.opacity-0]="!open()"
      [class.pointer-events-auto]="open()"
      [class.pointer-events-none]="!open()"
      (click)="close()"
      aria-hidden="true"
    ></div>
    <div
      #panelRef
      class="fixed inset-y-0 z-50 flex w-80 max-w-[85vw] flex-col overflow-y-auto shadow-drawer transition-transform duration-300 ease-out-expo"
      [class.bg-surface]="tone() === 'surface'"
      [class.bg-gradient-to-b]="tone() === 'navy'"
      [class.from-primary]="tone() === 'navy'"
      [class.to-primary-dark]="tone() === 'navy'"
      [class.drawer-left]="side() === 'left'"
      [class.drawer-right]="side() === 'right'"
      [class.drawer-open]="open()"
      [attr.inert]="!open() ? '' : null"
      [attr.aria-hidden]="!open()"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
    >
      <ng-content />
    </div>
  `,
})
export class Drawer {
  readonly open = model(false);
  readonly side = input<'left' | 'right'>('left');
  readonly tone = input<'surface' | 'navy'>('surface');

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panelRef');

  constructor() {
    effect(() => {
      document.body.classList.toggle('overflow-hidden', this.open());
      if (this.open()) {
        this.panel()?.nativeElement.focus();
      }
    });
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  close(): void {
    this.open.set(false);
  }
}
