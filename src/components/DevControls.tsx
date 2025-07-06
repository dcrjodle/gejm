import React, { useState } from 'react';
import styles from '../styles/DevControls.module.scss';

interface DevControlsProps {
  gameEngine?: any;
}

const DevControls: React.FC<DevControlsProps> = ({ gameEngine }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRefillHealth = () => {
    if (gameEngine) {
      // Direct access to game state for dev controls
      const currentState = gameEngine.getGameState();
      gameEngine.gameState.player = { 
        ...currentState.player, 
        health: currentState.player.maxHealth 
      };
    }
  };

  const handleRefillAmmo = () => {
    if (gameEngine) {
      gameEngine.refillAmmo();
    }
  };

  const handleAddResources = () => {
    if (gameEngine) {
      const currentState = gameEngine.getGameState();
      const updatedPlayer = { ...currentState.player, resources: currentState.player.resources + 100 };
      gameEngine.gameState.player = updatedPlayer;
    }
  };

  const handleSpawnWave = () => {
    if (gameEngine && gameEngine.isWaveReadyToStart()) {
      gameEngine.startNextWave();
    }
  };

  if (!gameEngine) return null;

  return (
    <div className={styles.devControls}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '⬆️' : '⬇️'} DEV
      </button>
      
      {isOpen && (
        <div className={styles.controlsPanel}>
          <h3>Developer Controls</h3>
          <div className={styles.buttonGroup}>
            <button onClick={handleRefillHealth}>
              ❤️ Refill Health
            </button>
            <button onClick={handleRefillAmmo}>
              🔫 Refill Ammo
            </button>
            <button onClick={handleAddResources}>
              💎 +100 Resources
            </button>
            <button onClick={handleSpawnWave}>
              👾 Spawn Wave
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevControls;