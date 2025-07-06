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
  // Enemy type configurations
  basic: {
    size: number;
    color: string;
    health: number;
    speed: number;
    experienceValue: number;
  };
  elite: {
    size: number;
    color: string;
    health: number;
    speed: number;
    experienceValue: number;
    spawnChance: number; // 0-1 probability
  };
  boss: {
    size: number;
    color: string;
    health: number;
    speed: number;
    experienceValue: number;
    count: number; // Number of bosses per boss wave
  };
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

export interface WaveConfig {
  preparationDuration: number; // 10 seconds
  combatDuration: number; // 60-120 seconds  
  intermissionDuration: number; // 30-60 seconds
  difficultyScaling: {
    healthMultiplier: number; // +15% per wave
    speedMultiplier: number; // +5% per wave
    spawnRateMultiplier: number; // +10% per wave
  };
  bossWaves: number[]; // [5, 10, 15, 20, ...]
  eliteWaveStart: number; // Wave 3
  baseEnemiesPerWave: number; // Starting number of enemies
  enemiesPerWaveIncrease: number; // Additional enemies per wave
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
  wave: WaveConfig;
}