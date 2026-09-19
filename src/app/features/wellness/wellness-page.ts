import { Component, computed, inject, signal } from '@angular/core';
import { LucideDroplets, LucideMoon } from '@lucide/angular';
import { LanguageService } from '../../core/services/language.service';
import { Reveal } from '../../shared/directives/reveal/reveal';
import { Toast, type ToastTone } from '../../shared/ui/toast/toast';
import { AiWellnessInsight } from './components/ai-wellness-insight/ai-wellness-insight';
import { FatigueCard } from './components/fatigue-card/fatigue-card';
import { HydrationCard } from './components/hydration-card/hydration-card';
import { MoodCard } from './components/mood-card/mood-card';
import { SleepCard } from './components/sleep-card/sleep-card';
import { StressCard } from './components/stress-card/stress-card';
import { WellnessBreakdown } from './components/wellness-breakdown/wellness-breakdown';
import { WellnessChart } from './components/wellness-chart/wellness-chart';
import { WellnessDataForm } from './components/wellness-data-form/wellness-data-form';
import { WellnessGoals } from './components/wellness-goals/wellness-goals';
import { WellnessHeader } from './components/wellness-header/wellness-header';
import { WellnessMetric } from './components/wellness-metric/wellness-metric';
import { WellnessOverview } from './components/wellness-overview/wellness-overview';
import { WellnessTimeline } from './components/wellness-timeline/wellness-timeline';
import { WellnessService } from './services/wellness.service';

@Component({
  selector: 'app-wellness-page',
  imports: [
    Reveal,
    Toast,
    WellnessHeader,
    WellnessOverview,
    WellnessMetric,
    MoodCard,
    StressCard,
    FatigueCard,
    WellnessChart,
    AiWellnessInsight,
    HydrationCard,
    SleepCard,
    WellnessTimeline,
    WellnessBreakdown,
    WellnessGoals,
    WellnessDataForm,
  ],
  template: `
    <div class="space-y-6">
      <app-wellness-header class="well-card" (add)="openForm()" />

      <div
        appReveal
        revealStagger=".well-card"
        class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12"
      >
        <app-wellness-overview class="well-card xl:col-span-4" />

        <app-wellness-metric
          class="well-card xl:col-span-2"
          [icon]="moonIcon"
          [label]="sleep()"
          [value]="service.sleepDuration()"
          [goal]="sleepGoal()"
          [progress]="service.sleepPercent()"
          [delta]="service.sleepDeltaLabel()"
          [positive]="true"
          tone="navy"
        />

        <app-wellness-metric
          class="well-card xl:col-span-2"
          [icon]="dropletsIcon"
          [label]="hydration()"
          [value]="service.hydrationLabel()"
          [goal]="hydrationGoal()"
          [progress]="service.hydrationPercent()"
          [delta]="hydrationDelta()"
          [positive]="true"
          tone="teal"
        />

        <app-mood-card class="well-card xl:col-span-2" (changed)="onMoodChanged()" />
        <app-stress-card class="well-card xl:col-span-2" (changed)="onStressChanged()" />

        <app-fatigue-card class="well-card xl:col-span-3" />
        <app-wellness-chart class="well-card xl:col-span-6" />
        <app-ai-wellness-insight class="well-card xl:col-span-3" />

        <app-hydration-card class="well-card xl:col-span-4" (add)="onAddWater()" />
        <app-sleep-card class="well-card xl:col-span-5" />
        <app-wellness-timeline class="well-card xl:col-span-3" />

        <app-wellness-breakdown class="well-card xl:col-span-4" />
        <app-wellness-goals class="well-card xl:col-span-8" />
      </div>
    </div>

    @if (modalOpen()) {
      <app-wellness-data-form (saved)="onDataSaved()" (closed)="modalOpen.set(false)" />
    }

    @if (toast(); as message) {
      <app-toast [message]="message" [tone]="toastTone()" (closed)="toast.set(null)" />
    }
  `,
})
export class WellnessPage {
  protected readonly service = inject(WellnessService);
  private readonly languageService = inject(LanguageService);

  protected readonly moonIcon = LucideMoon;
  protected readonly dropletsIcon = LucideDroplets;

  protected readonly sleep = this.languageService.translateSignal('wellnessPage.metrics.sleep');
  protected readonly sleepGoal = this.languageService.translateSignal('wellnessPage.metrics.sleepGoal');
  protected readonly hydration = this.languageService.translateSignal(
    'wellnessPage.metrics.hydration',
  );
  protected readonly hydrationGoal = computed(() =>
    this.languageService.translate('wellnessPage.metrics.hydrationGoal', {
      value: this.service.hydrationGoalLabel(),
    }),
  );
  protected readonly hydrationDelta = this.languageService.translateSignal(
    'wellnessPage.metrics.hydrationDelta',
  );

  protected readonly modalOpen = signal(false);
  protected readonly toast = signal<string | null>(null);
  protected readonly toastTone = signal<ToastTone>('primary');

  protected openForm(): void {
    this.modalOpen.set(true);
  }

  protected onDataSaved(): void {
    this.modalOpen.set(false);
    this.toastTone.set('success');
    this.toast.set(this.languageService.translate('wellnessPage.toast.dataAdded'));
  }

  protected onAddWater(): void {
    this.service.addHydration(250);
    this.toastTone.set('success');
    this.toast.set(this.languageService.translate('wellnessPage.toast.waterAdded'));
  }

  protected onMoodChanged(): void {
    this.toastTone.set('success');
    this.toast.set(this.languageService.translate('wellnessPage.toast.moodUpdated'));
  }

  protected onStressChanged(): void {
    this.toastTone.set('success');
    this.toast.set(this.languageService.translate('wellnessPage.toast.stressUpdated'));
  }
}
