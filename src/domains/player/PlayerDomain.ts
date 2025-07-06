import { Player, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { PlayerConfig } from '../../engine/types/config';

export class PlayerDomain implements DomainInterface<Player> {
  private config: PlayerConfig;
  private events: GameEvent[] = [];

  constructor(config: PlayerConfig) {
    this.config = config;
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
      size: this.config.size,
      color: this.config.color,
      health: this.config.startingHealth,
      maxHealth: this.config.startingHealth,
      level: this.config.startingLevel,
      experience: 0,
      experienceToNext: this.calculateExperienceToNext(this.config.startingLevel),
      speed: this.config.startingSpeed
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

  private calculateExperienceToNext(level: number): number {
    return level * this.config.experiencePerLevel;
  }
}