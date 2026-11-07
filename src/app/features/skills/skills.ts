import { Component } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';

export interface CategoriaSkill {
  nome: string;
  nivel: string;
  percentual: number;
  descricao: string;
  tecnologias: string[];
  destaque?: boolean;
  emEstudo?: boolean;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class SkillsComponent {
  protected readonly categorias: CategoriaSkill[] = [
    { nome: 'Front-end', nivel: 'Avançado', percentual: 92, descricao: 'Interfaces performáticas e acessíveis, do componente à arquitetura da aplicação.', tecnologias: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS/SCSS', 'RxJS', 'Angular Material', 'Micro Frontends'], destaque: true },
    { nome: 'Back-end', nivel: 'Intermediário', percentual: 62, descricao: 'APIs REST e serviços com Java e Spring Boot.', tecnologias: ['Java', 'Spring Boot', 'Spring Security', 'Spring Data JPA', 'REST APIs', 'PHP'] },
    { nome: 'Dados e cache', nivel: 'Intermediário', percentual: 65, descricao: 'Modelagem relacional e estratégias de cache.', tecnologias: ['PostgreSQL', 'MySQL', 'Redis', 'Supabase'] },
    { nome: 'Cloud e DevOps', nivel: 'Intermediário', percentual: 58, descricao: 'Containers, versionamento e infraestrutura na nuvem.', tecnologias: ['AWS', 'Docker', 'GitHub Actions', 'Git'] },
    { nome: 'Em estudo', nivel: 'Em evolução', percentual: 30, descricao: 'Arquiteturas orientadas a eventos.', tecnologias: ['Kafka', 'Mensageria', 'Eventos em tempo real'], emEstudo: true },
  ];
}
