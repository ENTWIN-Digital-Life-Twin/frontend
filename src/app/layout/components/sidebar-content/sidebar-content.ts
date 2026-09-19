import { Component, computed, inject, output } from '@angular/core';
import { ACCOUNT_ITEMS, NAV_SECTIONS } from '../../../core/models/navigation';
import { BrandLogo } from '../../../shared/components/brand-logo/brand-logo';
import { SidebarNavItem } from '../sidebar-nav-item/sidebar-nav-item';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-sidebar-content',
  template: `
    <div class="flex h-full flex-col">
      <div class="shrink-0 border-b border-white/5 px-5 pt-6 pb-5">
        <app-brand-logo
          tone="light"
          size="md"
          link="/dashboard"
        />
      </div>

      <div class="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        @for (section of sections(); track $index) {
          <div class="mb-6">
            <p
              class="mb-2.5 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50"
            >
              {{ section.label }}
            </p>
            <ul class="space-y-1">
              @for (item of section.items; track item.path) {
                <li>
                  <app-sidebar-nav-item [item]="item" (navigate)="onNavigate()" />
                </li>
              }
            </ul>
          </div>
        }
      </div>

      <div class="shrink-0 border-t border-white/5 px-3 py-3">
        <p
          class="mb-2.5 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50"
        >
          {{ accountLabel() }}
        </p>
        <ul class="space-y-1">
          @for (item of accountItems; track item.path) {
            <li>
              <app-sidebar-nav-item [item]="item" (navigate)="onNavigate()" />
            </li>
          }
        </ul>
        <p class="mt-4 px-3 text-[11px] font-medium tracking-wide text-white/35">
          Digital Life Twin · {{ version() }}
        </p>
      </div>
    </div>
  `,
  imports: [BrandLogo, SidebarNavItem],
})
export class SidebarContent {
  readonly navigate = output<void>();

  private readonly languageService = inject(LanguageService);

  protected readonly accountLabel = computed(() =>
    this.languageService.translate<string>('sidebar.account.title'),
  );

  protected readonly version = computed(() =>
    this.languageService.translate<string>('footer.version'),
  );

  protected readonly sections = computed(() =>
    NAV_SECTIONS.map((section) => ({
      label: this.languageService.translate<string>(section.labelKey),
      items: section.items,
    })),
  );

  protected readonly accountItems = ACCOUNT_ITEMS;

  protected onNavigate(): void {
    this.navigate.emit();
  }
}
