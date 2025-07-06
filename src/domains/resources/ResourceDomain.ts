import { Resource, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';

export class ResourceDomain implements DomainInterface<Resource> {
  private events: GameEvent[] = [];
  private readonly PICKUP_DISTANCE = 40; // Distance to start pickup animation
  private readonly PICKUP_DURATION = 300; // Duration of pickup animation in ms

  update(entities: Resource[], deltaTime: number, gameState: any): DomainUpdate<Resource> {
    const { player } = gameState;
    
    // Update existing resources and handle pickup detection
    const updatedResources = entities
      .map(resource => this.updateResourceWithPickup(resource, deltaTime, player))
      .filter(resource => resource.life > 0 && !this.isPickupComplete(resource));

    return { entities: updatedResources, events: this.events };
  }

  configure(config: any): void {
    // Resources don't need configuration for now
  }

  getEvents(): GameEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  createResource(x: number, y: number, value: number = 5): Resource {
    return {
      x,
      y,
      size: 6,
      color: '#ffaa00',
      value,
      life: 10000, // 10 seconds
      maxLife: 10000,
      isBeingPickedUp: false
    };
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
    if (distance <= this.PICKUP_DISTANCE && !resource.isBeingPickedUp) {
      updatedResource.isBeingPickedUp = true;
      updatedResource.pickupStartTime = Date.now();
    }

    // Animate resource towards player if being picked up
    if (updatedResource.isBeingPickedUp && updatedResource.pickupStartTime) {
      const pickupProgress = Math.min(1, (Date.now() - updatedResource.pickupStartTime) / this.PICKUP_DURATION);
      
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
    const pickupProgress = (Date.now() - resource.pickupStartTime) / this.PICKUP_DURATION;
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