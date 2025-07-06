import React from 'react';
import styles from '../styles/PauseMenu.module.scss';

interface PauseMenuProps {
  isVisible: boolean;
  onResume: () => void;
  onRestart: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ isVisible, onResume, onRestart }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.pauseOverlay}>
      <div className={styles.pauseMenu}>
        <h1 className={styles.title}>GAME PAUSED</h1>
        
        <div className={styles.menuButtons}>
          <button 
            className={styles.menuButton}
            onClick={onResume}
          >
            RESUME
          </button>
          
          <button 
            className={styles.menuButton}
            onClick={onRestart}
          >
            RESTART
          </button>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.controlItem}>
            <span className={styles.key}>WASD</span>
            <span className={styles.action}>Move</span>
          </div>
          <div className={styles.controlItem}>
            <span className={styles.key}>SPACE / CLICK</span>
            <span className={styles.action}>Shoot</span>
          </div>
          <div className={styles.controlItem}>
            <span className={styles.key}>P / ESC</span>
            <span className={styles.action}>Pause</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;