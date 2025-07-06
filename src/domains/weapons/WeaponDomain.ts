import { Bullet, Player, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { WeaponConfig } from '../../engine/types/config';

export class WeaponDomain implements DomainInterface<Bullet> {
  private config: WeaponConfig;
  private events: GameEvent[] = [];
  private lastShotTime: number = 0;
  private currentAmmo: number;
  private lastAmmoRegenTime: number = 0;

  constructor(config: WeaponConfig) {
    this.config = config;
    this.currentAmmo = config.maxAmmo;
  }

  update(entities: Bullet[], deltaTime: number, gameState: any): DomainUpdate<Bullet> {
    const { canvasWidth, canvasHeight } = gameState;
    
    // Handle ammo regeneration
    this.handleAmmoRegeneration(deltaTime);
    
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

  shoot(player: Player, targetX?: number, targetY?: number): Bullet | null {
    const now = Date.now();
    if (now - this.lastShotTime > this.config.shootCooldown && this.currentAmmo > 0) {
      const bullet = this.createBullet(player, targetX, targetY);
      this.lastShotTime = now;
      this.currentAmmo--;
      
      this.events.push({
        type: 'BULLET_FIRED',
        data: { bullet, ammoRemaining: this.currentAmmo },
        timestamp: now
      });
      
      return bullet;
    }
    return null;
  }

  private createBullet(player: Player, targetX?: number, targetY?: number): Bullet {
    let vx = 0;
    let vy = -this.config.bulletSpeed;
    
    // If target coordinates are provided, calculate direction to target
    if (targetX !== undefined && targetY !== undefined) {
      const dx = targetX - player.x;
      const dy = targetY - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        vx = (dx / distance) * this.config.bulletSpeed;
        vy = (dy / distance) * this.config.bulletSpeed;
      }
    }
    
    return {
      x: player.x,
      y: player.y - player.size,
      vx,
      vy,
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

  private handleAmmoRegeneration(deltaTime: number): void {
    const now = Date.now();
    const timeSinceLastRegen = now - this.lastAmmoRegenTime;
    const regenInterval = 1000 / this.config.ammoRegenRate; // ms per ammo

    if (this.currentAmmo < this.config.maxAmmo && timeSinceLastRegen > regenInterval) {
      this.currentAmmo = Math.min(this.config.maxAmmo, this.currentAmmo + 1);
      this.lastAmmoRegenTime = now;
      
      this.events.push({
        type: 'AMMO_REGENERATED',
        data: { currentAmmo: this.currentAmmo, maxAmmo: this.config.maxAmmo },
        timestamp: now
      });
    }
  }

  getCurrentAmmo(): number {
    return this.currentAmmo;
  }

  getMaxAmmo(): number {
    return this.config.maxAmmo;
  }

  refillAmmo(): void {
    this.currentAmmo = this.config.maxAmmo;
  }
}