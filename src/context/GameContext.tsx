import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GameAction, Player } from '../types/game';

const initialPlayer: Player = {
  x: 600,
  y: 400,
  vx: 0,
  vy: 0,
  size: 8,
  color: '#00ffff',
  health: 3,
  maxHealth: 3,
  level: 1,
  experience: 0,
  experienceToNext: 10,
  speed: 4,
  resources: 0,
  energyCrystals: 0,
  quantumCores: 0,
  essenceFragments: 0
};

const initialBase = {
  x: 100,
  y: 400,
  size: 40,
  color: '#ffffff',
  health: 100,
  maxHealth: 100,
  repairRate: 2,
  lastDamageTime: 0
};

const initialState: GameState = {
  player: initialPlayer,
  enemies: [],
  bullets: [],
  particles: [],
  resources: [],
  base: initialBase,
  gameRunning: true,
  gameOver: false,
  levelUp: false,
  canvasWidth: 1200,
  canvasHeight: 800
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_PLAYER':
      return { ...state, player: { ...state.player, ...action.payload } };
    
    case 'ADD_BULLET':
      return { ...state, bullets: [...state.bullets, action.payload] };
    
    case 'ADD_ENEMY':
      return { ...state, enemies: [...state.enemies, action.payload] };
    
    case 'ADD_PARTICLE':
      return { ...state, particles: [...state.particles, action.payload] };
    
    case 'UPDATE_BULLETS':
      return { ...state, bullets: action.payload };
    
    case 'UPDATE_ENEMIES':
      return { ...state, enemies: action.payload };
    
    case 'UPDATE_PARTICLES':
      return { ...state, particles: action.payload };
    
    case 'ADD_RESOURCE':
      return { ...state, resources: [...state.resources, action.payload] };
    
    case 'UPDATE_RESOURCES':
      return { ...state, resources: action.payload };
    
    case 'SET_GAME_RUNNING':
      return { ...state, gameRunning: action.payload };
    
    case 'SET_GAME_OVER':
      return { ...state, gameOver: action.payload, gameRunning: false };
    
    case 'SET_LEVEL_UP':
      return { ...state, levelUp: action.payload };
    
    case 'RESET_GAME':
      return { ...initialState, gameRunning: true, gameOver: false, levelUp: false };
    
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};