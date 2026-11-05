import { Component, signal } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({ selector: 'app-sobre', standalone: true, imports: [RevealDirective], templateUrl: './sobre.html', styleUrl: './sobre.scss' })
export class SobreComponent {
  protected readonly years = signal(0);
  protected readonly homepage = signal(0);
  protected readonly dashboards = signal(0);
  private started = false;

  protected startCounters(): void {
    if (this.started || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.started = true;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.years.set(Math.round(5 * eased));
      this.homepage.set(Math.round(50 * eased));
      this.dashboards.set(Math.round(95 * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
