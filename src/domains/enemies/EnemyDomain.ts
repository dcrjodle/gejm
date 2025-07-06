import { Enemy, EnemyType, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
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
    const { player, base, canvasWidth, canvasHeight, currentWave = 1, wavePhase = 'preparation' } = gameState;
    
    // Apply wave scaling to existing enemies
    const updatedEnemies = entities.map(enemy => this.updateEnemyWithScaling(enemy, base, player, currentWave));
    
    // Update wave tracking
    this.currentWaveEnemiesAlive = updatedEnemies.length;
    
    // Check if we should spawn new enemies based on wave phase
    const now = Date.now();
    if (this.shouldSpawnEnemyForWave(now, wavePhase, currentWave)) {
      // Determine enemy type based on wave progression
      const enemyType = this.selectEnemyType(currentWave);
      const newEnemy = this.createEnemy(canvasWidth, canvasHeight, enemyType, currentWave);
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

  private shouldSpawnEnemyForWave(currentTime: number, wavePhase: string, currentWave: number): boolean {
    const timeSinceLastSpawn = currentTime - this.lastSpawnTime;
    
    // Only spawn enemies during combat phase
    if (wavePhase !== 'combat') {
      return false;
    }
    
    // Calculate total enemies for this wave (from WaveDomain logic)
    const baseEnemies = 5; // config.wave.baseEnemiesPerWave
    const additionalEnemies = (currentWave - 1) * 2; // config.wave.enemiesPerWaveIncrease
    let totalEnemiesForWave = baseEnemies + additionalEnemies;
    
    // Boss waves have fewer but stronger enemies (30% fewer)
    if (currentWave % 5 === 0 && currentWave >= 5) {
      totalEnemiesForWave = Math.floor(totalEnemiesForWave * 0.7);
    }
    
    // Check if we've spawned enough enemies for this wave
    if (this.currentWaveEnemiesSpawned >= totalEnemiesForWave) {
      return false;
    }
    
    // Check spawn delay
    return timeSinceLastSpawn > this.config.waveSpawnDelay;
  }

  private createEnemy(canvasWidth: number, canvasHeight: number, enemyType: EnemyType = EnemyType.BASIC, waveNumber: number = 1): Enemy {
    // Always spawn from right side
    const x = canvasWidth + 20;
    const y = Math.random() * canvasHeight;
    
    // Get enemy type configuration
    const typeConfig = this.getEnemyTypeConfig(enemyType);
    
    // Apply wave scaling to base stats
    const scaledHealth = Math.floor(typeConfig.health * Math.pow(1.15, waveNumber - 1));
    const scaledSpeed = typeConfig.speed * Math.pow(1.05, waveNumber - 1);
    
    return {
      x,
      y,
      vx: 0,
      vy: 0,
      type: enemyType,
      size: typeConfig.size,
      color: typeConfig.color,
      speed: scaledSpeed + Math.random() * this.config.speedVariation,
      health: scaledHealth,
      maxHealth: scaledHealth,
      experienceValue: typeConfig.experienceValue,
      waveNumber
    };
  }

  private getEnemyTypeConfig(enemyType: EnemyType) {
    switch (enemyType) {
      case EnemyType.BASIC:
        return this.config.basic;
      case EnemyType.ELITE:
        return this.config.elite;
      case EnemyType.BOSS:
        return this.config.boss;
      default:
        return this.config.basic;
    }
  }

  private updateEnemyWithScaling(enemy: Enemy, base: any, player: any, currentWave: number): Enemy {
    // Apply different AI behaviors based on enemy type
    const updatedEnemy = this.updateEnemyMovement(enemy, base, player);
    
    // Apply any wave-specific modifications if needed
    return updatedEnemy;
  }

  private updateEnemyMovement(enemy: Enemy, base: any, player: any): Enemy {
    let targetX: number, targetY: number;
    
    // Different AI behaviors based on enemy type
    switch (enemy.type) {
      case EnemyType.BASIC:
        // Basic enemies target the base directly
        targetX = base.x;
        targetY = base.y;
        break;
        
      case EnemyType.ELITE:
        // Elite enemies prefer to target the player if close, otherwise base
        const playerDistance = Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2);
        if (playerDistance < 60) { // Larger detection range than basic
          targetX = player.x;
          targetY = player.y;
        } else {
          targetX = base.x;
          targetY = base.y;
        }
        break;
        
      case EnemyType.BOSS:
        // Boss enemies always target the player first
        const bossPlayerDistance = Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2);
        if (bossPlayerDistance < 120) { // Very large detection range
          targetX = player.x;
          targetY = player.y;
        } else {
          targetX = base.x;
          targetY = base.y;
        }
        break;
        
      default:
        targetX = base.x;
        targetY = base.y;
    }
    
    const dx = targetX - enemy.x;
    const dy = targetY - enemy.y;
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
    // Reset enemy tracking for new wave
    this.currentWaveEnemiesSpawned = 0;
    this.currentWaveEnemiesAlive = 0;
    this.lastSpawnTime = 0; // Reset to allow immediate spawning when combat starts
    
    this.events.push({
      type: 'ENEMY_WAVE_RESET',
      data: { enemiesSpawned: 0, enemiesAlive: 0 },
      timestamp: Date.now()
    });
  }

  isWaveReadyToStart(): boolean {
    return this.currentWaveEnemiesAlive === 0;
  }

  isWaveInProgress(): boolean {
    return this.currentWaveEnemiesAlive > 0;
  }

  getCurrentWaveStatus(): { enemiesSpawned: number; enemiesAlive: number; waveSize: number } {
    return {
      enemiesSpawned: this.currentWaveEnemiesSpawned,
      enemiesAlive: this.currentWaveEnemiesAlive,
      waveSize: this.config.waveSize
    };
  }

  private selectEnemyType(waveNumber: number): EnemyType {
    // Boss waves (every 5th wave starting from wave 5)
    if (waveNumber % 5 === 0 && waveNumber >= 5) {
      return EnemyType.BOSS;
    }
    
    // Elite enemies start appearing from wave 3
    if (waveNumber >= 3) {
      // 25% chance for elite on eligible waves
      if (Math.random() < this.config.elite.spawnChance) {
        return EnemyType.ELITE;
      }
    }
    
    // Default to basic enemy
    return EnemyType.BASIC;
  }

  reset(): void {
    this.lastSpawnTime = 0;
    this.currentWaveEnemiesSpawned = 0;
    this.currentWaveEnemiesAlive = 0;
    this.clearEvents();
  }
}