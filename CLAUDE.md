# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 2D pixel battle game built with React, TypeScript, and SASS modules. The player controls a cyan pixel, shoots green bullets at pink enemy pixels, and gains experience to level up.

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Architecture

### Domain-Driven Design
The game is built using a modular, domain-driven architecture where each feature is isolated into its own domain:

- **Player Domain** (`src/domains/player/`) - Handles player stats, leveling, experience, and health management
- **Enemy Domain** (`src/domains/enemies/`) - Manages enemy spawning, AI behavior, and movement patterns
- **Weapon Domain** (`src/domains/weapons/`) - Controls shooting mechanics, bullet creation, and weapon systems
- **Movement Domain** (`src/domains/movement/`) - Handles player movement, key bindings, and physics
- **Canvas Domain** (`src/domains/canvas/`) - Manages all rendering, visual effects, and drawing operations
- **Particle Domain** (`src/domains/particles/`) - Controls explosion effects, particle systems, and visual feedback

### Game Engine Architecture
The core game engine (`src/engine/GameEngine.ts`) serves as the main coordinator:
- Orchestrates all domain updates in the correct order
- Handles collision detection between different entity types
- Manages event communication between domains
- Provides a centralized update loop with proper delta timing
- Maintains game state consistency across all domains

### Configuration System
A comprehensive configuration system enables real-time game modifications:
- **ConfigService** (`src/services/ConfigService.ts`) - Manages dynamic configuration with hot-reloading
- **Default Configuration** (`src/config/defaultConfig.ts`) - Centralized game balance and settings
- **Type-Safe Configuration** - Full TypeScript support with validation
- **LLM-Ready Interface** - Easy methods for external modification of any game aspect

### State Management
The system uses a hybrid approach:
- React Context (`src/context/GameContext.tsx`) for UI state management
- Game Engine for core game logic and entity management
- Event-driven communication between domains
- Proper separation between game logic and presentation layer

### Component Structure
- `Game.tsx`: Main game container that orchestrates hooks
- `GameCanvas.tsx`: Canvas rendering with real-time game state visualization
- `GameUI.tsx`: HUD displaying player stats and controls
- `GameOverlay.tsx`: Modal overlays for game over and level up states

### Key Implementation Details

#### State Update Timing
The game loop was refactored to avoid stale closure issues where `ADD_BULLET` actions were immediately overwritten by `UPDATE_BULLETS` with stale state. The solution uses `stateRef.current` to access fresh state and conditional updates.

#### Keyboard Input
`useKeyboard` hook manages real-time key state tracking using refs to avoid re-render issues during rapid game loop updates.

#### Game Entity Management
- **Player**: WASD movement with boundary clamping
- **Enemies**: Spawn from canvas edges every 2 seconds, move toward player
- **Bullets**: 300ms cooldown, move upward, filtered by canvas bounds
- **Particles**: Explosion effects with life decay

#### Styling System
SASS modules with neon theme variables (`$primary-neon`, `$secondary-neon`, etc.) provide scoped styling. Global body styles are applied via `:global()` selector.

### Game Balance (Configurable via ConfigService)
- Default canvas: 1200x800px
- Enemy spawn rate: 2 seconds, max 5 concurrent
- Level progression: 10 XP per level, grants +1 health and +0.2 speed
- Bullet cooldown: 300ms
- Player starting stats: 3 health, level 1, speed 4

### LLM Integration Interface
The ConfigService provides these methods for dynamic game modification:

```typescript
// Individual domain configuration
configService.setPlayerConfig({ startingHealth: 5, startingSpeed: 6 });
configService.setEnemyConfig({ spawnRate: 1000, maxConcurrent: 10 });
configService.setWeaponConfig({ shootCooldown: 200, damage: 2 });
configService.setMovementConfig({ keyBindings: { shoot: 'x' } });
configService.setCanvasConfig({ width: 1600, height: 900 });
configService.setParticleConfig({ explosionCount: 12 });

// Quick adjustments
configService.adjustDifficulty(1.5); // Increase difficulty by 50%
configService.adjustCanvasSize(1600, 900); // Resize game area

// Full configuration updates
configService.updateConfig({ 
  player: { startingHealth: 5 },
  enemies: { spawnRate: 800 }
});
```

### Critical Development Notes
- The game engine handles all entity management and collision detection
- Domain updates are processed in a specific order to maintain consistency
- Configuration changes are applied immediately through the subscription system
- Each domain operates independently, making it safe to modify specific features
- The React layer only handles UI state; core game logic runs in the engine