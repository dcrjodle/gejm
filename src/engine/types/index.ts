export * from './common';
export * from './entities';
export * from './config';
export * from './buildings';

// Re-export GameState from the original types for compatibility
export interface GameState {
  player: import('./entities').Player;
  enemies: import('./entities').Enemy[];
  bullets: import('./entities').Bullet[];
  particles: import('./entities').Particle[];
  resources: import('./entities').Resource[];
  base: import('./entities').Base;
  buildings: import('./buildings').Building[];
  powerConnections: import('./buildings').PowerConnection[];
  placementPreview?: import('./buildings').PlacementPreview;
  selectedBuildingType?: string;
  placementMode: boolean;
  playerStats: import('./buildings').PlayerStats;
  gameRunning: boolean;
  gameOver: boolean;
  levelUp: boolean;
  canvasWidth: number;
  canvasHeight: number;
  lastUpdate?: number;
}