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

### State Management
The entire game state is managed through React Context (`src/context/GameContext.tsx`) using a reducer pattern. The `GameState` interface defines all game entities (player, enemies, bullets, particles) and game status flags. All state mutations happen through dispatched `GameAction` types.

### Game Loop Architecture
The core game loop is implemented in `useGameLoop` hook, which:
- Uses `requestAnimationFrame` for smooth 60fps updates
- Manages stale closure issues by maintaining a `stateRef` that tracks current state
- Handles player movement, enemy spawning, bullet updates, and collision detection
- **Critical**: Updates are applied conditionally to avoid React batching issues that can cause state overwrites

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

### Game Balance
- Default canvas: 800x600px
- Enemy spawn rate: 2 seconds, max 5 concurrent
- Level progression: 10 XP per level, grants +1 health and +0.2 speed
- Bullet cooldown: 300ms
- Player starting stats: 3 health, level 1, speed 4

### Critical Development Notes
When modifying the game loop, be aware that React's state batching can cause issues where newly added entities (bullets/enemies) are immediately removed by update functions using stale state. Always use `stateRef.current` for the latest state in game loop logic.