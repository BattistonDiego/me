import { Component } from '@angular/core';
import { NavbarComponent } from './layout/navbar/navbar';
import { HeroComponent } from './features/hero/hero';
import { SobreComponent } from './features/sobre/sobre';
import { ExperienciaComponent } from './features/experiencia/experiencia';

@Component({
  imports: [NavbarComponent, HeroComponent, SobreComponent, ExperienciaComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
