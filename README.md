# 2D Pixel Battle Game

A modular, domain-driven 2D pixel battle game built with React, TypeScript, and SASS modules. Features a configurable game engine designed for AI/LLM integration.

## 🎮 Game Overview

Control a cyan pixel that shoots green bullets at pink enemy pixels. Gain experience by defeating enemies to level up and increase your stats. The game features:

- Real-time WASD movement controls
- Shooting mechanics with SPACE bar
- Enemy AI that follows the player
- Experience and leveling system
- Particle explosion effects
- Neon-themed visual design

## 🏗️ Architecture

### Domain-Driven Design

The game uses a modular architecture where each feature is isolated into its own domain:

| Domain | Location | Responsibility |
|--------|----------|----------------|
| **Player** | `src/domains/player/` | Player stats, leveling, experience, health management |
| **Enemies** | `src/domains/enemies/` | Enemy spawning, AI behavior, movement patterns |
| **Weapons** | `src/domains/weapons/` | Shooting mechanics, bullet creation, weapon systems |
| **Movement** | `src/domains/movement/` | Player movement, key bindings, physics |
| **Canvas** | `src/domains/canvas/` | Rendering, visual effects, drawing operations |
| **Particles** | `src/domains/particles/` | Explosion effects, particle systems, visual feedback |

### Game Engine

The core game engine (`src/engine/GameEngine.ts`) coordinates all domains:
- Orchestrates domain updates in correct order
- Handles collision detection between entities
- Manages event communication between domains
- Provides centralized update loop with delta timing
- Maintains game state consistency

### Configuration System

A comprehensive configuration system enables real-time modifications:
- **ConfigService** (`src/services/ConfigService.ts`) - Dynamic configuration with hot-reloading
- **Default Configuration** (`src/config/defaultConfig.ts`) - Centralized game balance
- **Type-Safe** - Full TypeScript support with validation
- **LLM-Ready** - Easy interface for external modifications

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pixel-battle

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The game will be available at `http://localhost:3000`

## 🎮 Controls

- **WASD** - Move player
- **SPACE** - Shoot bullets

## 🔧 Configuration & Customization

### Game Balance (Default Settings)

- Canvas: 1200x800px
- Enemy spawn rate: 2 seconds, max 5 concurrent
- Level progression: 10 XP per level
- Level bonuses: +1 health, +0.2 speed per level
- Bullet cooldown: 300ms
- Player starting stats: 3 health, level 1, speed 4

### LLM/AI Integration Interface

The ConfigService provides methods for dynamic game modification:

```typescript
// Access the config service from the game component
const { configService } = useGameLoop(keysRef);

// Individual domain configuration
configService.setPlayerConfig({ 
  startingHealth: 5, 
  startingSpeed: 6,
  experiencePerLevel: 15 
});

configService.setEnemyConfig({ 
  spawnRate: 1000,      // Faster spawning
  maxConcurrent: 10,    // More enemies
  baseSpeed: 2,         // Faster enemies
  color: '#ff00ff'      // Purple enemies
});

configService.setWeaponConfig({ 
  shootCooldown: 200,   // Faster shooting
  damage: 2,            // More damage
  bulletSpeed: 12       // Faster bullets
});

configService.setMovementConfig({ 
  keyBindings: { 
    shoot: 'x',         // Change shoot key
    up: 'i',            // Change movement keys
    down: 'k',
    left: 'j',
    right: 'l'
  }
});

configService.setCanvasConfig({ 
  width: 1600, 
  height: 900,
  backgroundColor: '#001100',  // Dark green background
  showGrid: false              // Hide grid
});

configService.setParticleConfig({ 
  explosionCount: 12,          // More particles
  explosionSpeed: 4,           // Faster particles
  explosionLife: 2.0           // Longer-lasting effects
});

// Quick adjustments
configService.adjustDifficulty(1.5);        // 50% harder
configService.adjustCanvasSize(1600, 900);  // Resize game area

// Full configuration updates
configService.updateConfig({ 
  player: { startingHealth: 5 },
  enemies: { spawnRate: 800, color: '#00ffff' },
  weapons: { shootCooldown: 150 }
});

// Configuration validation
const errors = configService.validateConfig({
  player: { startingHealth: -1 }  // This would return validation errors
});
```

### Configuration Validation

The system includes built-in validation to prevent breaking changes:
- Player health must be > 0
- Enemy spawn rate must be ≥ 100ms
- Weapon cooldown must be ≥ 50ms
- Canvas dimensions must be ≥ 400x300px

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Game.tsx        # Main game container
│   ├── GameCanvas.tsx  # Canvas rendering
│   ├── GameUI.tsx      # HUD interface
│   └── GameOverlay.tsx # Modal overlays
├── domains/            # Game feature domains
│   ├── player/         # Player management
│   ├── enemies/        # Enemy systems
│   ├── weapons/        # Weapon mechanics
│   ├── movement/       # Movement physics
│   ├── canvas/         # Rendering systems
│   └── particles/      # Particle effects
├── engine/             # Core game engine
│   ├── GameEngine.ts   # Main coordinator
│   └── types/          # Type definitions
├── services/           # External services
│   └── ConfigService.ts # Configuration management
├── config/             # Default configurations
├── context/            # React context
├── hooks/              # Custom React hooks
├── styles/             # SASS modules
└── utils/              # Utility functions
```

### Key Design Principles

1. **Domain Independence** - Each domain can be modified without affecting others
2. **Event-Driven Communication** - Domains communicate through events
3. **Configuration-First** - All game parameters are configurable
4. **Type Safety** - Full TypeScript coverage with strict typing
5. **Hot-Reloading** - Configuration changes apply immediately
6. **LLM-Friendly** - Simple interface for AI modifications

### Adding New Features

1. **Create a new domain** in `src/domains/`
2. **Implement the DomainInterface** with update, configure, and event methods
3. **Register the domain** in GameEngine.ts
4. **Add configuration** options to the config types
5. **Update default config** with new parameters

### Event System

Domains can emit events for communication:

```typescript
// In a domain
this.events.push({
  type: 'PLAYER_LEVEL_UP',
  data: { newLevel: 5 },
  timestamp: Date.now()
});

// Events are automatically collected by the game engine
// and can trigger reactions in other domains
```

## 🧪 Testing

The modular architecture makes unit testing straightforward:

```bash
# Run all tests
npm test

# Test specific domain
npm test -- --testPathPattern=domains/player
```

Each domain can be tested in isolation with mock dependencies.

## 🚀 Deployment

```bash
# Build for production
npm run build

# Serve static files
npm install -g serve
serve -s build
```

## 🤖 AI/LLM Integration Examples

### Example 1: Difficulty Scaling
```typescript
// Gradually increase difficulty over time
setInterval(() => {
  configService.adjustDifficulty(1.1);
}, 30000); // Every 30 seconds
```

### Example 2: Dynamic Enemy Behavior
```typescript
// Change enemy behavior based on player performance
if (player.level > 5) {
  configService.setEnemyConfig({
    baseSpeed: 3,
    color: '#ff0000', // Red enemies for higher levels
    experienceValue: 2
  });
}
```

### Example 3: Adaptive Controls
```typescript
// AI could optimize controls based on player performance
configService.setMovementConfig({
  keyBindings: {
    up: 'w',
    down: 's', 
    left: 'a',
    right: 'd',
    shoot: 'space'
  }
});
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes in the appropriate domain
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For questions about the architecture or LLM integration, please open an issue or refer to the `CLAUDE.md` file for detailed technical documentation.