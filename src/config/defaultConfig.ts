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
    upgrades: {
      health: {
        levels: [4, 5, 7, 10], // Max health per level
        costs: [
          { energyCrystals: 30, quantumCores: 0, essenceFragments: 0 },
          { energyCrystals: 60, quantumCores: 1, essenceFragments: 0 },
          { energyCrystals: 120, quantumCores: 3, essenceFragments: 1 },
          { energyCrystals: 250, quantumCores: 8, essenceFragments: 2 }
        ]
      },
      speed: {
        levels: [3.0, 3.5, 4.2, 5.0], // Movement speed per level
        costs: [
          { energyCrystals: 40, quantumCores: 0, essenceFragments: 0 },
          { energyCrystals: 80, quantumCores: 2, essenceFragments: 0 },
          { energyCrystals: 160, quantumCores: 5, essenceFragments: 1 },
          { energyCrystals: 320, quantumCores: 12, essenceFragments: 3 }
        ]
      },
      damage: {
        levels: [2, 3, 4, 6], // Bullet damage per level
        costs: [
          { energyCrystals: 50, quantumCores: 1, essenceFragments: 0 },
          { energyCrystals: 100, quantumCores: 3, essenceFragments: 0 },
          { energyCrystals: 200, quantumCores: 8, essenceFragments: 2 },
          { energyCrystals: 400, quantumCores: 20, essenceFragments: 5 }
        ]
      },
      fireRate: {
        levels: [250, 200, 150, 100], // Shoot cooldown in ms (lower = faster)
        costs: [
          { energyCrystals: 35, quantumCores: 0, essenceFragments: 0 },
          { energyCrystals: 70, quantumCores: 2, essenceFragments: 0 },
          { energyCrystals: 140, quantumCores: 6, essenceFragments: 1 },
          { energyCrystals: 280, quantumCores: 15, essenceFragments: 4 }
        ]
      }
    }
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
      maxCapacity: 999999, // Unlimited
      color: "#00ffff",
      size: 6,
    },
    quantumCore: {
      dropRate: 0.3, // 30% chance per elite enemy kill
      value: 1,
      maxCapacity: 999999, // Unlimited
      color: "#ff00ff",
      size: 8,
    },
    essenceFragment: {
      dropRate: 1.0, // 100% chance per boss enemy kill
      minValue: 1,
      maxValue: 2,
      maxCapacity: 999999, // Unlimited
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
    upgrades: {
      health: {
        levels: [150, 200, 300, 500], // Max health per level
        costs: [
          { energyCrystals: 50, quantumCores: 0, essenceFragments: 0 },
          { energyCrystals: 100, quantumCores: 2, essenceFragments: 0 },
          { energyCrystals: 200, quantumCores: 5, essenceFragments: 1 },
          { energyCrystals: 400, quantumCores: 10, essenceFragments: 3 }
        ]
      },
      armor: {
        levels: [0.1, 0.2, 0.35, 0.5], // Damage reduction per level
        costs: [
          { energyCrystals: 75, quantumCores: 1, essenceFragments: 0 },
          { energyCrystals: 150, quantumCores: 3, essenceFragments: 0 },
          { energyCrystals: 300, quantumCores: 8, essenceFragments: 2 },
          { energyCrystals: 600, quantumCores: 15, essenceFragments: 5 }
        ]
      },
      turrets: {
        levels: [1, 2, 3, 4], // Number of auto-turrets
        costs: [
          { energyCrystals: 100, quantumCores: 2, essenceFragments: 0 },
          { energyCrystals: 200, quantumCores: 5, essenceFragments: 1 },
          { energyCrystals: 400, quantumCores: 12, essenceFragments: 3 },
          { energyCrystals: 800, quantumCores: 25, essenceFragments: 8 }
        ]
      },
      shield: {
        levels: [50, 100, 200, 400], // Shield HP per level
        costs: [
          { energyCrystals: 125, quantumCores: 3, essenceFragments: 0 },
          { energyCrystals: 250, quantumCores: 8, essenceFragments: 1 },
          { energyCrystals: 500, quantumCores: 20, essenceFragments: 4 },
          { energyCrystals: 1000, quantumCores: 40, essenceFragments: 10 }
        ]
      }
    }
  },
  wave: {
    preparationDuration: 30000, // 30 seconds - extended for upgrades and building
    combatDuration: 90000, // 90 seconds (1.5 minutes)
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
