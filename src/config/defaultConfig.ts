import { GameConfig } from "../engine/types/config";

export const defaultGameConfig: GameConfig = {
  player: {
    startingHealth: 3,
    startingSpeed: 2.5, // Reduced from 4 for better control
    startingLevel: 1,
    startingPosition: { x: 800, y: 600 }, // Will be updated at runtime
    size: 8,
    color: "#00ffff",
    experiencePerLevel: 10,
    healthPerLevel: 1,
    speedPerLevel: 0.15, // Reduced from 0.2 to match slower base speed
  },
  enemies: {
    spawnRate: 2000, // milliseconds
    maxConcurrent: 15, // Increased to allow more enemies per wave
    baseSpeed: 0.1, // Reduced from 1 for better balance
    speedVariation: 0.1, // Reduced from 1.5 to keep speeds more consistent
    size: 10, // Increased from 6 for better hitbox collision
    color: "#ff0066",
    health: 1,
    experienceValue: 1,
    waveSize: 5,
    waveSpawnDelay: 800, // milliseconds between spawns in a wave
    // Enemy type configurations
    basic: {
      size: 8,
      color: "#ff0066", // Pink - basic enemy
      health: 1,
      speed: 0.8,
      experienceValue: 1,
    },
    elite: {
      size: 12,
      color: "#ff8800", // Orange - elite enemy
      health: 3,
      speed: 1.2,
      experienceValue: 3,
      spawnChance: 0.25, // 25% chance to spawn elite instead of basic
    },
    boss: {
      size: 20,
      color: "#ff0000", // Red - boss enemy
      health: 15,
      speed: 0.6,
      experienceValue: 10,
      count: 1, // 1 boss per boss wave
    },
  },
  weapons: {
    shootCooldown: 300, // milliseconds
    bulletSpeed: 8,
    bulletSize: 3,
    bulletColor: "#00ff00",
    damage: 1,
    maxAmmo: 20,
    ammoRegenRate: 2, // ammo per second
  },
  movement: {
    keyBindings: {
      up: "w",
      down: "s",
      left: "a",
      right: "d",
      shoot: " ",
      pause: "p",
    },
    friction: 0.95,
    acceleration: 1.0,
  },
  canvas: {
    width: 1920, // Will be updated at runtime
    height: 1080, // Will be updated at runtime
    backgroundColor: "#000011",
    gridSize: 40,
    gridColor: "#001122",
    showGrid: true,
  },
  particles: {
    explosionCount: 8,
    explosionSpeed: 2,
    explosionLife: 1.0,
    explosionSize: 2,
    friction: 0.98,
    lifeDecay: 0.02,
  },
  resources: {
    energyCrystal: {
      dropRate: 0.8, // 80% chance per basic enemy kill
      minValue: 1,
      maxValue: 3,
      maxCapacity: 999,
      color: "#00ffff",
      size: 6,
    },
    quantumCore: {
      dropRate: 0.3, // 30% chance per elite enemy kill
      value: 1,
      maxCapacity: 99,
      color: "#ff00ff",
      size: 8,
    },
    essenceFragment: {
      dropRate: 1.0, // 100% chance per boss enemy kill
      minValue: 1,
      maxValue: 2,
      maxCapacity: 9,
      color: "#ffff00",
      size: 10,
    },
    pickupDistance: 40,
    pickupDuration: 300,
  },
  base: {
    startingHealth: 100,
    maxHealth: 100,
    repairRate: 2, // 2 health per second
    repairDelay: 5000, // 5 seconds after last damage
    position: { x: 100, y: 400 }, // Leftmost corner with some padding
    size: 40,
    color: "#ffffff",
  },
  wave: {
    preparationDuration: 10000, // 10 seconds
    combatDuration: 90000, // 90 seconds (1.5 minutes)
    intermissionDuration: 45000, // 45 seconds
    difficultyScaling: {
      healthMultiplier: 1.15, // +15% health per wave
      speedMultiplier: 1.05, // +5% speed per wave
      spawnRateMultiplier: 1.1, // +10% spawn rate per wave
    },
    bossWaves: [5, 10, 15, 20, 25, 30], // Boss every 5 waves
    eliteWaveStart: 3, // Elite enemies start appearing on wave 3
    baseEnemiesPerWave: 5, // Starting with 5 enemies per wave
    enemiesPerWaveIncrease: 2, // +2 enemies per wave progression
  },
};
