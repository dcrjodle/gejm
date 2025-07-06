import { Resource, DomainInterface, DomainUpdate, GameEvent } from '../../engine/types';

export class ResourceDomain implements DomainInterface<Resource> {
  private events: GameEvent[] = [];

  update(entities: Resource[], deltaTime: number, gameState: any): DomainUpdate<Resource> {
    // Update existing resources (age them)
    const updatedResources = entities
      .map(resource => this.updateResource(resource, deltaTime))
      .filter(resource => resource.life > 0);

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
      maxLife: 10000
    };
  }

  private updateResource(resource: Resource, deltaTime: number): Resource {
    return {
      ...resource,
      life: resource.life - deltaTime
    };
  }

  collectResource(resource: Resource): void {
    this.events.push({
      type: 'RESOURCE_COLLECTED',
      data: { resource, value: resource.value },
      timestamp: Date.now()
    });
  }
}