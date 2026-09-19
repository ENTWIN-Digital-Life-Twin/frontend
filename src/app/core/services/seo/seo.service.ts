import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  ogType?: string;
  robots?: string;
  canonical?: string | null;
}

const DEFAULT_TITLE = 'Digital Life Twin — Votre quotidien, enfin compris';
const DEFAULT_DESCRIPTION =
  'Digital Life Twin centralise votre planning, vos habitudes et votre bien-être pour vous aider à mieux organiser votre quotidien.';

/**
 * Lightweight client-side SEO manager.
 * Updates document.title, meta description, canonical, Open Graph, Twitter
 * and robots tags. Authenticated (private) routes must pass `noindex`.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);

  apply(config: SeoConfig | null | undefined): void {
    const cfg = config ?? {};
    const title = cfg.title ?? DEFAULT_TITLE;
    const description = cfg.description ?? DEFAULT_DESCRIPTION;
    const robots = cfg.robots ?? 'index, follow';
    const canonical = cfg.canonical ?? this.canonicalForCurrentPath();
    const image = cfg.image ?? this.defaultImage();

    this.document.title = title;
    this.setMeta('description', description);
    this.setMeta('robots', robots);

    this.setLink('canonical', canonical);

    this.setMeta('og:title', title, 'property');
    this.setMeta('og:description', description, 'property');
    this.setMeta('og:type', cfg.ogType ?? 'website', 'property');
    this.setMeta('og:url', canonical, 'property');
    this.setMeta('og:site_name', 'Digital Life Twin', 'property');
    this.setMeta('og:image', image, 'property');
    this.setMeta('og:locale', 'fr_FR', 'property');

    this.setMeta('twitter:card', 'summary_large_image', 'name');
    this.setMeta('twitter:title', title, 'name');
    this.setMeta('twitter:description', description, 'name');
    this.setMeta('twitter:image', image, 'name');
  }

  private setMeta(
    name: string,
    content: string,
    attribute: 'name' | 'property' = 'name',
  ): void {
    const head = this.document.head;
    let el = head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
    if (!el) {
      el = this.document.createElement('meta');
      el.setAttribute(attribute, name);
      head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  private setLink(rel: string, href: string): void {
    const head = this.document.head;
    let el = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
      el = this.document.createElement('link');
      el.setAttribute('rel', rel);
      head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  private canonicalForCurrentPath(): string {
    const win = this.document.defaultView;
    if (!win) {
      return '/';
    }
    return `${win.location.origin}${win.location.pathname}`;
  }

  private defaultImage(): string {
    const win = this.document.defaultView;
    const base = win ? win.location.origin : '';
    return `${base}/brand/logo.png`;
  }
}
