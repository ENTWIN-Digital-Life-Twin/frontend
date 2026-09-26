import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import {
  LucideMail,
  LucideSearch,
  LucideTrash2,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { LanguageService } from '../../core/services/language.service';
import { AuthService, type AdminContact, type AdminStats, type UserProfile } from '../../core/services/auth/auth.service';
import { Badge } from '../../shared/ui/badge/badge';
import { Button } from '../../shared/ui/button/button';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { InputDirective } from '../../shared/directives/field-control/field-control';

type AdminTab = 'overview' | 'users' | 'messages';
type StatusFilter = 'all' | 'ACTIVE' | 'DISABLED' | 'BLOCKED';
type RoleFilter = 'all' | 'admin' | 'user';

@Component({
  selector: 'app-admin',
  imports: [
    Badge,
    Button,
    DatePipe,
    Drawer,
    EmptyState,
    InputDirective,
    LucideSearch,
    LucideTrash2,
    LucideX,
  ],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">{{ eyebrow() }}</p>
          <h1 class="mt-0.5 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {{ title() }}
          </h1>
          <p class="mt-1 text-sm text-ink-muted">{{ description() }}</p>
        </div>
        <button appButton variant="secondary" size="md" (click)="refresh()" [disabled]="loading()">
          {{ retryLabel() }}
        </button>
      </header>

      @if (loadError()) {
        <p class="rounded-panel border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger">
          {{ loadErrorLabel() }}
        </p>
      }
      @if (actionError()) {
        <p class="rounded-panel border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger">
          {{ actionErrorLabel() }}
        </p>
      }

      <section class="flex flex-wrap gap-1 rounded-card border border-line bg-surface p-2 shadow-card">
        @for (item of tabs(); track item.id) {
          <button
            type="button"
            class="rounded-panel px-3 py-1.5 text-xs font-semibold transition-all duration-200"
            [class.bg-primary]="tab() === item.id"
            [class.text-white]="tab() === item.id"
            [class.shadow-soft]="tab() === item.id"
            [class.text-ink-muted]="tab() !== item.id"
            [class.hover:text-primary]="tab() !== item.id"
            (click)="tab.set(item.id)"
          >
            {{ item.label }}
          </button>
        }
      </section>

      @if (tab() === 'overview') {
        <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button type="button" class="rounded-card border border-line bg-surface p-4 text-start shadow-card" (click)="tab.set('users')">
            <p class="text-xs text-ink-muted">{{ usersLabel() }}</p>
            <p class="mt-1 font-display text-2xl font-bold text-primary">{{ stats()?.totalUsers ?? '—' }}</p>
          </button>
          <button type="button" class="rounded-card border border-line bg-surface p-4 text-start shadow-card" (click)="setStatusFilter('ACTIVE')">
            <p class="text-xs text-ink-muted">{{ activeLabel() }}</p>
            <p class="mt-1 font-display text-2xl font-bold text-primary">{{ stats()?.activeUsers ?? '—' }}</p>
          </button>
          <button type="button" class="rounded-card border border-line bg-surface p-4 text-start shadow-card" (click)="setRoleFilter('admin')">
            <p class="text-xs text-ink-muted">{{ adminsLabel() }}</p>
            <p class="mt-1 font-display text-2xl font-bold text-primary">{{ stats()?.adminUsers ?? '—' }}</p>
          </button>
          <button type="button" class="rounded-card border border-line bg-surface p-4 text-start shadow-card" (click)="tab.set('messages')">
            <p class="text-xs text-ink-muted">{{ contactsLabel() }}</p>
            <p class="mt-1 font-display text-2xl font-bold text-primary">{{ stats()?.contactMessages ?? '—' }}</p>
          </button>
        </section>

        <div class="grid gap-6 xl:grid-cols-2">
          <section class="rounded-card border border-line bg-surface p-5 shadow-card">
            <div class="flex items-center justify-between gap-2">
              <h2 class="font-display text-lg font-semibold text-primary">{{ recentUsersTitle() }}</h2>
              <button type="button" class="text-xs font-semibold text-accent-dark" (click)="tab.set('users')">
                {{ viewAllLabel() }}
              </button>
            </div>
            <ul class="mt-4 divide-y divide-line">
              @for (user of recentUsers(); track user.id) {
                <li>
                  <button type="button" class="flex w-full items-center justify-between gap-3 py-3 text-start" (click)="openUser(user)">
                    <span class="min-w-0">
                      <span class="block truncate font-medium text-primary">{{ displayName(user) }}</span>
                      <span class="block truncate text-xs text-ink-muted">{{ user.email }}</span>
                    </span>
                    <app-badge [variant]="statusVariant(user)">{{ statusLabel(user) }}</app-badge>
                  </button>
                </li>
              } @empty {
                <app-empty-state [icon]="usersIcon" [title]="noUsers()" />
              }
            </ul>
          </section>

          <section class="rounded-card border border-line bg-surface p-5 shadow-card">
            <div class="flex items-center justify-between gap-2">
              <h2 class="font-display text-lg font-semibold text-primary">{{ recentMessagesTitle() }}</h2>
              <button type="button" class="text-xs font-semibold text-accent-dark" (click)="tab.set('messages')">
                {{ viewAllLabel() }}
              </button>
            </div>
            <ul class="mt-4 divide-y divide-line">
              @for (item of recentContacts(); track item.id) {
                <li>
                  <button type="button" class="w-full py-3 text-start" (click)="openContact(item)">
                    <span class="flex items-start justify-between gap-2">
                      <span class="truncate font-medium text-primary">{{ item.subject }}</span>
                      <span class="shrink-0 text-xs text-ink-faint">{{ item.createdAt | date: 'short' }}</span>
                    </span>
                    <span class="mt-1 block truncate text-xs text-ink-muted">{{ item.name }} · {{ item.email }}</span>
                  </button>
                </li>
              } @empty {
                <app-empty-state [icon]="mailIcon" [title]="noContacts()" />
              }
            </ul>
          </section>
        </div>
      }

      @if (tab() === 'users') {
        <section class="space-y-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label class="relative block min-w-0 flex-1">
              <span class="sr-only">{{ searchUsers() }}</span>
              <svg lucideSearch class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true"></svg>
              <input
                appInput
                type="search"
                class="ps-10"
                [value]="userQuery()"
                [placeholder]="searchUsers()"
                (input)="userQuery.set($any($event.target).value)"
              />
            </label>
            <div class="flex flex-wrap gap-1 rounded-card border border-line bg-surface p-1">
              @for (filter of statusFilters(); track filter.id) {
                <button
                  type="button"
                  class="rounded-panel px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                  [class.bg-primary]="statusFilter() === filter.id"
                  [class.text-white]="statusFilter() === filter.id"
                  [class.text-ink-muted]="statusFilter() !== filter.id"
                  (click)="statusFilter.set(filter.id)"
                >
                  {{ filter.label }}
                </button>
              }
            </div>
            <div class="flex flex-wrap gap-1 rounded-card border border-line bg-surface p-1">
              @for (filter of roleFilters(); track filter.id) {
                <button
                  type="button"
                  class="rounded-panel px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                  [class.bg-primary]="roleFilter() === filter.id"
                  [class.text-white]="roleFilter() === filter.id"
                  [class.text-ink-muted]="roleFilter() !== filter.id"
                  (click)="roleFilter.set(filter.id)"
                >
                  {{ filter.label }}
                </button>
              }
            </div>
          </div>

          <div class="overflow-x-auto rounded-card border border-line bg-surface p-5 shadow-card">
            <table class="w-full min-w-[48rem] text-left text-sm">
              <thead class="text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th class="pb-2 font-medium">{{ nameCol() }}</th>
                  <th class="pb-2 font-medium">{{ emailCol() }}</th>
                  <th class="pb-2 font-medium">{{ statusCol() }}</th>
                  <th class="pb-2 font-medium">{{ rolesCol() }}</th>
                  <th class="pb-2 font-medium">{{ joinedCol() }}</th>
                  <th class="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line">
                @for (user of filteredUsers(); track user.id) {
                  <tr class="cursor-pointer hover:bg-surface-muted/60" (click)="openUser(user)">
                    <td class="py-3 font-medium text-primary">
                      {{ displayName(user) }}
                      @if (isSelf(user)) {
                        <span class="ms-2 text-[11px] font-semibold uppercase tracking-wide text-accent-dark">{{ youLabel() }}</span>
                      }
                    </td>
                    <td class="py-3 text-ink-muted">{{ user.email }}</td>
                    <td class="py-3">
                      <app-badge [variant]="statusVariant(user)">{{ statusLabel(user) }}</app-badge>
                    </td>
                    <td class="py-3 text-ink-muted">{{ roleText(user) }}</td>
                    <td class="py-3 text-ink-faint">{{ user.createdAt | date: 'mediumDate' }}</td>
                    <td class="py-3 text-right" (click)="$event.stopPropagation()">
                      @if (!isSelf(user)) {
                        <div class="flex justify-end gap-2">
                          <button
                            appButton
                            variant="secondary"
                            size="sm"
                            [disabled]="busyId() === user.id"
                            (click)="toggleStatus(user)"
                          >
                            {{ user.accountStatus === 'ACTIVE' ? disableLabel() : enableLabel() }}
                          </button>
                          <button
                            appButton
                            variant="ghost"
                            size="sm"
                            [disabled]="busyId() === user.id || (isAdmin(user) && !canDemote(user))"
                            (click)="toggleRole(user)"
                          >
                            {{ isAdmin(user) ? demoteLabel() : promoteLabel() }}
                          </button>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            @if (filteredUsers().length === 0) {
              <app-empty-state [icon]="usersIcon" [title]="noUsers()" />
            }
          </div>
        </section>
      }

      @if (tab() === 'messages') {
        <section class="space-y-4">
          <label class="relative block max-w-xl">
            <span class="sr-only">{{ searchMessages() }}</span>
            <svg lucideSearch class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true"></svg>
            <input
              appInput
              type="search"
              class="ps-10"
              [value]="messageQuery()"
              [placeholder]="searchMessages()"
              (input)="messageQuery.set($any($event.target).value)"
            />
          </label>

          <ul class="space-y-3">
            @for (item of filteredContacts(); track item.id) {
              <li class="rounded-card border border-line bg-surface p-4 shadow-card">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <button type="button" class="min-w-0 flex-1 text-start" (click)="openContact(item)">
                    <p class="font-semibold text-primary">{{ item.subject }}</p>
                    <p class="mt-1 text-xs text-ink-muted">{{ item.name }} · {{ item.email }}</p>
                    <p class="mt-2 line-clamp-2 text-sm text-ink">{{ item.message }}</p>
                  </button>
                  <div class="flex items-center gap-2">
                    <p class="text-xs text-ink-faint">{{ item.createdAt | date: 'short' }}</p>
                    <button
                      appButton
                      variant="ghost"
                      size="sm"
                      (click)="requestDelete(item)"
                    >
                      <svg lucideTrash2 class="h-4 w-4 text-danger" aria-hidden="true"></svg>
                      {{ deleteLabel() }}
                    </button>
                  </div>
                </div>
              </li>
            } @empty {
              <app-empty-state [icon]="mailIcon" [title]="noContacts()" />
            }
          </ul>
        </section>
      }
    </div>

    <app-drawer [(open)]="userDrawerOpen" side="right">
      @if (selectedUser(); as user) {
        <div class="flex h-full flex-col bg-surface">
          <div class="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">{{ detailsLabel() }}</p>
              <h2 class="mt-1 font-display text-xl font-semibold text-primary">{{ displayName(user) }}</h2>
              <p class="text-sm text-ink-muted">{{ user.email }}</p>
            </div>
            <button appButton variant="ghost" size="icon" (click)="userDrawerOpen.set(false)" [attr.aria-label]="closeLabel()">
              <svg lucideX class="h-4 w-4" aria-hidden="true"></svg>
            </button>
          </div>
          <div class="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
            <div class="flex flex-wrap gap-2">
              <app-badge [variant]="statusVariant(user)">{{ statusLabel(user) }}</app-badge>
              <app-badge [variant]="isAdmin(user) ? 'primary' : 'neutral'">{{ roleText(user) }}</app-badge>
              <app-badge [variant]="user.emailVerified ? 'success' : 'warning'">
                {{ user.emailVerified ? verifiedLabel() : unverifiedLabel() }}
              </app-badge>
            </div>
            <p><span class="text-ink-muted">{{ joinedCol() }}:</span> {{ user.createdAt | date: 'medium' }}</p>
            <p><span class="text-ink-muted">{{ lastLoginCol() }}:</span> {{ user.lastLoginAt ? (user.lastLoginAt | date: 'medium') : neverLabel() }}</p>
            <p><span class="text-ink-muted">{{ languageCol() }}:</span> {{ user.preferredLanguage || '—' }}</p>
            <p><span class="text-ink-muted">{{ timezoneCol() }}:</span> {{ user.timezone || '—' }}</p>
            @if (isSelf(user)) {
              <p class="rounded-panel bg-surface-muted px-3 py-2 text-xs text-ink-muted">{{ selfHint() }}</p>
            }
          </div>
          @if (!isSelf(user)) {
            <div class="flex flex-col gap-2 border-t border-line px-5 py-4">
              <button appButton variant="secondary" [disabled]="busyId() === user.id" (click)="toggleStatus(user)">
                {{ user.accountStatus === 'ACTIVE' ? disableLabel() : enableLabel() }}
              </button>
              <button
                appButton
                [disabled]="busyId() === user.id || (isAdmin(user) && !canDemote(user))"
                (click)="toggleRole(user)"
              >
                {{ isAdmin(user) ? demoteLabel() : promoteLabel() }}
              </button>
              @if (isAdmin(user) && !canDemote(user)) {
                <p class="text-xs text-ink-muted">{{ lastAdminLabel() }}</p>
              }
            </div>
          }
        </div>
      }
    </app-drawer>

    <app-drawer [(open)]="contactDrawerOpen" side="right">
      @if (selectedContact(); as item) {
        <div class="flex h-full flex-col bg-surface">
          <div class="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">{{ contactsTitle() }}</p>
              <h2 class="mt-1 font-display text-xl font-semibold text-primary">{{ item.subject }}</h2>
              <p class="text-sm text-ink-muted">{{ item.name }} · {{ item.email }}</p>
            </div>
            <button appButton variant="ghost" size="icon" (click)="contactDrawerOpen.set(false)" [attr.aria-label]="closeLabel()">
              <svg lucideX class="h-4 w-4" aria-hidden="true"></svg>
            </button>
          </div>
          <div class="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <p class="text-xs text-ink-faint">{{ item.createdAt | date: 'medium' }}</p>
            <p class="whitespace-pre-wrap text-sm leading-relaxed text-ink">{{ item.message }}</p>
          </div>
          <div class="border-t border-line px-5 py-4">
            @if (confirmDeleteId() === item.id) {
              <p class="mb-3 text-sm text-ink-muted">{{ confirmDeleteLabel() }}</p>
              <div class="flex gap-2">
                <button appButton variant="danger" [disabled]="busyId() === item.id" (click)="deleteContact(item)">
                  {{ deleteLabel() }}
                </button>
                <button appButton variant="secondary" (click)="confirmDeleteId.set(null)">{{ cancelLabel() }}</button>
              </div>
            } @else {
              <button appButton variant="secondary" (click)="confirmDeleteId.set(item.id)">
                <svg lucideTrash2 class="h-4 w-4 text-danger" aria-hidden="true"></svg>
                {{ deleteLabel() }}
              </button>
            }
          </div>
        </div>
      }
    </app-drawer>
  `,
})
export class AdminComponent {
  private readonly languageService = inject(LanguageService);
  private readonly auth = inject(AuthService);

  protected readonly usersIcon = LucideUsers;
  protected readonly mailIcon = LucideMail;

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
  protected readonly noUsers = this.languageService.translateSignal('adminPage.noUsers');
  protected readonly searchUsers = this.languageService.translateSignal('adminPage.searchUsers');
  protected readonly searchMessages = this.languageService.translateSignal('adminPage.searchMessages');
  protected readonly loadErrorLabel = this.languageService.translateSignal('adminPage.loadError');
  protected readonly promoteLabel = this.languageService.translateSignal('adminPage.promote');
  protected readonly demoteLabel = this.languageService.translateSignal('adminPage.demote');
  protected readonly youLabel = this.languageService.translateSignal('adminPage.you');
  protected readonly joinedCol = this.languageService.translateSignal('adminPage.joined');
  protected readonly lastLoginCol = this.languageService.translateSignal('adminPage.lastLogin');
  protected readonly neverLabel = this.languageService.translateSignal('adminPage.never');
  protected readonly verifiedLabel = this.languageService.translateSignal('adminPage.verified');
  protected readonly unverifiedLabel = this.languageService.translateSignal('adminPage.unverified');
  protected readonly detailsLabel = this.languageService.translateSignal('adminPage.details');
  protected readonly recentUsersTitle = this.languageService.translateSignal('adminPage.recentUsers');
  protected readonly recentMessagesTitle = this.languageService.translateSignal('adminPage.recentMessages');
  protected readonly viewAllLabel = this.languageService.translateSignal('adminPage.viewAll');
  protected readonly confirmDeleteLabel = this.languageService.translateSignal('adminPage.confirmDelete');
  protected readonly languageCol = this.languageService.translateSignal('adminPage.language');
  protected readonly timezoneCol = this.languageService.translateSignal('adminPage.timezone');
  protected readonly selfHint = this.languageService.translateSignal('adminPage.selfHint');
  protected readonly lastAdminLabel = this.languageService.translateSignal('adminPage.lastAdmin');
  protected readonly retryLabel = this.languageService.translateSignal('common.retry');
  protected readonly deleteLabel = this.languageService.translateSignal('common.delete');
  protected readonly closeLabel = this.languageService.translateSignal('common.close');
  protected readonly cancelLabel = this.languageService.translateSignal('common.cancel');

  protected readonly stats = signal<AdminStats | null>(null);
  protected readonly users = signal<UserProfile[]>([]);
  protected readonly contacts = signal<AdminContact[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal(false);
  protected readonly actionError = signal<'failed' | 'forbidden' | null>(null);
  protected readonly tab = signal<AdminTab>('overview');
  protected readonly userQuery = signal('');
  protected readonly messageQuery = signal('');
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly roleFilter = signal<RoleFilter>('all');
  protected readonly busyId = signal<string | null>(null);
  protected readonly selectedUser = signal<UserProfile | null>(null);
  protected readonly selectedContact = signal<AdminContact | null>(null);
  protected readonly userDrawerOpen = signal(false);
  protected readonly contactDrawerOpen = signal(false);
  protected readonly confirmDeleteId = signal<string | null>(null);

  protected readonly actionErrorLabel = computed(() =>
    this.languageService.translate<string>(
      this.actionError() === 'forbidden' ? 'adminPage.forbidden' : 'adminPage.actionFailed',
    ),
  );

  protected readonly tabs = computed(() => [
    { id: 'overview' as const, label: this.languageService.translate<string>('adminPage.overview') },
    { id: 'users' as const, label: this.usersLabel() },
    { id: 'messages' as const, label: this.contactsLabel() },
  ]);

  protected readonly statusFilters = computed(() => [
    { id: 'all' as const, label: this.languageService.translate<string>('common.all') },
    { id: 'ACTIVE' as const, label: this.activeLabel() },
    { id: 'DISABLED' as const, label: this.languageService.translate<string>('adminPage.disabled') },
    { id: 'BLOCKED' as const, label: this.languageService.translate<string>('adminPage.blocked') },
  ]);

  protected readonly roleFilters = computed(() => [
    { id: 'all' as const, label: this.languageService.translate<string>('common.all') },
    { id: 'admin' as const, label: this.languageService.translate<string>('adminPage.filterAdmins') },
    { id: 'user' as const, label: this.languageService.translate<string>('adminPage.filterUsers') },
  ]);

  protected readonly filteredUsers = computed(() => {
    const query = this.userQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const role = this.roleFilter();
    return this.users().filter((user) => {
      const haystack = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();
      if (query && !haystack.includes(query)) {
        return false;
      }
      if (status !== 'all' && user.accountStatus !== status) {
        return false;
      }
      if (role === 'admin' && !this.isAdmin(user)) {
        return false;
      }
      if (role === 'user' && this.isAdmin(user)) {
        return false;
      }
      return true;
    });
  });

  protected readonly filteredContacts = computed(() => {
    const query = this.messageQuery().trim().toLowerCase();
    return this.contacts().filter((item) => {
      if (!query) {
        return true;
      }
      return `${item.name} ${item.email} ${item.subject} ${item.message}`.toLowerCase().includes(query);
    });
  });

  protected readonly recentUsers = computed(() => this.users().slice(0, 5));
  protected readonly recentContacts = computed(() => this.contacts().slice(0, 5));
  protected readonly adminCount = computed(
    () => this.users().filter((user) => this.isAdmin(user)).length,
  );

  constructor() {
    this.refresh();
  }

  protected isAdmin(user: UserProfile): boolean {
    return user.roles.some((role) => role.toUpperCase().includes('ADMIN'));
  }

  protected isSelf(user: UserProfile): boolean {
    return user.id === (this.auth.currentUser()?.id ?? '');
  }

  protected canDemote(user: UserProfile): boolean {
    return this.isAdmin(user) && !this.isSelf(user) && this.adminCount() > 1;
  }

  protected displayName(user: UserProfile): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  protected statusVariant(user: UserProfile): 'accent' | 'danger' | 'warning' | 'neutral' {
    if (user.accountStatus === 'ACTIVE') {
      return 'accent';
    }
    if (user.accountStatus === 'BLOCKED') {
      return 'danger';
    }
    if (user.accountStatus === 'DISABLED') {
      return 'warning';
    }
    return 'neutral';
  }

  protected statusLabel(user: UserProfile): string {
    if (user.accountStatus === 'ACTIVE') {
      return this.activeLabel();
    }
    if (user.accountStatus === 'BLOCKED') {
      return this.languageService.translate<string>('adminPage.blocked');
    }
    return this.languageService.translate<string>('adminPage.disabled');
  }

  protected roleText(user: UserProfile): string {
    return this.isAdmin(user)
      ? this.languageService.translate<string>('adminPage.roleAdmin')
      : this.languageService.translate<string>('adminPage.roleUser');
  }

  protected setStatusFilter(status: StatusFilter): void {
    this.statusFilter.set(status);
    this.tab.set('users');
  }

  protected setRoleFilter(role: RoleFilter): void {
    this.roleFilter.set(role);
    this.tab.set('users');
  }

  protected openUser(user: UserProfile): void {
    this.selectedUser.set(user);
    this.userDrawerOpen.set(true);
  }

  protected openContact(item: AdminContact): void {
    this.selectedContact.set(item);
    this.confirmDeleteId.set(null);
    this.contactDrawerOpen.set(true);
  }

  protected toggleStatus(user: UserProfile): void {
    const next = user.accountStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    this.runMutation(user.id, this.auth.updateAccountStatus(user.id, next), (updated) => {
      this.replaceUser(updated);
    });
  }

  protected toggleRole(user: UserProfile): void {
    const next = this.isAdmin(user) ? 'USER' : 'ADMIN';
    this.runMutation(user.id, this.auth.updateUserRole(user.id, next), (updated) => {
      this.replaceUser(updated);
    });
  }

  protected requestDelete(item: AdminContact): void {
    this.openContact(item);
    this.confirmDeleteId.set(item.id);
  }

  protected deleteContact(item: AdminContact): void {
    this.busyId.set(item.id);
    this.actionError.set(null);
    this.auth.deleteContact(item.id).subscribe({
      next: () => {
        this.contacts.update((items) => items.filter((entry) => entry.id !== item.id));
        this.stats.update((current) =>
          current
            ? { ...current, contactMessages: Math.max(0, current.contactMessages - 1) }
            : current,
        );
        this.busyId.set(null);
        this.confirmDeleteId.set(null);
        this.contactDrawerOpen.set(false);
        this.selectedContact.set(null);
      },
      error: (error: unknown) => this.onMutationError(error),
    });
  }

  protected refresh(): void {
    this.loading.set(true);
    this.loadError.set(false);
    forkJoin({
      stats: this.auth.adminStats(),
      users: this.auth.adminUsers(),
      contacts: this.auth.adminContacts(),
    }).subscribe({
      next: ({ stats, users, contacts }) => {
        this.stats.set(stats);
        this.users.set(users);
        this.contacts.set(contacts);
        this.loading.set(false);
        const selected = this.selectedUser();
        if (selected) {
          this.selectedUser.set(users.find((user) => user.id === selected.id) ?? selected);
        }
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  private replaceUser(updated: UserProfile): void {
    this.users.update((users) => users.map((user) => (user.id === updated.id ? updated : user)));
    if (this.selectedUser()?.id === updated.id) {
      this.selectedUser.set(updated);
    }
    this.stats.update((current) => {
      if (!current) {
        return current;
      }
      const list = this.users();
      return {
        ...current,
        totalUsers: list.length,
        activeUsers: list.filter((user) => user.accountStatus === 'ACTIVE').length,
        adminUsers: list.filter((user) => this.isAdmin(user)).length,
      };
    });
  }

  private runMutation(
    id: string,
    request: ReturnType<AuthService['updateAccountStatus']>,
    onSuccess: (updated: UserProfile) => void,
  ): void {
    this.busyId.set(id);
    this.actionError.set(null);
    request.subscribe({
      next: (updated) => {
        onSuccess(updated);
        this.busyId.set(null);
      },
      error: (error: unknown) => this.onMutationError(error),
    });
  }

  private onMutationError(error: unknown): void {
    this.busyId.set(null);
    this.actionError.set(error instanceof HttpErrorResponse && error.status === 403 ? 'forbidden' : 'failed');
  }
}
