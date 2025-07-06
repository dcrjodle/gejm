import { GameObject, Velocity } from './common';

export interface Player extends GameObject, Velocity {
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  experienceToNext: number;
  speed: number;
  resources: number;
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

export interface Resource extends GameObject {
  value: number;
  life: number;
  maxLife: number;
}

export interface GameEntities {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  particles: Particle[];
  resources: Resource[];
}