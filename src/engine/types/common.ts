export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameObject extends Position {
  size: number;
  color: string;
}

export interface GameBounds {
  width: number;
  height: number;
}

export interface DeltaTime {
  deltaTime: number;
}

export interface DomainUpdate<T> {
  entities: T[];
  events?: GameEvent[];
}

export interface GameEvent {
  type: string;
  data?: any;
  timestamp: number;
}

export interface DomainInterface<T> {
  update(entities: T[], deltaTime: number, gameState: any): DomainUpdate<T>;
  configure(config: any): void;
  getEvents(): GameEvent[];
  clearEvents(): void;
}