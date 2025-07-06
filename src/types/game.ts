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

export interface Player extends GameObject {
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  experienceToNext: number;
  speed: number;
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

export interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  particles: Particle[];
  gameRunning: boolean;
  gameOver: boolean;
  levelUp: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export type GameAction = 
  | { type: 'UPDATE_PLAYER'; payload: Partial<Player> }
  | { type: 'ADD_BULLET'; payload: Bullet }
  | { type: 'ADD_ENEMY'; payload: Enemy }
  | { type: 'ADD_PARTICLE'; payload: Particle }
  | { type: 'UPDATE_BULLETS'; payload: Bullet[] }
  | { type: 'UPDATE_ENEMIES'; payload: Enemy[] }
  | { type: 'UPDATE_PARTICLES'; payload: Particle[] }
  | { type: 'SET_GAME_RUNNING'; payload: boolean }
  | { type: 'SET_GAME_OVER'; payload: boolean }
  | { type: 'SET_LEVEL_UP'; payload: boolean }
  | { type: 'RESET_GAME' };