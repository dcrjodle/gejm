import React, { useRef, useEffect, useState } from 'react';
import { useGameContext } from '../context/GameContext';

interface GameCanvasProps {
  className?: string;
  gameEngine?: any;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ className, gameEngine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useGameContext();
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Update canvas size when window resizes
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-focus canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.focus();
    }
  }, []);

  // Handle mouse events for building placement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameEngine) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Update placement preview if in placement mode
      gameEngine.updatePlacementPreview(x, y);
    };

    const handleMouseClick = (event: MouseEvent) => {
      const gameState = gameEngine.getGameState();
      
      if (gameState.placementMode) {
        event.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (event.button === 0) { // Left click - place building
          const result = gameEngine.placeBuilding(x, y);
          if (!result.success) {
            console.log(result.message);
          }
        } else if (event.button === 2) { // Right click - cancel placement
          gameEngine.cancelBuildingPlacement();
        }
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      const gameState = gameEngine.getGameState();
      if (gameState.placementMode) {
        event.preventDefault(); // Prevent right-click context menu during placement
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseClick);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseClick);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gameEngine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Use game engine for rendering if available, otherwise fallback to original rendering
    if (gameEngine) {
      gameEngine.render(ctx);
    } else {
      // Fallback rendering (original logic)
      // Clear canvas
      ctx.fillStyle = '#000011';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid pattern
      ctx.strokeStyle = '#001122';
      ctx.lineWidth = 1;
      const gridSize = 40;
      
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw particles first (behind everything)
      state.particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life;
        ctx.fillRect(
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size,
          particle.size
        );
      });
      ctx.globalAlpha = 1;

      // Draw enemies
      state.enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(
          enemy.x - enemy.size / 2,
          enemy.y - enemy.size / 2,
          enemy.size,
          enemy.size
        );
      });

      // Draw bullets
      state.bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(
          bullet.x - bullet.size / 2,
          bullet.y - bullet.size / 2,
          bullet.size,
          bullet.size
        );
      });

      // Draw player
      ctx.fillStyle = state.player.color;
      ctx.shadowColor = state.player.color;
      ctx.shadowBlur = 15;
      ctx.fillRect(
        state.player.x - state.player.size / 2,
        state.player.y - state.player.size / 2,
        state.player.size,
        state.player.size
      );

      // Draw player health bar
      const healthBarWidth = 20;
      const healthBarHeight = 3;
      const healthPercentage = state.player.health / state.player.maxHealth;
      
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#333';
      ctx.fillRect(
        state.player.x - healthBarWidth / 2,
        state.player.y - state.player.size / 2 - 8,
        healthBarWidth,
        healthBarHeight
      );
      
      ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.2 ? '#ffff00' : '#ff0000';
      ctx.fillRect(
        state.player.x - healthBarWidth / 2,
        state.player.y - state.player.size / 2 - 8,
        healthBarWidth * healthPercentage,
        healthBarHeight
      );

      ctx.shadowBlur = 0;
    }
  }, [state, gameEngine]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className={className}
      tabIndex={0}
    />
  );
};

export default GameCanvas;