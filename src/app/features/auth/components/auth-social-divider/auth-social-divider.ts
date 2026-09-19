import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-social-divider',
  template: `
    <div class="flex items-center gap-4" role="separator" [attr.aria-label]="label()">
      <span class="h-px flex-1 bg-line" aria-hidden="true"></span>
      <span class="text-xs font-medium uppercase tracking-wide text-ink-faint">{{ label() }}</span>
      <span class="h-px flex-1 bg-line" aria-hidden="true"></span>
    </div>
  `,
})
export class AuthSocialDivider {
  readonly label = input.required<string>();
}
