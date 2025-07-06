import { GameConfig } from '../engine/types/config';
import { defaultGameConfig } from '../config/defaultConfig';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export class ConfigService {
  private currentConfig: GameConfig;
  private subscribers: ((config: GameConfig) => void)[] = [];

  constructor(initialConfig: GameConfig = defaultGameConfig) {
    this.currentConfig = { ...initialConfig };
  }

  getConfig(): GameConfig {
    return { ...this.currentConfig };
  }

  updateConfig(partialConfig: DeepPartial<GameConfig>): void {
    this.currentConfig = this.mergeConfigs(this.currentConfig, partialConfig);
    this.notifySubscribers();
  }

  resetToDefault(): void {
    this.currentConfig = { ...defaultGameConfig };
    this.notifySubscribers();
  }

  subscribe(callback: (config: GameConfig) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private mergeConfigs(current: GameConfig, partial: DeepPartial<GameConfig>): GameConfig {
    const result = { ...current };
    
    // Deep merge each section
    if (partial.player) {
      result.player = { ...current.player };
      if (partial.player.startingHealth !== undefined) result.player.startingHealth = partial.player.startingHealth;
      if (partial.player.startingSpeed !== undefined) result.player.startingSpeed = partial.player.startingSpeed;
      if (partial.player.startingLevel !== undefined) result.player.startingLevel = partial.player.startingLevel;
      if (partial.player.size !== undefined) result.player.size = partial.player.size;
      if (partial.player.color !== undefined) result.player.color = partial.player.color;
      if (partial.player.experiencePerLevel !== undefined) result.player.experiencePerLevel = partial.player.experiencePerLevel;
      if (partial.player.healthPerLevel !== undefined) result.player.healthPerLevel = partial.player.healthPerLevel;
      if (partial.player.speedPerLevel !== undefined) result.player.speedPerLevel = partial.player.speedPerLevel;
      if (partial.player.startingPosition) {
        result.player.startingPosition = { ...current.player.startingPosition };
        if (partial.player.startingPosition.x !== undefined) result.player.startingPosition.x = partial.player.startingPosition.x;
        if (partial.player.startingPosition.y !== undefined) result.player.startingPosition.y = partial.player.startingPosition.y;
      }
    }
    if (partial.enemies) {
      result.enemies = { ...current.enemies };
      if (partial.enemies.spawnRate !== undefined) result.enemies.spawnRate = partial.enemies.spawnRate;
      if (partial.enemies.maxConcurrent !== undefined) result.enemies.maxConcurrent = partial.enemies.maxConcurrent;
      if (partial.enemies.baseSpeed !== undefined) result.enemies.baseSpeed = partial.enemies.baseSpeed;
      if (partial.enemies.speedVariation !== undefined) result.enemies.speedVariation = partial.enemies.speedVariation;
      if (partial.enemies.size !== undefined) result.enemies.size = partial.enemies.size;
      if (partial.enemies.color !== undefined) result.enemies.color = partial.enemies.color;
      if (partial.enemies.health !== undefined) result.enemies.health = partial.enemies.health;
      if (partial.enemies.experienceValue !== undefined) result.enemies.experienceValue = partial.enemies.experienceValue;
    }
    if (partial.weapons) {
      result.weapons = { ...current.weapons };
      if (partial.weapons.shootCooldown !== undefined) result.weapons.shootCooldown = partial.weapons.shootCooldown;
      if (partial.weapons.bulletSpeed !== undefined) result.weapons.bulletSpeed = partial.weapons.bulletSpeed;
      if (partial.weapons.bulletSize !== undefined) result.weapons.bulletSize = partial.weapons.bulletSize;
      if (partial.weapons.bulletColor !== undefined) result.weapons.bulletColor = partial.weapons.bulletColor;
      if (partial.weapons.damage !== undefined) result.weapons.damage = partial.weapons.damage;
    }
    if (partial.movement) {
      result.movement = { ...current.movement };
      if (partial.movement.friction !== undefined) result.movement.friction = partial.movement.friction;
      if (partial.movement.acceleration !== undefined) result.movement.acceleration = partial.movement.acceleration;
      if (partial.movement.keyBindings) {
        result.movement.keyBindings = { ...current.movement.keyBindings };
        if (partial.movement.keyBindings.up !== undefined) result.movement.keyBindings.up = partial.movement.keyBindings.up;
        if (partial.movement.keyBindings.down !== undefined) result.movement.keyBindings.down = partial.movement.keyBindings.down;
        if (partial.movement.keyBindings.left !== undefined) result.movement.keyBindings.left = partial.movement.keyBindings.left;
        if (partial.movement.keyBindings.right !== undefined) result.movement.keyBindings.right = partial.movement.keyBindings.right;
        if (partial.movement.keyBindings.shoot !== undefined) result.movement.keyBindings.shoot = partial.movement.keyBindings.shoot;
      }
    }
    if (partial.canvas) {
      result.canvas = { ...current.canvas };
      if (partial.canvas.width !== undefined) result.canvas.width = partial.canvas.width;
      if (partial.canvas.height !== undefined) result.canvas.height = partial.canvas.height;
      if (partial.canvas.backgroundColor !== undefined) result.canvas.backgroundColor = partial.canvas.backgroundColor;
      if (partial.canvas.gridSize !== undefined) result.canvas.gridSize = partial.canvas.gridSize;
      if (partial.canvas.gridColor !== undefined) result.canvas.gridColor = partial.canvas.gridColor;
      if (partial.canvas.showGrid !== undefined) result.canvas.showGrid = partial.canvas.showGrid;
    }
    if (partial.particles) {
      result.particles = { ...current.particles };
      if (partial.particles.explosionCount !== undefined) result.particles.explosionCount = partial.particles.explosionCount;
      if (partial.particles.explosionSpeed !== undefined) result.particles.explosionSpeed = partial.particles.explosionSpeed;
      if (partial.particles.explosionLife !== undefined) result.particles.explosionLife = partial.particles.explosionLife;
      if (partial.particles.explosionSize !== undefined) result.particles.explosionSize = partial.particles.explosionSize;
      if (partial.particles.friction !== undefined) result.particles.friction = partial.particles.friction;
      if (partial.particles.lifeDecay !== undefined) result.particles.lifeDecay = partial.particles.lifeDecay;
    }

    return result;
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.currentConfig));
  }

  // LLM-friendly configuration methods
  setPlayerConfig(config: Partial<GameConfig['player']>): void {
    this.updateConfig({ player: config });
  }

  setEnemyConfig(config: Partial<GameConfig['enemies']>): void {
    this.updateConfig({ enemies: config });
  }

  setWeaponConfig(config: Partial<GameConfig['weapons']>): void {
    this.updateConfig({ weapons: config });
  }

  setMovementConfig(config: Partial<GameConfig['movement']>): void {
    this.updateConfig({ movement: config });
  }

  setCanvasConfig(config: Partial<GameConfig['canvas']>): void {
    this.updateConfig({ canvas: config });
  }

  setParticleConfig(config: Partial<GameConfig['particles']>): void {
    this.updateConfig({ particles: config });
  }

  // Quick adjustments for common modifications
  adjustDifficulty(multiplier: number): void {
    this.updateConfig({
      enemies: {
        ...this.currentConfig.enemies,
        spawnRate: Math.max(500, this.currentConfig.enemies.spawnRate / multiplier),
        maxConcurrent: Math.floor(this.currentConfig.enemies.maxConcurrent * multiplier),
        baseSpeed: this.currentConfig.enemies.baseSpeed * multiplier
      },
      weapons: {
        ...this.currentConfig.weapons,
        shootCooldown: Math.max(100, this.currentConfig.weapons.shootCooldown / multiplier)
      }
    });
  }

  adjustCanvasSize(width: number, height: number): void {
    this.updateConfig({
      canvas: { ...this.currentConfig.canvas, width, height },
      player: {
        ...this.currentConfig.player,
        startingPosition: { x: width / 2, y: height / 2 }
      }
    });
  }

  // Validation methods
  validateConfig(config: DeepPartial<GameConfig>): string[] {
    const errors: string[] = [];

    if (config.player) {
      if (config.player.startingHealth !== undefined && config.player.startingHealth <= 0) {
        errors.push('Player starting health must be greater than 0');
      }
      if (config.player.startingSpeed !== undefined && config.player.startingSpeed <= 0) {
        errors.push('Player starting speed must be greater than 0');
      }
    }

    if (config.enemies) {
      if (config.enemies.spawnRate !== undefined && config.enemies.spawnRate < 100) {
        errors.push('Enemy spawn rate must be at least 100ms');
      }
      if (config.enemies.maxConcurrent !== undefined && config.enemies.maxConcurrent < 1) {
        errors.push('Max concurrent enemies must be at least 1');
      }
    }

    if (config.weapons) {
      if (config.weapons.shootCooldown !== undefined && config.weapons.shootCooldown < 50) {
        errors.push('Weapon shoot cooldown must be at least 50ms');
      }
    }

    if (config.canvas) {
      if (config.canvas.width !== undefined && config.canvas.width < 400) {
        errors.push('Canvas width must be at least 400px');
      }
      if (config.canvas.height !== undefined && config.canvas.height < 300) {
        errors.push('Canvas height must be at least 300px');
      }
    }

    return errors;
  }
}