import { Injectable, signal } from '@angular/core';

const SECTIONS = ['sobre', 'experiencia', 'skills', 'projetos', 'contato'] as const;
type Section = typeof SECTIONS[number];
const NAV_TARGETS = ['inicio', ...SECTIONS] as const;

@Injectable({ providedIn: 'root' })
export class SecaoAtivaService {
  readonly active = signal<Section | null>(null);
  private observer?: IntersectionObserver;
  private initialized = false;
  private readonly visible = new Map<string, IntersectionObserverEntry>();
  private pending = false;
  private settleTimer?: ReturnType<typeof setTimeout>;
  private readonly onScrollEnd = () => this.finishNavigation();
  private readonly onScroll = () => { if (!this.pending) this.updateActive(); };

  initialize(): void {
    if (this.initialized || typeof IntersectionObserver === 'undefined') return;
    this.initialized = true;
    requestAnimationFrame(() => this.observeSections());
  }

  private observeSections(): void {
    const targets = SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el && el.getBoundingClientRect().height > 1);
    try {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => entry.isIntersecting ? this.visible.set(entry.target.id, entry) : this.visible.delete(entry.target.id));
        if (!this.pending) this.updateActive();
      }, { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5] });
      targets.forEach((target) => this.observer?.observe(target));
    } catch { this.observer = undefined; }
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('scrollend', this.onScrollEnd);
  }

  navigate(id: string): void {
    if (!NAV_TARGETS.includes(id as typeof NAV_TARGETS[number])) return;
    const section = id as typeof NAV_TARGETS[number];
    this.pending = true;
    clearTimeout(this.settleTimer);
    this.active.set(section === 'inicio' ? null : section);
    document.getElementById(section)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    this.settleTimer = setTimeout(this.onScrollEnd, 1600);
  }

  private finishNavigation(): void {
    if (!this.pending) return;
    this.pending = false;
    clearTimeout(this.settleTimer);
    this.updateActive();
  }

  private updateActive(): void {
    const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
    if (atPageEnd) {
      const lastSection = SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el && el.getBoundingClientRect().height > 1).at(-1);
      if (lastSection) {
        this.active.set(lastSection.id as Section);
        return;
      }
    }
    const current = [...this.visible.values()].sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    this.active.set(current ? current.target.id as Section : null);
  }
}
