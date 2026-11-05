import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { GlobeComponent } from './globo/globo';

@Component({ selector: 'app-hero', standalone: true, imports: [GlobeComponent], templateUrl: './hero.html', styleUrl: './hero.scss' })
export class HeroComponent implements OnInit, OnDestroy {
  protected readonly heroVisible = signal(true);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    try {
      this.observer = new IntersectionObserver(([entry]) => this.heroVisible.set(entry.intersectionRatio > 0.5), { threshold: [0, 0.5, 1] });
      const hero = document.getElementById('inicio');
      if (hero) this.observer.observe(hero);
    } catch { this.observer = undefined; }
  }

  ngOnDestroy(): void { this.observer?.disconnect(); }
}
