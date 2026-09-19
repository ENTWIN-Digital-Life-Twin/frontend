import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-page-shell',
  template: `
    <div
      class="mx-auto w-full max-w-md rounded-2xl border border-line bg-surface px-6 py-8 shadow-card sm:px-8 sm:py-10 lg:max-w-md lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
    >
      <ng-content />
    </div>
  `,
})
export class AuthPageShell {}
