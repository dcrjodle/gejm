import { GameConfig } from "../engine/types/config";

export const defaultGameConfig: GameConfig = {
  player: {
    startingHealth: 3,
    startingSpeed: 4,
    startingLevel: 1,
    startingPosition: { x: 800, y: 600 }, // Will be updated at runtime
    size: 8,
    color: "#00ffff",
    experiencePerLevel: 10,
    healthPerLevel: 1,
    speedPerLevel: 0.2,
  },
  enemies: {
    spawnRate: 2000, // milliseconds
    maxConcurrent: 5,
    baseSpeed: 1,
    speedVariation: 1.5,
    size: 6,
    color: "#ff0066",
    health: 1,
    experienceValue: 1,
    waveSize: 5,
    waveSpawnDelay: 500, // milliseconds between spawns in a wave
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
    position: { x: 600, y: 400 }, // Will be updated at runtime to center
    size: 40,
    color: "#ffffff",
  },
};
