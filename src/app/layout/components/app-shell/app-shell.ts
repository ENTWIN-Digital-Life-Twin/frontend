import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from '../app-header/app-header';
import { Sidebar } from '../app-sidebar/app-sidebar';
import { SidebarContent } from '../sidebar-content/sidebar-content';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { BottomNav } from '../bottom-nav/bottom-nav';
import { NotificationService } from '../../../features/notifications/services/notification.service';
import { ReminderService } from '../../../features/notifications/services/reminder.service';

@Component({
  selector: 'app-shell',
  template: `
    <div class="min-h-dvh bg-background">
      <app-sidebar />

      <div class="min-h-dvh pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:ps-[280px] lg:pb-0">
        <app-header (menu)="drawerOpen.set(true)" />
        <main #page class="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <router-outlet />
        </main>
      </div>

      <app-bottom-nav (more)="drawerOpen.set(true)" />

      <app-drawer [(open)]="drawerOpen" side="left" tone="navy">
        <app-sidebar-content (navigate)="drawerOpen.set(false)" />
      </app-drawer>
    </div>
  `,
  imports: [RouterOutlet, Header, Sidebar, SidebarContent, Drawer, BottomNav],
})
export class AppShell {
  readonly drawerOpen = signal(false);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly page = viewChild<ElementRef<HTMLElement>>('page');
  private readonly notifications = inject(NotificationService);
  private readonly reminders = inject(ReminderService);

  constructor() {
    this.reminders.startSession();
    this.notifications.startSession();
    this.destroyRef.onDestroy(() => {
      this.reminders.stopSession();
      this.notifications.stopSession();
    });
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.animatePage());
  }

  private animatePage(): void {
    const el = this.page()?.nativeElement;
    if (!el) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', clearProps: 'transform' },
      );
    });
  }
}
