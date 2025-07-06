import { Player, Enemy, Bullet, Particle, GameObject } from '../types/game';

export const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < (obj1.size + obj2.size) / 2;
};

export const isInBounds = (x: number, y: number, width: number, height: number): boolean => {
  return x >= 0 && x <= width && y >= 0 && y <= height;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const createEnemy = (canvasWidth: number, canvasHeight: number): Enemy => {
  const edge = Math.floor(Math.random() * 4);
  let x: number, y: number;
  
  switch (edge) {
    case 0: // top
      x = Math.random() * canvasWidth;
      y = -20;
      break;
    case 1: // right
      x = canvasWidth + 20;
      y = Math.random() * canvasHeight;
      break;
    case 2: // bottom
      x = Math.random() * canvasWidth;
      y = canvasHeight + 20;
      break;
    case 3: // left
      x = -20;
      y = Math.random() * canvasHeight;
      break;
    default:
      x = 0;
      y = 0;
  }
  
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    size: 6,
    color: '#ff0066',
    speed: 1 + Math.random() * 1.5,
    health: 1,
    experienceValue: 1
  };
};

export const createBullet = (player: Player): Bullet => {
  return {
    x: player.x,
    y: player.y - player.size,
    vx: 0,
    vy: -8,
    size: 3,
    color: '#00ff00',
    damage: 1
  };
};

export const createExplosion = (x: number, y: number, color: string): Particle[] => {
  const particles: Particle[] = [];
  const count = 8;
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 3;
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 2,
      color,
      life: 1,
      maxLife: 1
    });
  }
  
  return particles;
};

export const updateEnemyMovement = (enemy: Enemy, player: Player): Enemy => {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 0) {
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    return {
      ...enemy,
      x: enemy.x + normalizedDx * enemy.speed,
      y: enemy.y + normalizedDy * enemy.speed,
      vx: normalizedDx * enemy.speed,
      vy: normalizedDy * enemy.speed
    };
  }
  
  return enemy;
};

export const updateBullet = (bullet: Bullet): Bullet => {
  return {
    ...bullet,
    x: bullet.x + bullet.vx,
    y: bullet.y + bullet.vy
  };
};

export const updateParticle = (particle: Particle): Particle => {
  return {
    ...particle,
    x: particle.x + particle.vx,
    y: particle.y + particle.vy,
    life: particle.life - 0.02,
    vx: particle.vx * 0.98,
    vy: particle.vy * 0.98
  };
};

export const calculateLevelUp = (currentLevel: number, experience: number): { level: number; experienceToNext: number } => {
  let level = currentLevel;
  let expToNext = level * 10;
  
  while (experience >= expToNext) {
    level++;
    expToNext = level * 10;
  }
  
  return { level, experienceToNext: expToNext };
};