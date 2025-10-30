/**
 * BehaviorManager - Manages and executes behaviors
 * Behaviors are reusable scripts that define entity functionality
 */
import { pathToFileURL } from 'url';
import { resolve } from 'path';
export class BehaviorManager {
    behaviors = new Map();
    behaviorsByType = new Map();
    /**
     * Register a behavior
     */
    register(type, behavior) {
        const key = `${type}:${behavior.name}`;
        this.behaviors.set(key, behavior);
        if (!this.behaviorsByType.has(type)) {
            this.behaviorsByType.set(type, new Set());
        }
        this.behaviorsByType.get(type).add(behavior.name);
    }
    /**
     * Unregister a behavior
     */
    unregister(type, name) {
        const key = `${type}:${name}`;
        const removed = this.behaviors.delete(key);
        if (removed) {
            this.behaviorsByType.get(type)?.delete(name);
        }
        return removed;
    }
    /**
     * Get a behavior definition
     */
    get(type, name) {
        const key = `${type}:${name}`;
        return this.behaviors.get(key);
    }
    /**
     * Check if a behavior exists
     */
    has(type, name) {
        const key = `${type}:${name}`;
        return this.behaviors.has(key);
    }
    /**
     * Get all behaviors for a type
     */
    getByType(type) {
        const names = this.behaviorsByType.get(type);
        if (!names)
            return [];
        return Array.from(names)
            .map(name => this.get(type, name))
            .filter((b) => b !== undefined);
    }
    /**
     * Attach a behavior to an entity
     */
    attach(entity, behaviorName) {
        const behavior = this.get(entity.type, behaviorName);
        if (!behavior) {
            console.warn(`Behavior ${entity.type}:${behaviorName} not found`);
            return false;
        }
        const entityBehavior = {
            name: behavior.name,
            execute: async (...args) => {
                return await behavior.execute(entity, ...args);
            }
        };
        entity.addBehavior(behaviorName, entityBehavior);
        return true;
    }
    /**
     * Detach a behavior from an entity
     */
    detach(entity, behaviorName) {
        return entity.removeBehavior(behaviorName);
    }
    /**
     * Load behavior from file
     */
    async loadFromFile(type, filePath) {
        try {
            const absolutePath = resolve(filePath);
            const fileUrl = pathToFileURL(absolutePath).href;
            const module = await import(fileUrl);
            const behavior = module.default || module;
            if (!behavior.name || !behavior.execute) {
                throw new Error(`Invalid behavior module: ${filePath}. Must export name and execute function.`);
            }
            this.register(type, behavior);
        }
        catch (error) {
            console.error(`Failed to load behavior from ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Get all registered behavior names by type
     */
    getAllBehaviorNames() {
        const result = new Map();
        for (const [type, names] of this.behaviorsByType.entries()) {
            result.set(type, Array.from(names));
        }
        return result;
    }
    /**
     * Clear all behaviors
     */
    clear() {
        this.behaviors.clear();
        this.behaviorsByType.clear();
    }
}
// Export singleton instance
export const behaviorManager = new BehaviorManager();
//# sourceMappingURL=BehaviorManager.js.map