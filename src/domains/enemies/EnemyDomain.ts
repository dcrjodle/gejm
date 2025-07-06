import { Enemy, Player, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { EnemyConfig } from '../../engine/types/config';

export class EnemyDomain implements DomainInterface<Enemy> {
  private config: EnemyConfig;
  private events: GameEvent[] = [];
  private lastSpawnTime: number = 0;

  constructor(config: EnemyConfig) {
    this.config = config;
  }

  update(entities: Enemy[], deltaTime: number, gameState: any): DomainUpdate<Enemy> {
    const { player, canvasWidth, canvasHeight } = gameState;
    
    // Update existing enemies
    const updatedEnemies = entities.map(enemy => this.updateEnemyMovement(enemy, player));
    
    // Check if we should spawn new enemies
    const now = Date.now();
    if (this.shouldSpawnEnemy(now, updatedEnemies.length)) {
      const newEnemy = this.createEnemy(canvasWidth, canvasHeight);
      updatedEnemies.push(newEnemy);
      this.lastSpawnTime = now;
      
      this.events.push({
        type: 'ENEMY_SPAWNED',
        data: { enemy: newEnemy },
        timestamp: now
      });
    }

    return { entities: updatedEnemies, events: this.events };
  }

  configure(config: EnemyConfig): void {
    this.config = { ...this.config, ...config };
  }

  getEvents(): GameEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  private shouldSpawnEnemy(currentTime: number, currentEnemyCount: number): boolean {
    const timeSinceLastSpawn = currentTime - this.lastSpawnTime;
    return timeSinceLastSpawn > this.config.spawnRate && 
           currentEnemyCount < this.config.maxConcurrent;
  }

  private createEnemy(canvasWidth: number, canvasHeight: number): Enemy {
    const edge = Math.floor(Math.random() * 4);
    let x: number, y: number;
    
    switch (edge) {
      case 0: // top
        x = Math.random() * canvasWidth;
        y = -20;
        break;
      case 1: // right
        x = canvasWidth + 20;
        y = Math.random() * canvasHeight;
        break;
      case 2: // bottom
        x = Math.random() * canvasWidth;
        y = canvasHeight + 20;
        break;
      case 3: // left
        x = -20;
        y = Math.random() * canvasHeight;
        break;
      default:
        x = 0;
        y = 0;
    }
    
    return {
      x,
      y,
      vx: 0,
      vy: 0,
      size: this.config.size,
      color: this.config.color,
      speed: this.config.baseSpeed + Math.random() * this.config.speedVariation,
      health: this.config.health,
      experienceValue: this.config.experienceValue
    };
  }

  private updateEnemyMovement(enemy: Enemy, player: Player): Enemy {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      return {
        ...enemy,
        x: enemy.x + normalizedDx * enemy.speed,
        y: enemy.y + normalizedDy * enemy.speed,
        vx: normalizedDx * enemy.speed,
        vy: normalizedDy * enemy.speed
      };
    }
    
    return enemy;
  }

  destroyEnemy(enemy: Enemy): void {
    this.events.push({
      type: 'ENEMY_DESTROYED',
      data: { enemy },
      timestamp: Date.now()
    });
  }
}