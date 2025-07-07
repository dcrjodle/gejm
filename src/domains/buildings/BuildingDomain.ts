import { Building, BuildingStatus, PowerConnection, PlacementPreview, PlayerStats, BuildingEvent } from '../../engine/types/buildings';
import { DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { BuildingConfig, BuildingType, defaultBuildingConfig } from '../../config/buildingConfig';

export class BuildingDomain implements DomainInterface<Building> {
  private config: BuildingConfig;
  private events: BuildingEvent[] = [];
  private nextBuildingId: number = 1;

  constructor(config: BuildingConfig = defaultBuildingConfig) {
    this.config = config;
  }

  update(buildings: Building[], deltaTime: number, gameState: any): DomainUpdate<Building> {
    const updatedBuildings = buildings.map(building => this.updateBuilding(building, deltaTime, gameState));
    
    // Update power connections
    this.updatePowerConnections(updatedBuildings, gameState.powerConnections || []);
    
    // Update power status after connections are established
    this.updateBuildingPowerStatus(updatedBuildings);
    
    // Handle turret firing
    this.handleTurretFiring(updatedBuildings, gameState);

    return { entities: updatedBuildings, events: this.events };
  }

  configure(config: Partial<BuildingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getEvents(): BuildingEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  // Building placement and management
  canPlaceBuilding(typeId: string, x: number, y: number, existingBuildings: Building[], playerLevel: number, canvasWidth: number, canvasHeight: number): { valid: boolean; conflicts: string[] } {
    const conflicts: string[] = [];
    const buildingType = this.config.buildings[typeId];

    if (!buildingType) {
      conflicts.push('Invalid building type');
      return { valid: false, conflicts };
    }

    // Check level requirement
    if (playerLevel < buildingType.requiredLevel) {
      conflicts.push(`Requires level ${buildingType.requiredLevel}`);
    }

    // Check if building is available at this level
    const availableBuildings = this.config.levelRestrictions[playerLevel] || [];
    if (!availableBuildings.includes(typeId)) {
      conflicts.push('Building not available at this level');
    }

    // Check canvas bounds
    const halfSize = buildingType.size / 2;
    if (x - halfSize < 0 || x + halfSize > canvasWidth || y - halfSize < 0 || y + halfSize > canvasHeight) {
      conflicts.push('Outside playable area');
    }

    // Check collision with existing buildings
    for (const building of existingBuildings) {
      const distance = Math.sqrt((x - building.x) ** 2 + (y - building.y) ** 2);
      const minDistance = (buildingType.size + building.size) / 2 + 5; // 5 pixel buffer
      if (distance < minDistance) {
        conflicts.push('Too close to existing building');
        break;
      }
    }

    // Check max count limit
    if (buildingType.maxCount) {
      const existingCount = existingBuildings.filter(b => b.typeId === typeId).length;
      if (existingCount >= buildingType.maxCount) {
        conflicts.push(`Maximum ${buildingType.maxCount} allowed`);
      }
    }

    return { valid: conflicts.length === 0, conflicts };
  }

  createPlacementPreview(typeId: string, x: number, y: number, existingBuildings: Building[], playerLevel: number, canvasWidth: number, canvasHeight: number): PlacementPreview {
    const validation = this.canPlaceBuilding(typeId, x, y, existingBuildings, playerLevel, canvasWidth, canvasHeight);
    
    return {
      typeId,
      x,
      y,
      valid: validation.valid,
      conflicts: validation.conflicts
    };
  }

  placeBuilding(typeId: string, x: number, y: number, existingBuildings: Building[], playerLevel: number, canvasWidth: number, canvasHeight: number): { success: boolean; building?: Building; message: string } {
    const validation = this.canPlaceBuilding(typeId, x, y, existingBuildings, playerLevel, canvasWidth, canvasHeight);
    
    if (!validation.valid) {
      return { success: false, message: validation.conflicts.join(', ') };
    }

    const buildingType = this.config.buildings[typeId];
    const building: Building = {
      id: `building_${this.nextBuildingId++}`,
      typeId,
      x,
      y,
      size: buildingType.size,
      color: buildingType.color,
      status: BuildingStatus.CONSTRUCTING,
      health: buildingType.health,
      maxHealth: buildingType.health,
      level: 1,
      constructionTime: 2000, // 2 seconds construction time
      constructionStartTime: Date.now(),
      effects: { ...buildingType.effects }
    };

    this.events.push({
      type: 'BUILDING_PLACED',
      buildingId: building.id,
      buildingType: typeId,
      position: { x, y },
      timestamp: Date.now()
    });

    return { success: true, building, message: 'Building placed successfully' };
  }

  private updateBuilding(building: Building, deltaTime: number, gameState: any): Building {
    let updatedBuilding = { ...building };

    // Handle construction
    if (building.status === BuildingStatus.CONSTRUCTING && building.constructionStartTime && building.constructionTime) {
      const elapsed = Date.now() - building.constructionStartTime;
      if (elapsed >= building.constructionTime) {
        updatedBuilding.status = BuildingStatus.ACTIVE;
        updatedBuilding.constructionStartTime = undefined;
        updatedBuilding.constructionTime = undefined;
      }
    }

    // Power status will be updated after power connections are established

    return updatedBuilding;
  }

  private updatePowerConnections(buildings: Building[], powerConnections: PowerConnection[]): void {
    // Reset all power connections
    buildings.forEach(building => {
      building.poweredBy = [];
      building.connectedTo = [];
    });

    // Find all pylons
    const pylons = buildings.filter(b => this.config.buildings[b.typeId]?.powerGeneration && b.status !== BuildingStatus.DESTROYED);
    const powerConsumers = buildings.filter(b => this.config.buildings[b.typeId]?.requiresPower && b.status !== BuildingStatus.DESTROYED);
    

    // For each pylon, find nearby buildings to power
    pylons.forEach(pylon => {
      const pylonType = this.config.buildings[pylon.typeId];
      const maxConnections = pylonType.maxConnections || 0;
      let connections = 0;

      // Sort consumers by distance to pylon
      const sortedConsumers = powerConsumers
        .map(consumer => ({
          building: consumer,
          distance: Math.sqrt((pylon.x - consumer.x) ** 2 + (pylon.y - consumer.y) ** 2)
        }))
        .filter(item => item.distance <= 100) // 100 pixel power range
        .sort((a, b) => a.distance - b.distance);

      // Connect to closest buildings up to max connections
      for (const item of sortedConsumers) {
        if (connections >= maxConnections) break;
        
        const consumer = item.building;
        if (!consumer.poweredBy) consumer.poweredBy = [];
        if (!pylon.connectedTo) pylon.connectedTo = [];

        consumer.poweredBy.push(pylon.id);
        pylon.connectedTo.push(consumer.id);
        connections++;
      }
    });
  }

  private updateBuildingPowerStatus(buildings: Building[]): void {
    buildings.forEach(building => {
      if (building.status === BuildingStatus.ACTIVE) {
        const buildingType = this.config.buildings[building.typeId];
        if (buildingType.requiresPower) {
          const isPowered = building.poweredBy && building.poweredBy.length > 0;
          building.status = isPowered ? BuildingStatus.POWERED : BuildingStatus.UNPOWERED;
        } else {
          building.status = BuildingStatus.POWERED; // Non-power buildings are always "powered"
        }
      }
    });
  }

  private handleTurretFiring(buildings: Building[], gameState: any): void {
    const turrets = buildings.filter(b => 
      b.typeId === 'turret' && 
      b.status === BuildingStatus.POWERED &&
      b.effects?.range && 
      b.effects?.damage
    );

    for (const turret of turrets) {
      const now = Date.now();
      const fireRate = turret.effects?.fireRate || 1000;
      
      if (!turret.lastFireTime || now - turret.lastFireTime >= fireRate) {
        // Find closest enemy in range
        const enemies = gameState.enemies || [];
        let closestEnemy = null;
        let closestDistance = Infinity;

        for (const enemy of enemies) {
          const distance = Math.sqrt((turret.x - enemy.x) ** 2 + (turret.y - enemy.y) ** 2);
          if (distance <= (turret.effects?.range || 0) && distance < closestDistance) {
            closestEnemy = enemy;
            closestDistance = distance;
          }
        }

        if (closestEnemy) {
          // Create bullet from turret to enemy
          const dx = closestEnemy.x - turret.x;
          const dy = closestEnemy.y - turret.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const speed = 6;

          const bullet = {
            x: turret.x,
            y: turret.y,
            vx: (dx / distance) * speed,
            vy: (dy / distance) * speed,
            size: 3,
            color: '#ffff00',
            damage: turret.effects?.damage || 1
          };

          // Add bullet to game state via events
          this.events.push({
            type: 'TURRET_FIRED',
            buildingId: turret.id,
            timestamp: now,
            data: { bullet }
          } as BuildingEvent);

          turret.lastFireTime = now;
        }
      }
    }
  }

  // Player stats management
  getPlayerStatValue(statId: string, level: number): number {
    const statConfig = this.config.playerStats[statId];
    if (!statConfig) return 0;
    
    return statConfig.baseValue + (level * statConfig.valuePerLevel);
  }

  canUpgradePlayerStat(statId: string, currentLevel: number, resources: { energyCrystals: number; quantumCores: number; essenceFragments: number }): { canUpgrade: boolean; cost?: any; message: string } {
    const statConfig = this.config.playerStats[statId];
    if (!statConfig) {
      return { canUpgrade: false, message: 'Invalid stat' };
    }

    if (currentLevel >= statConfig.maxLevel) {
      return { canUpgrade: false, message: 'Maximum level reached' };
    }

    const cost = statConfig.costPerLevel;
    const canAfford = resources.energyCrystals >= cost.energyCrystals &&
                      resources.quantumCores >= cost.quantumCores &&
                      resources.essenceFragments >= cost.essenceFragments;

    if (!canAfford) {
      return { canUpgrade: false, cost, message: 'Insufficient resources' };
    }

    return { canUpgrade: true, cost, message: 'Ready to upgrade' };
  }

  getBuildingConfig(): BuildingConfig {
    return this.config;
  }
}