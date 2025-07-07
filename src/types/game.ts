export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface GameObject extends Position {
  size: number;
  color: string;
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
}

export interface Enemy extends GameObject, Velocity {
  speed: number;
  health: number;
  experienceValue: number;
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

export interface Base extends GameObject {
  health: number;
  maxHealth: number;
  repairRate: number;
  lastDamageTime: number;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  particles: Particle[];
  resources: Resource[];
  base: Base;
  gameRunning: boolean;
  gameOver: boolean;
  levelUp: boolean;
  canvasWidth: number;
  canvasHeight: number;
  lastUpdate?: number; // For forcing UI updates
}

export type GameAction = 
  | { type: 'UPDATE_PLAYER'; payload: Partial<import('../engine/types/entities').Player> }
  | { type: 'ADD_BULLET'; payload: import('../engine/types/entities').Bullet }
  | { type: 'ADD_ENEMY'; payload: import('../engine/types/entities').Enemy }
  | { type: 'ADD_PARTICLE'; payload: import('../engine/types/entities').Particle }
  | { type: 'ADD_RESOURCE'; payload: import('../engine/types/entities').Resource }
  | { type: 'UPDATE_BULLETS'; payload: import('../engine/types/entities').Bullet[] }
  | { type: 'UPDATE_ENEMIES'; payload: import('../engine/types/entities').Enemy[] }
  | { type: 'UPDATE_PARTICLES'; payload: import('../engine/types/entities').Particle[] }
  | { type: 'UPDATE_RESOURCES'; payload: import('../engine/types/entities').Resource[] }
  | { type: 'SET_GAME_RUNNING'; payload: boolean }
  | { type: 'SET_GAME_OVER'; payload: boolean }
  | { type: 'SET_LEVEL_UP'; payload: boolean }
  | { type: 'FORCE_UI_UPDATE'; payload: number }
  | { type: 'RESET_GAME' };