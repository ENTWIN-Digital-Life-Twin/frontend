import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of, switchMap, timeout, type Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';
import type { AiCategory, LocalizedAiInsight, RiskLevel } from '../models/ai.models';
import { analysisConfidence, recommendationConfidence } from './analysis-confidence';

interface LifestyleRiskResponse {
  riskLevel: string;
  score: number | null;
  confidence?: number | null;
  engine: string;
  factors: string[];
}

interface RecommendationItem {
  type: string;
  priority: string;
  message: string;
}

interface RecommendationResponse {
  recommendations: RecommendationItem[];
  engine: string;
}

interface WeeklyWellnessSummary {
  averageSleepMinutes: number | null;
  averageHydrationMl: number | null;
  totalWorkoutMinutes: number | null;
  averageMood: number | null;
  averageStress: number | null;
  averageFatigue: number | null;
  averageDailySteps: number | null;
}

interface ChatResponse {
  answer?: string;
  reply?: string;
  engine: string;
  proposedAction?: string | null;
  proposedTask?: ProposedTaskPayload | null;
}

export interface ProposedTaskPayload {
  title: string;
  description?: string | null;
  durationMinutes?: number;
  priority?: string;
  category?: string;
}

export interface ChatReply {
  answer: string;
  proposedAction: string | null;
  proposedTask: ProposedTaskPayload | null;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const TYPE_TO_CATEGORY: Record<string, AiCategory> = {
  REST: 'wellness',
  HYDRATION: 'nutrition',
  STRESS: 'wellness',
  ACTIVITY: 'wellness',
  MOOD: 'wellness',
};

function startDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function toRisk(value: string | null | undefined): RiskLevel {
  const normalized = (value ?? 'low').toLowerCase();
  if (normalized === 'high' || normalized === 'moderate') {
    return normalized;
  }
  return 'low';
}

function priorityToRisk(priority: string): RiskLevel {
  const normalized = priority.toUpperCase();
  if (normalized === 'HIGH') {
    return 'high';
  }
  if (normalized === 'MEDIUM') {
    return 'moderate';
  }
  return 'low';
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpClient);
  private readonly dashboard = inject(DashboardService);
  private readonly baseUrl = `${environment.aiApiUrl}/ai`;
  private readonly wellnessUrl = `${environment.wellnessApiUrl}/wellness`;

  private readonly insightsSignal = signal<LocalizedAiInsight[]>([]);
  private readonly globalScoreSignal = signal(0);
  private readonly riskLevelSignal = signal<RiskLevel | null>(null);
  private readonly loadingSignal = signal(true);
  private readonly weeklySummarySignal = signal<WeeklyWellnessSummary | null>(null);
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  readonly insights = this.insightsSignal.asReadonly();
  readonly globalScore = this.globalScoreSignal.asReadonly();
  readonly riskLevel = this.riskLevelSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  constructor() {
    this.refresh();
  }

  /** Reload dashboard + insights after a user mutation (debounced). */
  notifyUserDataChanged(): void {
    this.dashboard.loadAll();
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = setTimeout(() => this.refresh(), 400);
  }

  refresh(): void {
    this.loadingSignal.set(true);
    if (this.dashboard.state().stats === 'idle') {
      this.dashboard.loadAll();
    }

    this.http
      .get<WeeklyWellnessSummary>(`${this.wellnessUrl}/summary/weekly`, {
        params: { startDate: startDate() },
      })
      .pipe(catchError(() => of(null)))
      .subscribe((summary) => {
        this.weeklySummarySignal.set(summary);
        const payload = this.signalsFrom(summary);
        if (!payload) {
          this.insightsSignal.set([]);
          this.globalScoreSignal.set(0);
          this.riskLevelSignal.set(null);
          this.loadingSignal.set(false);
          return;
        }

        forkJoin({
          risk: this.http
            .post<LifestyleRiskResponse>(`${this.baseUrl}/lifestyle-risk`, payload)
            .pipe(catchError(() => of(null))),
          recs: this.http
            .post<RecommendationResponse>(`${this.baseUrl}/recommendations`, {
              sleepMinutes: payload.averageSleepMinutes,
              hydrationMl: payload.averageHydrationMl,
              weeklyWorkoutMinutes: payload.weeklyWorkoutMinutes,
              stressLevel: payload.averageStress,
              fatigueLevel: payload.averageFatigue,
              moodLevel: payload.averageMood,
              dailySteps: payload.averageDailySteps,
            })
            .pipe(catchError(() => of(null))),
        }).subscribe({
          next: ({ risk, recs }) => {
            this.riskLevelSignal.set(risk ? toRisk(risk.riskLevel) : null);
            this.globalScoreSignal.set(risk?.score != null ? Math.round(risk.score) : 0);
            this.insightsSignal.set(this.toInsights(risk, recs, payload));
            this.loadingSignal.set(false);
          },
          error: () => {
            this.insightsSignal.set([]);
            this.loadingSignal.set(false);
          },
        });
      });
  }

  /** Sends a chat message to the FastAPI IA service (Ollama-backed). */
  sendMessage(message: string, history: ChatTurn[] = []): Observable<string> {
    return this.sendChat(message, history).pipe(map((res) => res.answer));
  }

  sendChat(message: string, history: ChatTurn[] = []): Observable<ChatReply> {
    this.dashboard.loadAll();
    return this.http
      .get<WeeklyWellnessSummary>(`${this.wellnessUrl}/summary/weekly`, {
        params: { startDate: startDate() },
      })
      .pipe(
        timeout({ first: 8_000 }),
        catchError(() => of(this.weeklySummarySignal())),
        switchMap((summary) => {
          if (summary) {
            this.weeklySummarySignal.set(summary);
          }
          return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, {
            question: message,
            history: history.slice(-12),
            context: this.chatContext(summary),
          });
        }),
        timeout({ first: 20_000 }),
        map((res) => {
          const answer = (res.answer || res.reply || '').trim();
          if (!answer) {
            throw new Error('empty-assistant-answer');
          }
          return {
            answer,
            proposedAction: res.proposedAction ?? null,
            proposedTask: res.proposedTask ?? null,
          };
        }),
        catchError(() => of(this.localChatReply(message, history))),
      );
  }

  private signalsFrom(summary: WeeklyWellnessSummary | null): {
    averageSleepMinutes?: number;
    averageHydrationMl?: number;
    weeklyWorkoutMinutes?: number;
    averageStress?: number;
    averageFatigue?: number;
    averageMood?: number;
    averageDailySteps?: number;
  } | null {
    if (!summary) {
      return null;
    }
    const payload = {
      averageSleepMinutes: summary.averageSleepMinutes ?? undefined,
      averageHydrationMl: summary.averageHydrationMl ?? undefined,
      weeklyWorkoutMinutes: summary.totalWorkoutMinutes ?? undefined,
      averageStress: summary.averageStress ?? undefined,
      averageFatigue: summary.averageFatigue ?? undefined,
      averageMood: summary.averageMood ?? undefined,
      averageDailySteps: summary.averageDailySteps ?? undefined,
    };
    return Object.values(payload).some((value) => value != null) ? payload : null;
  }

  private toInsights(
    risk: LifestyleRiskResponse | null,
    recs: RecommendationResponse | null,
    payload: NonNullable<ReturnType<AiService['signalsFrom']>>,
  ): LocalizedAiInsight[] {
    const signals = Object.values(payload).filter((value) => value != null).length;
    const confidence = Math.max(
      80,
      Math.round(risk?.confidence ?? analysisConfidence(signals)),
    );
    const insights: LocalizedAiInsight[] = [];
    if (risk) {
      insights.push({
        id: 'lifestyle-risk',
        category: 'wellness',
        risk: toRisk(risk.riskLevel),
        title: `Lifestyle risk: ${risk.riskLevel}`,
        confidence,
        explanation: risk.factors.length
          ? `Flags: ${risk.factors.join(', ').toLowerCase().replaceAll('_', ' ')}.`
          : 'No major lifestyle flags in the last 7 days.',
        recommendation: recs?.recommendations[0]?.message ?? 'Keep logging sleep, water and mood.',
        factors: risk.factors.map((factor) => ({ label: factor.replaceAll('_', ' '), value: risk.riskLevel })),
      });
    }
    for (const item of recs?.recommendations ?? []) {
      insights.push({
        id: `rec-${item.type.toLowerCase()}`,
        category: TYPE_TO_CATEGORY[item.type] ?? 'wellness',
        risk: priorityToRisk(item.priority),
        title: item.type.replaceAll('_', ' '),
        confidence: recommendationConfidence(item.priority),
        explanation: item.message,
        recommendation: item.message,
        factors: [{ label: item.type, value: item.priority }],
      });
    }
    return insights;
  }

  private chatContext(summary: WeeklyWellnessSummary | null = this.weeklySummarySignal()): Record<string, unknown> {
    return {
      planning: this.dashboard.stats(),
      wellness: this.dashboard.wellness(),
      weeklyWellness: this.dashboard.weeklyWellness(),
      weeklySummary: summary ?? this.weeklySummarySignal(),
      upcoming: this.dashboard.upcomingEvent(),
      timeline: this.dashboard.timeline(),
      analysis: {
        globalScore: this.globalScoreSignal(),
        riskLevel: this.riskLevelSignal(),
        confidence: Math.max(
          80,
          ...this.insightsSignal().map((insight) => insight.confidence),
          analysisConfidence(
            Object.values(this.signalsFrom(summary ?? this.weeklySummarySignal()) ?? {}).filter(
              (value) => value != null,
            ).length,
          ),
        ),
        insights: this.insightsSignal().map((insight) => ({
          title: insight.title,
          risk: insight.risk,
          recommendation: insight.recommendation,
        })),
      },
      platform: {
        dashboard: 'Home dashboard: today plan, tasks and wellness snapshot.',
        planning: 'Planning: daily plan, drag tasks, mark them done.',
        tasks: 'Tasks: create, edit, complete or delete tasks.',
        calendar: 'Calendar: add events with date and time.',
        wellness: 'Well-being: log sleep (bedtime + wake-up), mood, stress, fatigue and water.',
        nutrition: 'Nutrition: add meals and drinks.',
        sport: 'Sport: add a workout. Type Autre is available for anything else.',
        notifications: 'Notifications: reminders and alerts.',
        settings: 'Settings → Security: change password or send a reset email.',
        analysis: 'Insights: lifestyle analysis that updates after you log data.',
      },
    };
  }

  private localChatReply(message: string, history: ChatTurn[] = []): ChatReply {
    const lowered = this.effectiveQuestion(message, history).toLowerCase();
    const wellness = this.dashboard.wellness();
    const planning = this.dashboard.stats();
    const summary = this.weeklySummarySignal();
    const durationNote =
      'Sleep duration is the time between bedtime and wake-up in Well-being (including nights that cross midnight).';

    if (/(how (do|can) i|comment (faire|ajouter|créer)|كيف)/i.test(lowered)) {
      if (/(task|tâche|tache|مهمة)/i.test(lowered)) {
        return this.plainReply(
          'Open Tasks or Planning, tap Create a task, fill title, time and duration, then save. You can also ask me: “Create a task: review notes”.',
        );
      }
      if (/(sleep|sommeil|نوم)/i.test(lowered)) {
        return this.plainReply(
          'Open Well-being, add a sleep night with bedtime and wake-up. Duration is calculated automatically, including nights that cross midnight.',
        );
      }
      if (/(password|mot de passe|كلمة المرور)/i.test(lowered)) {
        return this.plainReply('Open Settings → Security to change your password, or send a reset email from there.');
      }
      if (/(meal|repas|nutrition|طعام)/i.test(lowered)) {
        return this.plainReply('Open Nutrition and add a meal (breakfast, lunch, dinner, snack or other) with foods and quantities.');
      }
      if (/(workout|sport|activité|تمرين)/i.test(lowered)) {
        return this.plainReply('Open Sport, add a workout, pick a type (including Autre) and save duration.');
      }
      return this.plainReply(
        'I can walk you through Dashboard, Planning, Tasks, Calendar, Well-being, Nutrition, Sport, Notifications, Settings and Insights. What do you want to do?',
      );
    }
    if (/(sleep|sommeil|نوم|bed|wake|durée|duration)/i.test(lowered)) {
      const last = wellness?.sleep?.value;
      const avg = summary?.averageSleepMinutes;
      if (last) {
        const extra = avg ? ` Weekly average is about ${(avg / 60).toFixed(1)}h.` : '';
        return this.plainReply(`Your last logged sleep is ${last}.${extra} ${durationNote}`);
      }
      if (avg) {
        return this.plainReply(
          `You've averaged about ${(avg / 60).toFixed(1)}h of sleep recently. ${durationNote}`,
        );
      }
      return this.plainReply(
        'I do not have sleep records yet. Log bedtime and wake-up in Well-being; duration is calculated automatically.',
      );
    }
    if (/(hydrat|water|eau|ماء)/i.test(lowered)) {
      const last = wellness?.hydration?.value;
      const avg = summary?.averageHydrationMl;
      if (last) {
        const extra = avg ? ` Weekly average is about ${(avg / 1000).toFixed(1)} L/day.` : '';
        return this.plainReply(`Your last logged hydration is ${last}.${extra}`);
      }
      return this.plainReply('Log a water intake in Well-being, then ask me again.');
    }
    if (/(mood|humeur|مزاج)/i.test(lowered)) {
      const last = wellness?.mood?.value;
      return this.plainReply(last ? `Your last logged mood is ${last}.` : 'Log your mood in Well-being, then ask again.');
    }
    if (/(nutrition|meal|repas|calorie)/i.test(lowered)) {
      const last = wellness?.nutrition?.value;
      return this.plainReply(
        last
          ? `Your last nutrition snapshot is ${last}. Add or edit meals in Nutrition.`
          : 'I do not have meals yet. Open Nutrition and add what you ate.',
      );
    }
    if (/(task|tâche|tache|todo|مهمة|productiv|focus)/i.test(lowered) && planning) {
      return this.plainReply(
        `You've completed ${planning.tasksCompleted} of ${planning.tasksTotal} tasks (${planning.productivityPercent}% productivity).`,
      );
    }
    return this.plainReply(this.afternoonPlan(lowered));
  }

  private afternoonPlan(lowered: string): string {
    const planning = this.dashboard.stats();
    const upcoming = this.dashboard.upcomingEvent();
    const timeline = this.dashboard.timeline();
    const wellness = this.dashboard.wellness();
    const remaining =
      planning != null ? Math.max(0, planning.tasksTotal - planning.tasksCompleted) : null;
    const slot = /(morning|matin)/i.test(lowered)
      ? 'morning'
      : /(evening|soir)/i.test(lowered)
        ? 'evening'
        : 'afternoon';
    const parts: string[] = [];
    if (remaining != null && planning) {
      if (remaining === 0) {
        parts.push(`Your tasks for today are done (${planning.tasksCompleted}/${planning.tasksTotal}).`);
      } else {
        parts.push(
          `Start with the next of your ${remaining} remaining task${remaining > 1 ? 's' : ''} (${planning.tasksCompleted}/${planning.tasksTotal} done).`,
        );
      }
      if (planning.overloaded) {
        parts.push('Your schedule looks full — keep blocks to about 45 minutes and protect a short break.');
      } else if (planning.freeMinutes >= 60) {
        parts.push(`You still have about ${planning.freeMinutes} free minutes; use one block for deep work.`);
      }
    }
    if (upcoming?.title) {
      parts.push(`Protect time for ${upcoming.title}${upcoming.time ? ` at ${upcoming.time}` : ''}.`);
    } else if (timeline.length) {
      const next = timeline[0];
      parts.push(`Next on your timeline: ${next.title}${next.time ? ` at ${next.time}` : ''}.`);
    }
    const energy = wellness?.mood?.value || wellness?.sleep?.value;
    if (energy && remaining) {
      parts.push('If energy is low, do the smallest high-priority task first, drink water, then continue.');
    }
    if (!parts.length) {
      return `For this ${slot}: pick one priority in Tasks, work 45 minutes, then a 10-minute break. Add your tasks and events in Planning so I can sequence them next time.`;
    }
    return parts.join(' ');
  }

  private effectiveQuestion(message: string, history: ChatTurn[]): string {
    const trimmed = message.trim();
    const followUp = trimmed.length < 24 || /^(and|et|what about|aussi|و)/i.test(trimmed);
    if (!followUp || history.length === 0) {
      return trimmed;
    }
    const previous = [...history].reverse().find((turn) => turn.role === 'user')?.content;
    return previous ? `${previous}\n${trimmed}` : trimmed;
  }

  private plainReply(answer: string): ChatReply {
    return { answer, proposedAction: null, proposedTask: null };
  }
}
