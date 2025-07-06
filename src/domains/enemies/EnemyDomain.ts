import { Enemy, Player, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { EnemyConfig } from '../../engine/types/config';

export class EnemyDomain implements DomainInterface<Enemy> {
  private config: EnemyConfig;
  private events: GameEvent[] = [];
  private lastSpawnTime: number = 0;
  private currentWaveEnemiesSpawned: number = 0;
  private currentWaveEnemiesAlive: number = 0;
  private waveInProgress: boolean = false;
  private waveReadyToStart: boolean = true;

  constructor(config: EnemyConfig) {
    this.config = config;
  }

  update(entities: Enemy[], deltaTime: number, gameState: any): DomainUpdate<Enemy> {
    const { player, canvasWidth, canvasHeight } = gameState;
    
    // Update existing enemies
    const updatedEnemies = entities.map(enemy => this.updateEnemyMovement(enemy, player));
    
    // Update wave tracking
    this.currentWaveEnemiesAlive = updatedEnemies.length;
    
    // Check if we should spawn new enemies or start a new wave
    const now = Date.now();
    if (this.shouldSpawnEnemy(now)) {
      const newEnemy = this.createEnemy(canvasWidth, canvasHeight);
      updatedEnemies.push(newEnemy);
      this.lastSpawnTime = now;
      this.currentWaveEnemiesSpawned++;
      this.currentWaveEnemiesAlive++;
      
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

  private shouldSpawnEnemy(currentTime: number): boolean {
    const timeSinceLastSpawn = currentTime - this.lastSpawnTime;
    
    // If wave is in progress, spawn enemies with delay until wave is complete
    if (this.waveInProgress && this.currentWaveEnemiesSpawned < this.config.waveSize) {
      return timeSinceLastSpawn > this.config.waveSpawnDelay;
    }
    
    // If wave is complete, mark it as finished and ready for next wave
    if (this.currentWaveEnemiesSpawned >= this.config.waveSize) {
      this.waveInProgress = false;
    }
    
    return false;
  }

  private createEnemy(canvasWidth: number, canvasHeight: number): Enemy {
    // Always spawn from right side
    const x = canvasWidth + 20;
    const y = Math.random() * canvasHeight;
    
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
    this.currentWaveEnemiesAlive = Math.max(0, this.currentWaveEnemiesAlive - 1);
    
    this.events.push({
      type: 'ENEMY_DESTROYED',
      data: { enemy },
      timestamp: Date.now()
    });
    
    // Check if wave is complete (all enemies spawned and all defeated)
    if (this.currentWaveEnemiesAlive === 0 && this.currentWaveEnemiesSpawned >= this.config.waveSize) {
      this.waveReadyToStart = true;
      this.events.push({
        type: 'WAVE_COMPLETED',
        data: { waveSize: this.currentWaveEnemiesSpawned },
        timestamp: Date.now()
      });
    }
  }

  startNextWave(): void {
    if (this.waveReadyToStart && this.currentWaveEnemiesAlive === 0) {
      this.waveInProgress = true;
      this.waveReadyToStart = false;
      this.currentWaveEnemiesSpawned = 0;
      this.lastSpawnTime = Date.now() - this.config.waveSpawnDelay; // Start immediately
      
      this.events.push({
        type: 'WAVE_STARTED',
        data: { waveSize: this.config.waveSize },
        timestamp: Date.now()
      });
    }
  }

  isWaveReadyToStart(): boolean {
    return this.waveReadyToStart && this.currentWaveEnemiesAlive === 0;
  }

  isWaveInProgress(): boolean {
    return this.waveInProgress;
  }

  getCurrentWaveStatus(): { enemiesSpawned: number; enemiesAlive: number; waveSize: number } {
    return {
      enemiesSpawned: this.currentWaveEnemiesSpawned,
      enemiesAlive: this.currentWaveEnemiesAlive,
      waveSize: this.config.waveSize
    };
  }

  reset(): void {
    this.lastSpawnTime = 0;
    this.currentWaveEnemiesSpawned = 0;
    this.currentWaveEnemiesAlive = 0;
    this.waveInProgress = false;
    this.waveReadyToStart = true;
    this.clearEvents();
  }
}