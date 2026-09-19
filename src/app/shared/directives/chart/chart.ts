import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
} from '@angular/core';
import type { ChartConfiguration } from 'chart.js/auto';

const THEME_ATTRIBUTES = ['data-theme', 'data-contrast', 'data-accent'];

let chartJsPromise: Promise<typeof import('chart.js/auto')> | null = null;

function loadChartJs(): Promise<typeof import('chart.js/auto')> {
  if (!chartJsPromise) {
    chartJsPromise = import('chart.js/auto');
  }
  return chartJsPromise;
}

@Directive({
  selector: 'canvas[appChart]',
})
export class ChartDirective implements AfterViewInit, OnDestroy {
  readonly config = input.required<ChartConfiguration>();

  private readonly host = inject<ElementRef<HTMLCanvasElement>>(ElementRef);
  private chart: InstanceType<typeof import('chart.js/auto')['Chart']> | null = null;
  private themeObserver: MutationObserver | null = null;

  constructor() {
    effect(() => {
      const chart = this.chart;
      if (!chart) {
        return;
      }
      const resolved = this.resolveTokens(this.config());
      chart.data = resolved.data;
      if (resolved.options) {
        chart.options = resolved.options;
      }
      chart.update();
    });
  }

  ngAfterViewInit(): void {
    loadChartJs().then(({ Chart }) => {
      this.chart = new Chart(this.host.nativeElement, this.resolveTokens(this.config()));

      this.themeObserver = new MutationObserver(() => {
        const chart = this.chart;
        if (!chart) {
          return;
        }
        chart.options = this.resolveTokens(this.config()).options ?? chart.options;
        chart.update();
      });
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: THEME_ATTRIBUTES,
      });
    });
  }

  ngOnDestroy(): void {
    this.themeObserver?.disconnect();
    this.themeObserver = null;
    this.chart?.destroy();
    this.chart = null;
  }

  /** Replaces `var(--token)` references with their resolved values so chart
   * colors follow the active theme. */
  private resolveTokens<T>(value: T): T {
    if (typeof value === 'string') {
      return this.resolveString(value) as T;
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.resolveTokens(item)) as T;
    }
    if (value !== null && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        out[key] = this.resolveTokens(item);
      }
      return out as T;
    }
    return value;
  }

  private resolveString(value: string): string {
    if (!value.includes('var(')) {
      return value;
    }
    const styles = getComputedStyle(document.documentElement);
    return value.replace(/var\((--[a-zA-Z0-9-]+)\)/g, (match, name: string) => {
      return styles.getPropertyValue(name).trim() || match;
    });
  }
}
