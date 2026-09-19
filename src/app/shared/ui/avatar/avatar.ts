import { Component, computed, input } from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  template: `
    @if (src()) {
      <img
        [src]="src()"
        [alt]="name()"
        class="h-full w-full object-cover"
        draggable="false"
      />
    } @else {
      <span aria-hidden="true">{{ initials() }}</span>
    }
  `,
  host: {
    'class':
      'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent font-medium text-white',
    '[class.h-8]': 'size() === "sm"',
    '[class.w-8]': 'size() === "sm"',
    '[class.h-10]': 'size() === "md"',
    '[class.w-10]': 'size() === "md"',
    '[class.h-12]': 'size() === "lg"',
    '[class.w-12]': 'size() === "lg"',
    '[class.h-16]': 'size() === "xl"',
    '[class.w-16]': 'size() === "xl"',
    '[class.ring-2]': 'ring()',
    '[class.ring-white]': 'ring()',
    'role': 'img',
    '[attr.aria-label]': 'name()',
  },
})
export class Avatar {
  readonly name = input<string>('');
  readonly src = input<string | null>(null);
  readonly size = input<AvatarSize>('md');
  readonly ring = input(false);

  protected readonly initials = computed(() => {
    const name = this.name().trim();
    if (!name) {
      return '?';
    }
    const parts = name.split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts.length > 1 ? (parts[1]?.charAt(0) ?? '') : '';
    return (first + second).toUpperCase();
  });
}
