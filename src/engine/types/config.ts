export interface PlayerConfig {
  startingHealth: number;
  startingSpeed: number;
  startingLevel: number;
  startingPosition: { x: number; y: number };
  size: number;
  color: string;
  experiencePerLevel: number;
  healthPerLevel: number;
  speedPerLevel: number;
}

export interface EnemyConfig {
  spawnRate: number;
  maxConcurrent: number;
  baseSpeed: number;
  speedVariation: number;
  size: number;
  color: string;
  health: number;
  experienceValue: number;
  waveSize: number;
  waveSpawnDelay: number;
}

export interface WeaponConfig {
  shootCooldown: number;
  bulletSpeed: number;
  bulletSize: number;
  bulletColor: string;
  damage: number;
  maxAmmo: number;
  ammoRegenRate: number; // ammo per second
}

export interface MovementConfig {
  keyBindings: {
    up: string;
    down: string;
    left: string;
    right: string;
    shoot: string;
    pause: string;
  };
  friction: number;
  acceleration: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  gridSize: number;
  gridColor: string;
  showGrid: boolean;
}

export interface ParticleConfig {
  explosionCount: number;
  explosionSpeed: number;
  explosionLife: number;
  explosionSize: number;
  friction: number;
  lifeDecay: number;
}

export interface ResourceConfig {
  energyCrystal: {
    dropRate: number; // 0-1 probability per basic enemy kill
    minValue: number;
    maxValue: number;
    maxCapacity: number;
    color: string;
    size: number;
  };
  quantumCore: {
    dropRate: number; // 0-1 probability per elite enemy kill
    value: number;
    maxCapacity: number;
    color: string;
    size: number;
  };
  essenceFragment: {
    dropRate: number; // 0-1 probability per boss enemy kill
    minValue: number;
    maxValue: number;
    maxCapacity: number;
    color: string;
    size: number;
  };
  pickupDistance: number;
  pickupDuration: number;
}

export interface BaseConfig {
  startingHealth: number;
  maxHealth: number;
  repairRate: number; // health per second when not under attack
  repairDelay: number; // milliseconds after last damage before repair starts
  position: { x: number; y: number };
  size: number;
  color: string;
}

export interface GameConfig {
  player: PlayerConfig;
  enemies: EnemyConfig;
  weapons: WeaponConfig;
  movement: MovementConfig;
  canvas: CanvasConfig;
  particles: ParticleConfig;
  resources: ResourceConfig;
  base: BaseConfig;
}