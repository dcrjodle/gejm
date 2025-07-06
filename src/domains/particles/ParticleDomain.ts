import { Particle, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { ParticleConfig } from '../../engine/types/config';

export class ParticleDomain implements DomainInterface<Particle> {
  private config: ParticleConfig;
  private events: GameEvent[] = [];

  constructor(config: ParticleConfig) {
    this.config = config;
  }

  update(entities: Particle[], deltaTime: number, gameState: any): DomainUpdate<Particle> {
    // Update existing particles
    const updatedParticles = entities
      .map(particle => this.updateParticle(particle))
      .filter(particle => particle.life > 0);

    return { entities: updatedParticles, events: this.events };
  }

  configure(config: ParticleConfig): void {
    this.config = { ...this.config, ...config };
  }

  getEvents(): GameEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  createExplosion(x: number, y: number, color: string): Particle[] {
    const particles: Particle[] = [];
    
    for (let i = 0; i < this.config.explosionCount; i++) {
      const angle = (Math.PI * 2 * i) / this.config.explosionCount;
      const speed = this.config.explosionSpeed + Math.random() * this.config.explosionSpeed;
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: this.config.explosionSize + Math.random() * this.config.explosionSize,
        color,
        life: this.config.explosionLife,
        maxLife: this.config.explosionLife
      });
    }
    
    this.events.push({
      type: 'EXPLOSION_CREATED',
      data: { x, y, color, particleCount: particles.length },
      timestamp: Date.now()
    });
    
    return particles;
  }

  private updateParticle(particle: Particle): Particle {
    return {
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      life: particle.life - this.config.lifeDecay,
      vx: particle.vx * this.config.friction,
      vy: particle.vy * this.config.friction
    };
  }
}