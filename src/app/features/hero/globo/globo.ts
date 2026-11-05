import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, PLATFORM_ID, inject, signal, viewChild } from '@angular/core';
import type * as THREE from 'three';

const NODE_COUNT = 140;
const K_NEIGHBORS = 4;
const MAX_EDGE_LENGTH = 0.82;
const LINE_OPACITY = 0.36;
const POINT_SIZE_MIN = 3;
const POINT_SIZE_MAX = 5;
const SPHERE_RADIUS = 1.22;

@Component({
  selector: 'app-globe',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <div class="globe-stage" #stage>
      <canvas #canvas aria-hidden="true"></canvas>
      <div class="portrait">
        @if (photoLoaded()) {
          <img ngSrc="/foto-diego.jpeg" width="1200" height="1600" priority alt="Foto de Diego" (error)="onPhotoError()">
        } @else {
          <span class="portrait-letter">D</span>
        }
      </div>
    </div>
  `,
  styleUrl: './globo.scss',
})
export class GlobeComponent implements AfterViewInit, OnDestroy {
  protected readonly photoLoaded = signal(true);

  protected onPhotoError(): void {
    this.photoLoaded.set(false);
  }

  private readonly stage = viewChild.required<ElementRef<HTMLDivElement>>('stage');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly zone = inject(NgZone);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private mesh?: THREE.Group;
  private lineMaterial?: THREE.ShaderMaterial;
  private nodeMaterial?: THREE.ShaderMaterial;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private animationFrame = 0;
  private visible = true;
  private pageVisible = true;
  private disposed = false;
  private pointerX = 0;
  private pointerY = 0;
  private targetX = 0;
  private targetY = 0;
  private readonly reducedMotion = this.browser && matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly touchDevice = this.browser && matchMedia('(pointer: coarse)').matches;
  private readonly handlePointerMove = (event: PointerEvent) => {
    if (this.reducedMotion || this.touchDevice) return;
    this.targetY = ((event.clientX / innerWidth) * 2 - 1) * 0.3;
    this.targetX = ((event.clientY / innerHeight) * 2 - 1) * 0.22;
  };
  private readonly handlePointerLeave = () => { this.targetX = 0; this.targetY = 0; };
  private readonly handleVisibility = () => { this.pageVisible = document.visibilityState === 'visible'; this.syncAnimation(); };

  ngAfterViewInit(): void {
    if (!this.browser) return;
    this.zone.runOutsideAngular(() => { void this.initialize(); });
  }

  ngOnDestroy(): void {
    this.disposed = true;
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerleave', this.handlePointerLeave);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.mesh?.traverse((item) => {
      const object = item as THREE.Mesh | THREE.Points | THREE.LineSegments;
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      materials.forEach((material) => material.dispose());
    });
    this.renderer?.dispose();
  }

  private async initialize(): Promise<void> {
    try {
    const THREE = await import('three');
    if (this.disposed) return;
    const element = this.stage().nativeElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.z = 4.5;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas().nativeElement, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    let randomSeed = 0x5eed1234;
    const random = (): number => {
      randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0;
      return randomSeed / 0x100000000;
    };
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const nodePositions: THREE.Vector3[] = [];
    const pointPositions: number[] = [];
    const pointColors: number[] = [];
    const pointSizes: number[] = [];
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    const violet = new THREE.Color('#8b5cf6');
    const cyan = new THREE.Color('#22d3ee');
    const colorAt = (p: THREE.Vector3) => violet.clone().lerp(cyan, THREE.MathUtils.clamp((p.x - p.y + SPHERE_RADIUS * 2) / (SPHERE_RADIUS * 4), 0, 1));

    for (let i = 0; i < NODE_COUNT; i++) {
      const y = 1 - 2 * ((i + 0.5) / NODE_COUNT);
      const ringRadius = Math.sqrt(1 - y * y);
      const angle = goldenAngle * i;
      const jitter = 0.022;
      const p = new THREE.Vector3(
        ringRadius * Math.cos(angle) + (random() - 0.5) * jitter,
        y + (random() - 0.5) * jitter,
        ringRadius * Math.sin(angle) + (random() - 0.5) * jitter,
      ).normalize().multiplyScalar(SPHERE_RADIUS);
      nodePositions.push(p);
      const color = colorAt(p);
      pointColors.push(color.r, color.g, color.b);
      const isAccentNode = random() > 0.88;
      pointSizes.push(isAccentNode ? POINT_SIZE_MAX : POINT_SIZE_MIN + random() * (4.3 - POINT_SIZE_MIN));
    }
    for (const position of nodePositions) pointPositions.push(position.x, position.y, position.z);

    const maxEdgeLength = SPHERE_RADIUS * MAX_EDGE_LENGTH;
    const edgeCandidates: Array<{ a: number; b: number; distance: number }> = [];
    const nearestEdges = new Set<string>();
    for (let i = 0; i < nodePositions.length; i++) {
      const neighbors: Array<{ index: number; distance: number }> = [];
      for (let j = 0; j < nodePositions.length; j++) {
        if (i === j) continue;
        const distance = nodePositions[i].distanceTo(nodePositions[j]);
        if (distance <= maxEdgeLength) neighbors.push({ index: j, distance });
        if (j > i && distance <= maxEdgeLength) edgeCandidates.push({ a: i, b: j, distance });
      }
      neighbors.sort((a, b) => a.distance - b.distance);
      for (const neighbor of neighbors.slice(0, K_NEIGHBORS)) {
        const a = Math.min(i, neighbor.index);
        const b = Math.max(i, neighbor.index);
        nearestEdges.add(`${a}:${b}`);
      }
    }

    const selectedEdges = new Set<string>();
    const degrees = new Uint8Array(NODE_COUNT);
    const addEdge = (edge: { a: number; b: number }, degreeLimit: number): boolean => {
      const key = `${edge.a}:${edge.b}`;
      if (selectedEdges.has(key) || degrees[edge.a] >= degreeLimit || degrees[edge.b] >= degreeLimit) return false;
      selectedEdges.add(key);
      degrees[edge.a]++;
      degrees[edge.b]++;
      return true;
    };
    const candidatesByDistance = edgeCandidates.sort((a, b) => a.distance - b.distance);
    for (const edge of candidatesByDistance) {
      if (nearestEdges.has(`${edge.a}:${edge.b}`)) addEdge(edge, K_NEIGHBORS);
    }
    for (let i = 0; i < NODE_COUNT; i++) {
      if (degrees[i] >= 3) continue;
      for (const edge of candidatesByDistance) {
        if (degrees[i] >= 3) break;
        if (edge.a === i || edge.b === i) addEdge(edge, 5);
      }
    }

    for (const key of selectedEdges) {
      const [a, b] = key.split(':').map(Number);
      const first = nodePositions[a];
      const second = nodePositions[b];
      linePositions.push(first.x, first.y, first.z, second.x, second.y, second.z);
      const firstColor = colorAt(first);
      const secondColor = colorAt(second);
      lineColors.push(firstColor.r, firstColor.g, firstColor.b, secondColor.r, secondColor.g, secondColor.b);
    }

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    this.lineMaterial = new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: { uLineOpacity: { value: LINE_OPACITY } },
      vertexShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          float frontness = 1.0 - smoothstep(3.5, 5.5, -viewPosition.z);
          vColor = color * mix(0.28, 1.0, frontness);
          vAlpha = mix(0.18, 1.0, frontness);
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        uniform float uLineOpacity;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          gl_FragColor = vec4(vColor, uLineOpacity * vAlpha);
          #include <colorspace_fragment>
        }
      `,
    });
    const lines = new THREE.LineSegments(linesGeometry, this.lineMaterial);
    lines.renderOrder = 0;
    const nodesGeometry = new THREE.BufferGeometry();
    nodesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3));
    nodesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(pointColors, 3));
    nodesGeometry.setAttribute('aSize', new THREE.Float32BufferAttribute(pointSizes, 1));
    this.nodeMaterial = new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPixelRatio: { value: this.renderer.getPixelRatio() } },
      vertexShader: `
        attribute float aSize;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          float frontness = 1.0 - smoothstep(3.5, 5.5, -viewPosition.z);
          vColor = color * mix(0.55, 1.0, frontness);
          vAlpha = mix(0.42, 1.0, frontness);
          gl_PointSize = aSize * uPixelRatio;
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float radius = length(gl_PointCoord - vec2(0.5));
          float core = 1.0 - smoothstep(0.2, 0.38, radius);
          float halo = (1.0 - smoothstep(0.12, 0.5, radius)) * 0.22;
          float alpha = max(core, halo) * vAlpha;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vColor, alpha);
          #include <colorspace_fragment>
        }
      `,
    });
    const nodes = new THREE.Points(nodesGeometry, this.nodeMaterial);
    nodes.renderOrder = 1;
    this.mesh = new THREE.Group();
    this.mesh.add(lines, nodes);
    this.scene.add(this.mesh);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(element);
    this.intersectionObserver = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; this.syncAnimation(); }, { threshold: 0.05 });
    this.intersectionObserver.observe(element);
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', this.handlePointerLeave);
    document.addEventListener('visibilitychange', this.handleVisibility);
    this.resize();
    this.syncAnimation();
    } catch (error) {
      console.error('[app-globe] Falha ao inicializar o renderer, as geometrias ou os shaders do Three.js.', error);
      throw error;
    }
  }

  private resize(): void {
    if (!this.renderer || !this.camera) return;
    const { width, height } = this.stage().nativeElement.getBoundingClientRect();
    this.renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
    this.camera.aspect = Math.max(width, 1) / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
    if (this.nodeMaterial) this.nodeMaterial.uniforms['uPixelRatio'].value = this.renderer.getPixelRatio();
    if (this.mesh) {
      const sizeRatio = Number.parseFloat(getComputedStyle(this.stage().nativeElement).getPropertyValue('--globo-tamanho')) / 100 || 1;
      this.mesh.scale.setScalar(width / sizeRatio < 420 ? 0.83 : 1);
    }
  }

  private syncAnimation(): void {
    if (!this.disposed && this.visible && this.pageVisible && !this.animationFrame) this.animationFrame = requestAnimationFrame(this.animate);
    if ((!this.visible || !this.pageVisible) && this.animationFrame) { cancelAnimationFrame(this.animationFrame); this.animationFrame = 0; }
  }

  private readonly animate = (time: number): void => {
    this.animationFrame = 0;
    if (!this.mesh || !this.renderer || !this.scene || !this.camera) return;
    this.pointerX += (this.targetX - this.pointerX) * 0.065;
    this.pointerY += (this.targetY - this.pointerY) * 0.065;
    this.mesh.rotation.y = this.pointerY + (this.reducedMotion ? 0 : time * 0.00013);
    this.mesh.rotation.x = this.pointerX + (this.reducedMotion ? 0 : -0.12 + Math.sin(time * 0.00019) * 0.035);
    this.renderer.render(this.scene, this.camera);
    this.syncAnimation();
  };
}
