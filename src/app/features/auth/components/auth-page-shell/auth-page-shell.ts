import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-page-shell',
  template: `
    <div
      class="mx-auto w-full rounded-2xl border border-line bg-surface px-6 py-8 shadow-card sm:px-8 sm:py-10 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
      [class.max-w-lg]="wide()"
      [class.max-w-md]="!wide()"
      [class.lg:max-w-lg]="wide()"
      [class.lg:max-w-md]="!wide()"
    >
      <ng-content />
    </div>
  `,
})
export class AuthPageShell {
  readonly wide = input(false);
}
