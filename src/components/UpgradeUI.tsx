import React, { useState } from "react";
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
  const [upgradeMode, setUpgradeMode] = useState<'buildings' | 'player'>('buildings');

  if (!manualOpen || !gameEngine) return null;

  const player = gameEngine.getGameState().player;
  const playerStats = gameEngine.getGameState().playerStats;
  const buildingConfig = gameEngine.getBuildingConfig();
  
  // Get available buildings for current level
  const availableBuildings = buildingConfig.levelRestrictions[player.level] || [];
  
  const handleBuildingPurchase = (buildingTypeId: string) => {
    const result = gameEngine.startBuildingPlacement(buildingTypeId);
    if (result.success) {
      // Close the upgrade UI when entering placement mode
      if (onClose) onClose();
    } else {
      console.log(result.message);
    }
  };

  const handlePlayerStatUpgrade = (statId: string) => {
    const result = gameEngine.upgradePlayerStat(statId);
    if (!result.success) {
      console.log(result.message);
    }
  };

  const canAffordBuilding = (cost: any) => {
    return player.energyCrystals >= cost.energyCrystals &&
           player.quantumCores >= cost.quantumCores &&
           player.essenceFragments >= cost.essenceFragments;
  };

  const canAffordStat = (statId: string) => {
    const currentLevel = playerStats[statId]?.level || 0;
    const statConfig = buildingConfig.playerStats[statId];
    if (!statConfig || currentLevel >= statConfig.maxLevel) return false;
    
    const cost = statConfig.costPerLevel;
    return player.energyCrystals >= cost.energyCrystals &&
           player.quantumCores >= cost.quantumCores &&
           player.essenceFragments >= cost.essenceFragments;
  };

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
            className={`${styles.modeButton} ${upgradeMode === 'buildings' ? styles.active : ''}`}
            onClick={() => setUpgradeMode('buildings')}
          >
            🏗️ Buildings
          </button>
          <button 
            className={`${styles.modeButton} ${upgradeMode === 'player' ? styles.active : ''}`}
            onClick={() => setUpgradeMode('player')}
          >
            ⚡ Player Stats
          </button>
        </div>
        
        <h2 className={styles.title}>
          {upgradeMode === 'buildings' ? '🏗️ Buildings' : '⚡ Player Stats'}
        </h2>
        
        {upgradeMode === 'buildings' ? (
          <div className={styles.upgradeGrid}>
            {availableBuildings.map((buildingId: string) => {
              const building = buildingConfig.buildings[buildingId];
              if (!building) return null;

              return (
                <div key={buildingId} className={styles.upgradeCard}>
                  <div className={styles.upgradeHeader}>
                    <span className={styles.upgradeIcon}>{building.icon}</span>
                    <span className={styles.upgradeName}>{building.name}</span>
                    <span className={styles.upgradeLevel}>Lv.{building.requiredLevel}</span>
                  </div>
                  <div className={styles.upgradeDescription}>
                    {building.description}
                  </div>
                  <div className={styles.upgradeCost}>
                    <span className={`${styles.costItem} ${canAffordBuilding(building.cost) ? styles.affordable : ''}`}>
                      💎 {building.cost.energyCrystals}
                    </span>
                    {building.cost.quantumCores > 0 && (
                      <span className={`${styles.costItem} ${canAffordBuilding(building.cost) ? styles.affordable : ''}`}>
                        🔮 {building.cost.quantumCores}
                      </span>
                    )}
                    {building.cost.essenceFragments > 0 && (
                      <span className={`${styles.costItem} ${canAffordBuilding(building.cost) ? styles.affordable : ''}`}>
                        💫 {building.cost.essenceFragments}
                      </span>
                    )}
                  </div>
                  <button
                    className={`${styles.upgradeButton} ${!canAffordBuilding(building.cost) ? styles.disabled : ''}`}
                    onClick={() => handleBuildingPurchase(buildingId)}
                    disabled={!canAffordBuilding(building.cost)}
                  >
                    Build
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.playerStatsGrid}>
            {Object.entries(buildingConfig.playerStats).map(([statId, statConfig]: [string, any]) => {
              const currentStat = playerStats[statId];
              const currentLevel = currentStat?.level || 0;
              const currentValue = currentStat?.value || statConfig.baseValue;
              
              if (currentLevel >= statConfig.maxLevel) return null;

              const nextValue = statConfig.baseValue + ((currentLevel + 1) * statConfig.valuePerLevel);
              
              return (
                <div key={statId} className={styles.statCard}>
                  <div className={styles.upgradeHeader}>
                    <span className={styles.upgradeIcon}>{statConfig.icon}</span>
                    <span className={styles.upgradeName}>{statConfig.name}</span>
                    <span className={styles.upgradeLevel}>Lv.{currentLevel + 1}</span>
                  </div>
                  <div className={styles.statCategory}>
                    {statConfig.category.toUpperCase()}
                  </div>
                  <div className={styles.upgradeDescription}>
                    {statConfig.description}
                  </div>
                  <div className={styles.upgradeEffect}>
                    {currentValue.toFixed(1)} → {nextValue.toFixed(1)}
                  </div>
                  <div className={styles.upgradeCost}>
                    <span className={`${styles.costItem} ${canAffordStat(statId) ? styles.affordable : ''}`}>
                      💎 {statConfig.costPerLevel.energyCrystals}
                    </span>
                    {statConfig.costPerLevel.quantumCores > 0 && (
                      <span className={`${styles.costItem} ${canAffordStat(statId) ? styles.affordable : ''}`}>
                        🔮 {statConfig.costPerLevel.quantumCores}
                      </span>
                    )}
                    {statConfig.costPerLevel.essenceFragments > 0 && (
                      <span className={`${styles.costItem} ${canAffordStat(statId) ? styles.affordable : ''}`}>
                        💫 {statConfig.costPerLevel.essenceFragments}
                      </span>
                    )}
                  </div>
                  <button
                    className={`${styles.upgradeButton} ${!canAffordStat(statId) ? styles.disabled : ''}`}
                    onClick={() => handlePlayerStatUpgrade(statId)}
                    disabled={!canAffordStat(statId)}
                  >
                    Upgrade
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        <div className={styles.playerResources}>
          <h3>Your Resources:</h3>
          <div className={styles.resourceDisplay}>
            <span className={styles.resource}>💎 {player.energyCrystals}</span>
            <span className={styles.resource}>🔮 {player.quantumCores}</span>
            <span className={styles.resource}>💫 {player.essenceFragments}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeUI;