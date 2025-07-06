import { GameState, GameEvent } from './types';
import { GameConfig } from './types/config';
import { PlayerDomain } from '../domains/player';
import { EnemyDomain } from '../domains/enemies';
import { WeaponDomain } from '../domains/weapons';
import { MovementDomain } from '../domains/movement';
import { CanvasDomain } from '../domains/canvas';
import { ParticleDomain } from '../domains/particles';
import { ResourceDomain } from '../domains/resources';
import { BaseDomain } from '../domains/base';
import { WaveDomain } from '../domains/wave';

export class GameEngine {
  private config: GameConfig;
  private playerDomain!: PlayerDomain;
  private enemyDomain!: EnemyDomain;
  private weaponDomain!: WeaponDomain;
  private movementDomain!: MovementDomain;
  private canvasDomain!: CanvasDomain;
  private particleDomain!: ParticleDomain;
  private resourceDomain!: ResourceDomain;
  private baseDomain!: BaseDomain;
  private waveDomain!: WaveDomain;
  private gameState!: GameState;
  private events: GameEvent[] = [];
  private isPaused: boolean = false;
  private lastPauseKeyTime: number = 0;

  constructor(config: GameConfig) {
    this.config = config;
    this.initializeDomains();
    this.initializeGameState();
  }

  private initializeDomains(): void {
    this.playerDomain = new PlayerDomain(this.config.player, this.config.resources);
    this.enemyDomain = new EnemyDomain(this.config.enemies);
    this.weaponDomain = new WeaponDomain(this.config.weapons);
    this.movementDomain = new MovementDomain(this.config.movement);
    this.canvasDomain = new CanvasDomain(this.config.canvas);
    this.particleDomain = new ParticleDomain(this.config.particles);
    this.resourceDomain = new ResourceDomain(this.config.resources);
    this.baseDomain = new BaseDomain(this.config.base);
    this.waveDomain = new WaveDomain(this.config.wave);
  }

  private initializeGameState(): void {
    const player = this.playerDomain.createPlayer();
    const base = this.baseDomain.createBase();
    
    // Position base in leftmost corner with some padding
    base.x = this.config.base.position.x;
    base.y = this.config.canvas.height / 2;
    
    this.gameState = {
      player,
      enemies: [],
      bullets: [],
      particles: [],
      resources: [],
      base,
      gameRunning: true,
      gameOver: false,
      levelUp: false,
      canvasWidth: this.config.canvas.width,
      canvasHeight: this.config.canvas.height
    };
  }

  update(deltaTime: number, keysPressed: Record<string, boolean>, mouseX?: number, mouseY?: number, mouseClicked?: boolean): void {
    // Always handle pause toggle, even when paused
    this.handlePauseInput(keysPressed);
    
    // Update wave system first - this should always run for timer
    const waveUpdate = this.waveDomain.update([], deltaTime, this.gameState);
    this.collectEvents(waveUpdate.events);
    
    // Handle wave combat start events
    const waveCombatStartEvent = waveUpdate.events?.find(event => event.type === 'WAVE_COMBAT_STARTED');
    if (waveCombatStartEvent) {
      // Ensure enemies can spawn immediately when combat starts
      this.enemyDomain.startNextWave();
    }

    if (!this.gameState.gameRunning) return;
    
    // Skip game logic update if paused, but still allow rendering
    if (this.isPaused) {
      return;
    }

    const gameContext = {
      ...this.gameState,
      keysPressed,
      mouseX,
      mouseY,
      canvasWidth: this.config.canvas.width,
      canvasHeight: this.config.canvas.height,
      currentWave: this.waveDomain.getCurrentWaveNumber(),
      wavePhase: this.waveDomain.getPhase()
    };

    // Update movement first
    const movementUpdate = this.movementDomain.update([this.gameState.player], deltaTime, gameContext);
    this.gameState.player = movementUpdate.entities[0];
    this.collectEvents(movementUpdate.events);

    // Handle shooting (space key or mouse click)
    if (this.movementDomain.isShootKeyPressed(keysPressed) || mouseClicked) {
      const bullet = this.weaponDomain.shoot(this.gameState.player, mouseX, mouseY);
      if (bullet) {
        this.gameState.bullets.push(bullet);
      }
    }

    // Update enemies
    const enemyUpdate = this.enemyDomain.update(this.gameState.enemies, deltaTime, gameContext);
    this.gameState.enemies = enemyUpdate.entities;
    this.collectEvents(enemyUpdate.events);
    
    // Notify WaveDomain of enemy spawns
    const enemySpawnEvents = enemyUpdate.events?.filter(event => event.type === 'ENEMY_SPAWNED') || [];
    enemySpawnEvents.forEach(() => {
      this.waveDomain.onEnemySpawned();
    });

    // Update bullets
    const bulletUpdate = this.weaponDomain.update(this.gameState.bullets, deltaTime, gameContext);
    this.gameState.bullets = bulletUpdate.entities;
    this.collectEvents(bulletUpdate.events);

    // Update particles
    const particleUpdate = this.particleDomain.update(this.gameState.particles, deltaTime, gameContext);
    this.gameState.particles = particleUpdate.entities;
    this.collectEvents(particleUpdate.events);

    // Update base
    const baseUpdate = this.baseDomain.update([this.gameState.base], deltaTime, gameContext);
    this.gameState.base = baseUpdate.entities[0];
    this.collectEvents(baseUpdate.events);

    // Update resources (includes automatic pickup detection)
    const resourceUpdate = this.resourceDomain.update(this.gameState.resources, deltaTime, gameContext);
    this.gameState.resources = resourceUpdate.entities;
    this.collectEvents(resourceUpdate.events);

    // Handle resource collection events - use new 3-tier system
    const collectionEvents = resourceUpdate.events?.filter(event => event.type === 'RESOURCE_COLLECTED') || [];
    collectionEvents.forEach(event => {
      if (event.data?.resource) {
        const resource = event.data.resource;
        this.gameState.player = this.playerDomain.collectResourcesByType(
          this.gameState.player, 
          resource.type, 
          resource.value
        );
        // Also update legacy resources for backward compatibility
        this.gameState.player = this.playerDomain.collectResources(this.gameState.player, resource.value);
      }
    });

    // Handle collisions
    this.handleCollisions();

    // Update player (for leveling, etc.)
    const playerUpdate = this.playerDomain.update([this.gameState.player], deltaTime, gameContext);
    this.gameState.player = playerUpdate.entities[0];
    this.collectEvents(playerUpdate.events);

    // Check game over conditions
    if (this.gameState.player.health <= 0 || this.gameState.base.health <= 0) {
      this.gameState.gameOver = true;
      this.gameState.gameRunning = false;
    }

    // Clear domain events
    this.clearAllDomainEvents();
  }

  private handleCollisions(): void {
    // Bullet-enemy collisions
    for (let i = this.gameState.bullets.length - 1; i >= 0; i--) {
      const bullet = this.gameState.bullets[i];
      for (let j = this.gameState.enemies.length - 1; j >= 0; j--) {
        const enemy = this.gameState.enemies[j];
        if (this.checkCollision(bullet, enemy)) {
          // Apply damage to enemy
          const damage = bullet.damage || 1;
          enemy.health -= damage;
          
          // Remove bullet
          this.gameState.bullets.splice(i, 1);
          this.weaponDomain.destroyBullet(bullet);
          
          // Check if enemy is dead
          if (enemy.health <= 0) {
            // Create explosion
            const explosionParticles = this.particleDomain.createExplosion(enemy.x, enemy.y, enemy.color);
            this.gameState.particles.push(...explosionParticles);
            
            // Create resource drops using new 3-tier system
            const resourceDrops = this.resourceDomain.createResourceDrop(enemy.x, enemy.y, enemy.type);
            this.gameState.resources.push(...resourceDrops);
            
            // Remove enemy
            this.gameState.enemies.splice(j, 1);
            
            // Give experience
            this.gameState.player = this.playerDomain.gainExperience(this.gameState.player, enemy.experienceValue);
            
            // Track events
            this.enemyDomain.destroyEnemy(enemy);
            this.waveDomain.onEnemyDestroyed();
          }
          break;
        }
      }
    }

    // Enemy-base collisions (primary target)
    for (let i = this.gameState.enemies.length - 1; i >= 0; i--) {
      const enemy = this.gameState.enemies[i];
      if (this.checkCollision(this.gameState.base, enemy)) {
        // Create explosion
        const explosionParticles = this.particleDomain.createExplosion(enemy.x, enemy.y, enemy.color);
        this.gameState.particles.push(...explosionParticles);
        
        // Damage base
        this.gameState.base = this.baseDomain.damageBase(this.gameState.base, 10);
        
        // Remove enemy
        this.gameState.enemies.splice(i, 1);
        this.enemyDomain.destroyEnemy(enemy);
        this.waveDomain.onEnemyDestroyed();
        continue; // Skip player collision check since enemy hit base
      }
    }

    // Player-enemy collisions (secondary - only if enemy didn't hit base)
    for (let i = this.gameState.enemies.length - 1; i >= 0; i--) {
      const enemy = this.gameState.enemies[i];
      if (this.checkCollision(this.gameState.player, enemy)) {
        // Create explosion
        const explosionParticles = this.particleDomain.createExplosion(enemy.x, enemy.y, enemy.color);
        this.gameState.particles.push(...explosionParticles);
        
        // Remove enemy and damage player
        this.gameState.enemies.splice(i, 1);
        this.gameState.player = this.playerDomain.takeDamage(this.gameState.player, 1);
        
        // Track event
        this.enemyDomain.destroyEnemy(enemy);
        this.waveDomain.onEnemyDestroyed();
      }
    }

    // Player-resource collisions are now handled automatically in ResourceDomain
  }

  private checkCollision(obj1: any, obj2: any): boolean {
    // Create hitboxes for both objects
    const hitbox1 = this.getHitbox(obj1);
    const hitbox2 = this.getHitbox(obj2);
    
    // Check for rectangular collision (AABB - Axis-Aligned Bounding Box)
    return hitbox1.x < hitbox2.x + hitbox2.width &&
           hitbox1.x + hitbox1.width > hitbox2.x &&
           hitbox1.y < hitbox2.y + hitbox2.height &&
           hitbox1.y + hitbox1.height > hitbox2.y;
  }

  private getHitbox(obj: any): { x: number; y: number; width: number; height: number } {
    // Create a square hitbox based on the object's size
    const halfSize = obj.size / 2;
    return {
      x: obj.x - halfSize,
      y: obj.y - halfSize,
      width: obj.size,
      height: obj.size
    };
  }

  private collectEvents(events?: GameEvent[]): void {
    if (events) {
      this.events.push(...events);
    }
  }

  private clearAllDomainEvents(): void {
    this.playerDomain.clearEvents();
    this.enemyDomain.clearEvents();
    this.weaponDomain.clearEvents();
    this.movementDomain.clearEvents();
    this.canvasDomain.clearEvents();
    this.particleDomain.clearEvents();
    this.resourceDomain.clearEvents();
    this.baseDomain.clearEvents();
    this.waveDomain.clearEvents();
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.canvasDomain.render(
      ctx,
      this.gameState.player,
      this.gameState.enemies,
      this.gameState.bullets,
      this.gameState.particles,
      this.gameState.resources,
      this.gameState.base
    );
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  getEvents(): GameEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  configure(newConfig: Partial<GameConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reconfigure domains
    if (newConfig.player) this.playerDomain.configure(newConfig.player);
    if (newConfig.enemies) this.enemyDomain.configure(newConfig.enemies);
    if (newConfig.weapons) this.weaponDomain.configure(newConfig.weapons);
    if (newConfig.movement) this.movementDomain.configure(newConfig.movement);
    if (newConfig.canvas) this.canvasDomain.configure(newConfig.canvas);
    if (newConfig.particles) this.particleDomain.configure(newConfig.particles);
    if (newConfig.resources) this.resourceDomain.configure(newConfig.resources);
    if (newConfig.base) this.baseDomain.configure(newConfig.base);
    if (newConfig.wave) this.waveDomain.configure(newConfig.wave);

    // Update canvas size if changed
    if (newConfig.canvas) {
      this.gameState.canvasWidth = newConfig.canvas.width || this.config.canvas.width;
      this.gameState.canvasHeight = newConfig.canvas.height || this.config.canvas.height;
    }
  }

  resetGame(): void {
    // Reset all domains to their initial state
    if (this.weaponDomain && typeof this.weaponDomain.reset === 'function') {
      this.weaponDomain.reset();
    }
    if (this.enemyDomain && typeof this.enemyDomain.reset === 'function') {
      this.enemyDomain.reset();
    }
    if (this.baseDomain && typeof this.baseDomain.reset === 'function') {
      this.baseDomain.reset();
    }
    if (this.waveDomain && typeof this.waveDomain.reset === 'function') {
      this.waveDomain.reset();
    }
    
    // Reset pause state
    this.isPaused = false;
    this.lastPauseKeyTime = 0;
    
    // Reset game state
    this.initializeGameState();
    this.clearEvents();
    this.clearAllDomainEvents();
  }

  setGameRunning(running: boolean): void {
    this.gameState.gameRunning = running;
  }

  setLevelUp(levelUp: boolean): void {
    this.gameState.levelUp = levelUp;
  }

  startNextWave(): void {
    // Start the next wave in WaveDomain first (this will skip current phase)
    this.waveDomain.startNextWave();
    
    // Reset enemy tracking for new wave
    this.enemyDomain.startNextWave();
    
    // Restore player health to full for the new wave
    this.gameState.player = this.playerDomain.restoreHealth(this.gameState.player);
    
    // Add a wave start event to ensure UI updates
    this.events.push({
      type: 'WAVE_STARTED_WITH_HEALTH_RESET',
      data: { playerHealth: this.gameState.player.health, playerMaxHealth: this.gameState.player.maxHealth },
      timestamp: Date.now()
    });
  }

  isWaveReadyToStart(): boolean {
    return this.enemyDomain.isWaveReadyToStart();
  }

  isWaveInProgress(): boolean {
    return this.enemyDomain.isWaveInProgress();
  }

  getCurrentWaveStatus(): { enemiesSpawned: number; enemiesAlive: number; waveSize: number } {
    return this.enemyDomain.getCurrentWaveStatus();
  }

  getCurrentAmmo(): number {
    return this.weaponDomain.getCurrentAmmo();
  }

  getMaxAmmo(): number {
    return this.weaponDomain.getMaxAmmo();
  }

  refillAmmo(): void {
    this.weaponDomain.refillAmmo();
  }

  private handlePauseInput(keysPressed: Record<string, boolean>): void {
    const now = Date.now();
    const pauseKey = this.config.movement.keyBindings.pause;
    
    // Check for either P key or ESCAPE key
    if ((keysPressed[pauseKey] || keysPressed['Escape']) && now - this.lastPauseKeyTime > 300) { // 300ms debounce
      this.isPaused = !this.isPaused;
      this.lastPauseKeyTime = now;
      
      this.events.push({
        type: this.isPaused ? 'GAME_PAUSED' : 'GAME_RESUMED',
        data: { paused: this.isPaused },
        timestamp: now
      });
    }
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  getCurrentWave(): number {
    return this.waveDomain.getCurrentWaveNumber();
  }

  getWavePhase(): string {
    return this.waveDomain.getPhase();
  }

  getWaveTimeRemaining(): number {
    return this.waveDomain.getPhaseTimeRemaining();
  }

  spawnDevEnemy(enemyType: string): void {
    // Create enemy using EnemyDomain
    const canvasWidth = this.config.canvas.width;
    const canvasHeight = this.config.canvas.height;
    const currentWave = this.waveDomain.getCurrentWaveNumber();
    
    // Import EnemyType enum
    let type: any;
    switch (enemyType) {
      case 'basic':
        type = 'basic';
        break;
      case 'elite':
        type = 'elite';
        break;
      case 'boss':
        type = 'boss';
        break;
      default:
        type = 'basic';
    }
    
    // Manually create enemy (bypassing normal spawn logic)
    const enemy = this.createDevEnemy(canvasWidth, canvasHeight, type, currentWave);
    this.gameState.enemies.push(enemy);
    
    this.events.push({
      type: 'DEV_ENEMY_SPAWNED',
      data: { enemy, type: enemyType },
      timestamp: Date.now()
    });
  }

  private createDevEnemy(canvasWidth: number, canvasHeight: number, enemyType: string, waveNumber: number): any {
    // Always spawn from right side
    const x = canvasWidth + 20;
    const y = Math.random() * canvasHeight;
    
    // Get enemy type configuration from config
    let typeConfig: any;
    switch (enemyType) {
      case 'basic':
        typeConfig = this.config.enemies.basic;
        break;
      case 'elite':
        typeConfig = this.config.enemies.elite;
        break;
      case 'boss':
        typeConfig = this.config.enemies.boss;
        break;
      default:
        typeConfig = this.config.enemies.basic;
    }
    
    // Apply wave scaling to base stats
    const scaledHealth = Math.floor(typeConfig.health * Math.pow(1.15, waveNumber - 1));
    const scaledSpeed = typeConfig.speed * Math.pow(1.05, waveNumber - 1);
    
    return {
      x,
      y,
      vx: 0,
      vy: 0,
      type: enemyType,
      size: typeConfig.size,
      color: typeConfig.color,
      speed: scaledSpeed + Math.random() * this.config.enemies.speedVariation,
      health: scaledHealth,
      maxHealth: scaledHealth,
      experienceValue: typeConfig.experienceValue,
      waveNumber
    };
  }
}