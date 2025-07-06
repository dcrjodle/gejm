export enum WavePhase {
  PREPARATION = 'preparation',
  COMBAT = 'combat', 
  UPGRADE_INTERMISSION = 'upgrade_intermission'
}

export interface WaveState {
  currentWave: number;
  phase: WavePhase;
  phaseStartTime: number;
  phaseDuration: number;
  totalEnemiesInWave: number;
  enemiesSpawned: number;
  enemiesAlive: number;
  waveComplete: boolean;
  nextWaveReady: boolean;
}

export interface WaveConfig {
  preparationDuration: number; // 10 seconds
  combatDuration: number; // 60-120 seconds  
  intermissionDuration: number; // 30-60 seconds
  difficultyScaling: {
    healthMultiplier: number; // +15% per wave
    speedMultiplier: number; // +5% per wave
    spawnRateMultiplier: number; // +10% per wave
  };
  bossWaves: number[]; // [5, 10, 15, 20, ...]
  eliteWaveStart: number; // Wave 3
  baseEnemiesPerWave: number; // Starting number of enemies
  enemiesPerWaveIncrease: number; // Additional enemies per wave
}