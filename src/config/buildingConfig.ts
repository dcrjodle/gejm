export interface BuildingCost {
  energyCrystals: number;
  quantumCores: number;
  essenceFragments: number;
}

export interface BuildingType {
  id: string;
  name: string;
  description: string;
  icon: string;
  size: number;
  color: string;
  cost: BuildingCost;
  requiredLevel: number;
  maxCount?: number; // Optional limit on how many can be built
  requiresPower: boolean;
  powerConsumption: number; // How much power this building consumes
  powerGeneration?: number; // How much power this building generates (for pylons)
  maxConnections?: number; // For pylons, how many buildings they can power
  health: number;
  effects?: {
    // Building-specific effects
    damage?: number;
    range?: number;
    fireRate?: number;
    shieldStrength?: number;
    resourceBonus?: number;
  };
}

export interface PlayerStatConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseValue: number;
  costPerLevel: BuildingCost;
  maxLevel: number;
  valuePerLevel: number;
  category: 'combat' | 'survival' | 'utility';
}

export interface BuildingConfig {
  buildings: Record<string, BuildingType>;
  playerStats: Record<string, PlayerStatConfig>;
  levelRestrictions: Record<number, string[]>; // level -> available building IDs
}

export const defaultBuildingConfig: BuildingConfig = {
  buildings: {
    pylon: {
      id: 'pylon',
      name: 'Power Pylon',
      description: 'Generates power for other buildings. Can power up to 2 buildings.',
      icon: '⚡',
      size: 12,
      color: '#ffff00',
      cost: {
        energyCrystals: 25,
        quantumCores: 0,
        essenceFragments: 0
      },
      requiredLevel: 1,
      requiresPower: false,
      powerConsumption: 0,
      powerGeneration: 2,
      maxConnections: 2,
      health: 50
    },
    turret: {
      id: 'turret',
      name: 'Auto Turret',
      description: 'Automated defense turret that shoots at nearby enemies.',
      icon: '🔫',
      size: 16,
      color: '#00ff00',
      cost: {
        energyCrystals: 75,
        quantumCores: 1,
        essenceFragments: 0
      },
      requiredLevel: 2,
      requiresPower: true,
      powerConsumption: 1,
      health: 75,
      effects: {
        damage: 2,
        range: 100,
        fireRate: 500
      }
    },
    shield: {
      id: 'shield',
      name: 'Shield Generator',
      description: 'Provides energy shields to nearby buildings and the base.',
      icon: '🛡️',
      size: 18,
      color: '#0088ff',
      cost: {
        energyCrystals: 100,
        quantumCores: 2,
        essenceFragments: 0
      },
      requiredLevel: 3,
      requiresPower: true,
      powerConsumption: 1,
      health: 60,
      effects: {
        shieldStrength: 100,
        range: 80
      }
    }
  },
  playerStats: {
    health: {
      id: 'health',
      name: 'Vitality',
      description: 'Increases maximum health points',
      icon: '❤️',
      baseValue: 3,
      costPerLevel: { energyCrystals: 30, quantumCores: 0, essenceFragments: 0 },
      maxLevel: 10,
      valuePerLevel: 1,
      category: 'survival'
    },
    speed: {
      id: 'speed',
      name: 'Agility',
      description: 'Increases movement speed',
      icon: '💨',
      baseValue: 2.5,
      costPerLevel: { energyCrystals: 25, quantumCores: 0, essenceFragments: 0 },
      maxLevel: 8,
      valuePerLevel: 0.3,
      category: 'utility'
    },
    damage: {
      id: 'damage',
      name: 'Firepower',
      description: 'Increases bullet damage',
      icon: '⚔️',
      baseValue: 1,
      costPerLevel: { energyCrystals: 40, quantumCores: 1, essenceFragments: 0 },
      maxLevel: 6,
      valuePerLevel: 1,
      category: 'combat'
    },
    fireRate: {
      id: 'fireRate',
      name: 'Rate of Fire',
      description: 'Decreases time between shots',
      icon: '🔥',
      baseValue: 300,
      costPerLevel: { energyCrystals: 35, quantumCores: 0, essenceFragments: 0 },
      maxLevel: 5,
      valuePerLevel: -40, // Negative because lower is better for fire rate
      category: 'combat'
    },
    luck: {
      id: 'luck',
      name: 'Fortune',
      description: 'Increases resource drop rates',
      icon: '🍀',
      baseValue: 0,
      costPerLevel: { energyCrystals: 50, quantumCores: 1, essenceFragments: 0 },
      maxLevel: 5,
      valuePerLevel: 0.15, // 15% bonus per level
      category: 'utility'
    },
    armor: {
      id: 'armor',
      name: 'Resilience',
      description: 'Reduces damage taken',
      icon: '🛡️',
      baseValue: 0,
      costPerLevel: { energyCrystals: 60, quantumCores: 2, essenceFragments: 0 },
      maxLevel: 4,
      valuePerLevel: 0.1, // 10% damage reduction per level
      category: 'survival'
    }
  },
  levelRestrictions: {
    1: ['pylon'],
    2: ['pylon', 'turret'],
    3: ['pylon', 'turret', 'shield'],
    4: ['pylon', 'turret', 'shield'],
    5: ['pylon', 'turret', 'shield']
  }
};