import { Injectable, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import {
  CATEGORY_ICONS,
  CATEGORY_KEYS,
  PLANNING_SAMPLE_ENTRIES,
  nextDateISO,
  prevDateISO,
  toMinutes,
  todayISO,
  weekDates,
  type DaySummary,
  type PlanningCategory,
  type PlanningEntry,
  type PlanningFilter,
  type PlanningView,
} from '../models/planning.models';

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private readonly languageService = inject(LanguageService);

  readonly entries = signal<PlanningEntry[]>(PLANNING_SAMPLE_ENTRIES);

  readonly selectedDate = signal<string>(todayISO());
  readonly filter = signal<PlanningFilter>('all');
  readonly view = signal<PlanningView>('day');
  readonly selectedEntryId = signal<string | null>(null);

  readonly isToday = computed(() => this.selectedDate() === todayISO());

  readonly filteredEntries = computed(() =>
    this.entriesFor(this.selectedDate()).filter((entry) => this.matches(entry)),
  );

  readonly selectedEntry = computed(() => {
    const id = this.selectedEntryId();
    if (!id) {
      return null;
    }
    return this.entries().find((entry) => entry.id === id) ?? null;
  });

  readonly week = computed(() => weekDates(this.selectedDate()));

  readonly weekRangeLabel = computed(() => {
    const [first, last] = this.week();
    const locale = this.languageService.getLocale();
    const fmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' });
    const f = new Date(`${first}T00:00:00`);
    const l = new Date(`${last}T00:00:00`);
    return `${fmt.format(f)} – ${fmt.format(l)}`;
  });

  readonly summary = computed<DaySummary>(() => {
    const list = this.entriesFor(this.selectedDate());
    const tasks = list.filter((entry) => entry.type === 'task');
    const events = list.filter((entry) => entry.type === 'event');
    const blocks = list.filter((entry) => entry.type !== 'free');
    const done = tasks.filter((entry) => entry.status === 'done');

    const total = blocks.reduce((acc, entry) => acc + entry.duration, 0);
    const freeMinutes = list
      .filter((entry) => entry.type === 'free')
      .reduce((acc, entry) => acc + entry.duration, 0);

    const categories: { category: PlanningCategory; minutes: number }[] = (
      ['work', 'personal', 'sport', 'meals'] as PlanningCategory[]
    )
      .map((category) => ({
        category,
        minutes: blocks
          .filter((entry) => entry.category === category)
          .reduce((acc, entry) => acc + entry.duration, 0),
      }))
      .filter((item) => item.minutes > 0);

    const loadPercent = Math.min(100, Math.round((total / 960) * 100));

    return {
      totalTasks: tasks.length,
      doneTasks: done.length,
      totalEvents: events.length,
      blocks: blocks.length,
      freeMinutes,
      loadPercent,
      tone: loadPercent > 75 ? 'danger' : loadPercent > 50 ? 'warning' : 'primary',
      categories,
    };
  });

  setFilter(filter: PlanningFilter): void {
    this.filter.set(filter);
  }

  selectDate(iso: string): void {
    this.selectedDate.set(iso);
  }

  goToday(): void {
    this.selectedDate.set(todayISO());
  }

  goPreviousDay(): void {
    this.selectedDate.set(prevDateISO(this.selectedDate()));
  }

  goNextDay(): void {
    this.selectedDate.set(nextDateISO(this.selectedDate()));
  }

  setView(view: PlanningView): void {
    this.view.set(view);
  }

  openEntry(id: string): void {
    this.selectedEntryId.set(id);
  }

  closeEntry(): void {
    this.selectedEntryId.set(null);
  }

  toggleComplete(id: string): void {
    this.entries.update((entries) =>
      entries.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status: entry.status === 'done' ? 'todo' : 'done',
            }
          : entry,
      ),
    );
  }

  addEntry(entry: PlanningEntry): void {
    this.entries.update((entries) => [...entries, entry]);
    this.selectedDate.set(entry.date);
    this.selectedEntryId.set(entry.id);
  }

  updateEntry(entry: PlanningEntry): void {
    this.entries.update((entries) =>
      entries.map((item) => (item.id === entry.id ? entry : item)),
    );
  }

  deleteEntry(id: string): void {
    this.entries.update((entries) => entries.filter((entry) => entry.id !== id));
    this.selectedEntryId.set(null);
  }

  entriesFor(iso: string): PlanningEntry[] {
    return this.entries()
      .filter((entry) => entry.date === iso)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }

  dayHasEntries(iso: string): boolean {
    return this.entriesFor(iso).length > 0;
  }

  dayCount(iso: string): number {
    return this.entriesFor(iso).length;
  }

  categoryIcon(category: PlanningCategory): typeof CATEGORY_ICONS[PlanningCategory] {
    return CATEGORY_ICONS[category];
  }

  categoryLabel(category: PlanningCategory): string {
    return this.languageService.translate(CATEGORY_KEYS[category]);
  }

  planDay(): void {
    const planned = this.planSchedule();
    this.entries.update((entries) => [
      ...entries.filter((entry) => entry.date !== this.selectedDate() || entry.type === 'free'),
      ...planned,
    ]);
    this.selectedEntryId.set(null);
  }

  private matches(entry: PlanningEntry): boolean {
    const filter = this.filter();
    if (filter === 'all') {
      return true;
    }
    if (filter === 'tasks') {
      return entry.type === 'task';
    }
    if (filter === 'events') {
      return entry.type === 'event';
    }
    return entry.category === filter;
  }

  private planSchedule(): PlanningEntry[] {
    const date = this.selectedDate();
    const existing = this.entriesFor(date).filter((entry) => entry.type !== 'free');
    const t = (key: string) => this.languageService.translate<string>(key);
    const blocks: PlanningEntry[] = [
      {
        id: `plan-${date}-1`,
        type: 'task',
        title: t('mock.planSchedule.review'),
        category: 'work',
        date,
        start: '09:00',
        end: '10:30',
        duration: 90,
        status: 'todo',
        priority: 'high',
        tone: 'primary',
      },
      {
        id: `plan-${date}-2`,
        type: 'event',
        title: t('mock.planSchedule.lecture'),
        category: 'work',
        date,
        start: '10:45',
        end: '12:15',
        duration: 90,
        tone: 'accent',
      },
      {
        id: `plan-${date}-3`,
        type: 'break',
        title: t('mock.planSchedule.lunch'),
        category: 'meals',
        date,
        start: '12:30',
        end: '13:30',
        duration: 60,
        tone: 'warning',
      },
      {
        id: `plan-${date}-4`,
        type: 'task',
        title: t('mock.planSchedule.practicalWork'),
        category: 'work',
        date,
        start: '14:00',
        end: '15:30',
        duration: 90,
        status: 'todo',
        priority: 'medium',
        tone: 'primary',
      },
      {
        id: `plan-${date}-5`,
        type: 'sport',
        title: t('mock.planSchedule.workout'),
        category: 'sport',
        date,
        start: '18:00',
        end: '19:00',
        duration: 60,
        tone: 'danger',
      },
      {
        id: `plan-${date}-6`,
        type: 'free',
        title: t('mock.planSchedule.freeEvening'),
        category: 'free',
        date,
        start: '19:30',
        end: '22:00',
        duration: 150,
        tone: 'primary',
      },
    ];
    const plannedIds = new Set(blocks.map((entry) => entry.id));
    return [...existing.filter((entry) => !plannedIds.has(entry.id)), ...blocks].sort(
      (a, b) => toMinutes(a.start) - toMinutes(b.start),
    );
  }
}
