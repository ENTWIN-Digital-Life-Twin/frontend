import {
  Component,
  Directive,
  HostListener,
  inject,
  input,
  signal,
  ElementRef,
} from '@angular/core';

@Directive({
  selector: 'app-dropdown',
  exportAs: 'dropdown',
  host: {
    class: 'relative inline-block',
  },
})
export class Dropdown {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly open = signal(false);

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  toggle(): void {
    this.open.set(!this.open());
  }

  close(): void {
    this.open.set(false);
  }
}

@Directive({
  selector: '[appDropdownTrigger]',
  host: {
    '[attr.aria-expanded]': 'dropdown.open()',
    '[attr.aria-haspopup]': '"menu"',
    'type': 'button',
  },
})
export class DropdownTrigger {
  protected readonly dropdown = inject(Dropdown);

  @HostListener('click')
  onClick(): void {
    this.dropdown.toggle();
  }
}

@Component({
  selector: 'app-dropdown-menu',
  template: `
    @if (dropdown.open()) {
      <div
        class="absolute z-50 mt-2 min-w-[13rem] overflow-hidden rounded-card border border-line bg-surface p-1.5 shadow-popover"
        [class]="panelClass()"
        [class.end-0]="align() === 'end'"
        [class.start-0]="align() === 'start'"
        role="menu"
        [attr.aria-label]="ariaLabel() ?? null"
      >
        <ng-content />
      </div>
    }
  `,
})
export class DropdownMenu {
  readonly align = input<'start' | 'end'>('end');
  readonly ariaLabel = input<string | null>(null);
  readonly panelClass = input('');
  protected readonly dropdown = inject(Dropdown);
}

@Directive({
  selector: '[appDropdownItem]',
  host: {
    'class':
      'flex w-full cursor-pointer select-none items-center gap-2.5 rounded-panel px-3 py-2 text-start text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-primary',
    '[attr.role]': '"menuitem"',
    '[tabindex]': '"0"',
  },
})
export class DropdownItem {
  private readonly dropdown = inject(Dropdown);

  @HostListener('click')
  onClick(): void {
    this.dropdown.close();
  }

  @HostListener('keydown.enter', ['$event'])
  onEnter(event: Event): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).click();
  }
}
