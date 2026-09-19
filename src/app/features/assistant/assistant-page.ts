import { AfterViewInit, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideArrowUp,
  LucideBot,
  LucideMessageSquarePlus,
  LucideSparkles,
} from '@lucide/angular';
import { Button } from '../../shared/ui/button/button';
import { LanguageService } from '../../core/services/language.service';
import {
  CONTEXT_ITEMS,
  MOCK_CONVERSATIONS,
  SUGGESTED_QUESTION_KEYS,
  WELCOME_KEY,
  assistantReply,
  type AssistantConversation,
  type AssistantMessage,
  type ContextItem,
} from './models/assistant.models';
import { makeId } from '../ai/models/ai.models';

const TONE_DOT: Record<ContextItem['tone'], string> = {
  navy: 'bg-primary',
  teal: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

function timeNow(locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(),
  );
}

function welcomeMessage(locale: string): AssistantMessage {
  return {
    id: makeId('am'),
    role: 'assistant',
    contentKey: WELCOME_KEY,
    contentVars: { name: 'Sarah' },
    time: timeNow(locale),
  };
}

@Component({
  selector: 'app-assistant-page',
  imports: [FormsModule, Button, LucideArrowUp, LucideBot, LucideMessageSquarePlus, LucideSparkles],
  template: `
    <div class="flex flex-col gap-5 lg:h-[calc(100dvh-6.5rem)] lg:flex-row">
      <!-- Conversation list -->
      <aside class="flex w-full flex-col gap-2 lg:w-72 lg:shrink-0">
        <button appButton variant="secondary" size="md" class="w-full justify-start" (click)="newConversation()">
          <svg lucideMessageSquarePlus class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
          {{ newConversationLabel() }}
        </button>

        <nav class="flex flex-col gap-1.5" [attr.aria-label]="conversationsAria()">
          @for (item of localizedConversations(); track item.id) {
            <button
              type="button"
              class="group flex flex-col gap-1 rounded-panel border p-3 text-left transition-all duration-200"
              [class.border-accent/40]="item.id === activeId()"
              [class.bg-teal-50/60]="item.id === activeId()"
              [class.border-line]="item.id !== activeId()"
              [class.bg-surface]="item.id !== activeId()"
              [class.hover:border-accent/30]="item.id !== activeId()"
              (click)="activeId.set(item.id)"
              [attr.aria-current]="item.id === activeId() ? 'page' : null"
            >
              <span class="flex items-center gap-2">
                <span class="truncate text-sm font-semibold" [class.text-primary]="item.id !== activeId()">
                  {{ item.title }}
                </span>
              </span>
              <span class="text-[11px] text-ink-faint">{{ relativeTimeLabel(item.updatedAt) }}</span>
            </button>
          }
        </nav>
      </aside>

      <!-- Conversation -->
      <section class="flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <header class="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          <div class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-panel bg-accent/15 text-accent-dark">
              <svg lucideBot class="h-5 w-5" aria-hidden="true"></svg>
            </span>
            <div>
              <h2 class="font-display text-base font-semibold tracking-tight text-primary">
                {{ activeConversation()?.title ?? newConversationLabel() }}
              </h2>
              <p class="flex items-center gap-1.5 text-xs text-ink-muted">
                <span class="h-1.5 w-1.5 rounded-full bg-success"></span>
                {{ online() }}
              </p>
            </div>
          </div>
        </header>

        <div #scrollRef class="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          @for (message of activeMessages(); track message.id) {
            <div class="flex w-full" [class.justify-end]="message.role === 'user'">
              <div class="flex max-w-[85%] gap-2.5" [class.flex-row-reverse]="message.role === 'user'">
                @if (message.role === 'assistant') {
                  <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-dark">
                    <svg lucideBot class="h-3.5 w-3.5" aria-hidden="true"></svg>
                  </span>
                }
                <div
                  class="message-bubble rounded-panel px-3.5 py-2.5 text-sm leading-relaxed shadow-soft"
                  [class.bg-primary]="message.role === 'user'"
                  [class.text-white]="message.role === 'user'"
                  [class.border]="message.role === 'assistant'"
                  [class.border-line]="message.role === 'assistant'"
                  [class.bg-surface-muted/70]="message.role === 'assistant'"
                  [class.text-ink]="message.role === 'assistant'"
                >
                  <p>{{ message.content }}</p>
                  <p
                    class="mt-1.5 text-right text-[10px] tabular-nums"
                    [class.text-white/75]="message.role === 'user'"
                    [class.text-ink-faint]="message.role === 'assistant'"
                  >
                    {{ message.time }}
                  </p>
                </div>
              </div>
            </div>
          }

          @if (typing()) {
            <div class="flex justify-start">
              <div class="flex items-center gap-1.5 rounded-panel border border-line bg-surface-muted/70 px-4 py-3">
                @for (dot of [0, 1, 2]; track dot) {
                  <span class="typing-dot h-1.5 w-1.5 rounded-full bg-accent"></span>
                }
              </div>
            </div>
          }
        </div>

        <div class="border-t border-line p-3 sm:p-4">
          @if (!typing()) {
            <div class="mb-3 flex flex-wrap gap-1.5">
              @for (question of suggestedQuestions(); track question) {
                <button
                  type="button"
                  (click)="send(question)"
                  class="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-accent/50 hover:text-accent-dark"
                >
                  {{ question }}
                </button>
              }
            </div>
          }

          <form class="flex items-end gap-2" (ngSubmit)="submit()" novalidate>
            <input
              [ngModel]="draft()"
              name="draft"
              (ngModelChange)="draft.set($event)"
              type="text"
              [placeholder]="inputPlaceholder()"
              [attr.aria-label]="inputAria()"
              class="h-11 w-full flex-1 rounded-panel border border-line bg-background px-3.5 text-sm text-ink shadow-soft transition-all placeholder:text-ink-faint focus:border-accent/60 focus:outline-none focus:ring-4 focus:ring-accent/15"
            />
            <button
              appButton
              variant="accent"
              size="icon"
              type="submit"
              [attr.aria-label]="sendAria()"
              [disabled]="!draft().trim() || typing()"
            >
              <svg lucideArrowUp class="h-4 w-4" aria-hidden="true"></svg>
            </button>
          </form>
        </div>
      </section>

      <!-- Context panel -->
      <aside class="hidden w-72 shrink-0 flex-col gap-4 xl:flex">
        <section class="rounded-card border border-line bg-surface p-4 shadow-card">
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {{ contextTitle() }}
          </p>
          <h3 class="mt-1 font-display text-base font-semibold tracking-tight text-primary">
            {{ contextOverview() }}
          </h3>
          <div class="mt-4 space-y-3">
            @for (item of contextItems(); track item.label) {
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-2 text-sm text-ink-muted">
                  <span class="h-1.5 w-1.5 rounded-full" [class]="TONE_DOT[item.tone]"></span>
                  {{ item.label }}
                </span>
                <span class="text-sm font-semibold tabular-nums text-primary">{{ item.value }}</span>
              </div>
            }
          </div>
        </section>

        <section class="rounded-card border border-accent/30 bg-gradient-to-br from-teal-50/70 to-surface p-4 shadow-card">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-panel bg-accent/15 text-accent-dark">
              <svg lucideSparkles class="h-4 w-4" aria-hidden="true"></svg>
            </span>
            <p class="text-sm font-semibold text-primary">{{ recommendation() }}</p>
          </div>
          <p class="mt-2.5 text-sm leading-relaxed text-ink">
            {{ recommendationText() }}
          </p>
        </section>
      </aside>
    </div>
  `,
})
export class AssistantPage implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly languageService = inject(LanguageService);

  protected readonly TONE_DOT = TONE_DOT;

  protected readonly conversations = signal<AssistantConversation[]>(MOCK_CONVERSATIONS);
  protected readonly activeId = signal(MOCK_CONVERSATIONS[0]?.id ?? '');
  protected readonly draft = signal('');
  protected readonly typing = signal(false);

  protected readonly newConversationLabel = this.languageService.translateSignal(
    'assistantPage.newConversation',
  );
  protected readonly conversationsAria = this.languageService.translateSignal(
    'assistantPage.conversationsAria',
  );
  protected readonly online = this.languageService.translateSignal('assistantPage.online');
  protected readonly contextTitle = this.languageService.translateSignal(
    'assistantPage.contextTitle',
  );
  protected readonly contextOverview = this.languageService.translateSignal(
    'assistantPage.contextOverview',
  );
  protected readonly recommendation = this.languageService.translateSignal(
    'assistantPage.recommendation',
  );
  protected readonly recommendationText = this.languageService.translateSignal(
    'assistantPage.recommendationText',
  );
  protected readonly inputPlaceholder = this.languageService.translateSignal(
    'assistantPage.inputPlaceholder',
  );
  protected readonly inputAria = this.languageService.translateSignal('assistantPage.inputAria');
  protected readonly sendAria = this.languageService.translateSignal('assistantPage.sendAria');

  protected readonly suggestedQuestions = computed(() =>
    SUGGESTED_QUESTION_KEYS.map((key) => this.languageService.translate<string>(key)),
  );

  protected readonly contextItems = computed(() =>
    CONTEXT_ITEMS.map((item) => ({
      tone: item.tone,
      label: this.languageService.translate(item.labelKey),
      value: item.valueKey ? this.languageService.translate(item.valueKey) : (item.value ?? ''),
    })),
  );

  protected readonly localizedConversations = computed(() =>
    this.conversations().map((conversation) => ({
      ...conversation,
      title: this.languageService.translate(conversation.titleKey),
    })),
  );

  protected readonly activeConversation = computed(
    () => this.localizedConversations().find((item) => item.id === this.activeId()) ?? null,
  );

  protected readonly activeMessages = computed(() =>
    (this.activeConversation()?.messages ?? []).map((message) => ({
      id: message.id,
      role: message.role,
      time: message.time,
      content:
        'contentKey' in message
          ? this.languageService.translate(message.contentKey, message.contentVars)
          : message.content,
    })),
  );

  protected relativeTimeLabel(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.round(diff / 3_600_000);
    if (hours < 1) {
      return this.languageService.translate('assistantPage.timeNow');
    }
    return this.languageService.translate('assistantPage.timeAgo', { count: String(hours) });
  }

  protected newConversation(): void {
    const locale = this.languageService.getLocale();
    const conversation: AssistantConversation = {
      id: `c-${Date.now()}`,
      titleKey: 'assistantPage.newDiscussion',
      updatedAt: new Date().toISOString(),
      messages: [welcomeMessage(locale)],
    };
    this.conversations.update((list) => [conversation, ...list]);
    this.activeId.set(conversation.id);
  }

  protected submit(): void {
    const text = this.draft().trim();
    if (!text) {
      return;
    }
    this.draft.set('');
    void this.send(text);
  }

  protected async send(prompt: string): Promise<void> {
    const text = prompt.trim();
    if (!text || this.typing()) {
      return;
    }
    const userMessage: AssistantMessage = {
      id: makeId('m'),
      role: 'user',
      content: text,
      time: timeNow(this.languageService.getLocale()),
    };
    this.conversations.update((list) =>
      list.map((item) =>
        item.id === this.activeId()
          ? {
              ...item,
              updatedAt: new Date().toISOString(),
              messages: [...item.messages, userMessage],
            }
          : item,
      ),
    );
    this.typing.set(true);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const replyKey = assistantReply(text);
    const replyText = this.languageService.translate(replyKey);
    this.conversations.update((list) =>
      list.map((item) =>
        item.id === this.activeId()
          ? {
              ...item,
              updatedAt: new Date().toISOString(),
              messages: [
                ...item.messages,
                { id: makeId('m'), role: 'assistant', content: replyText, time: timeNow(this.languageService.getLocale()) },
              ],
            }
          : item,
      ),
    );
    this.typing.set(false);
  }

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const root = this.host.nativeElement;
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('.message-bubble'),
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out', clearProps: 'transform' },
      );
    });
  }
}
