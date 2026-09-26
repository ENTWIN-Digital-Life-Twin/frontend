import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';
import { AuthService, type AdminContact, type AdminStats, type UserProfile } from '../../core/services/auth/auth.service';
import { Badge } from '../../shared/ui/badge/badge';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-admin',
  imports: [Badge, Button, DatePipe],
  template: `
    <div class="space-y-6">
      <header>
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">{{ eyebrow() }}</p>
        <h1 class="mt-0.5 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {{ title() }}
        </h1>
        <p class="mt-1 text-sm text-ink-muted">{{ description() }}</p>
      </header>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-xs text-ink-muted">{{ usersLabel() }}</p>
          <p class="mt-1 font-display text-2xl font-bold text-primary">{{ stats()?.totalUsers ?? '—' }}</p>
        </article>
        <article class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-xs text-ink-muted">{{ activeLabel() }}</p>
          <p class="mt-1 font-display text-2xl font-bold text-primary">{{ stats()?.activeUsers ?? '—' }}</p>
        </article>
        <article class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-xs text-ink-muted">{{ adminsLabel() }}</p>
          <p class="mt-1 font-display text-2xl font-bold text-primary">{{ stats()?.adminUsers ?? '—' }}</p>
        </article>
        <article class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-xs text-ink-muted">{{ contactsLabel() }}</p>
          <p class="mt-1 font-display text-2xl font-bold text-primary">{{ stats()?.contactMessages ?? '—' }}</p>
        </article>
      </section>

      <section class="rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 class="font-display text-lg font-semibold text-primary">{{ usersTitle() }}</h2>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[40rem] text-left text-sm">
            <thead class="text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th class="pb-2 font-medium">{{ nameCol() }}</th>
                <th class="pb-2 font-medium">{{ emailCol() }}</th>
                <th class="pb-2 font-medium">{{ statusCol() }}</th>
                <th class="pb-2 font-medium">{{ rolesCol() }}</th>
                <th class="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              @for (user of users(); track user.id) {
                <tr>
                  <td class="py-3 font-medium text-primary">{{ user.firstName }} {{ user.lastName }}</td>
                  <td class="py-3 text-ink-muted">{{ user.email }}</td>
                  <td class="py-3">
                    <app-badge [variant]="user.accountStatus === 'ACTIVE' ? 'accent' : 'neutral'">
                      {{ user.accountStatus }}
                    </app-badge>
                  </td>
                  <td class="py-3 text-ink-muted">{{ user.roles.join(', ') }}</td>
                  <td class="py-3 text-right">
                    @if (user.id !== currentUserId()) {
                      <button
                        appButton
                        variant="secondary"
                        size="sm"
                        (click)="toggleStatus(user)"
                      >
                        {{ user.accountStatus === 'ACTIVE' ? disableLabel() : enableLabel() }}
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-card border border-line bg-surface p-5 shadow-card">
        <h2 class="font-display text-lg font-semibold text-primary">{{ contactsTitle() }}</h2>
        <ul class="mt-4 space-y-3">
          @for (item of contacts(); track item.id) {
            <li class="rounded-panel border border-line p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="font-semibold text-primary">{{ item.subject }}</p>
                <p class="text-xs text-ink-faint">{{ item.createdAt | date: 'short' }}</p>
              </div>
              <p class="mt-1 text-xs text-ink-muted">{{ item.name }} · {{ item.email }}</p>
              <p class="mt-2 text-sm text-ink">{{ item.message }}</p>
            </li>
          } @empty {
            <p class="text-sm text-ink-muted">{{ noContacts() }}</p>
          }
        </ul>
      </section>
    </div>
  `,
})
export class AdminComponent {
  private readonly languageService = inject(LanguageService);
  private readonly auth = inject(AuthService);

  protected readonly eyebrow = this.languageService.translateSignal('adminPage.eyebrow');
  protected readonly title = this.languageService.translateSignal('adminPage.title');
  protected readonly description = this.languageService.translateSignal('adminPage.description');
  protected readonly usersLabel = this.languageService.translateSignal('adminPage.users');
  protected readonly activeLabel = this.languageService.translateSignal('adminPage.active');
  protected readonly adminsLabel = this.languageService.translateSignal('adminPage.admins');
  protected readonly contactsLabel = this.languageService.translateSignal('adminPage.contacts');
  protected readonly usersTitle = this.languageService.translateSignal('adminPage.usersTitle');
  protected readonly contactsTitle = this.languageService.translateSignal('adminPage.contactsTitle');
  protected readonly nameCol = this.languageService.translateSignal('adminPage.name');
  protected readonly emailCol = this.languageService.translateSignal('adminPage.email');
  protected readonly statusCol = this.languageService.translateSignal('adminPage.status');
  protected readonly rolesCol = this.languageService.translateSignal('adminPage.roles');
  protected readonly disableLabel = this.languageService.translateSignal('adminPage.disable');
  protected readonly enableLabel = this.languageService.translateSignal('adminPage.enable');
  protected readonly noContacts = this.languageService.translateSignal('adminPage.noContacts');

  protected readonly stats = signal<AdminStats | null>(null);
  protected readonly users = signal<UserProfile[]>([]);
  protected readonly contacts = signal<AdminContact[]>([]);
  protected readonly currentUserId = () => this.auth.currentUser()?.id ?? '';

  constructor() {
    this.refresh();
  }

  protected toggleStatus(user: UserProfile): void {
    const next = user.accountStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    this.auth.updateAccountStatus(user.id, next).subscribe({
      next: () => this.refresh(),
      error: () => void 0,
    });
  }

  private refresh(): void {
    this.auth.adminStats().subscribe({ next: (value) => this.stats.set(value), error: () => void 0 });
    this.auth.adminUsers().subscribe({ next: (value) => this.users.set(value), error: () => void 0 });
    this.auth.adminContacts().subscribe({ next: (value) => this.contacts.set(value), error: () => void 0 });
  }
}
