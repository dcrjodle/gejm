import { GameObject } from './common';
import { BuildingCost, BuildingType } from '../../config/buildingConfig';

export enum BuildingStatus {
  PLACING = 'placing',
  CONSTRUCTING = 'constructing',
  ACTIVE = 'active',
  POWERED = 'powered',
  UNPOWERED = 'unpowered',
  DAMAGED = 'damaged',
  DESTROYED = 'destroyed'
}

export interface Building extends GameObject {
  id: string; // Unique instance ID
  typeId: string; // Reference to BuildingType
  status: BuildingStatus;
  health: number;
  maxHealth: number;
  level: number;
  poweredBy?: string[]; // IDs of pylons powering this building
  connectedTo?: string[]; // IDs of buildings this pylon powers
  constructionTime?: number;
  constructionStartTime?: number;
  lastFireTime?: number;
  effects?: {
    damage?: number;
    range?: number;
    fireRate?: number;
    shieldStrength?: number;
    resourceBonus?: number;
  };
}

export interface PowerConnection {
  pylonId: string;
  buildingId: string;
  distance: number;
}

export interface PlacementPreview {
  typeId: string;
  x: number;
  y: number;
  valid: boolean;
  conflicts: string[]; // Reasons why placement is invalid
}

export interface BuildingGameState {
  buildings: Building[];
  powerConnections: PowerConnection[];
  placementPreview?: PlacementPreview;
  selectedBuildingType?: string;
  placementMode: boolean;
}

export interface PlayerStats {
  [statId: string]: {
    level: number;
    value: number;
  };
}

// Extended game state to include buildings
export interface GameStateWithBuildings {
  buildings: Building[];
  powerConnections: PowerConnection[];
  placementPreview?: PlacementPreview;
  selectedBuildingType?: string;
  placementMode: boolean;
  playerStats: PlayerStats;
}

// Events for building system
export interface BuildingEvent {
  type: 'BUILDING_PLACED' | 'BUILDING_UPGRADED' | 'BUILDING_DESTROYED' | 'BUILDING_POWERED' | 'BUILDING_UNPOWERED' | 'PLACEMENT_MODE_STARTED' | 'PLACEMENT_MODE_CANCELLED';
  buildingId?: string;
  buildingType?: string;
  position?: { x: number; y: number };
  timestamp: number;
}