import { Component } from '@angular/core';
import { NavbarComponent } from './layout/navbar/navbar';
import { HeroComponent } from './features/hero/hero';
import { SobreComponent } from './features/sobre/sobre';
import { ExperienciaComponent } from './features/experiencia/experiencia';
import { SkillsComponent } from './features/skills/skills';
import { ProjetosComponent } from './features/projetos/projetos';
import { ContatoComponent } from './features/contato/contato';
import { FooterComponent } from './layout/footer/footer';

@Component({
  imports: [NavbarComponent, HeroComponent, SobreComponent, ExperienciaComponent, SkillsComponent, ProjetosComponent, ContatoComponent, FooterComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
