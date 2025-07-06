# Neon Pixel Survival - PRD Implementation Plan

## Executive Summary

This document outlines the comprehensive implementation plan for transforming the current 2D pixel battle game into **Neon Pixel Survival**, a tower defense/survival/roguelike game as specified in the PRD. The plan leverages the existing domain-driven architecture while adding new systems and mechanics.

## Current Game Architecture Analysis

### **Existing Foundation (40% Reusable)**

The current game provides an excellent foundation with:

#### **✅ Fully Reusable Domains**
- **PlayerDomain** (`src/domains/player/`) - Stats, health, leveling system works perfectly
- **CanvasDomain** (`src/domains/canvas/`) - Rendering system is solid and extensible
- **ParticleDomain** (`src/domains/particles/`) - Explosion effects work well for combat feedback
- **MovementDomain** (`src/domains/movement/`) - Player movement mechanics are solid

#### **✅ Excellent Infrastructure**
- **GameEngine** (`src/engine/GameEngine.ts`) - Strong orchestration and collision detection
- **ConfigService** (`src/services/ConfigService.ts`) - Hot-reloadable configuration ready for expansions
- **TypeScript Types** - Comprehensive type system for game entities and configuration
- **Domain Architecture** - Clean separation of concerns enables easy feature additions

#### **⚠️ Domains Requiring Major Modifications**
- **EnemyDomain** (`src/domains/enemies/`) - Basic enemy spawning, needs multiple enemy types and AI behaviors
- **WeaponDomain** (`src/domains/weapons/`) - Single weapon type, needs multi-shot, piercing, ultimate abilities
- **ResourceDomain** (`src/domains/resources/`) - Single resource type, needs 3-tier system

### **UI/UX Foundation**
- **GameUI** - Shows player stats, health, XP, resources (partially reusable)
- **GameOverlay** - Game over and level up screens (reusable)
- **GameCanvas** - Canvas rendering with real-time visualization (reusable)
- **CustomCursor** - Custom cursor system (reusable)
- **PauseMenu** - Pause functionality (reusable)

## Major Architecture Transformation Required

### **1. Wave-Based Gameplay System**

**Current State:** Continuous survival with basic wave spawning
**PRD Requirement:** Structured wave system with 3 distinct phases

#### **Implementation Plan:**
- **Create WaveDomain** - New domain for wave progression management
- **Wave State Management:**
  - Combat Phase (60-120 seconds)
  - Upgrade Intermission (30-60 seconds)
  - Wave Preparation (10 seconds)
- **Wave Progression Logic:**
  - Enemy scaling per wave (+15% HP, +5% speed, +10% spawn rate)
  - Boss spawning on waves 5, 10, 15, etc.
  - Elite enemy spawn chances increasing with wave number

#### **Key Files to Create:**
- `src/domains/wave/WaveDomain.ts`
- `src/domains/wave/types.ts`
- `src/domains/wave/WaveManager.ts`

### **2. Base Defense Mechanics**

**Current State:** Player-centric survival (enemies target player)
**PRD Requirement:** Base defense (enemies target central base)

#### **Implementation Plan:**
- **Create BaseDomain** - New domain for central base management
- **Base Entity System:**
  - Central base with health system
  - Base damage when enemies reach it
  - Base repair/upgrade mechanics
- **Enemy AI Changes:**
  - Primary target: Base instead of player
  - Secondary behavior: Attack player if in range
  - Pathfinding toward base location

#### **Key Files to Create:**
- `src/domains/base/BaseDomain.ts`
- `src/domains/base/types.ts`
- `src/engine/types/entities.ts` (extend with Base interface)

### **3. Resource System Expansion**

**Current State:** Single resource type for basic upgrades
**PRD Requirement:** 3-tier resource system with different rarities

#### **Implementation Plan:**
- **Extend ResourceDomain** - Add multiple resource types
- **Resource Types:**
  - **Energy Crystals** (Common) - 1-3 per basic enemy kill, max 999
  - **Quantum Cores** (Rare) - 1 per elite enemy kill, max 99
  - **Essence Fragments** (Epic) - 1-2 per boss enemy kill, max 9
- **Resource Management:**
  - Different drop rates based on enemy type
  - Visual distinction for different resource types
  - Separate inventory tracking

#### **Key Files to Modify:**
- `src/domains/resources/ResourceDomain.ts`
- `src/domains/resources/types.ts`
- `src/engine/types/entities.ts` (extend Resource interface)

## New Systems to Build (30% from scratch)

### **1. Building/Tower Defense System**

**PRD Requirement:** Grid-based defensive structure placement

#### **Implementation Plan:**
- **Create BuildingDomain** - New domain for defensive structures
- **Grid System:**
  - 20x20 pixel tile-based placement
  - Collision detection with existing structures
  - Limited building area around central base
- **Structure Types:**
  - **Basic Defenses:** Barrier Wall, Spike Trap, Turret
  - **Advanced Defenses:** Tesla Coil, Laser Grid, Shield Generator
  - **Special Buildings:** Resource Extractor, Repair Station, Church

#### **Key Files to Create:**
- `src/domains/building/BuildingDomain.ts`
- `src/domains/building/types.ts`
- `src/domains/building/BuildingManager.ts`
- `src/components/BuildingPlacementUI.tsx`

### **2. Character Progression System**

**PRD Requirement:** Comprehensive upgrade system with multiple ability trees

#### **Implementation Plan:**
- **Create UpgradeDomain** - New domain for character progression
- **Upgrade Categories:**
  - **Combat Abilities:** Damage, Fire Rate, Movement Speed, Multi-Shot, Piercing
  - **Survival Abilities:** Max Health, Health Regeneration, Shield, Magnetic Collection
  - **Ultimate Abilities:** Time Dilation, Nuclear Pulse, Resurrection (unlocked at Wave 10+)
- **Resource-Gated Progression:**
  - Energy Crystals for basic upgrades
  - Quantum Cores for advanced upgrades
  - Essence Fragments for ultimate abilities

#### **Key Files to Create:**
- `src/domains/upgrade/UpgradeDomain.ts`
- `src/domains/upgrade/types.ts`
- `src/domains/upgrade/UpgradeManager.ts`
- `src/components/UpgradeScreen.tsx`

### **3. Divine Intervention System**

**PRD Requirement:** Church building with LLM integration for prayer system

#### **Implementation Plan:**
- **Create DivineInterventionDomain** - New domain for church mechanics
- **Church Building:**
  - Unlock condition: 15 Quantum Cores + 1 Essence Fragment
  - Special building type with unique interactions
- **Prayer System:**
  - Text input interface (200 character limit)
  - Resource cost calculation (1-3 Quantum Cores)
  - LLM integration for prayer processing
- **LLM Request Processing:**
  - LLM analyzes user input for reasonableness and game balance
  - Determines if request is appropriate (not overpowered)
  - Modifies game configuration to apply user request
  - **Cannot modify enemies** - LLM restricted from enemy modifications
- **Divine Responses via Config Modification:**
  - **Building Creation:** Spawn walls, turrets, defensive structures
  - **Weapon Enhancements:** Dual weapons, multi-shot, piercing bullets
  - **Player Abilities:** Temporary shields, speed boosts, damage multipliers
  - **Resource Effects:** Resource multiplication, collection bonuses
  - **Environmental Changes:** Particle effects, visual enhancements

#### **Key Files to Create:**
- `src/domains/divine/DivineInterventionDomain.ts`
- `src/domains/divine/types.ts`
- `src/domains/divine/PrayerProcessor.ts`
- `src/components/ChurchInterface.tsx`
- `src/services/LLMService.ts`

## Enhanced Enemy System

### **Enemy Type Expansion**

**Current State:** Basic enemy with simple AI
**PRD Requirement:** 9+ enemy types with different behaviors

#### **Implementation Plan:**
- **Standard Enemies (Waves 1-∞):**
  - Pixel Drone: Basic enemy, low HP, moderate speed
  - Assault Bot: Higher HP, faster movement
  - Heavy Tank: Very high HP, slow movement, high damage
- **Elite Enemies (Waves 3+):**
  - Phantom Striker: Fast, teleports occasionally
  - Siege Breaker: Extremely high HP, targets base directly
  - Swarm Mother: Spawns smaller enemies on death
- **Boss Enemies (Waves 5, 10, 15, etc.):**
  - Neon Overlord: Massive HP, multiple attack patterns
  - Quantum Destroyer: Disables nearby player structures
  - Digital Apocalypse: Final boss tier, extremely dangerous

#### **Key Files to Modify:**
- `src/domains/enemies/EnemyDomain.ts`
- `src/domains/enemies/types.ts`
- `src/domains/enemies/EnemyAI.ts`

## UI/UX Overhaul

### **New UI Components Required**

#### **1. Wave Progress UI**
- Wave counter display
- Wave timer/progress bar
- Enemy counters (spawned/alive/remaining)
- Next wave preview

#### **2. Upgrade Screen Interface**
- Split-screen layout: Character upgrades vs Building placement
- Resource cost indicators
- Upgrade preview effects
- Tab filtering (Available/Locked/Purchased)

#### **3. Building Placement UI**
- Grid overlay visualization
- Building selection palette
- Resource cost display
- Placement validation feedback

#### **4. Base Health UI**
- Central base health indicator
- Base damage alerts
- Repair status display

#### **5. Resource Management UI**
- 3-tier resource display with icons
- Resource cap indicators
- Collection animations

#### **6. Church Interface**
- Atmospheric church background
- Prayer text input (200 char limit)
- Resource cost calculator
- Prayer history display

## Implementation Timeline

### **Phase 1: Core Systems Foundation (Weeks 1-4)**

#### **Week 1-2: Resource & Wave Systems**
- Extend ResourceDomain for 3-tier system
- Create WaveDomain for wave progression
- Implement wave state management (Combat/Upgrade/Preparation phases)
- Add resource drop mechanics for different enemy types

#### **Week 3-4: Base Defense & Enemy Enhancement**
- Create BaseDomain for central base mechanics
- Enhance EnemyDomain with multiple enemy types
- Implement enemy AI targeting base instead of player
- Add boss enemy mechanics and scaling

### **Phase 2: Building & Upgrade Systems (Weeks 5-8)**

#### **Week 5-6: Building System**
- Create BuildingDomain for defensive structures
- Implement grid-based placement system
- Add basic defensive buildings (walls, turrets, traps)
- Create BuildingPlacementUI component

#### **Week 7-8: Character Progression**
- Create UpgradeDomain for character abilities
- Implement upgrade trees (Combat/Survival/Ultimate)
- Build UpgradeScreen UI component
- Add resource-gated progression mechanics

### **Phase 3: Advanced Features (Weeks 9-12)**

#### **Week 9-10: Advanced Buildings & Abilities**
- Add advanced defensive structures (Tesla Coil, Laser Grid)
- Implement ultimate abilities (Time Dilation, Nuclear Pulse, Resurrection)
- Create special buildings (Resource Extractor, Repair Station)
- Add building adjacency and power systems

#### **Week 11-12: Divine Intervention System**
- Create DivineInterventionDomain
- Build Church building and interface
- Implement prayer system with text input
- Add LLM integration infrastructure (server-side)
- Implement LLM-driven config modification system
- Add balance validation for LLM requests
- Create enemy modification restrictions

### **Phase 4: Polish & Balance (Weeks 13-16)**

#### **Week 13-14: Balance & Testing**
- Comprehensive balance testing for all systems
- Difficulty curve optimization
- Performance optimization for 100+ entities
- Bug fixing and edge case handling

#### **Week 15-16: Final Polish**
- UI/UX polish and visual effects
- LLM integration testing and content filtering
- Final performance optimization
- Launch preparation and documentation

## Technical Implementation Details

### **Game Engine Enhancements**

#### **GameEngine.ts Modifications:**
- Add domain orchestration for new domains
- Implement wave state management
- Add building collision detection
- Enhance resource collection system

#### **Configuration System Extensions:**
- Add configuration for new domains
- Implement wave progression settings
- Add building placement constraints
- Configure resource drop rates and caps

### **State Management Updates**

#### **GameContext Extensions:**
- Add wave state tracking
- Implement building state management
- Add upgrade progression tracking
- Include divine intervention state

#### **Entity System Enhancements:**
- Add Base entity interface
- Extend Resource interface for multiple types
- Add Building entity interface
- Include upgrade state in Player interface

### **Performance Considerations**

#### **Optimization Targets:**
- 60 FPS with 100+ entities on screen
- Sub-100ms input latency
- Efficient collision detection for buildings
- Optimized rendering for particle effects

#### **Memory Management:**
- Entity pooling for bullets and particles
- Efficient building grid representation
- Optimized resource collection algorithms
- LLM response caching

## Risk Assessment & Mitigation

### **Technical Risks**

#### **High Priority:**
- **LLM API reliability and cost scaling**
  - Mitigation: Implement fallback responses, rate limiting, cost monitoring
- **Canvas performance with many entities**
  - Mitigation: Entity pooling, culling, optimized rendering
- **Cross-browser compatibility**
  - Mitigation: Comprehensive testing, polyfills, fallbacks

#### **Medium Priority:**
- **Save game data persistence**
  - Mitigation: Local storage with versioning, cloud backup options
- **Balancing difficulty progression**
  - Mitigation: Extensive playtesting, analytics, configurable parameters
- **Player exploit prevention**
  - Mitigation: Server-side validation, input sanitization, rate limiting

### **Content Risks**

#### **High Priority:**
- **Inappropriate LLM responses**
  - Mitigation: Content filtering, response moderation, fallback responses
- **Divine intervention system abuse**
  - Mitigation: Rate limiting, resource caps, request validation, balance bounds
- **LLM game-breaking modifications**
  - Mitigation: Strict validation of config changes, enemy modification restrictions
- **Difficulty balance frustration**
  - Mitigation: Difficulty options, accessibility features, player feedback

## Success Metrics

### **Key Performance Indicators**

#### **Engagement Metrics:**
- Average session duration: Target 15+ minutes
- Wave completion rate: 70% players reach Wave 5
- Return player rate: 40% within 7 days
- Building system adoption: 80% of players by Wave 3

#### **Divine Intervention Metrics:**
- Church build rate: 60% of players by Wave 10
- Prayer usage: Average 3 prayers per session
- LLM response satisfaction: 4+ stars average
- Prayer system retention: 50% repeat usage

#### **Technical Metrics:**
- Page load time: <3 seconds
- Crash rate: <1% of sessions
- API response time: <2 seconds average
- 60 FPS maintenance: 95% of gameplay time

## Configuration & Extensibility

### **LLM Integration Interface**

The existing ConfigService provides methods for dynamic game modification that will be extended for PRD features:

```typescript
// New domain configurations
configService.setWaveConfig({ 
  combatDuration: 90000, 
  intermissionDuration: 45000,
  difficultyScaling: 1.15 
});

configService.setBuildingConfig({ 
  gridSize: 20, 
  maxBuildingRadius: 300,
  constructionCosts: { turret: 25, wall: 8 }
});

configService.setResourceConfig({ 
  energyCrystalCap: 999,
  quantumCoreCap: 99,
  essenceFragmentCap: 9
});

// Divine intervention settings
configService.setDivineConfig({
  prayerCooldown: 60000,
  maxPrayerLength: 200,
  baseCost: 1
});

// LLM-driven config modification examples
configService.divineIntervention.spawnBuilding({ 
  type: 'wall', 
  position: { x: 400, y: 300 },
  cost: 8 
});

configService.divineIntervention.enhancePlayer({ 
  dualWeapons: true,
  shield: { duration: 10000, strength: 2 },
  speedMultiplier: 1.5
});

configService.divineIntervention.modifyWeapons({ 
  multiShot: 3,
  piercing: true,
  damage: 2
});
```

### **Extensibility Features**

#### **Modular Domain Architecture:**
- Each new domain operates independently
- Hot-swappable configuration system
- Event-driven communication between domains
- Easy addition of new enemy types, buildings, or abilities

#### **Data-Driven Design:**
- JSON configuration for all game balance
- External asset loading for sprites and audio
- Configurable wave progression and enemy scaling
- Customizable building placement rules

## Conclusion

This implementation plan leverages the existing domain-driven architecture to transform the current game into a full-featured tower defense/survival game as specified in the PRD. The modular approach ensures that:

1. **40% of existing code can be reused** directly
2. **30% needs major modifications** but retains core structure
3. **30% requires new development** using established patterns

The phased approach allows for iterative development and testing, ensuring each system is solid before building dependent features. The existing ConfigService and clean architecture patterns make this transformation feasible while maintaining code quality and extensibility.

The most critical success factors are:
- Maintaining the existing domain architecture patterns
- Implementing robust LLM integration with proper content filtering and balance validation
- Creating a secure config modification system that prevents game-breaking changes
- Restricting LLM access to prevent enemy modifications while allowing creative player enhancements
- Balancing the complexity of new systems with gameplay fun
- Ensuring performance remains optimal with increased entity count

This plan provides a clear roadmap for creating an engaging tower defense game while preserving the technical excellence of the current codebase.