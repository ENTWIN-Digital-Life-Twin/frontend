import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicFooter } from './components/public-footer/public-footer';
import { PublicNav } from './components/public-nav/public-nav';

@Component({
  selector: 'app-public-layout',
  template: `
    <app-public-nav />
    <main class="overflow-x-hidden">
      <router-outlet />
    </main>
    <app-public-footer />
  `,
  imports: [RouterOutlet, PublicNav, PublicFooter],
})
export class PublicLayout {}
