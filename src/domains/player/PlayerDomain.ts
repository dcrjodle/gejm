import { Player, ResourceType, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { PlayerConfig, ResourceConfig } from '../../engine/types/config';

export class PlayerDomain implements DomainInterface<Player> {
  private config: PlayerConfig;
  private resourceConfig?: ResourceConfig;
  private events: GameEvent[] = [];

  constructor(config: PlayerConfig, resourceConfig?: ResourceConfig) {
    this.config = config;
    this.resourceConfig = resourceConfig;
  }

  update(entities: Player[], deltaTime: number, gameState: any): DomainUpdate<Player> {
    if (entities.length === 0) {
      return { entities: [] };
    }

    const player = entities[0];
    const updatedPlayer = { ...player };

    // Handle level progression
    if (player.experience >= player.experienceToNext) {
      const levelsGained = Math.floor(player.experience / player.experienceToNext);
      updatedPlayer.level += levelsGained;
      updatedPlayer.experience = player.experience % player.experienceToNext;
      updatedPlayer.experienceToNext = this.calculateExperienceToNext(updatedPlayer.level);
      
      // Apply level bonuses
      updatedPlayer.maxHealth += levelsGained * this.config.healthPerLevel;
      updatedPlayer.health = updatedPlayer.maxHealth; // Full heal on level up
      updatedPlayer.speed += levelsGained * this.config.speedPerLevel;
      
      this.events.push({
        type: 'PLAYER_LEVEL_UP',
        data: { newLevel: updatedPlayer.level, levelsGained },
        timestamp: Date.now()
      });
    }

    // Handle death
    if (player.health <= 0) {
      this.events.push({
        type: 'PLAYER_DEATH',
        data: { finalLevel: player.level },
        timestamp: Date.now()
      });
    }

    return { entities: [updatedPlayer], events: this.events };
  }

  configure(config: PlayerConfig): void {
    this.config = { ...this.config, ...config };
  }

  getEvents(): GameEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  createPlayer(): Player {
    return {
      x: this.config.startingPosition.x,
      y: this.config.startingPosition.y,
      vx: 0,
      vy: 0,
      size: this.config.size,
      color: this.config.color,
      health: this.config.startingHealth,
      maxHealth: this.config.startingHealth,
      level: this.config.startingLevel,
      experience: 0,
      experienceToNext: this.calculateExperienceToNext(this.config.startingLevel),
      speed: this.config.startingSpeed,
      resources: 0, // Keep for backward compatibility
      energyCrystals: 0,
      quantumCores: 0,
      essenceFragments: 0
    };
  }

  takeDamage(player: Player, damage: number): Player {
    const newHealth = Math.max(0, player.health - damage);
    
    if (newHealth < player.health) {
      this.events.push({
        type: 'PLAYER_DAMAGE_TAKEN',
        data: { damage, newHealth },
        timestamp: Date.now()
      });
    }

    return { ...player, health: newHealth };
  }

  gainExperience(player: Player, experience: number): Player {
    const newExperience = player.experience + experience;
    
    this.events.push({
      type: 'PLAYER_EXPERIENCE_GAINED',
      data: { experience, newExperience },
      timestamp: Date.now()
    });

    return { ...player, experience: newExperience };
  }

  collectResources(player: Player, resources: number): Player {
    const newResources = player.resources + resources;
    
    this.events.push({
      type: 'PLAYER_RESOURCES_GAINED',
      data: { resources, newResources },
      timestamp: Date.now()
    });

    return { ...player, resources: newResources };
  }

  collectResourcesByType(player: Player, type: ResourceType, amount: number): Player {
    const maxCapacity = this.getResourceCapacity(type);
    
    switch (type) {
      case ResourceType.ENERGY_CRYSTAL:
        const newEnergyCrystals = Math.min(maxCapacity, player.energyCrystals + amount);
        const actualEnergyGained = newEnergyCrystals - player.energyCrystals;
        
        if (actualEnergyGained > 0) {
          this.events.push({
            type: 'PLAYER_ENERGY_CRYSTALS_GAINED',
            data: { amount: actualEnergyGained, newTotal: newEnergyCrystals, maxCapacity },
            timestamp: Date.now()
          });
        }
        
        return { ...player, energyCrystals: newEnergyCrystals };
        
      case ResourceType.QUANTUM_CORE:
        const newQuantumCores = Math.min(maxCapacity, player.quantumCores + amount);
        const actualQuantumGained = newQuantumCores - player.quantumCores;
        
        if (actualQuantumGained > 0) {
          this.events.push({
            type: 'PLAYER_QUANTUM_CORES_GAINED',
            data: { amount: actualQuantumGained, newTotal: newQuantumCores, maxCapacity },
            timestamp: Date.now()
          });
        }
        
        return { ...player, quantumCores: newQuantumCores };
        
      case ResourceType.ESSENCE_FRAGMENT:
        const newEssenceFragments = Math.min(maxCapacity, player.essenceFragments + amount);
        const actualEssenceGained = newEssenceFragments - player.essenceFragments;
        
        if (actualEssenceGained > 0) {
          this.events.push({
            type: 'PLAYER_ESSENCE_FRAGMENTS_GAINED',
            data: { amount: actualEssenceGained, newTotal: newEssenceFragments, maxCapacity },
            timestamp: Date.now()
          });
        }
        
        return { ...player, essenceFragments: newEssenceFragments };
        
      default:
        return player;
    }
  }

  spendResourcesByType(player: Player, type: ResourceType, amount: number): Player | null {
    switch (type) {
      case ResourceType.ENERGY_CRYSTAL:
        if (player.energyCrystals < amount) return null;
        const newEnergyCrystals = player.energyCrystals - amount;
        
        this.events.push({
          type: 'PLAYER_ENERGY_CRYSTALS_SPENT',
          data: { amount, newTotal: newEnergyCrystals },
          timestamp: Date.now()
        });
        
        return { ...player, energyCrystals: newEnergyCrystals };
        
      case ResourceType.QUANTUM_CORE:
        if (player.quantumCores < amount) return null;
        const newQuantumCores = player.quantumCores - amount;
        
        this.events.push({
          type: 'PLAYER_QUANTUM_CORES_SPENT',
          data: { amount, newTotal: newQuantumCores },
          timestamp: Date.now()
        });
        
        return { ...player, quantumCores: newQuantumCores };
        
      case ResourceType.ESSENCE_FRAGMENT:
        if (player.essenceFragments < amount) return null;
        const newEssenceFragments = player.essenceFragments - amount;
        
        this.events.push({
          type: 'PLAYER_ESSENCE_FRAGMENTS_SPENT',
          data: { amount, newTotal: newEssenceFragments },
          timestamp: Date.now()
        });
        
        return { ...player, essenceFragments: newEssenceFragments };
        
      default:
        return null;
    }
  }

  private getResourceCapacity(type: ResourceType): number {
    if (!this.resourceConfig) return 999; // Fallback
    
    switch (type) {
      case ResourceType.ENERGY_CRYSTAL:
        return this.resourceConfig.energyCrystal.maxCapacity;
      case ResourceType.QUANTUM_CORE:
        return this.resourceConfig.quantumCore.maxCapacity;
      case ResourceType.ESSENCE_FRAGMENT:
        return this.resourceConfig.essenceFragment.maxCapacity;
      default:
        return 999;
    }
  }

  spendResources(player: Player, amount: number): Player {
    const newResources = Math.max(0, player.resources - amount);
    
    this.events.push({
      type: 'PLAYER_RESOURCES_SPENT',
      data: { amount, newResources },
      timestamp: Date.now()
    });

    return { ...player, resources: newResources };
  }

  private calculateExperienceToNext(level: number): number {
    return level * this.config.experiencePerLevel;
  }
}