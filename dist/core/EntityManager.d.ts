/**
 * EntityManager - Manages all game entities
 * Provides CRUD operations and wraps existing services
 */
import { Entity } from './Entity.js';
import { CharacterService } from '../services/CharacterService.js';
import { SceneService } from '../services/SceneService.js';
import { ItemService } from '../services/ItemService.js';
import { MemoryService } from '../services/MemoryService.js';
export type EntityType = 'character' | 'scene' | 'item' | 'memory';
export declare class EntityManager {
    private entities;
    private characterService;
    private sceneService;
    private itemService;
    private memoryService;
    constructor();
    /**
     * Generate entity key
     */
    private getKey;
    /**
     * Register an entity
     */
    register(entity: Entity): void;
    /**
     * Unregister an entity
     */
    unregister(type: EntityType, id: number | string): boolean;
    /**
     * Get an entity by type and id
     */
    get(type: EntityType, id: number | string): Entity | undefined;
    /**
     * Get all entities of a type
     */
    getByType(type: EntityType): Entity[];
    /**
     * Check if entity exists
     */
    has(type: EntityType, id: number | string): boolean;
    /**
     * Get all entities
     */
    getAll(): Entity[];
    /**
     * Clear all entities
     */
    clear(): void;
    /**
     * Get entity count
     */
    count(): number;
    /**
     * Get entity count by type
     */
    countByType(type: EntityType): number;
    getCharacterService(): CharacterService;
    getSceneService(): SceneService;
    getItemService(): ItemService;
    getMemoryService(): MemoryService;
    /**
     * Create a character entity
     */
    createCharacter(data: any): Promise<any>;
    /**
     * Get character by id
     */
    getCharacter(id: number): any;
    /**
     * Update character
     */
    updateCharacter(id: number, data: any): Promise<any>;
    /**
     * Delete character
     */
    deleteCharacter(id: number): Promise<boolean>;
    /**
     * Create a scene entity
     */
    createScene(data: any): Promise<any>;
    /**
     * Get scene by id
     */
    getScene(id: number): any;
    /**
     * Get scene details
     */
    getSceneDetails(id: number): any;
    /**
     * Create an item entity
     */
    createItem(data: any): Promise<any>;
    /**
     * Get item by id
     */
    getItem(id: number): any;
    /**
     * Move character to scene
     */
    moveCharacter(characterId: number, sceneId: number): Promise<any>;
    /**
     * Use an item
     */
    useItem(itemId: number, characterId: number): Promise<any>;
    /**
     * Pick up an item
     */
    pickItem(itemId: number, characterId: number): Promise<any>;
    /**
     * Drop an item
     */
    dropItem(itemId: number, sceneId: number): Promise<any>;
}
export declare const entityManager: EntityManager;
//# sourceMappingURL=EntityManager.d.ts.map