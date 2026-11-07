import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RevealDirective } from '../../shared/reveal.directive';

export interface Experiencia {
  empresa: string;
  periodo: string;
  cargo: string;
  projeto?: string;
  descricao: string;
  entregas: string[];
  tecnologias: string[];
  rodape?: string;
  logo?: string;
  fundoLogo?: 'claro' | 'escuro';
  pais?: string;
  atual?: boolean;
  logoFalhou?: boolean;
  revelada: boolean;
}

@Component({
  selector: 'app-experiencia',
  standalone: true,
  imports: [RevealDirective, NgOptimizedImage],
  templateUrl: './experiencia.html',
  styleUrl: './experiencia.scss',
})
export class ExperienciaComponent {
  protected linhaVisivel = false;

  protected readonly experiencias: Experiencia[] = [
    {
      empresa: 'Vente-unique', periodo: 'Nov de 2026 — Atual', cargo: 'Atendimento ao Cliente', logo: 'vente_uniquecom.jpg', fundoLogo: 'claro', pais: 'Espanha', atual: true,
      // TODO: confirmar a data de início antes de atualizar o período.
      descricao: 'Atendimento ao cliente em uma empresa na Espanha, com foco em desenvolver minha comunicação profissional em português, inglês e espanhol no dia a dia, enquanto sigo evoluindo como desenvolvedor.',
      entregas: [
        'Atendimento a clientes em ambiente profissional na Espanha, com rotina de comunicação em espanhol.',
        'Aperfeiçoamento contínuo da comunicação em português (nativo), inglês (B2) e espanhol (B2).',
        'Evolução técnica em paralelo, com projetos próprios em Angular, Java e Spring Boot.',
      ],
      tecnologias: ['Atendimento ao cliente', 'Comunicação', 'Português', 'Inglês', 'Espanhol'], revelada: false,
    },
    {
      empresa: 'GFT Technologies', periodo: 'Jul 2024 — Jan 2026', cargo: 'Desenvolvedor Front-end', projeto: 'Bradesco Seguros Performance', logo: 'gft.png', fundoLogo: 'claro', pais: 'Brasil',
      descricao: 'Plataforma interna para parceiros e funcionários da Bradesco Seguros acompanharem sua performance.',
      entregas: [
        'Reduziu em 50% o tempo de carregamento da home com cache inteligente e carregamento assíncrono.',
        'Reduziu em 95% o tempo de renderização de um dashboard com vários gráficos, usando priority loading e lazy chart strategy.',
        'Construiu do zero um mapa SVG interativo do Brasil plotando as agências Bradesco.',
        'Atuou com Micro Frontends, testes unitários e de integração (Jasmine, Karma, JUnit) e metodologia ágil (Scrum, Jira).',
      ],
      tecnologias: ['Angular 16', 'TypeScript', 'SCSS', 'PHP', 'Redis', 'MySQL', 'Docker', 'AWS', 'SVG', 'Micro Frontends'],
      rodape: 'Sistemas web usados por milhares de pessoas diariamente, incluindo situações críticas e sob pressão.', revelada: false,
    },
    {
      empresa: 'SIS Consultoria de Informática', periodo: '2023 — 2024', cargo: 'Desenvolvedor Front-end', logo: 'sis.jpeg', pais: 'Brasil',
      descricao: 'Aplicação web interna que substituiu processos manuais e reduziu o tempo operacional.',
      entregas: [
        'Desenvolveu a aplicação com Angular, TypeScript e integração com APIs REST.',
        'Aplicou boas práticas de UX/UI, responsividade e desempenho para melhorar a experiência do usuário interno.',
        'Migrou funcionalidades legadas para uma stack moderna (COBOL → Angular), participando de todo o ciclo de vida do software.',
      ],
      tecnologias: ['Angular', 'TypeScript', 'REST', 'UX/UI', 'Migração de legado'], revelada: false,
    },
    {
      empresa: 'FIS Global', periodo: '2022 — 2023', cargo: 'Desenvolvedor COBOL', logo: 'fis.jpg', pais: 'Brasil',
      descricao: 'Manutenção e evolução de sistemas financeiros legados em ambiente de missão crítica.',
      entregas: [
        'Desenvolveu e manteve sistemas em COBOL (mainframe IBM), com processamento batch via JCL e transações online via CICS.',
        'Analisou e corrigiu estruturas de dados críticas em ambiente de alta disponibilidade.',
        'Colaborou com equipes multidisciplinares para garantir SLAs e entregas dentro do prazo.',
      ],
      tecnologias: ['COBOL', 'JCL', 'CICS', 'Mainframe IBM'], revelada: false,
    },
    {
      empresa: 'SIS Consultoria de Informática', periodo: '2019 — 2021', cargo: 'Desenvolvedor em Formação (Front-end e Java)', logo: 'sis.jpeg', pais: 'Brasil',
      descricao: 'Primeiro contato profissional com desenvolvimento, em projetos internos da empresa.',
      entregas: [
        'Desenvolveu na prática com Java e front-end (HTML5, CSS3, JavaScript).',
        'Absorveu os fundamentos de programação, trabalho em equipe, versionamento com Git e ciclo de desenvolvimento de software.',
      ],
      tecnologias: ['Java', 'HTML5', 'CSS3', 'JavaScript', 'Git'], revelada: false,
    },
  ];

  protected revelarLinha(): void { this.linhaVisivel = true; }
  protected revelarExperiencia(experiencia: Experiencia): void { experiencia.revelada = true; }
  protected falharLogo(experiencia: Experiencia): void { experiencia.logoFalhou = true; }
  protected iniciais(empresa: string): string {
    if (empresa.startsWith('Vente-unique')) return 'VU';
    if (empresa.startsWith('GFT')) return 'GFT';
    if (empresa.startsWith('SIS')) return 'SIS';
    return 'FIS';
  }
}
