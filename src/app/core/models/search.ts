import type { LucideIcon } from '@lucide/angular';

export type SearchCategory = 'pages' | 'tasks' | 'events' | 'planning' | 'notifications' | 'workouts' | 'meals';

export interface SearchResult {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle: string;
  path: string;
  icon: LucideIcon;
  /** 0 = exact match, higher = lower priority */
  rank: number;
}

export interface SearchResultGroup {
  category: SearchCategory;
  labelKey: string;
  items: SearchResult[];
}
