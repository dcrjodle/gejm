import React from 'react';
import { useGameContext } from '../context/GameContext';
import styles from '../styles/GameUI.module.scss';

interface GameUIProps {
  configService?: any;
  gameEngine?: any;
}

const GameUI: React.FC<GameUIProps> = ({ configService, gameEngine }) => {
  const { state } = useGameContext();
  
  const handleNextWave = () => {
    if (gameEngine && gameEngine.isWaveReadyToStart()) {
      gameEngine.startNextWave();
    }
  };
  
  const waveStatus = gameEngine?.getCurrentWaveStatus() || { enemiesSpawned: 0, enemiesAlive: 0, waveSize: 0 };
  const isWaveReady = gameEngine?.isWaveReadyToStart() || false;
  const currentAmmo = gameEngine?.getCurrentAmmo() || 0;
  const maxAmmo = gameEngine?.getMaxAmmo() || 0;
  const isPaused = gameEngine?.isPausedState() || false;

  return (
    <div className={styles.gameUI}>
      <div className={styles.statsPanel}>
        <div className={styles.stat}>
          <span className={styles.label}>Level</span>
          <span className={styles.value}>{state.player.level}</span>
        </div>
        
        <div className={styles.stat}>
          <span className={styles.label}>Health</span>
          <div className={styles.healthBar}>
            {Array.from({ length: state.player.maxHealth }, (_, i) => (
              <div
                key={i}
                className={`${styles.healthPoint} ${
                  i < state.player.health ? styles.active : ''
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className={styles.stat}>
          <span className={styles.label}>XP</span>
          <div className={styles.xpBar}>
            <div 
              className={styles.xpFill}
              style={{ 
                width: `${(state.player.experience / state.player.experienceToNext) * 100}%` 
              }}
            />
            <span className={styles.xpText}>
              {state.player.experience}/{state.player.experienceToNext}
            </span>
          </div>
        </div>

        <div className={styles.stat}>
          <span className={styles.label}>Resources</span>
          <span className={styles.value}>{state.player.resources || 0}</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.label}>Ammo</span>
          <div className={styles.ammoBar}>
            <div 
              className={styles.ammoFill}
              style={{ 
                width: `${(currentAmmo / maxAmmo) * 100}%` 
              }}
            />
            <span className={styles.ammoText}>
              {currentAmmo}/{maxAmmo}
            </span>
          </div>
        </div>

        <div className={styles.stat}>
          <span className={styles.label}>Wave</span>
          <div className={styles.waveInfo}>
            <span className={styles.waveText}>
              {waveStatus.enemiesAlive}/{waveStatus.waveSize} enemies
            </span>
            {isWaveReady && (
              <button 
                className={styles.nextWaveButton}
                onClick={handleNextWave}
              >
                Next Wave
              </button>
            )}
          </div>
        </div>
      </div>

      {isPaused && (
        <div className={styles.pauseOverlay}>
          <div className={styles.pauseText}>PAUSED</div>
          <div className={styles.pauseSubtext}>Press P to resume</div>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Move</span>
          <span className={styles.controlKeys}>WASD</span>
        </div>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Shoot</span>
          <span className={styles.controlKeys}>SPACE</span>
        </div>
      </div>
    </div>
  );
};

export default GameUI;