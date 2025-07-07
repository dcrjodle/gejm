import React, { useState, useEffect } from "react";
import { useGameContext } from "../context/GameContext";
import styles from "../styles/UpgradeUI.module.scss";

interface UpgradeUIProps {
  gameEngine?: any;
  visible: boolean;
  manualOpen?: boolean;
  onClose?: () => void;
}

const UpgradeUI: React.FC<UpgradeUIProps> = ({ gameEngine, visible, manualOpen = false, onClose }) => {
  const { state } = useGameContext();
  const [upgradeMode, setUpgradeMode] = useState<'base' | 'player'>('base');
  const [showAfterDelay, setShowAfterDelay] = useState(false);

  // Handle 10-second delay for automatic showing during intermission
  useEffect(() => {
    if (visible && !manualOpen) {
      setShowAfterDelay(false);
      const timer = setTimeout(() => {
        setShowAfterDelay(true);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    } else if (manualOpen) {
      setShowAfterDelay(true);
    } else {
      setShowAfterDelay(false);
    }
  }, [visible, manualOpen]);

  if ((!showAfterDelay && !manualOpen) || !gameEngine) return null;

  const base = gameEngine.getGameState().base;
  const player = gameEngine.getGameState().player;
  const config = gameEngine.getConfig();
  
  const handleUpgrade = (upgradeType: string) => {
    if (upgradeMode === 'base') {
      const result = gameEngine.upgradeBase(upgradeType);
      if (!result.success) {
        console.log(result.message);
      }
    } else {
      const result = gameEngine.upgradePlayer(upgradeType);
      if (!result.success) {
        console.log(result.message);
      }
    }
  };

  const getUpgradeInfo = (upgradeType: string) => {
    if (upgradeMode === 'base') {
      const currentLevel = base.upgradeLevels[upgradeType];
      const upgradeConfig = config.base.upgrades[upgradeType];
      
      if (!upgradeConfig || currentLevel >= upgradeConfig.levels.length) {
        return null;
      }
      
      const cost = upgradeConfig.costs[currentLevel];
      const nextValue = upgradeConfig.levels[currentLevel];
      
      return { cost, nextValue, currentLevel };
    } else {
      const currentLevel = player.upgradeLevels[upgradeType];
      const upgradeConfig = config.player.upgrades[upgradeType];
      
      if (!upgradeConfig || currentLevel >= upgradeConfig.levels.length) {
        return null;
      }
      
      const cost = upgradeConfig.costs[currentLevel];
      const nextValue = upgradeConfig.levels[currentLevel];
      
      return { cost, nextValue, currentLevel };
    }
  };

  const canAfford = (cost: any) => {
    return state.player.energyCrystals >= cost.energyCrystals &&
           state.player.quantumCores >= cost.quantumCores &&
           state.player.essenceFragments >= cost.essenceFragments;
  };

  // Get upgrade info based on current mode
  let upgrades: any = {};
  if (upgradeMode === 'base') {
    upgrades = {
      health: getUpgradeInfo('health'),
      armor: getUpgradeInfo('armor'),
      turrets: getUpgradeInfo('turrets'),
      shield: getUpgradeInfo('shield')
    };
  } else {
    upgrades = {
      health: getUpgradeInfo('health'),
      speed: getUpgradeInfo('speed'),
      damage: getUpgradeInfo('damage'),
      fireRate: getUpgradeInfo('fireRate')
    };
  }

  return (
    <div className={styles.upgradeOverlay}>
      <div className={styles.upgradePanel}>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        )}
        <div className={styles.modeSelector}>
          <button 
            className={`${styles.modeButton} ${upgradeMode === 'base' ? styles.active : ''}`}
            onClick={() => setUpgradeMode('base')}
          >
            🏗️ Base Buildings
          </button>
          <button 
            className={`${styles.modeButton} ${upgradeMode === 'player' ? styles.active : ''}`}
            onClick={() => setUpgradeMode('player')}
          >
            ⚡ Player Stats
          </button>
        </div>
        
        <h2 className={styles.title}>
          {upgradeMode === 'base' ? '🏗️ Base Upgrades' : '⚡ Player Upgrades'}
        </h2>
        
        <div className={styles.upgradeGrid}>
          {Object.entries(upgrades).map(([upgradeType, upgradeInfo]: [string, any]) => {
            if (!upgradeInfo) return null;

            const getUpgradeIcon = (type: string) => {
              const icons = {
                health: '❤️',
                armor: '🛡️',
                turrets: '🔫',
                shield: '🔵',
                speed: '💨',
                damage: '⚔️',
                fireRate: '🔥'
              };
              return icons[type as keyof typeof icons] || '⭐';
            };

            const getUpgradeName = (type: string) => {
              const names = {
                health: upgradeMode === 'base' ? 'Max Health' : 'Player Health',
                armor: 'Armor',
                turrets: 'Auto-Turrets', 
                shield: 'Energy Shield',
                speed: 'Movement Speed',
                damage: 'Bullet Damage',
                fireRate: 'Fire Rate'
              };
              return names[type as keyof typeof names] || type;
            };

            const getCurrentValue = (type: string) => {
              if (upgradeMode === 'base') {
                switch (type) {
                  case 'health': return base.maxHealth;
                  case 'armor': return Math.round(base.armor * 100) + '%';
                  case 'turrets': return base.upgradeLevels.turrets;
                  case 'shield': return base.maxShield;
                  default: return 0;
                }
              } else {
                switch (type) {
                  case 'health': return player.maxHealth;
                  case 'speed': return player.speed.toFixed(1);
                  case 'damage': return player.damage;
                  case 'fireRate': return player.fireRate + 'ms';
                  default: return 0;
                }
              }
            };

            const getNextValue = (type: string) => {
              if (upgradeMode === 'base') {
                switch (type) {
                  case 'armor': return Math.round(upgradeInfo.nextValue * 100) + '%';
                  default: return upgradeInfo.nextValue;
                }
              } else {
                switch (type) {
                  case 'speed': return upgradeInfo.nextValue.toFixed(1);
                  case 'fireRate': return upgradeInfo.nextValue + 'ms';
                  default: return upgradeInfo.nextValue;
                }
              }
            };

            return (
              <div key={upgradeType} className={styles.upgradeCard}>
                <div className={styles.upgradeHeader}>
                  <span className={styles.upgradeIcon}>{getUpgradeIcon(upgradeType)}</span>
                  <span className={styles.upgradeName}>{getUpgradeName(upgradeType)}</span>
                  <span className={styles.upgradeLevel}>Lv.{upgradeInfo.currentLevel + 1}</span>
                </div>
                <div className={styles.upgradeEffect}>
                  {getCurrentValue(upgradeType)} → {getNextValue(upgradeType)}
                </div>
                <div className={styles.upgradeCost}>
                  <span className={styles.costItem}>
                    💎 {upgradeInfo.cost.energyCrystals}
                  </span>
                  {upgradeInfo.cost.quantumCores > 0 && (
                    <span className={styles.costItem}>
                      🔮 {upgradeInfo.cost.quantumCores}
                    </span>
                  )}
                  {upgradeInfo.cost.essenceFragments > 0 && (
                    <span className={styles.costItem}>
                      💫 {upgradeInfo.cost.essenceFragments}
                    </span>
                  )}
                </div>
                <button
                  className={`${styles.upgradeButton} ${!canAfford(upgradeInfo.cost) ? styles.disabled : ''}`}
                  onClick={() => handleUpgrade(upgradeType)}
                  disabled={!canAfford(upgradeInfo.cost)}
                >
                  Upgrade
                </button>
              </div>
            );
          })}
        </div>
        
        <div className={styles.playerResources}>
          <h3>Your Resources:</h3>
          <div className={styles.resourceDisplay}>
            <span className={styles.resource}>💎 {state.player.energyCrystals}</span>
            <span className={styles.resource}>🔮 {state.player.quantumCores}</span>
            <span className={styles.resource}>💫 {state.player.essenceFragments}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeUI;