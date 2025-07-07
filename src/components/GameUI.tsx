import React from "react";
import { useGameContext } from "../context/GameContext";
import styles from "../styles/GameUI.module.scss";

interface GameUIProps {
  configService?: any;
  gameEngine?: any;
}

const GameUI: React.FC<GameUIProps> = ({ gameEngine }) => {
  const { state } = useGameContext();

  // Wave information
  const currentWave = gameEngine?.getCurrentWave() || 1;
  const wavePhase = gameEngine?.getWavePhase() || 'preparation';
  const timeRemaining = gameEngine?.getWaveTimeRemaining() || 0;
  
  const handleNextWave = () => {
    if (gameEngine) {
      gameEngine.startNextWave();
    }
  };

  // Allow skipping during preparation and upgrade intermission phases
  const canSkipWave = wavePhase === 'preparation' || wavePhase === 'upgrade_intermission';
  
  // Dev options for spawning enemies
  const spawnBasicEnemy = () => {
    if (gameEngine) {
      gameEngine.spawnDevEnemy('basic');
    }
  };
  
  const spawnEliteEnemy = () => {
    if (gameEngine) {
      gameEngine.spawnDevEnemy('elite');
    }
  };
  
  const spawnBossEnemy = () => {
    if (gameEngine) {
      gameEngine.spawnDevEnemy('boss');
    }
  };
  const currentAmmo = gameEngine?.getCurrentAmmo() || 0;
  const maxAmmo = gameEngine?.getMaxAmmo() || 0;
  const baseState = gameEngine?.getGameState().base || null;
  
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className={styles.gameUI}>
      {/* Wave Counter at the top */}
      <div className={styles.waveCounter}>
        <div className={styles.waveNumber}>
          <span className={styles.icon}>🌊</span>
          <span className={styles.waveText}>Wave {currentWave}</span>
        </div>
        <div className={styles.wavePhase}>
          <span className={styles.phaseText}>{wavePhase.replace('_', ' ')}</span>
          <span className={styles.timeRemaining}>{formatTime(timeRemaining)}</span>
        </div>
      </div>
      
      {/* Dev Options and Next Wave Button in top right */}
      <div className={styles.devPanel}>
        {canSkipWave && (
          <button
            className={styles.nextWaveButton}
            onClick={handleNextWave}
          >
            {wavePhase === 'preparation' ? 'Start Combat' : 'Next Wave'}
          </button>
        )}
        
        <div className={styles.enemySpawnButtons}>
          <span className={styles.devLabel}>Dev Spawn:</span>
          <button className={styles.devButton} onClick={spawnBasicEnemy}>
            Basic
          </button>
          <button className={styles.devButton} onClick={spawnEliteEnemy}>
            Elite
          </button>
          <button className={styles.devButton} onClick={spawnBossEnemy}>
            Boss
          </button>
        </div>
      </div>
      
      <div className={styles.statsPanel}>
        <div className={styles.stat}>
          <span className={styles.icon}>⭐</span>
          <span className={styles.value}>{state.player.level}</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.icon}>❤️</span>
          <div className={styles.healthBar}>
            {Array.from({ length: state.player.maxHealth }, (_, i) => (
              <div
                key={i}
                className={`${styles.healthPoint} ${
                  i < state.player.health ? styles.active : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div className={styles.stat}>
          <span className={styles.icon}>✨</span>
          <div className={styles.xpBar}>
            <div
              className={styles.xpFill}
              style={{
                width: `${
                  (state.player.experience / state.player.experienceToNext) *
                  100
                }%`,
              }}
            />
            <span className={styles.xpText}>
              {state.player.experience}/{state.player.experienceToNext}
            </span>
          </div>
        </div>

        <div className={styles.stat}>
          <span className={styles.icon}>💎</span>
          <span className={styles.value}>
            {state.player.energyCrystals || 0}
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.icon}>🔮</span>
          <span className={styles.value}>
            {state.player.quantumCores || 0}
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.icon}>💫</span>
          <span className={styles.value}>
            {state.player.essenceFragments || 0}
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.icon}>🔫</span>
          <div className={styles.ammoBar}>
            <div
              className={styles.ammoFill}
              style={{
                width: `${(currentAmmo / maxAmmo) * 100}%`,
              }}
            />
            <span className={styles.ammoText}>
              {currentAmmo}/{maxAmmo}
            </span>
          </div>
        </div>

        <div className={styles.stat}>
          <span className={styles.icon}>🏠</span>
          <div className={styles.baseStatus}>
            {/* Base Health */}
            <div className={styles.healthBar}>
              {baseState &&
                Array.from(
                  { length: Math.ceil(baseState.maxHealth / 10) },
                  (_, i) => (
                    <div
                      key={i}
                      className={`${styles.healthPoint} ${
                        (i + 1) * 10 <= baseState.health ? styles.active : ""
                      }`}
                    />
                  )
                )}
            </div>
            {/* Base Shield */}
            {baseState && baseState.maxShield > 0 && (
              <div className={styles.shieldBar}>
                {Array.from(
                  { length: Math.ceil(baseState.maxShield / 10) },
                  (_, i) => (
                    <div
                      key={i}
                      className={`${styles.shieldPoint} ${
                        (i + 1) * 10 <= baseState.shield ? styles.active : ""
                      }`}
                    />
                  )
                )}
              </div>
            )}
            {/* Base Upgrades Indicator */}
            {baseState && (baseState.upgradeLevels.armor > 0 || baseState.upgradeLevels.turrets > 0) && (
              <div className={styles.upgradeIndicators}>
                {baseState.upgradeLevels.armor > 0 && (
                  <span className={styles.upgradeIcon} title={`Armor Level ${baseState.upgradeLevels.armor}`}>
                    🛡️{baseState.upgradeLevels.armor}
                  </span>
                )}
                {baseState.upgradeLevels.turrets > 0 && (
                  <span className={styles.upgradeIcon} title={`Turrets Level ${baseState.upgradeLevels.turrets}`}>
                    🔫{baseState.upgradeLevels.turrets}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Move</span>
          <span className={styles.controlKeys}>WASD</span>
        </div>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Shoot</span>
          <span className={styles.controlKeys}>SPACE / CLICK</span>
        </div>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Upgrades</span>
          <span className={styles.controlKeys}>U</span>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
