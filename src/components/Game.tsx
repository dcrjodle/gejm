import React from 'react';
import { useKeyboard } from '../hooks/useKeyboard';
import { useGameLoop } from '../hooks/useGameLoop';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import GameOverlay from './GameOverlay';
import styles from '../styles/Game.module.scss';

const Game: React.FC = () => {
  const keysRef = useKeyboard();
  const { gameEngine, configService } = useGameLoop(keysRef);

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameWrapper}>
        <GameCanvas 
          className={styles.gameCanvas} 
          gameEngine={gameEngine} 
        />
        <GameUI configService={configService} />
        <GameOverlay />
      </div>
    </div>
  );
};

export default Game;