import { Component, OnInit, signal } from '@angular/core';
import { SecaoAtivaService } from '../../shared/secao-ativa.service';

@Component({ selector: 'app-navbar', standalone: true, templateUrl: './navbar.html', styleUrl: './navbar.scss' })
export class NavbarComponent implements OnInit {
  protected readonly active;
  constructor(private readonly sections: SecaoAtivaService) { this.active = sections.active; }
  ngOnInit(): void { this.sections.initialize(); }
  protected navigate(id: string): void { this.sections.navigate(id); this.closeMenu(); }
  protected readonly menuOpen = signal(false);
  protected toggleMenu(): void { this.menuOpen.update((open) => !open); }
  protected closeMenu(): void { this.menuOpen.set(false); }
}
