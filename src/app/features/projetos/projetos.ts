import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';

export type CapaProjeto = 'habitos' | 'kanban' | 'dashboard';

export interface Projeto {
  titulo: string;
  descricao: string;
  tecnologias: string[];
  capa: CapaProjeto;
  urlCodigo: string;
  urlProjeto?: string;
  imagem?: string;
  emDesenvolvimento?: boolean;
  revelado: boolean;
}

// TODO: troque os placeholders pelos destinos reais dos repositórios e deploys.
@Component({
  selector: 'app-projetos',
  standalone: true,
  imports: [RevealDirective, NgOptimizedImage],
  templateUrl: './projetos.html',
  styleUrl: './projetos.scss',
})
export class ProjetosComponent {
  protected readonly habitCells = Array.from({ length: 45 }, (_, index) => {
    const active = new Set([1, 3, 6, 8, 11, 13, 17, 19, 21, 25, 27, 30, 32, 35, 38, 40, 43]);
    const cyan = new Set([1, 6, 11, 17, 21, 25, 30, 35, 43]);
    return active.has(index) ? (cyan.has(index) ? 'cyan' : 'violet') : '';
  });

  protected readonly projetos: Projeto[] = [
    {
      titulo: 'System-Habts',
      descricao:
        'Aplicação de acompanhamento de hábitos com metas diárias, sequências e histórico visual de progresso.',
      tecnologias: ['Angular', 'TypeScript', 'Spring Boot', 'PostgreSQL', 'Docker'],
      capa: 'habitos',
      urlCodigo: 'https://github.com/BattistonDiego/System-Habts-Front',
      urlProjeto: 'https://system-habts-front.vercel.app/login',
      revelado: false,
    },
    {
      titulo: 'Tracker de Candidaturas',
      descricao:
        'Quadro kanban para acompanhar candidaturas a vagas, com arrastar e soltar entre etapas.',
      tecnologias: ['Angular', 'Spring Boot', 'PostgreSQL'],
      capa: 'kanban',
      urlCodigo: 'https://github.com/[USUARIO]/[REPO-TRACKER]',
      revelado: false,
    },
    {
      titulo: 'Dashboard de eventos em tempo real',
      descricao:
        'Painel que recebe eventos via Kafka e Spring Boot e os exibe ao vivo com SSE/WebSocket.',
      tecnologias: ['Kafka', 'Spring Boot', 'WebSocket', 'Angular'],
      capa: 'dashboard',
      urlCodigo: 'https://github.com/[USUARIO]/[REPO-DASHBOARD]',
      emDesenvolvimento: true,
      revelado: false,
    },
  ];

  protected isRealUrl(url?: string): boolean {
    return !!url && !url.includes('[') && /^https?:\/\//i.test(url);
  }

  protected marcarRevelado(projeto: Projeto): void {
    projeto.revelado = true;
  }
}
