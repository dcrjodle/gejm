import { GameObject, Velocity } from './common';

export interface PlayerUpgradeLevels {
  health: number;
  speed: number;
  damage: number;
  fireRate: number;
}

export interface Player extends GameObject, Velocity {
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  experienceToNext: number;
  speed: number;
  resources: number; // Keep for backward compatibility
  energyCrystals: number;
  quantumCores: number;
  essenceFragments: number;
  upgradeLevels: PlayerUpgradeLevels;
  damage: number;
  fireRate: number; // Shoot cooldown in ms
}

export enum EnemyType {
  BASIC = 'basic',
  ELITE = 'elite', 
  BOSS = 'boss'
}

export interface Enemy extends GameObject, Velocity {
  type: EnemyType;
  speed: number;
  health: number;
  maxHealth: number;
  experienceValue: number;
  waveNumber: number;
  hitTime?: number;
  hitFlashDuration?: number;
}

export interface Bullet extends GameObject, Velocity {
  damage: number;
}

export interface Particle extends GameObject, Velocity {
  life: number;
  maxLife: number;
}

export enum ResourceType {
  ENERGY_CRYSTAL = 'energy_crystal',
  QUANTUM_CORE = 'quantum_core',
  ESSENCE_FRAGMENT = 'essence_fragment'
}

export interface Resource extends GameObject {
  type: ResourceType;
  value: number;
  life: number;
  maxLife: number;
  isBeingPickedUp: boolean;
  pickupStartTime?: number;
}

export interface BaseUpgradeLevels {
  health: number;
  armor: number;
  turrets: number;
  shield: number;
}

export interface Base extends GameObject {
  health: number;
  maxHealth: number;
  repairRate: number;
  lastDamageTime: number;
  upgradeLevels: BaseUpgradeLevels;
  shield: number;
  maxShield: number;
  armor: number; // Damage reduction (0-1)
}

export interface GameEntities {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  particles: Particle[];
  resources: Resource[];
  base: Base;
}