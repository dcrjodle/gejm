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
      upgradeLevels: {
        health: 0,
        armor: 0,
        turrets: 0,
        shield: 0
      },
      shield: 0,
      maxShield: 0,
      armor: 0
    };
  }

  damageBase(base: Base, damage: number): Base {
    // Apply armor damage reduction
    const actualDamage = Math.max(1, damage * (1 - base.armor));
    
    let updatedBase = { ...base };
    let remainingDamage = actualDamage;
    
    // Shield absorbs damage first
    if (base.shield > 0) {
      const shieldDamage = Math.min(remainingDamage, base.shield);
      updatedBase.shield = Math.max(0, base.shield - shieldDamage);
      remainingDamage -= shieldDamage;
      
      this.events.push({
        type: 'BASE_SHIELD_DAMAGED',
        data: { damage: shieldDamage, newShield: updatedBase.shield, maxShield: base.maxShield },
        timestamp: Date.now()
      });
    }
    
    // Remaining damage goes to health
    if (remainingDamage > 0) {
      const newHealth = Math.max(0, base.health - remainingDamage);
      updatedBase = {
        ...updatedBase,
        health: newHealth,
        lastDamageTime: Date.now(),
      };
      
      this.events.push({
        type: 'BASE_DAMAGED',
        data: { damage: remainingDamage, newHealth, maxHealth: base.maxHealth },
        timestamp: Date.now()
      });
      
      if (newHealth <= 0) {
        this.events.push({
          type: 'BASE_DESTROYED',
          data: { base: updatedBase },
          timestamp: Date.now()
        });
      }
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

  upgradeBase(base: Base, upgradeType: string, player: any): { base: Base; player: any; success: boolean; message: string } {
    const currentLevel = base.upgradeLevels[upgradeType as keyof typeof base.upgradeLevels];
    const upgradeConfig = this.config.upgrades[upgradeType as keyof typeof this.config.upgrades];
    
    if (!upgradeConfig || currentLevel >= upgradeConfig.levels.length) {
      return { base, player, success: false, message: 'Max level reached' };
    }
    
    const cost = upgradeConfig.costs[currentLevel];
    
    // Check if player has enough resources
    if (player.energyCrystals < cost.energyCrystals || 
        player.quantumCores < cost.quantumCores || 
        player.essenceFragments < cost.essenceFragments) {
      return { base, player, success: false, message: 'Insufficient resources' };
    }
    
    // Deduct resources
    const updatedPlayer = {
      ...player,
      energyCrystals: player.energyCrystals - cost.energyCrystals,
      quantumCores: player.quantumCores - cost.quantumCores,
      essenceFragments: player.essenceFragments - cost.essenceFragments
    };
    
    // Apply upgrade
    const newLevel = currentLevel + 1;
    const updatedBase = { ...base };
    updatedBase.upgradeLevels = {
      ...base.upgradeLevels,
      [upgradeType]: newLevel
    };
    
    // Apply upgrade effects
    switch (upgradeType) {
      case 'health':
        const newMaxHealth = upgradeConfig.levels[currentLevel];
        updatedBase.maxHealth = newMaxHealth;
        updatedBase.health = Math.min(updatedBase.health + (newMaxHealth - base.maxHealth), newMaxHealth);
        break;
      case 'armor':
        updatedBase.armor = upgradeConfig.levels[currentLevel];
        break;
      case 'shield':
        const newMaxShield = upgradeConfig.levels[currentLevel];
        updatedBase.maxShield = newMaxShield;
        updatedBase.shield = newMaxShield; // Restore shield when upgraded
        break;
      case 'turrets':
        // Turrets will be handled by a separate TurretDomain
        break;
    }
    
    this.events.push({
      type: 'BASE_UPGRADED',
      data: { upgradeType, newLevel, cost },
      timestamp: Date.now()
    });
    
    return { base: updatedBase, player: updatedPlayer, success: true, message: `${upgradeType} upgraded to level ${newLevel}` };
  }

  reset(): void {
    this.clearEvents();
  }
}