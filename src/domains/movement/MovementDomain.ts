import { Player, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { MovementConfig } from '../../engine/types/config';

export class MovementDomain implements DomainInterface<Player> {
  private config: MovementConfig;
  private events: GameEvent[] = [];

  constructor(config: MovementConfig) {
    this.config = config;
  }

  update(entities: Player[], deltaTime: number, gameState: any): DomainUpdate<Player> {
    if (entities.length === 0) {
      return { entities: [] };
    }

    const player = entities[0];
    const { keysPressed, canvasWidth, canvasHeight } = gameState;
    
    const updatedPlayer = this.updatePlayerMovement(player, keysPressed, canvasWidth, canvasHeight);
    
    return { entities: [updatedPlayer], events: this.events };
  }

  configure(config: MovementConfig): void {
    this.config = { ...this.config, ...config };
  }

  getEvents(): GameEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  private updatePlayerMovement(
    player: Player, 
    keysPressed: Record<string, boolean>, 
    canvasWidth: number, 
    canvasHeight: number
  ): Player {
    let newX = player.x;
    let newY = player.y;
    let moved = false;

    // Direct movement based on key presses - no acceleration or friction
    if (keysPressed[this.config.keyBindings.up]) {
      newY -= player.speed;
      moved = true;
    }
    if (keysPressed[this.config.keyBindings.down]) {
      newY += player.speed;
      moved = true;
    }
    if (keysPressed[this.config.keyBindings.left]) {
      newX -= player.speed;
      moved = true;
    }
    if (keysPressed[this.config.keyBindings.right]) {
      newX += player.speed;
      moved = true;
    }

    // Keep player in bounds
    newX = this.clamp(newX, player.size, canvasWidth - player.size);
    newY = this.clamp(newY, player.size, canvasHeight - player.size);

    if (moved) {
      this.events.push({
        type: 'PLAYER_MOVED',
        data: { 
          from: { x: player.x, y: player.y },
          to: { x: newX, y: newY }
        },
        timestamp: Date.now()
      });
    }

    return {
      ...player,
      x: newX,
      y: newY,
      vx: 0, // Reset velocity since we're using direct movement
      vy: 0
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  isShootKeyPressed(keysPressed: Record<string, boolean>): boolean {
    return keysPressed[this.config.keyBindings.shoot] || false;
  }
}