import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { TaskCategory } from '../../tasks/models/task.models';

interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  colorCode: string | null;
  systemCategory: boolean;
  active: boolean;
}

const DEFAULT_CATEGORY_NAMES: Record<TaskCategory, string> = {
  work: 'Work',
  personal: 'Personal',
  sport: 'Sport',
  studies: 'Studies',
};

/**
 * Bridges the frontend's fixed `TaskCategory` union with planning-service's
 * per-user category UUIDs. Ensures the four default categories exist for the
 * current user and exposes id <-> key lookups.
 */
@Injectable({ providedIn: 'root' })
export class TaskCategoryDirectoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.planningApiUrl}/task-categories`;

  private ready$: Observable<Map<TaskCategory, string>> | null = null;
  private idToKey = new Map<string, TaskCategory>();
  private keyToId = new Map<TaskCategory, string>();

  /** Loads (and bootstraps if needed) the category directory. Cached after first call. */
  load(): Observable<Map<TaskCategory, string>> {
    if (!this.ready$) {
      this.ready$ = this.http.get<CategoryResponse[]>(this.baseUrl).pipe(
        switchMap((categories) => this.ensureDefaults(categories)),
        map((categories) => this.buildMaps(categories)),
        shareReplay(1),
      );
    }
    return this.ready$;
  }

  categoryIdFor(category: TaskCategory): string | undefined {
    return this.keyToId.get(category);
  }

  categoryFor(categoryId: string | null | undefined): TaskCategory {
    if (!categoryId) {
      return 'personal';
    }
    return this.idToKey.get(categoryId) ?? 'personal';
  }

  private ensureDefaults(existing: CategoryResponse[]): Observable<CategoryResponse[]> {
    const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));
    const missing = (Object.entries(DEFAULT_CATEGORY_NAMES) as [TaskCategory, string][]).filter(
      ([, name]) => !existingNames.has(name.toLowerCase()),
    );

    if (missing.length === 0) {
      return of(existing);
    }

    const creations = missing.map(([, name]) =>
      this.http.post<CategoryResponse>(this.baseUrl, { name, description: null, colorCode: null }),
    );

    return forkJoin(creations).pipe(map((created) => [...existing, ...created]));
  }

  private buildMaps(categories: CategoryResponse[]): Map<TaskCategory, string> {
    this.idToKey = new Map();
    this.keyToId = new Map();
    const nameToKey = new Map(
      (Object.entries(DEFAULT_CATEGORY_NAMES) as [TaskCategory, string][]).map(([key, name]) => [
        name.toLowerCase(),
        key,
      ]),
    );
    for (const category of categories) {
      const key = nameToKey.get(category.name.toLowerCase());
      if (key) {
        this.idToKey.set(category.id, key);
        this.keyToId.set(key, category.id);
      }
    }
    return this.keyToId;
  }
}
