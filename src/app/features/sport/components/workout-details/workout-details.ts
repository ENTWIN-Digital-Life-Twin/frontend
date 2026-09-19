import { Component, computed, inject, input, model, output } from '@angular/core';
import {
  LucideCalendar,
  LucideClock,
  LucideDynamicIcon,
  LucideFlame,
  LucideMapPin,
  LucidePencil,
  LucideTrash2,
  LucideX,
  LucideZap,
} from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { Button } from '../../../../shared/ui/button/button';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Drawer } from '../../../../shared/ui/drawer/drawer';
import {
  WORKOUT_TYPE_BAR,
  WORKOUT_TYPE_CHIP,
  WORKOUT_TYPE_ICONS,
  formatDistance,
  formatDuration,
  type Workout,
  type WorkoutIntensity,
  type WorkoutType,
} from '../../models/sport.models';

function dateLabelFor(iso: string, locale: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(year, month - 1, day));
}

@Component({
  selector: 'app-workout-details',
  imports: [Drawer, Button, Badge, LucideDynamicIcon, LucideCalendar, LucideClock, LucideFlame, LucideMapPin, LucidePencil, LucideTrash2, LucideX, LucideZap],
  template: `
    <app-drawer [(open)]="open" side="right">
      <div class="flex min-h-full flex-col bg-gradient-to-b from-surface to-background">
        <header class="border-b border-line p-6">
          <div class="flex items-start justify-between gap-3">
            <span
              class="flex h-12 w-12 items-center justify-center rounded-panel shadow-card"
              [class]="WORKOUT_TYPE_CHIP[workout().type]"
            >
              <svg [lucideIcon]="icon()" class="h-6 w-6" aria-hidden="true"></svg>
            </span>
            <button
              appButton
              variant="ghost"
              size="icon"
              [attr.aria-label]="closeLabel()"
              (click)="open.set(false)"
            >
              <span class="sr-only">{{ closeShortLabel() }}</span>
              <svg lucideX class="h-4 w-4" aria-hidden="true"></svg>
            </button>
          </div>
          <p class="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {{ WORKOUT_TYPE_LABELS()[workout().type] }}
          </p>
          <h2 class="mt-1 font-display text-2xl font-semibold tracking-tight text-primary">
            {{ t(workout().title) }}
          </h2>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <app-badge variant="accent" [dot]="true">{{ INTENSITY_LABELS()[workout().intensity] }}</app-badge>
            <app-badge variant="neutral">{{ dateLabel() }}</app-badge>
          </div>
        </header>

        <div class="flex-1 p-6">
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-panel border border-line bg-surface p-3.5">
              <svg lucideClock class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
              <p class="mt-2 font-display text-base font-bold tabular-nums text-primary">
                {{ formatDuration(workout().duration) }}
              </p>
              <p class="text-[11px] text-ink-muted">{{ durationLabel() }}</p>
            </div>
            <div class="rounded-panel border border-line bg-surface p-3.5">
              <svg lucideMapPin class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
              <p class="mt-2 font-display text-base font-bold tabular-nums text-primary">
                {{ formatDistance(workout().distance) }}
              </p>
              <p class="text-[11px] text-ink-muted">{{ distanceLabel() }}</p>
            </div>
            <div class="rounded-panel border border-line bg-surface p-3.5">
              <svg lucideFlame class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
              <p class="mt-2 font-display text-base font-bold tabular-nums text-primary">
                {{ workout().calories }}
              </p>
              <p class="text-[11px] text-ink-muted">kcal</p>
            </div>
            <div class="rounded-panel border border-line bg-surface p-3.5">
              <svg lucideZap class="h-4 w-4 text-accent-dark" aria-hidden="true"></svg>
              <p class="mt-2 font-display text-base font-bold tabular-nums text-primary">
                {{ workout().startTime }}
              </p>
              <p class="text-[11px] text-ink-muted">{{ startLabel() }}</p>
            </div>
          </div>

          @if (workout().notes) {
            <div class="mt-5 rounded-panel border border-line bg-surface p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-ink-muted">{{ notesLabel() }}</p>
              <p class="mt-1.5 text-sm leading-relaxed text-ink">{{ t(workout().notes) }}</p>
            </div>
          }

          <div class="mt-5 rounded-panel border border-line bg-surface p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {{ intensityTitleLabel() }}
            </p>
            <div class="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface-strong">
              <div
                class="h-full rounded-full transition-all duration-500"
                [class]="barClass"
                [style.width]="intensityPercent + '%'"
              ></div>
            </div>
            <div class="mt-2 flex items-center justify-between text-xs">
              <span class="text-ink-muted">{{ lightLabel() }}</span>
              <span class="text-ink-muted">{{ highLabel() }}</span>
            </div>
          </div>

          <div class="mt-5 flex items-center gap-2 rounded-panel bg-teal-50/70 p-3 text-xs text-accent-dark">
            <svg lucideCalendar class="h-4 w-4 shrink-0" aria-hidden="true"></svg>
            {{ recordedLabel() }}
          </div>
        </div>

        <footer class="flex gap-2 border-t border-line p-4 sm:p-6">
          <button appButton variant="secondary" size="md" class="flex-1" (click)="edit.emit(workout())">
            <svg lucidePencil class="h-4 w-4" aria-hidden="true"></svg>
            {{ editLabel() }}
          </button>
          <button appButton variant="danger" size="md" class="flex-1" (click)="delete.emit(workout())">
            <svg lucideTrash2 class="h-4 w-4" aria-hidden="true"></svg>
            {{ deleteLabel() }}
          </button>
        </footer>
      </div>
    </app-drawer>
  `,
})
export class WorkoutDetails {
  readonly workout = input.required<Workout>();
  readonly open = model(true);
  readonly edit = output<Workout>();
  readonly delete = output<Workout>();

  private readonly languageService = inject(LanguageService);

  protected t(key: string): string {
    return this.languageService.translate(key);
  }

  protected readonly WORKOUT_TYPE_CHIP = WORKOUT_TYPE_CHIP;
  protected readonly formatDuration = formatDuration;
  protected readonly formatDistance = formatDistance;

  protected readonly closeLabel = this.languageService.translateSignal('sportDetails.close');
  protected readonly closeShortLabel = this.languageService.translateSignal(
    'sportDetails.closeShort',
  );
  protected readonly durationLabel = this.languageService.translateSignal('sportDetails.duration');
  protected readonly distanceLabel = this.languageService.translateSignal('sportDetails.distance');
  protected readonly startLabel = this.languageService.translateSignal('sportDetails.start');
  protected readonly notesLabel = this.languageService.translateSignal('sportDetails.notes');
  protected readonly intensityTitleLabel = this.languageService.translateSignal(
    'sportDetails.intensity',
  );
  protected readonly lightLabel = this.languageService.translateSignal('sportDetails.light');
  protected readonly highLabel = this.languageService.translateSignal('sportDetails.high');
  protected readonly recordedLabel = this.languageService.translateSignal('sportDetails.recorded');
  protected readonly editLabel = this.languageService.translateSignal('sportDetails.edit');
  protected readonly deleteLabel = this.languageService.translateSignal('sportDetails.delete');

  protected readonly WORKOUT_TYPE_LABELS = computed<Record<WorkoutType, string>>(() => ({
    running: this.languageService.translate('sport.types.running'),
    walking: this.languageService.translate('sport.types.walking'),
    cycling: this.languageService.translate('sport.types.cycling'),
    gym: this.languageService.translate('sport.types.gym'),
    stretching: this.languageService.translate('sport.types.stretching'),
  }));

  protected readonly INTENSITY_LABELS = computed<Record<WorkoutIntensity, string>>(() => ({
    low: this.languageService.translate('sportForm.intensityOptions.low'),
    medium: this.languageService.translate('sportForm.intensityOptions.medium'),
    high: this.languageService.translate('sportForm.intensityOptions.high'),
  }));

  protected readonly dateLabel = computed(() =>
    dateLabelFor(this.workout().date, this.languageService.getLocale()),
  );

  protected readonly icon = () => WORKOUT_TYPE_ICONS[this.workout().type];

  protected get intensityPercent(): number {
    return this.workout().intensity === 'high'
      ? 90
      : this.workout().intensity === 'medium'
        ? 55
        : 25;
  }
  protected get barClass(): string {
    return WORKOUT_TYPE_BAR[this.workout().type];
  }
}
