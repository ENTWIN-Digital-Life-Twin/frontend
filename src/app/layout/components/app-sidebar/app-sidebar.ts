import { Component } from '@angular/core';
import { SidebarContent } from '../sidebar-content/sidebar-content';

@Component({
  selector: 'app-sidebar',
  template: `
    <aside
      class="fixed inset-y-0 start-0 z-30 hidden w-[280px] flex-col overflow-hidden border-e border-white/5 bg-gradient-to-b from-primary via-primary to-primary-dark lg:flex"
    >
      <app-sidebar-content />
    </aside>
  `,
  imports: [SidebarContent],
})
export class Sidebar {}
