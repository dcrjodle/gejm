import React from 'react';
import { useGameContext } from '../context/GameContext';
import styles from '../styles/GameUI.module.scss';

const GameUI: React.FC = () => {
  const { state } = useGameContext();

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
      </div>

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