import { useEffect, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { GameEngine } from '../engine/GameEngine';
import { ConfigService } from '../services/ConfigService';
import { defaultGameConfig } from '../config/defaultConfig';

export const useGameLoop = (keysRef: React.MutableRefObject<Record<string, boolean>>) => {
  const { state, dispatch } = useGameContext();
  const animationRef = useRef<number>();
  const engineRef = useRef<GameEngine>();
  const configServiceRef = useRef<ConfigService>();
  const stateRef = useRef(state);
  const lastTimeRef = useRef<number>(0);
  const lastPlayerHealthRef = useRef<number>(state.player.health);
  const mouseRef = useRef<{ x: number; y: number; clicked: boolean }>({ x: 0, y: 0, clicked: false });
  
  // Update state ref
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initialize engine and config service
  useEffect(() => {
    if (!engineRef.current) {
      configServiceRef.current = new ConfigService(defaultGameConfig);
      
      // Set initial canvas size to current window dimensions
      configServiceRef.current.adjustCanvasSize(window.innerWidth, window.innerHeight);
      
      engineRef.current = new GameEngine(configServiceRef.current.getConfig());
      
      // Subscribe to config changes
      configServiceRef.current.subscribe((newConfig) => {
        engineRef.current?.configure(newConfig);
      });
    }

    // Add mouse event listener
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      const currentState = stateRef.current;
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Check if game was reset (player health went from 0 to positive)
      if (engineRef.current && 
          lastPlayerHealthRef.current <= 0 && 
          currentState.player.health > 0 && 
          !currentState.gameOver) {
        engineRef.current.resetGame();
        lastPlayerHealthRef.current = currentState.player.health;
      }

      if (!currentState.gameRunning || !engineRef.current) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Convert keys to simple object for engine
      const keysPressed: Record<string, boolean> = {};
      Object.keys(keysRef.current).forEach(key => {
        keysPressed[key] = keysRef.current[key];
      });

      // Update engine
      engineRef.current.update(deltaTime, keysPressed, mouseRef.current.x, mouseRef.current.y);
      
      // Get updated game state from engine
      const newGameState = engineRef.current.getGameState();
      
      // Check for level up events
      const events = engineRef.current.getEvents();
      const levelUpEvent = events.find(e => e.type === 'PLAYER_LEVEL_UP');
      if (levelUpEvent) {
        dispatch({ type: 'SET_LEVEL_UP', payload: true });
        setTimeout(() => dispatch({ type: 'SET_LEVEL_UP', payload: false }), 2000);
      }

      // Update React state if needed
      if (JSON.stringify(currentState.player) !== JSON.stringify(newGameState.player)) {
        dispatch({ type: 'UPDATE_PLAYER', payload: newGameState.player });
        lastPlayerHealthRef.current = newGameState.player.health;
      }
      
      if (JSON.stringify(currentState.enemies) !== JSON.stringify(newGameState.enemies)) {
        dispatch({ type: 'UPDATE_ENEMIES', payload: newGameState.enemies });
      }
      
      if (JSON.stringify(currentState.bullets) !== JSON.stringify(newGameState.bullets)) {
        dispatch({ type: 'UPDATE_BULLETS', payload: newGameState.bullets });
      }
      
      if (JSON.stringify(currentState.particles) !== JSON.stringify(newGameState.particles)) {
        dispatch({ type: 'UPDATE_PARTICLES', payload: newGameState.particles });
      }
      
      if (JSON.stringify(currentState.resources) !== JSON.stringify(newGameState.resources)) {
        dispatch({ type: 'UPDATE_RESOURCES', payload: newGameState.resources });
      }

      if (newGameState.gameOver !== currentState.gameOver) {
        dispatch({ type: 'SET_GAME_OVER', payload: newGameState.gameOver });
      }

      if (newGameState.gameRunning !== currentState.gameRunning) {
        dispatch({ type: 'SET_GAME_RUNNING', payload: newGameState.gameRunning });
      }

      // Clear engine events
      engineRef.current.clearEvents();

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dispatch, keysRef]);

  // Expose engine and config service for external use
  return { 
    animationRef,
    gameEngine: engineRef.current,
    configService: configServiceRef.current,
    mouseRef
  };
};