import { GameState, GameEvent } from './types';
import { GameConfig } from './types/config';
import { PlayerDomain } from '../domains/player';
import { EnemyDomain } from '../domains/enemies';
import { WeaponDomain } from '../domains/weapons';
import { MovementDomain } from '../domains/movement';
import { CanvasDomain } from '../domains/canvas';
import { ParticleDomain } from '../domains/particles';

export class GameEngine {
  private config: GameConfig;
  private playerDomain!: PlayerDomain;
  private enemyDomain!: EnemyDomain;
  private weaponDomain!: WeaponDomain;
  private movementDomain!: MovementDomain;
  private canvasDomain!: CanvasDomain;
  private particleDomain!: ParticleDomain;
  private gameState!: GameState;
  private events: GameEvent[] = [];

  constructor(config: GameConfig) {
    this.config = config;
    this.initializeDomains();
    this.initializeGameState();
  }

  private initializeDomains(): void {
    this.playerDomain = new PlayerDomain(this.config.player);
    this.enemyDomain = new EnemyDomain(this.config.enemies);
    this.weaponDomain = new WeaponDomain(this.config.weapons);
    this.movementDomain = new MovementDomain(this.config.movement);
    this.canvasDomain = new CanvasDomain(this.config.canvas);
    this.particleDomain = new ParticleDomain(this.config.particles);
  }

  private initializeGameState(): void {
    const player = this.playerDomain.createPlayer();
    
    this.gameState = {
      player,
      enemies: [],
      bullets: [],
      particles: [],
      gameRunning: true,
      gameOver: false,
      levelUp: false,
      canvasWidth: this.config.canvas.width,
      canvasHeight: this.config.canvas.height
    };
  }

  update(deltaTime: number, keysPressed: Record<string, boolean>): void {
    if (!this.gameState.gameRunning) return;

    const gameContext = {
      ...this.gameState,
      keysPressed,
      canvasWidth: this.config.canvas.width,
      canvasHeight: this.config.canvas.height
    };

    // Update movement first
    const movementUpdate = this.movementDomain.update([this.gameState.player], deltaTime, gameContext);
    this.gameState.player = movementUpdate.entities[0];
    this.collectEvents(movementUpdate.events);

    // Handle shooting
    if (this.movementDomain.isShootKeyPressed(keysPressed)) {
      const bullet = this.weaponDomain.shoot(this.gameState.player);
      if (bullet) {
        this.gameState.bullets.push(bullet);
      }
    }

    // Update enemies
    const enemyUpdate = this.enemyDomain.update(this.gameState.enemies, deltaTime, gameContext);
    this.gameState.enemies = enemyUpdate.entities;
    this.collectEvents(enemyUpdate.events);

    // Update bullets
    const bulletUpdate = this.weaponDomain.update(this.gameState.bullets, deltaTime, gameContext);
    this.gameState.bullets = bulletUpdate.entities;
    this.collectEvents(bulletUpdate.events);

    // Update particles
    const particleUpdate = this.particleDomain.update(this.gameState.particles, deltaTime, gameContext);
    this.gameState.particles = particleUpdate.entities;
    this.collectEvents(particleUpdate.events);

    // Handle collisions
    this.handleCollisions();

    // Update player (for leveling, etc.)
    const playerUpdate = this.playerDomain.update([this.gameState.player], deltaTime, gameContext);
    this.gameState.player = playerUpdate.entities[0];
    this.collectEvents(playerUpdate.events);

    // Check game over conditions
    if (this.gameState.player.health <= 0) {
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
          // Create explosion
          const explosionParticles = this.particleDomain.createExplosion(enemy.x, enemy.y, enemy.color);
          this.gameState.particles.push(...explosionParticles);
          
          // Remove entities
          this.gameState.bullets.splice(i, 1);
          this.gameState.enemies.splice(j, 1);
          
          // Give experience
          this.gameState.player = this.playerDomain.gainExperience(this.gameState.player, enemy.experienceValue);
          
          // Track events
          this.weaponDomain.destroyBullet(bullet);
          this.enemyDomain.destroyEnemy(enemy);
          break;
        }
      }
    }

    // Player-enemy collisions
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
      }
    }
  }

  private checkCollision(obj1: any, obj2: any): boolean {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.size + obj2.size) / 2;
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
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.canvasDomain.render(
      ctx,
      this.gameState.player,
      this.gameState.enemies,
      this.gameState.bullets,
      this.gameState.particles
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

    // Update canvas size if changed
    if (newConfig.canvas) {
      this.gameState.canvasWidth = newConfig.canvas.width || this.config.canvas.width;
      this.gameState.canvasHeight = newConfig.canvas.height || this.config.canvas.height;
    }
  }

  resetGame(): void {
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
}