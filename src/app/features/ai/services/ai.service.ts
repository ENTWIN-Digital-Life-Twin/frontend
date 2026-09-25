import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of, type Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';
import type { AiCategory, LocalizedAiInsight, RiskLevel } from '../models/ai.models';

interface LifestyleRiskResponse {
  riskLevel: string;
  score: number | null;
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

  readonly insights = this.insightsSignal.asReadonly();
  readonly globalScore = this.globalScoreSignal.asReadonly();
  readonly riskLevel = this.riskLevelSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  constructor() {
    this.refresh();
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
            this.insightsSignal.set(this.toInsights(risk, recs));
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
  sendMessage(message: string): Observable<string> {
    return this.http
      .post<ChatResponse>(`${this.baseUrl}/chat`, {
        question: message,
        context: this.chatContext(),
      })
      .pipe(map((res) => res.answer || res.reply || ''));
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
  ): LocalizedAiInsight[] {
    const insights: LocalizedAiInsight[] = [];
    if (risk) {
      insights.push({
        id: 'lifestyle-risk',
        category: 'wellness',
        risk: toRisk(risk.riskLevel),
        title: `Lifestyle risk: ${risk.riskLevel}`,
        confidence: risk.score != null ? Math.min(100, Math.round(risk.score)) : 70,
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
        confidence: item.priority.toUpperCase() === 'HIGH' ? 85 : 70,
        explanation: item.message,
        recommendation: item.message,
        factors: [{ label: item.type, value: item.priority }],
      });
    }
    return insights;
  }

  private chatContext(): Record<string, unknown> {
    return {
      planning: this.dashboard.stats(),
      wellness: this.dashboard.wellness(),
      weeklyWellness: this.dashboard.weeklyWellness(),
      upcoming: this.dashboard.upcomingEvent(),
    };
  }
}
