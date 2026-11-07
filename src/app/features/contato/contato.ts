import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [ReactiveFormsModule, RevealDirective],
  templateUrl: './contato.html',
  styleUrl: './contato.scss',
})
export class ContatoComponent {
  protected readonly form: FormGroup<{
    nome: FormControl<string>;
    email: FormControl<string>;
    mensagem: FormControl<string>;
    website: FormControl<string>;
  }>;
  protected submitted = false;
  protected sending = false;
  protected confirmation = '';

  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.nonNullable.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mensagem: ['', [Validators.required, Validators.minLength(10)]],
      website: [''],
    });
  }

  protected mostrarErro(campo: 'nome' | 'email' | 'mensagem'): boolean {
    return this.submitted || this.form.controls[campo].touched;
  }

  // TODO: substituir o mailto por um serviço de formulário (Formspree, EmailJS ou Netlify Forms), sem alterar o template.
  protected enviar(): void {
    this.submitted = true;
    this.confirmation = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { nome, email, mensagem, website } = this.form.getRawValue();
    if (website) return;

    this.sending = true;
    const subject = encodeURIComponent(`Contato pelo portfólio — ${nome}`);
    const body = encodeURIComponent(`Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${mensagem}`);
    window.location.href = `mailto:diegobattiston014@gmail.com?subject=${subject}&body=${body}`;
    this.form.reset();
    this.submitted = false;
    this.confirmation = 'Abrindo seu aplicativo de e-mail...';
    this.sending = false;
  }
}
