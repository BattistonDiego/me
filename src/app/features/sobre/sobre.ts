import { Component, signal } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({ selector: 'app-sobre', standalone: true, imports: [RevealDirective], templateUrl: './sobre.html', styleUrl: './sobre.scss' })
export class SobreComponent {
  protected readonly years = signal(0);
  protected readonly stats = [
    { value: '5+', label: 'anos de experiência', countUp: true },
    { value: '2019', label: 'no mercado de tecnologia, aprendendo e evoluindo desde então' },
    { value: '+ Pessoas', label: 'atendimento ao cliente e trabalho em equipe fazem parte da minha rotina', textual: true },
  ];
  private started = false;

  protected startCounters(): void {
    if (this.started) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.years.set(5);
      this.started = true;
      return;
    }
    this.started = true;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.years.set(Math.round(5 * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
