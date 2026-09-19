import { AfterViewInit, Component, computed, ElementRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideArrowUp, LucideDynamicIcon, LucideSparkles } from '@lucide/angular';
import { Button } from '../../shared/ui/button/button';
import { Badge } from '../../shared/ui/badge/badge';
import { LanguageService } from '../../core/services/language.service';
import {
  AI_CATEGORY_CHIP,
  AI_CATEGORY_ICONS,
  AI_CATEGORY_KEYS,
  MOCK_INSIGHTS,
  RISK_KEYS,
  SUGGESTED_QUESTION_KEYS,
  generateReply,
  makeId,
  type AiCategory,
  type ChatMessage,
  type LocalizedAiInsight,
  type RiskLevel,
} from './models/ai.models';

const CATEGORY_ORDER: AiCategory[] = ['productivity', 'wellness', 'schedule', 'nutrition', 'tasks'];

function categoryGroups(
  insights: LocalizedAiInsight[],
): { category: AiCategory; items: LocalizedAiInsight[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: insights.filter((insight) => insight.category === category),
  })).filter((group) => group.items.length > 0);
}

const RISK_DOT: Record<string, string> = {
  low: 'bg-success',
  moderate: 'bg-warning',
  high: 'bg-danger',
};

const RISK_BADGE: Record<string, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  moderate: 'warning',
  high: 'danger',
};

@Component({
  selector: 'app-ai-page',
  imports: [
    FormsModule,
    Button,
    Badge,
    LucideDynamicIcon,
    LucideArrowUp,
    LucideSparkles,
  ],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            {{ eyebrow() }}
          </p>
          <h1 class="mt-0.5 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {{ title() }}
          </h1>
          <p class="mt-1 text-sm text-ink-muted">
            {{ subtitle() }}
          </p>
        </div>
        <app-badge variant="accent" [dot]="true">{{ insightsToday() }}</app-badge>
      </header>

      <div class="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <!-- Insights column -->
        <div class="flex flex-col gap-6 xl:col-span-8">
          <!-- Summary banner -->
          <section
            data-reveal
            class="rounded-card bg-gradient-to-br from-primary-darker via-primary to-primary-light p-6 text-white shadow-card"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="flex h-11 w-11 items-center justify-center rounded-panel bg-white/10 text-teal-200 ring-1 ring-white/15">
                  <svg lucideSparkles class="h-5 w-5" aria-hidden="true"></svg>
                </span>
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200">
                    {{ overview() }}
                  </p>
                  <h2 class="mt-0.5 font-display text-lg font-semibold tracking-tight text-white">
                    {{ globalBalance() }}
                  </h2>
                </div>
              </div>
              <span class="font-display text-3xl font-bold tabular-nums text-teal-200">82/100</span>
            </div>
            <p class="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
              {{ summaryText() }}
            </p>
          </section>

          <!-- Insights by category -->
          @for (group of groups(); track group.category) {
            <section data-reveal>
              <div class="mb-3 flex items-center gap-2.5">
                <span class="flex h-8 w-8 items-center justify-center rounded-panel" [class]="AI_CATEGORY_CHIP[group.category]">
                  <svg [lucideIcon]="AI_CATEGORY_ICONS[group.category]" class="h-4 w-4" aria-hidden="true"></svg>
                </span>
                <h2 class="font-display text-lg font-semibold tracking-tight text-primary">
                  {{ categoryLabel(group.category) }}
                </h2>
              </div>

              <div class="flex flex-col gap-3">
                @for (insight of group.items; track insight.id) {
                  <article
                    class="insight-card rounded-card border border-line bg-surface p-5 shadow-soft transition-all duration-200 hover:border-accent/40 hover:shadow-card"
                  >
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div class="flex items-center gap-2.5">
                        <span class="h-2.5 w-2.5 rounded-full" [class]="RISK_DOT[insight.risk]"></span>
                        <h3 class="font-display text-base font-semibold tracking-tight text-primary">
                          {{ insight.title }}
                        </h3>
                      </div>
                      <app-badge [variant]="RISK_BADGE[insight.risk]">
                        {{ riskBadge(insight.risk) }}
                      </app-badge>
                    </div>

                    <p class="mt-3 text-sm leading-relaxed text-ink">{{ insight.explanation }}</p>

                    <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      @for (factor of insight.factors; track factor.label) {
                        <div class="rounded-panel border border-line bg-surface-muted/60 px-3 py-2">
                          <p class="text-[11px] text-ink-faint">{{ factor.label }}</p>
                          <p class="mt-0.5 text-sm font-semibold text-primary">{{ factor.value }}</p>
                        </div>
                      }
                    </div>

                    <div class="mt-4 flex items-center justify-between gap-4">
                      <div class="flex items-center gap-2 text-xs">
                        <span class="text-ink-muted">{{ confidence() }}</span>
                        <div class="h-1.5 w-24 overflow-hidden rounded-full bg-surface-strong">
                          <div
                            class="h-full rounded-full bg-accent transition-all duration-500"
                            [style.width]="insight.confidence + '%'"
                          ></div>
                        </div>
                        <span class="font-semibold tabular-nums text-accent-dark">
                          {{ insight.confidence }}%
                        </span>
                      </div>
                      <span class="text-[11px] text-ink-faint">{{ notDiagnosis() }}</span>
                    </div>

                    <div class="mt-4 rounded-panel border border-accent/25 bg-teal-50/60 p-3.5">
                      <p class="text-xs font-semibold uppercase tracking-wide text-accent-dark">
                        {{ recommendationLabel() }}
                      </p>
                      <p class="mt-1 text-sm leading-relaxed text-ink">{{ insight.recommendation }}</p>
                    </div>
                  </article>
                }
              </div>
            </section>
          }
        </div>

        <!-- Ask AI panel -->
        <aside class="xl:col-span-4">
          <section
            class="sticky top-24 flex h-[calc(100dvh-9rem)] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card"
          >
            <header class="border-b border-line p-4">
              <div class="flex items-center gap-2.5">
                <span class="flex h-9 w-9 items-center justify-center rounded-panel bg-accent/15 text-accent-dark">
                  <svg lucideSparkles class="h-5 w-5" aria-hidden="true"></svg>
                </span>
                <div>
                  <h2 class="font-display text-base font-semibold tracking-tight text-primary">
                    {{ askTitle() }}
                  </h2>
                  <p class="text-xs text-ink-muted">{{ askSubtitle() }}</p>
                </div>
              </div>
            </header>

            <div #chatScroll class="flex-1 space-y-3 overflow-y-auto p-4">
              @for (message of messages(); track message.id) {
                <div
                  class="flex w-full"
                  [class.justify-end]="message.role === 'user'"
                  [class.justify-start]="message.role === 'assistant'"
                >
                  <div
                    class="max-w-[85%] rounded-panel px-3.5 py-2.5 text-sm leading-relaxed shadow-soft"
                    [class.bg-primary]="message.role === 'user'"
                    [class.text-white]="message.role === 'user'"
                    [class.border]="message.role === 'assistant'"
                    [class.border-line]="message.role === 'assistant'"
                    [class.bg-surface-muted/70]="message.role === 'assistant'"
                    [class.text-ink]="message.role === 'assistant'"
                  >
                    {{ message.content }}
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

              @if (messages().length === 0 && !typing()) {
                <div class="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-accent shadow-sm">
                    <svg lucideSparkles class="h-6 w-6" aria-hidden="true"></svg>
                  </span>
                  <p class="max-w-[14rem] text-sm text-ink-muted">
                    {{ askHint() }}
                  </p>
                </div>
              }
            </div>

            <div class="border-t border-line p-3">
              @if (!typing() && messages().length < 2) {
                <div class="mb-3 flex flex-wrap gap-1.5">
                  @for (question of suggestedQuestions(); track question) {
                    <button
                      type="button"
                      (click)="ask(question)"
                      class="rounded-full border border-line bg-surface px-3 py-1.5 text-left text-xs font-medium text-ink-muted transition-colors hover:border-accent/50 hover:text-accent-dark"
                    >
                      {{ question }}
                    </button>
                  }
                </div>
              }

              <form class="flex items-end gap-2" (ngSubmit)="submit()" novalidate>
                <input
                  [ngModel]="question()"
                  name="question"
                  (ngModelChange)="question.set($event)"
                  type="text"
                  [placeholder]="inputPlaceholder()"
                  [attr.aria-label]="inputAria()"
                  class="h-10 w-full flex-1 rounded-panel border border-line bg-background px-3.5 text-sm text-ink shadow-soft transition-all placeholder:text-ink-faint focus:border-accent/60 focus:outline-none focus:ring-4 focus:ring-accent/15"
                />
                <button
                  appButton
                  variant="accent"
                  size="icon"
                  type="submit"
                  [attr.aria-label]="sendAria()"
                  [disabled]="!question().trim() || typing()"
                >
                  <svg lucideArrowUp class="h-4 w-4" aria-hidden="true"></svg>
                </button>
              </form>
            </div>
          </section>
        </aside>
      </div>
    </div>
  `,
})
export class AiPage implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly languageService = inject(LanguageService);

  protected readonly displayInsights = computed<LocalizedAiInsight[]>(() =>
    MOCK_INSIGHTS.map((insight) => ({
      id: insight.id,
      category: insight.category,
      risk: insight.risk,
      confidence: insight.confidence,
      title: this.languageService.translate(insight.titleKey),
      explanation: this.languageService.translate(insight.explanationKey),
      recommendation: this.languageService.translate(insight.recommendationKey),
      factors: insight.factors.map((factor) => ({
        label: this.languageService.translate(factor.labelKey),
        value: factor.valueKey ? this.languageService.translate(factor.valueKey) : factor.value ?? '',
      })),
    })),
  );

  protected readonly groups = computed(() => categoryGroups(this.displayInsights()));

  protected readonly eyebrow = this.languageService.translateSignal('aiPage.eyebrow');
  protected readonly title = this.languageService.translateSignal('aiPage.title');
  protected readonly subtitle = this.languageService.translateSignal('aiPage.subtitle');
  protected readonly insightsToday = this.languageService.translateSignal('aiPage.insightsToday', {
    count: String(MOCK_INSIGHTS.length),
  });
  protected readonly overview = this.languageService.translateSignal('aiPage.overview');
  protected readonly globalBalance = this.languageService.translateSignal('aiPage.globalBalance');
  protected readonly summaryText = this.languageService.translateSignal('aiPage.summaryText');
  protected readonly confidence = this.languageService.translateSignal('aiPage.confidence');
  protected readonly notDiagnosis = this.languageService.translateSignal('aiPage.notDiagnosis');
  protected readonly recommendationLabel = this.languageService.translateSignal(
    'aiPage.recommendation',
  );
  protected readonly askTitle = this.languageService.translateSignal('aiPage.askTitle');
  protected readonly askSubtitle = this.languageService.translateSignal('aiPage.askSubtitle');
  protected readonly askHint = this.languageService.translateSignal('aiPage.askHint');
  protected readonly inputPlaceholder = this.languageService.translateSignal(
    'aiPage.inputPlaceholder',
  );
  protected readonly inputAria = this.languageService.translateSignal('aiPage.inputAria');
  protected readonly sendAria = this.languageService.translateSignal('aiPage.sendAria');
  protected readonly suggestedQuestions = computed(() =>
    SUGGESTED_QUESTION_KEYS.map((key) => this.languageService.translate<string>(key)),
  );

  protected readonly AI_CATEGORY_ICONS = AI_CATEGORY_ICONS;
  protected readonly AI_CATEGORY_CHIP = AI_CATEGORY_CHIP;
  protected readonly RISK_DOT = RISK_DOT;
  protected readonly RISK_BADGE = RISK_BADGE;

  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly question = signal('');
  protected readonly typing = signal(false);

  protected categoryLabel(category: AiCategory): string {
    return this.languageService.translate(AI_CATEGORY_KEYS[category]);
  }

  protected riskLabel(risk: RiskLevel): string {
    return this.languageService.translate(RISK_KEYS[risk]);
  }

  protected riskBadge(risk: RiskLevel): string {
    return this.languageService.translate('aiPage.riskBadge', {
      value: this.riskLabel(risk),
    });
  }

  protected async ask(question: string): Promise<void> {
    const text = question.trim();
    if (!text || this.typing()) {
      return;
    }
    this.question.set('');
    this.messages.update((list) => [...list, { id: makeId('m'), role: 'user', content: text }]);
    this.typing.set(true);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const reply = this.languageService.translate(generateReply(text));
    this.messages.update((list) => [
      ...list,
      { id: makeId('m'), role: 'assistant', content: reply },
    ]);
    this.typing.set(false);
  }

  protected submit(): void {
    void this.ask(this.question());
  }

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const root = this.host.nativeElement;
    import('gsap').then(({ default: gsap }) => {
      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('[data-reveal]'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'power2.out', clearProps: 'transform' },
      );
      gsap.fromTo(
        root.querySelectorAll<HTMLElement>('.insight-card'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out', delay: 0.1, clearProps: 'transform' },
      );
    });
  }
}
