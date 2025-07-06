import React from 'react';
import { useGameContext } from '../context/GameContext';
import styles from '../styles/GameOverlay.module.scss';

const GameOverlay: React.FC = () => {
  const { state, dispatch } = useGameContext();

  const handleRestart = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  if (state.gameOver) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <h2 className={styles.title}>GAME OVER</h2>
          <div className={styles.stats}>
            <div className={styles.finalStat}>
              <span>Final Level: </span>
              <span className={styles.statValue}>{state.player.level}</span>
            </div>
            <div className={styles.finalStat}>
              <span>Experience: </span>
              <span className={styles.statValue}>{state.player.experience}</span>
            </div>
          </div>
          <button className={styles.restartButton} onClick={handleRestart}>
            RESTART
          </button>
        </div>
      </div>
    );
  }

  if (state.levelUp) {
    return (
      <div className={styles.levelUpOverlay}>
        <div className={styles.levelUpText}>
          LEVEL UP!
          <div className={styles.levelNumber}>{state.player.level}</div>
        </div>
      </div>
    );
  }

  return null;
};

export default GameOverlay;