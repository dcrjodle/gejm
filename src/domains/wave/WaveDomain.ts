import { DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { WaveConfig, WaveState, WavePhase } from './types';

export class WaveDomain implements DomainInterface<WaveState> {
  private config: WaveConfig;
  private events: GameEvent[] = [];
  private waveState: WaveState;

  constructor(config: WaveConfig) {
    this.config = config;
    this.waveState = this.createInitialWaveState();
  }

  update(entities: WaveState[], deltaTime: number, gameState: any): DomainUpdate<WaveState> {
    const currentTime = Date.now();
    const timeInPhase = currentTime - this.waveState.phaseStartTime;

    // Check if current phase should transition
    if (timeInPhase >= this.waveState.phaseDuration) {
      this.transitionToNextPhase();
    }

    // Update enemy counts from game state if provided
    if (gameState?.enemies) {
      this.waveState.enemiesAlive = gameState.enemies.length;
    }

    // Check if combat phase should end early (all enemies defeated)
    if (this.waveState.phase === WavePhase.COMBAT && 
        this.waveState.enemiesAlive === 0 && 
        this.waveState.enemiesSpawned >= this.waveState.totalEnemiesInWave) {
      this.transitionToNextPhase();
    }

    return { entities: [this.waveState], events: this.events };
  }

  configure(config: WaveConfig): void {
    this.config = { ...this.config, ...config };
  }

  getEvents(): GameEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  private createInitialWaveState(): WaveState {
    return {
      currentWave: 1,
      phase: WavePhase.PREPARATION,
      phaseStartTime: Date.now(),
      phaseDuration: this.config.preparationDuration,
      totalEnemiesInWave: this.calculateEnemiesForWave(1),
      enemiesSpawned: 0,
      enemiesAlive: 0,
      waveComplete: false,
      nextWaveReady: false
    };
  }

  private transitionToNextPhase(): void {
    const currentTime = Date.now();

    switch (this.waveState.phase) {
      case WavePhase.PREPARATION:
        // Preparation → Combat
        this.waveState.phase = WavePhase.COMBAT;
        this.waveState.phaseDuration = this.config.combatDuration;
        this.waveState.phaseStartTime = currentTime;
        
        this.events.push({
          type: 'WAVE_COMBAT_STARTED',
          data: { 
            wave: this.waveState.currentWave,
            totalEnemies: this.waveState.totalEnemiesInWave,
            isBossWave: this.isBossWave(),
            hasElites: this.hasEliteEnemies()
          },
          timestamp: currentTime
        });
        break;

      case WavePhase.COMBAT:
        // Combat → Next Wave Preparation
        this.waveState.currentWave++;
        this.waveState.phase = WavePhase.PREPARATION;
        this.waveState.phaseDuration = this.config.preparationDuration;
        this.waveState.phaseStartTime = currentTime;
        this.waveState.totalEnemiesInWave = this.calculateEnemiesForWave(this.waveState.currentWave);
        this.waveState.enemiesSpawned = 0;
        this.waveState.enemiesAlive = 0;
        this.waveState.waveComplete = true;
        this.waveState.nextWaveReady = false;
        
        this.events.push({
          type: 'WAVE_COMPLETED',
          data: { 
            wave: this.waveState.currentWave - 1,
            enemiesDefeated: this.waveState.enemiesSpawned 
          },
          timestamp: currentTime
        });
        
        this.events.push({
          type: 'WAVE_PREPARATION_STARTED',
          data: { 
            wave: this.waveState.currentWave,
            totalEnemies: this.waveState.totalEnemiesInWave
          },
          timestamp: currentTime
        });
        break;
    }
  }

  // Public methods for external control
  startNextWave(): void {
    if (this.waveState.phase === WavePhase.PREPARATION) {
      // Skip preparation phase and start combat immediately
      this.transitionToNextPhase();
    }
    // During combat phase, we don't allow skipping
  }

  isWaveReadyToStart(): boolean {
    return this.waveState.phase === WavePhase.PREPARATION;
  }

  getCurrentWaveInfo(): WaveState {
    return { ...this.waveState };
  }

  getPhase(): string {
    return this.waveState.phase;
  }

  getCurrentWaveNumber(): number {
    return this.waveState.currentWave;
  }

  getPhaseTimeRemaining(): number {
    const currentTime = Date.now();
    const timeInPhase = currentTime - this.waveState.phaseStartTime;
    return Math.max(0, this.waveState.phaseDuration - timeInPhase);
  }

  // Enemy spawning logic
  shouldSpawnEnemy(): boolean {
    return this.waveState.phase === WavePhase.COMBAT && 
           this.waveState.enemiesSpawned < this.waveState.totalEnemiesInWave;
  }

  onEnemySpawned(): void {
    this.waveState.enemiesSpawned++;
    this.waveState.enemiesAlive++;
  }

  onEnemyDestroyed(): void {
    this.waveState.enemiesAlive = Math.max(0, this.waveState.enemiesAlive - 1);
  }

  // Wave difficulty and type calculation
  isBossWave(): boolean {
    return this.config.bossWaves.includes(this.waveState.currentWave);
  }

  hasEliteEnemies(): boolean {
    return this.waveState.currentWave >= this.config.eliteWaveStart;
  }

  getEnemyHealthMultiplier(): number {
    return Math.pow(this.config.difficultyScaling.healthMultiplier, this.waveState.currentWave - 1);
  }

  getEnemySpeedMultiplier(): number {
    return Math.pow(this.config.difficultyScaling.speedMultiplier, this.waveState.currentWave - 1);
  }

  getSpawnRateMultiplier(): number {
    return Math.pow(this.config.difficultyScaling.spawnRateMultiplier, this.waveState.currentWave - 1);
  }

  private calculateEnemiesForWave(waveNumber: number): number {
    const baseEnemies = this.config.baseEnemiesPerWave;
    const additionalEnemies = (waveNumber - 1) * this.config.enemiesPerWaveIncrease;
    
    // Boss waves have fewer but stronger enemies
    if (this.config.bossWaves.includes(waveNumber)) {
      return Math.floor((baseEnemies + additionalEnemies) * 0.7); // 30% fewer enemies for boss waves
    }
    
    return baseEnemies + additionalEnemies;
  }

  reset(): void {
    this.waveState = this.createInitialWaveState();
    this.clearEvents();
  }
}