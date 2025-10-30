/**
 * EntityManager - Manages all game entities
 * Provides CRUD operations and wraps existing services
 */

import { Entity } from './Entity.js';
import { CharacterService } from '../services/CharacterService.js';
import { SceneService } from '../services/SceneService.js';
import { ItemService } from '../services/ItemService.js';
import { MemoryService } from '../services/MemoryService.js';
import { eventManager } from './EventManager.js';

export type EntityType = 'character' | 'scene' | 'item' | 'memory';

export class EntityManager {
  private entities: Map<string, Entity> = new Map();

  // Service references
  private characterService: CharacterService;
  private sceneService: SceneService;
  private itemService: ItemService;
  private memoryService: MemoryService;

  constructor() {
    this.characterService = new CharacterService();
    this.sceneService = new SceneService();
    this.itemService = new ItemService();
    this.memoryService = new MemoryService();
  }

  /**
   * Generate entity key
   */
  private getKey(type: EntityType, id: number | string): string {
    return `${type}:${id}`;
  }

  /**
   * Register an entity
   */
  register(entity: Entity): void {
    const key = this.getKey(entity.type as EntityType, entity.id);
    this.entities.set(key, entity);
  }

  /**
   * Unregister an entity
   */
  unregister(type: EntityType, id: number | string): boolean {
    const key = this.getKey(type, id);
    return this.entities.delete(key);
  }

  /**
   * Get an entity by type and id
   */
  get(type: EntityType, id: number | string): Entity | undefined {
    const key = this.getKey(type, id);
    return this.entities.get(key);
  }

  /**
   * Get all entities of a type
   */
  getByType(type: EntityType): Entity[] {
    const prefix = `${type}:`;
    const entities: Entity[] = [];

    for (const [key, entity] of this.entities.entries()) {
      if (key.startsWith(prefix)) {
        entities.push(entity);
      }
    }

    return entities;
  }

  /**
   * Check if entity exists
   */
  has(type: EntityType, id: number | string): boolean {
    const key = this.getKey(type, id);
    return this.entities.has(key);
  }

  /**
   * Get all entities
   */
  getAll(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Clear all entities
   */
  clear(): void {
    this.entities.clear();
  }

  /**
   * Get entity count
   */
  count(): number {
    return this.entities.size;
  }

  /**
   * Get entity count by type
   */
  countByType(type: EntityType): number {
    return this.getByType(type).length;
  }

  // Service accessors
  getCharacterService(): CharacterService {
    return this.characterService;
  }

  getSceneService(): SceneService {
    return this.sceneService;
  }

  getItemService(): ItemService {
    return this.itemService;
  }

  getMemoryService(): MemoryService {
    return this.memoryService;
  }

  /**
   * Create a character entity
   */
  async createCharacter(data: any): Promise<any> {
    const character = this.characterService.createCharacter(data);
    await eventManager.emit('character:created', character);
    return character;
  }

  /**
   * Get character by id
   */
  getCharacter(id: number): any {
    return this.characterService.getCharacterById(id);
  }

  /**
   * Update character
   */
  async updateCharacter(id: number, data: any): Promise<any> {
    const oldCharacter = this.characterService.getCharacterById(id);
    const character = this.characterService.updateCharacter(id, data);

    if (character) {
      await eventManager.emit('character:updated', character, oldCharacter);
    }

    return character;
  }

  /**
   * Delete character
   */
  async deleteCharacter(id: number): Promise<boolean> {
    const character = this.characterService.getCharacterById(id);
    const result = this.characterService.deleteCharacter(id);

    if (result && character) {
      await eventManager.emit('character:deleted', character);
    }

    return result;
  }

  /**
   * Create a scene entity
   */
  async createScene(data: any): Promise<any> {
    const scene = this.sceneService.createScene(data);
    await eventManager.emit('scene:created', scene);
    return scene;
  }

  /**
   * Get scene by id
   */
  getScene(id: number): any {
    return this.sceneService.getSceneById(id);
  }

  /**
   * Get scene details
   */
  getSceneDetails(id: number): any {
    return this.sceneService.getSceneDetails(id);
  }

  /**
   * Create an item entity
   */
  async createItem(data: any): Promise<any> {
    const item = this.itemService.createItem(data);
    await eventManager.emit('item:created', item);
    return item;
  }

  /**
   * Get item by id
   */
  getItem(id: number): any {
    return this.itemService.getItemById(id);
  }

  /**
   * Move character to scene
   */
  async moveCharacter(characterId: number, sceneId: number): Promise<any> {
    const character = this.characterService.getCharacterById(characterId);
    const scene = this.sceneService.getSceneById(sceneId);
    const oldSceneId = character?.current_scene_id;

    const result = this.characterService.moveCharacter(characterId, sceneId);

    if (result) {
      await eventManager.emit('character:move', result, oldSceneId, sceneId, scene);
    }

    return result;
  }

  /**
   * Use an item
   */
  async useItem(itemId: number, characterId: number): Promise<any> {
    const item = this.itemService.getItemById(itemId);
    const character = this.characterService.getCharacterById(characterId);

    if (!item || !character) {
      return null;
    }

    await eventManager.emit('item:before-use', item, character);

    const result = this.itemService.useItem(itemId, characterId);

    if (result) {
      await eventManager.emit('item:used', result.item, character, result.effect);
    }

    return result;
  }

  /**
   * Pick up an item
   */
  async pickItem(itemId: number, characterId: number): Promise<any> {
    const item = this.itemService.getItemById(itemId);
    const character = this.characterService.getCharacterById(characterId);

    if (!item || !character) {
      return null;
    }

    const result = this.itemService.pickItem(itemId, characterId);

    if (result) {
      await eventManager.emit('item:picked', result, character);
    }

    return result;
  }

  /**
   * Drop an item
   */
  async dropItem(itemId: number, sceneId: number): Promise<any> {
    const item = this.itemService.getItemById(itemId);
    const scene = this.sceneService.getSceneById(sceneId);

    if (!item || !scene) {
      return null;
    }

    const result = this.itemService.dropItem(itemId, sceneId);

    if (result) {
      await eventManager.emit('item:dropped', result, scene);
    }

    return result;
  }
}

// Export singleton instance
export const entityManager = new EntityManager();

