import { Player, Enemy, Bullet, Particle, Resource, Base, Building, PlacementPreview, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { CanvasConfig } from '../../engine/types/config';

export interface RenderableEntity {
  x: number;
  y: number;
  size: number;
  color: string;
  life?: number;
}

export class CanvasDomain implements DomainInterface<RenderableEntity> {
  private config: CanvasConfig;
  private events: GameEvent[] = [];

  constructor(config: CanvasConfig) {
    this.config = config;
  }

  update(entities: RenderableEntity[], deltaTime: number, gameState: any): DomainUpdate<RenderableEntity> {
    // Canvas domain doesn't modify entities, just renders them
    return { entities, events: this.events };
  }

  configure(config: CanvasConfig): void {
    this.config = { ...this.config, ...config };
  }

  getEvents(): GameEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  render(
    ctx: CanvasRenderingContext2D,
    player: Player,
    enemies: Enemy[],
    bullets: Bullet[],
    particles: Particle[],
    resources: Resource[] = [],
    base?: Base,
    buildings: Building[] = [],
    placementPreview?: PlacementPreview
  ): void {
    // Clear canvas
    ctx.fillStyle = this.config.backgroundColor;
    ctx.fillRect(0, 0, this.config.width, this.config.height);

    // Draw grid if enabled
    if (this.config.showGrid) {
      this.drawGrid(ctx);
    }

    // Draw base first (so other entities render on top)
    if (base) {
      this.drawBase(ctx, base);
    }

    // Draw buildings
    buildings.forEach(building => {
      this.drawBuilding(ctx, building);
    });

    // Draw power connections
    this.drawPowerConnections(ctx, buildings);

    // Draw particles
    particles.forEach(particle => {
      this.drawParticle(ctx, particle);
    });

    // Draw enemies
    enemies.forEach(enemy => {
      this.drawEnemy(ctx, enemy);
    });

    // Draw bullets
    bullets.forEach(bullet => {
      this.drawBullet(ctx, bullet);
    });

    // Draw resources
    resources.forEach(resource => {
      this.drawResource(ctx, resource);
    });

    // Draw placement preview
    if (placementPreview) {
      this.drawPlacementPreview(ctx, placementPreview);
    }

    // Draw player
    this.drawPlayer(ctx, player);

    // Draw player health bar
    this.drawHealthBar(ctx, player);
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.config.gridColor;
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= this.config.width; x += this.config.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.config.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= this.config.height; y += this.config.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.config.width, y);
      ctx.stroke();
    }
  }

  private drawParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.life;
    ctx.fillRect(
      particle.x - particle.size / 2,
      particle.y - particle.size / 2,
      particle.size,
      particle.size
    );
    ctx.globalAlpha = 1;
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    let fillColor = enemy.color;
    let shadowBlur = 10;
    let scale = 1;
    
    // Check if enemy was recently hit
    if (enemy.hitTime && enemy.hitFlashDuration) {
      const timeSinceHit = Date.now() - enemy.hitTime;
      if (timeSinceHit < enemy.hitFlashDuration) {
        // Flash effect - alternate between white and normal color
        const flashInterval = 25; // Flash every 25ms
        const flashPhase = Math.floor(timeSinceHit / flashInterval) % 2;
        if (flashPhase === 0) {
          fillColor = '#ffffff';
          shadowBlur = 20;
          scale = 1.2;
        } else {
          fillColor = enemy.color;
          shadowBlur = 15;
          scale = 1.1;
        }
      }
    }
    
    ctx.fillStyle = fillColor;
    ctx.shadowColor = fillColor;
    ctx.shadowBlur = shadowBlur;
    
    const size = enemy.size * scale;
    ctx.fillRect(
      enemy.x - size / 2,
      enemy.y - size / 2,
      size,
      size
    );
    ctx.shadowBlur = 0;
  }

  private drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
    ctx.fillStyle = bullet.color;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(
      bullet.x - bullet.size / 2,
      bullet.y - bullet.size / 2,
      bullet.size,
      bullet.size
    );
    ctx.shadowBlur = 0;
  }

  private drawResource(ctx: CanvasRenderingContext2D, resource: Resource): void {
    // Enhanced visual effects for pickup animation
    let pulseScale = 1 + Math.sin(Date.now() * 0.005) * 0.2;
    let alpha = Math.max(0.3, resource.life / resource.maxLife);
    let glowIntensity = 15;

    // Special effects when being picked up
    if (resource.isBeingPickedUp && resource.pickupStartTime) {
      const pickupProgress = Math.min(1, (Date.now() - resource.pickupStartTime) / 300);
      
      // Increase glow as it gets picked up
      glowIntensity = 15 + (pickupProgress * 25);
      
      // Increase alpha for bright pickup effect
      alpha = Math.min(1, alpha + pickupProgress * 0.5);
      
      // Add extra pulse during pickup
      pulseScale += pickupProgress * 0.3;
    }
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = resource.color;
    ctx.shadowColor = resource.color;
    ctx.shadowBlur = glowIntensity * pulseScale;
    
    const size = resource.size * pulseScale;
    ctx.fillRect(
      resource.x - size / 2,
      resource.y - size / 2,
      size,
      size
    );
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 15;
    ctx.fillRect(
      player.x - player.size / 2,
      player.y - player.size / 2,
      player.size,
      player.size
    );
    ctx.shadowBlur = 0;
  }

  private drawBase(ctx: CanvasRenderingContext2D, base: Base): void {
    // Draw base with pulsing effect based on health
    const healthPercentage = base.health / base.maxHealth;
    const pulseScale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
    
    // Main base structure
    ctx.fillStyle = base.color;
    ctx.shadowColor = base.color;
    ctx.shadowBlur = 20 * healthPercentage; // Dimmer glow when damaged
    
    const size = base.size * pulseScale;
    ctx.fillRect(
      base.x - size / 2,
      base.y - size / 2,
      size,
      size
    );
    
    // Health indicator ring
    if (healthPercentage < 1) {
      const ringRadius = base.size * 0.7;
      ctx.beginPath();
      ctx.arc(base.x, base.y, ringRadius, 0, 2 * Math.PI * healthPercentage);
      ctx.strokeStyle = healthPercentage > 0.5 ? '#00ff00' : 
                       healthPercentage > 0.2 ? '#ffff00' : '#ff0000';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
  }

  private drawHealthBar(ctx: CanvasRenderingContext2D, player: Player): void {
    const healthBarWidth = 20;
    const healthBarHeight = 3;
    const healthPercentage = player.health / player.maxHealth;
    
    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(
      player.x - healthBarWidth / 2,
      player.y - player.size / 2 - 8,
      healthBarWidth,
      healthBarHeight
    );
    
    // Health bar
    ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : 
                   healthPercentage > 0.2 ? '#ffff00' : '#ff0000';
    ctx.fillRect(
      player.x - healthBarWidth / 2,
      player.y - player.size / 2 - 8,
      healthBarWidth * healthPercentage,
      healthBarHeight
    );
  }

  getCanvasSize(): { width: number; height: number } {
    return {
      width: this.config.width,
      height: this.config.height
    };
  }

  private drawBuilding(ctx: CanvasRenderingContext2D, building: Building): void {
    let alpha = 1;
    let extraGlow = 0;

    // Handle construction phase
    if (building.status === 'constructing' && building.constructionStartTime && building.constructionTime) {
      const elapsed = Date.now() - building.constructionStartTime;
      const progress = Math.min(elapsed / building.constructionTime, 1);
      alpha = 0.3 + (progress * 0.7); // Fade in from 30% to 100%
      
      // Draw construction progress ring
      ctx.beginPath();
      ctx.arc(building.x, building.y, building.size / 2 + 5, 0, 2 * Math.PI * progress);
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Handle power status
    if (building.status === 'unpowered') {
      alpha = 0.6; // Dimmed when unpowered
    } else if (building.status === 'powered') {
      extraGlow = 5; // Extra glow when powered
    }

    ctx.globalAlpha = alpha;
    ctx.fillStyle = building.color;
    ctx.shadowColor = building.color;
    ctx.shadowBlur = 10 + extraGlow;
    
    // Draw building shape based on type
    const halfSize = building.size / 2;
    if (building.typeId === 'pylon') {
      // Draw pylon as circle
      ctx.beginPath();
      ctx.arc(building.x, building.y, halfSize, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // Draw other buildings as squares
      ctx.fillRect(
        building.x - halfSize,
        building.y - halfSize,
        building.size,
        building.size
      );
    }

    // Draw health bar if damaged
    if (building.health < building.maxHealth) {
      const barWidth = building.size;
      const barHeight = 4;
      const healthPercent = building.health / building.maxHealth;
      
      // Background
      ctx.fillStyle = '#333333';
      ctx.fillRect(
        building.x - barWidth / 2,
        building.y - building.size / 2 - 8,
        barWidth,
        barHeight
      );
      
      // Health bar
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : 
                     healthPercent > 0.2 ? '#ffff00' : '#ff0000';
      ctx.fillRect(
        building.x - barWidth / 2,
        building.y - building.size / 2 - 8,
        barWidth * healthPercent,
        barHeight
      );
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  private drawPowerConnections(ctx: CanvasRenderingContext2D, buildings: Building[]): void {
    // Find all pylons and their connections
    const pylons = buildings.filter(b => b.typeId === 'pylon' && b.status !== 'destroyed');
    
    for (const pylon of pylons) {
      if (pylon.connectedTo && pylon.connectedTo.length > 0) {
        for (const connectedId of pylon.connectedTo) {
          const connectedBuilding = buildings.find(b => b.id === connectedId);
          if (connectedBuilding) {
            // Draw power line
            ctx.beginPath();
            ctx.moveTo(pylon.x, pylon.y);
            ctx.lineTo(connectedBuilding.x, connectedBuilding.y);
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.globalAlpha = 0.7;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
          }
        }
      }
    }
  }

  private drawPlacementPreview(ctx: CanvasRenderingContext2D, placementPreview: PlacementPreview): void {
    const halfSize = 12; // Default preview size
    const color = placementPreview.valid ? '#00ff0080' : '#ff000080'; // Semi-transparent green or red
    
    ctx.fillStyle = color;
    ctx.strokeStyle = placementPreview.valid ? '#00ff00' : '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Draw preview shape
    if (placementPreview.typeId === 'pylon') {
      // Circle for pylon
      ctx.beginPath();
      ctx.arc(placementPreview.x, placementPreview.y, halfSize, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else {
      // Square for other buildings
      ctx.fillRect(
        placementPreview.x - halfSize,
        placementPreview.y - halfSize,
        halfSize * 2,
        halfSize * 2
      );
      ctx.strokeRect(
        placementPreview.x - halfSize,
        placementPreview.y - halfSize,
        halfSize * 2,
        halfSize * 2
      );
    }
    
    ctx.setLineDash([]);
    
    // Draw conflict messages
    if (!placementPreview.valid && placementPreview.conflicts.length > 0) {
      ctx.fillStyle = '#ff0000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      const message = placementPreview.conflicts[0]; // Show first conflict
      ctx.fillText(message, placementPreview.x, placementPreview.y + halfSize + 20);
    }
  }
}