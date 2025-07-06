import { Base, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { BaseConfig } from '../../engine/types/config';

export class BaseDomain implements DomainInterface<Base> {
  private config: BaseConfig;
  private events: GameEvent[] = [];

  constructor(config: BaseConfig) {
    this.config = config;
  }

  update(entities: Base[], deltaTime: number, gameState: any): DomainUpdate<Base> {
    // There should only be one base
    const base = entities[0];
    if (!base) {
      return { entities: [], events: this.events };
    }

    // Handle base repair when not under attack
    const updatedBase = this.updateBaseRepair(base, deltaTime);

    return { entities: [updatedBase], events: this.events };
  }

  configure(config: BaseConfig): void {
    this.config = { ...this.config, ...config };
  }

  getEvents(): GameEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  createBase(): Base {
    return {
      x: this.config.position.x,
      y: this.config.position.y,
      size: this.config.size,
      color: this.config.color,
      health: this.config.startingHealth,
      maxHealth: this.config.maxHealth,
      repairRate: this.config.repairRate,
      lastDamageTime: 0,
    };
  }

  damageBase(base: Base, damage: number): Base {
    const newHealth = Math.max(0, base.health - damage);
    const updatedBase = {
      ...base,
      health: newHealth,
      lastDamageTime: Date.now(),
    };

    this.events.push({
      type: 'BASE_DAMAGED',
      data: { damage, newHealth, maxHealth: base.maxHealth },
      timestamp: Date.now()
    });

    if (newHealth <= 0) {
      this.events.push({
        type: 'BASE_DESTROYED',
        data: { base: updatedBase },
        timestamp: Date.now()
      });
    }

    return updatedBase;
  }

  private updateBaseRepair(base: Base, deltaTime: number): Base {
    // Don't repair if at max health
    if (base.health >= base.maxHealth) {
      return base;
    }

    // Check if enough time has passed since last damage
    const timeSinceLastDamage = Date.now() - base.lastDamageTime;
    if (timeSinceLastDamage < this.config.repairDelay) {
      return base;
    }

    // Repair the base
    const repairAmount = (base.repairRate * deltaTime) / 1000; // Convert to seconds
    const newHealth = Math.min(base.maxHealth, base.health + repairAmount);

    if (newHealth > base.health) {
      this.events.push({
        type: 'BASE_REPAIRED',
        data: { repairAmount: newHealth - base.health, newHealth, maxHealth: base.maxHealth },
        timestamp: Date.now()
      });
    }

    return {
      ...base,
      health: newHealth,
    };
  }

  reset(): void {
    this.clearEvents();
  }
}