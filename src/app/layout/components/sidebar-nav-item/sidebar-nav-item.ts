import { Component, computed, inject, input, output } from '@angular/core';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import type { NavItem } from '../../../core/models/navigation';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-sidebar-nav-item',
  template: `
    <a
      [routerLink]="item().path"
      [class]="linkClasses()"
      [attr.aria-current]="active() ? 'page' : null"
      [attr.title]="label()"
      (click)="onNavigate()"
    >
      <span
        class="absolute start-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent transition-all duration-200"
        [class.opacity-100]="active()"
        [class.opacity-0]="!active()"
      ></span>
      <svg
        [lucideIcon]="item().icon"
        class="h-[18px] w-[18px] shrink-0 transition-colors duration-200"
        [class]="iconClasses()"
        aria-hidden="true"
      ></svg>
      <span class="truncate">{{ label() }}</span>
    </a>
  `,
  imports: [RouterLink, LucideDynamicIcon],
})
export class SidebarNavItem {
  readonly item = input.required<NavItem>();
  readonly navigate = output<void>();

  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly label = computed(() =>
    this.languageService.translate<string>(this.item().labelKey),
  );

  protected readonly active = computed(() => this.url().split('?')[0] === this.item().path);

  protected readonly linkClasses = computed(() => {
    const base =
      'group relative flex items-center gap-3 rounded-panel px-3 py-2.5 text-sm font-medium transition-all duration-200';
    const state = this.active()
      ? 'bg-white/10 text-white shadow-sm shadow-black/10'
      : 'text-white/65 hover:bg-white/5 hover:text-white';
    return `${base} ${state}`;
  });

  protected readonly iconClasses = computed(() =>
    this.active() ? 'text-accent-lighter' : 'text-white/45 group-hover:text-teal-200',
  );

  protected onNavigate(): void {
    this.navigate.emit();
  }
}
