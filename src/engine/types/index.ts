export * from './common';
export * from './entities';
export * from './config';

// Re-export GameState from the original types for compatibility
export interface GameState {
  player: import('./entities').Player;
  enemies: import('./entities').Enemy[];
  bullets: import('./entities').Bullet[];
  particles: import('./entities').Particle[];
  gameRunning: boolean;
  gameOver: boolean;
  levelUp: boolean;
  canvasWidth: number;
  canvasHeight: number;
}