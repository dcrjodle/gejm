import { Resource, ResourceType, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';
import { ResourceConfig } from '../../engine/types/config';

export class ResourceDomain implements DomainInterface<Resource> {
  private config: ResourceConfig;
  private events: GameEvent[] = [];

  constructor(config: ResourceConfig) {
    this.config = config;
  }

  update(entities: Resource[], deltaTime: number, gameState: any): DomainUpdate<Resource> {
    const { player } = gameState;
    
    // Update existing resources and handle pickup detection
    const updatedResources = entities
      .map(resource => this.updateResourceWithPickup(resource, deltaTime, player))
      .filter(resource => resource.life > 0 && !this.isPickupComplete(resource));

    return { entities: updatedResources, events: this.events };
  }

  configure(config: ResourceConfig): void {
    this.config = { ...this.config, ...config };
  }

  getEvents(): GameEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  createResource(x: number, y: number, type: ResourceType, value?: number): Resource {
    const resourceConfig = this.getResourceConfig(type);
    const resourceValue = value !== undefined ? value : this.getRandomValue(type);
    
    return {
      x,
      y,
      type,
      size: resourceConfig.size,
      color: resourceConfig.color,
      value: resourceValue,
      life: 10000, // 10 seconds
      maxLife: 10000,
      isBeingPickedUp: false
    };
  }

  createResourceDrop(x: number, y: number, enemyType: 'basic' | 'elite' | 'boss'): Resource[] {
    const resources: Resource[] = [];

    switch (enemyType) {
      case 'basic':
        if (Math.random() < this.config.energyCrystal.dropRate) {
          resources.push(this.createResource(x, y, ResourceType.ENERGY_CRYSTAL));
        }
        break;
      case 'elite':
        if (Math.random() < this.config.quantumCore.dropRate) {
          resources.push(this.createResource(x, y, ResourceType.QUANTUM_CORE));
        }
        // Elite enemies also have chance to drop energy crystals
        if (Math.random() < this.config.energyCrystal.dropRate * 0.5) {
          resources.push(this.createResource(x, y, ResourceType.ENERGY_CRYSTAL));
        }
        break;
      case 'boss':
        if (Math.random() < this.config.essenceFragment.dropRate) {
          resources.push(this.createResource(x, y, ResourceType.ESSENCE_FRAGMENT));
        }
        // Boss enemies also drop quantum cores and energy crystals
        if (Math.random() < this.config.quantumCore.dropRate * 2) {
          resources.push(this.createResource(x, y, ResourceType.QUANTUM_CORE));
        }
        if (Math.random() < this.config.energyCrystal.dropRate) {
          resources.push(this.createResource(x, y, ResourceType.ENERGY_CRYSTAL));
        }
        break;
    }

    return resources;
  }

  private getResourceConfig(type: ResourceType) {
    switch (type) {
      case ResourceType.ENERGY_CRYSTAL:
        return this.config.energyCrystal;
      case ResourceType.QUANTUM_CORE:
        return this.config.quantumCore;
      case ResourceType.ESSENCE_FRAGMENT:
        return this.config.essenceFragment;
      default:
        return this.config.energyCrystal; // fallback
    }
  }

  private getRandomValue(type: ResourceType): number {
    const config = this.getResourceConfig(type);
    if ('minValue' in config && 'maxValue' in config) {
      return Math.floor(Math.random() * (config.maxValue - config.minValue + 1)) + config.minValue;
    } else if ('value' in config) {
      return config.value;
    }
    return 1; // fallback
  }

  private updateResourceWithPickup(resource: Resource, deltaTime: number, player: any): Resource {
    let updatedResource = {
      ...resource,
      life: resource.life - deltaTime
    };

    // Calculate distance to player
    const dx = player.x - resource.x;
    const dy = player.y - resource.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Start pickup animation if close enough
    if (distance <= this.config.pickupDistance && !resource.isBeingPickedUp) {
      updatedResource.isBeingPickedUp = true;
      updatedResource.pickupStartTime = Date.now();
    }

    // Animate resource towards player if being picked up
    if (updatedResource.isBeingPickedUp && updatedResource.pickupStartTime) {
      const pickupProgress = Math.min(1, (Date.now() - updatedResource.pickupStartTime) / this.config.pickupDuration);
      
      // Lerp position towards player
      const lerpX = resource.x + (dx * pickupProgress * 0.8);
      const lerpY = resource.y + (dy * pickupProgress * 0.8);
      
      updatedResource.x = lerpX;
      updatedResource.y = lerpY;
      
      // Scale down as it gets picked up
      updatedResource.size = resource.size * (1 - pickupProgress * 0.5);

      // Trigger collection when animation is almost complete
      if (pickupProgress > 0.8) {
        this.events.push({
          type: 'RESOURCE_COLLECTED',
          data: { resource: updatedResource, value: updatedResource.value },
          timestamp: Date.now()
        });
      }
    }

    return updatedResource;
  }

  private isPickupComplete(resource: Resource): boolean {
    if (!resource.isBeingPickedUp || !resource.pickupStartTime) {
      return false;
    }
    const pickupProgress = (Date.now() - resource.pickupStartTime) / this.config.pickupDuration;
    return pickupProgress >= 1;
  }

  collectResource(resource: Resource): void {
    this.events.push({
      type: 'RESOURCE_COLLECTED',
      data: { resource, value: resource.value },
      timestamp: Date.now()
    });
  }
}