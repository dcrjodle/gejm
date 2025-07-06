import React from 'react';
import { useKeyboard } from '../hooks/useKeyboard';
import { useGameLoop } from '../hooks/useGameLoop';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import GameOverlay from './GameOverlay';
import styles from '../styles/Game.module.scss';

const Game: React.FC = () => {
  const keysRef = useKeyboard();
  useGameLoop(keysRef);

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameWrapper}>
        <GameCanvas className={styles.gameCanvas} />
        <GameUI />
        <GameOverlay />
      </div>
    </div>
  );
};

export default Game;