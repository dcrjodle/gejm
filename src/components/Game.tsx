import React, { useEffect, useReducer } from 'react';
import { useKeyboard } from '../hooks/useKeyboard';
import { useGameLoop } from '../hooks/useGameLoop';
import { useWindowSize } from '../hooks/useWindowSize';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import GameOverlay from './GameOverlay';
import CustomCursor from './CustomCursor';
import DevControls from './DevControls';
import PauseMenu from './PauseMenu';
import styles from '../styles/Game.module.scss';

const Game: React.FC = () => {
  const keysRef = useKeyboard();
  const { gameEngine, configService } = useGameLoop(keysRef);
  const windowSize = useWindowSize();
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  
  // Update canvas size when window size changes
  useEffect(() => {
    if (configService) {
      configService.adjustCanvasSize(windowSize.width, windowSize.height);
    }
  }, [windowSize.width, windowSize.height, configService]);

  const handleResumeGame = () => {
    if (gameEngine) {
      gameEngine.setPaused(false);
      // Force immediate re-render to hide pause menu
      forceUpdate();
      // Focus the canvas to ensure keyboard input works
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          canvas.focus();
        }
      }, 0);
    }
  };

  const handleRestartGame = () => {
    if (gameEngine) {
      gameEngine.resetGame();
      gameEngine.setPaused(false);
      // Force immediate re-render to update UI
      forceUpdate();
      // Focus the canvas to ensure keyboard input works
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          canvas.focus();
        }
      }, 0);
    }
  };

  const isPaused = gameEngine?.isPausedState() || false;

  return (
    <div className={styles.gameContainer}>
      <DevControls gameEngine={gameEngine} />
      <div className={styles.gameWrapper}>
        <GameCanvas 
          className={styles.gameCanvas} 
          gameEngine={gameEngine} 
        />
        <GameUI configService={configService} gameEngine={gameEngine} />
        <GameOverlay />
        <PauseMenu 
          isVisible={isPaused}
          onResume={handleResumeGame}
          onRestart={handleRestartGame}
        />
        <CustomCursor />
      </div>
    </div>
  );
};

export default Game;