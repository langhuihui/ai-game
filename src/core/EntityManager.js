/**
 * EntityManager - Manages all game entities
 * Provides CRUD operations and wraps existing services
 */
import { CharacterService } from '../services/CharacterService.js';
import { SceneService } from '../services/SceneService.js';
import { ItemService } from '../services/ItemService.js';
import { MemoryService } from '../services/MemoryService.js';
import { eventManager } from './EventManager.js';
export class EntityManager {
    entities = new Map();
    // Service references
    characterService;
    sceneService;
    itemService;
    memoryService;
    constructor() {
        this.characterService = new CharacterService();
        this.sceneService = new SceneService();
        this.itemService = new ItemService();
        this.memoryService = new MemoryService();
    }
    /**
     * Generate entity key
     */
    getKey(type, id) {
        return `${type}:${id}`;
    }
    /**
     * Register an entity
     */
    register(entity) {
        const key = this.getKey(entity.type, entity.id);
        this.entities.set(key, entity);
    }
    /**
     * Unregister an entity
     */
    unregister(type, id) {
        const key = this.getKey(type, id);
        return this.entities.delete(key);
    }
    /**
     * Get an entity by type and id
     */
    get(type, id) {
        const key = this.getKey(type, id);
        return this.entities.get(key);
    }
    /**
     * Get all entities of a type
     */
    getByType(type) {
        const prefix = `${type}:`;
        const entities = [];
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
    has(type, id) {
        const key = this.getKey(type, id);
        return this.entities.has(key);
    }
    /**
     * Get all entities
     */
    getAll() {
        return Array.from(this.entities.values());
    }
    /**
     * Clear all entities
     */
    clear() {
        this.entities.clear();
    }
    /**
     * Get entity count
     */
    count() {
        return this.entities.size;
    }
    /**
     * Get entity count by type
     */
    countByType(type) {
        return this.getByType(type).length;
    }
    // Service accessors
    getCharacterService() {
        return this.characterService;
    }
    getSceneService() {
        return this.sceneService;
    }
    getItemService() {
        return this.itemService;
    }
    getMemoryService() {
        return this.memoryService;
    }
    /**
     * Create a character entity
     */
    async createCharacter(data) {
        const character = this.characterService.createCharacter(data);
        await eventManager.emit('character:created', character);
        return character;
    }
    /**
     * Get character by id
     */
    getCharacter(id) {
        return this.characterService.getCharacterById(id);
    }
    /**
     * Update character
     */
    async updateCharacter(id, data) {
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
    async deleteCharacter(id) {
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
    async createScene(data) {
        const scene = this.sceneService.createScene(data);
        await eventManager.emit('scene:created', scene);
        return scene;
    }
    /**
     * Get scene by id
     */
    getScene(id) {
        return this.sceneService.getSceneById(id);
    }
    /**
     * Get scene details
     */
    getSceneDetails(id) {
        return this.sceneService.getSceneDetails(id);
    }
    /**
     * Create an item entity
     */
    async createItem(data) {
        const item = this.itemService.createItem(data);
        await eventManager.emit('item:created', item);
        return item;
    }
    /**
     * Get item by id
     */
    getItem(id) {
        return this.itemService.getItemById(id);
    }
    /**
     * Move character to scene
     */
    async moveCharacter(characterId, sceneId) {
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
    async useItem(itemId, characterId) {
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
    async pickItem(itemId, characterId) {
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
    async dropItem(itemId, sceneId) {
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
//# sourceMappingURL=EntityManager.js.map