import { Bullet, Player, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { WeaponConfig } from '../../engine/types/config';

export class WeaponDomain implements DomainInterface<Bullet> {
  private config: WeaponConfig;
  private events: GameEvent[] = [];
  private lastShotTime: number = 0;

  constructor(config: WeaponConfig) {
    this.config = config;
  }

  update(entities: Bullet[], deltaTime: number, gameState: any): DomainUpdate<Bullet> {
    const { canvasWidth, canvasHeight } = gameState;
    
    // Update existing bullets
    const updatedBullets = entities
      .map(bullet => this.updateBullet(bullet))
      .filter(bullet => this.isInBounds(bullet, canvasWidth, canvasHeight));

    return { entities: updatedBullets, events: this.events };
  }

  configure(config: WeaponConfig): void {
    this.config = { ...this.config, ...config };
  }

  getEvents(): GameEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  shoot(player: Player): Bullet | null {
    const now = Date.now();
    if (now - this.lastShotTime > this.config.shootCooldown) {
      const bullet = this.createBullet(player);
      this.lastShotTime = now;
      
      this.events.push({
        type: 'BULLET_FIRED',
        data: { bullet },
        timestamp: now
      });
      
      return bullet;
    }
    return null;
  }

  private createBullet(player: Player): Bullet {
    return {
      x: player.x,
      y: player.y - player.size,
      vx: 0,
      vy: -this.config.bulletSpeed,
      size: this.config.bulletSize,
      color: this.config.bulletColor,
      damage: this.config.damage
    };
  }

  private updateBullet(bullet: Bullet): Bullet {
    return {
      ...bullet,
      x: bullet.x + bullet.vx,
      y: bullet.y + bullet.vy
    };
  }

  private isInBounds(bullet: Bullet, canvasWidth: number, canvasHeight: number): boolean {
    return bullet.x >= 0 && bullet.x <= canvasWidth && 
           bullet.y >= 0 && bullet.y <= canvasHeight;
  }

  destroyBullet(bullet: Bullet): void {
    this.events.push({
      type: 'BULLET_DESTROYED',
      data: { bullet },
      timestamp: Date.now()
    });
  }
}