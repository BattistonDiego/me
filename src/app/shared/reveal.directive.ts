import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';

export type RevealDirection = 'left' | 'right' | 'top';

@Directive({ selector: '[appReveal]', standalone: true })
export class RevealDirective implements OnInit, OnDestroy {
  @Input() appReveal: RevealDirection = 'top';
  @Input() revealDelay = 0;
  @Input() revealDistance = 48;
  @Output() revealed = new EventEmitter<void>();
  private observer?: IntersectionObserver;
  private readonly reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private readonly element: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {}

  ngOnInit(): void {
    if (this.reducedMotion || typeof IntersectionObserver === 'undefined') {
      this.revealed.emit();
      return;
    }
    const el = this.element.nativeElement;
    const offset = this.appReveal === 'left' ? `-${this.revealDistance}px` : this.appReveal === 'right' ? `${this.revealDistance}px` : `0 ${this.revealDistance}px`;
    const transform = this.appReveal === 'top' ? `translate3d(0, ${this.revealDistance}px, 0)` : `translate3d(${offset}, 0, 0)`;
    this.renderer.setStyle(el, 'opacity', '0');
    this.renderer.setStyle(el, 'transform', transform);
    this.renderer.setStyle(el, 'transition', `opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${this.revealDelay}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${this.revealDelay}ms`);
    try {
      this.observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        this.renderer.setStyle(el, 'opacity', '1');
        this.renderer.setStyle(el, 'transform', 'translate3d(0, 0, 0)');
        this.revealed.emit();
        this.observer?.disconnect();
      }, { threshold: 0.2 });
      this.observer.observe(el);
    } catch {
      this.renderer.removeStyle(el, 'opacity');
      this.renderer.removeStyle(el, 'transform');
      this.revealed.emit();
    }
  }

  ngOnDestroy(): void { this.observer?.disconnect(); }
}
