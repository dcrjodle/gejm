import { useEffect, useRef, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import { 
  checkCollision, 
  isInBounds, 
  clamp, 
  createEnemy, 
  createBullet, 
  createExplosion,
  updateEnemyMovement,
  updateBullet,
  updateParticle,
  calculateLevelUp
} from '../utils/gameUtils';

export const useGameLoop = (keysRef: React.MutableRefObject<Record<string, boolean>>) => {
  const { state, dispatch } = useGameContext();
  const animationRef = useRef<number>();
  const lastShotRef = useRef<number>(0);
  const lastEnemySpawnRef = useRef<number>(0);
  const stateRef = useRef(state);
  
  // Update state ref
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const shoot = useCallback(() => {
    const now = Date.now();
    const currentState = stateRef.current;
    if (now - lastShotRef.current > 300) { // 300ms cooldown
      const bullet = createBullet(currentState.player);
      dispatch({ type: 'ADD_BULLET', payload: bullet });
      lastShotRef.current = now;
    }
  }, [dispatch]);

  const spawnEnemy = useCallback(() => {
    const now = Date.now();
    const currentState = stateRef.current;
    const timeSinceLastSpawn = now - lastEnemySpawnRef.current;
    
    if (timeSinceLastSpawn > 2000 && currentState.enemies.length < 5) { // 2s spawn rate, max 5 enemies
      const enemy = createEnemy(currentState.canvasWidth, currentState.canvasHeight);
      dispatch({ type: 'ADD_ENEMY', payload: enemy });
      lastEnemySpawnRef.current = now;
    }
  }, [dispatch]);


  useEffect(() => {
    const gameLoop = () => {
      const currentState = stateRef.current;
      if (!currentState.gameRunning) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Handle player movement
      let newX = currentState.player.x;
      let newY = currentState.player.y;

      if (keysRef.current['w']) newY -= currentState.player.speed;
      if (keysRef.current['s']) newY += currentState.player.speed;
      if (keysRef.current['a']) newX -= currentState.player.speed;
      if (keysRef.current['d']) newX += currentState.player.speed;
      if (keysRef.current[' ']) {
        shoot();
      }

      // Keep player in bounds
      newX = clamp(newX, currentState.player.size, currentState.canvasWidth - currentState.player.size);
      newY = clamp(newY, currentState.player.size, currentState.canvasHeight - currentState.player.size);

      if (newX !== currentState.player.x || newY !== currentState.player.y) {
        dispatch({ type: 'UPDATE_PLAYER', payload: { x: newX, y: newY } });
      }

      // Spawn enemies
      spawnEnemy();

      // Update bullets, enemies, and particles
      let updatedBullets = currentState.bullets
        .map(updateBullet)
        .filter(bullet => isInBounds(bullet.x, bullet.y, currentState.canvasWidth, currentState.canvasHeight));

      let updatedEnemies = currentState.enemies.map(enemy => updateEnemyMovement(enemy, currentState.player));

      let updatedParticles = currentState.particles
        .map(updateParticle)
        .filter(particle => particle.life > 0);

      // Check bullet-enemy collisions
      let experienceGained = 0;
      
      for (let i = updatedBullets.length - 1; i >= 0; i--) {
        const bullet = updatedBullets[i];
        for (let j = updatedEnemies.length - 1; j >= 0; j--) {
          const enemy = updatedEnemies[j];
          if (checkCollision(bullet, enemy)) {
            // Create explosion particles
            updatedParticles.push(...createExplosion(enemy.x, enemy.y, enemy.color));
            
            // Remove bullet and enemy
            updatedBullets.splice(i, 1);
            updatedEnemies.splice(j, 1);
            
            // Gain experience
            experienceGained += enemy.experienceValue;
            break;
          }
        }
      }

      // Check player-enemy collisions
      for (let i = updatedEnemies.length - 1; i >= 0; i--) {
        const enemy = updatedEnemies[i];
        if (checkCollision(currentState.player, enemy)) {
          // Create explosion particles
          updatedParticles.push(...createExplosion(enemy.x, enemy.y, enemy.color));
          
          // Remove enemy and damage player
          updatedEnemies.splice(i, 1);
          const newHealth = currentState.player.health - 1;
          
          dispatch({ type: 'UPDATE_PLAYER', payload: { health: newHealth } });
          
          if (newHealth <= 0) {
            dispatch({ type: 'SET_GAME_OVER', payload: true });
          }
        }
      }

      // Update experience and level
      if (experienceGained > 0) {
        const newExperience = currentState.player.experience + experienceGained;
        const { level, experienceToNext } = calculateLevelUp(currentState.player.level, newExperience);
        
        if (level > currentState.player.level) {
          dispatch({ type: 'SET_LEVEL_UP', payload: true });
          setTimeout(() => dispatch({ type: 'SET_LEVEL_UP', payload: false }), 2000);
          
          // Level up bonuses
          dispatch({ 
            type: 'UPDATE_PLAYER', 
            payload: { 
              level,
              experience: newExperience,
              experienceToNext,
              maxHealth: currentState.player.maxHealth + 1,
              health: currentState.player.maxHealth + 1,
              speed: currentState.player.speed + 0.2
            }
          });
        } else {
          dispatch({ 
            type: 'UPDATE_PLAYER', 
            payload: { 
              experience: newExperience,
              experienceToNext
            }
          });
        }
      }

      // Update game state only if needed
      if (currentState.bullets.length > 0 || updatedBullets.length > 0) {
        dispatch({ type: 'UPDATE_BULLETS', payload: updatedBullets });
      }
      if (currentState.enemies.length > 0 || updatedEnemies.length > 0) {
        dispatch({ type: 'UPDATE_ENEMIES', payload: updatedEnemies });
      }
      if (currentState.particles.length > 0 || updatedParticles.length > 0) {
        dispatch({ type: 'UPDATE_PARTICLES', payload: updatedParticles });
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shoot, spawnEnemy, dispatch, keysRef]);

  return { animationRef };
};