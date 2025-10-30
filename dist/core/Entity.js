/**
 * Entity - Base class for all game entities
 * Provides behavior support and common entity functionality
 */
import { eventManager } from './EventManager.js';
export class Entity {
    _id;
    _type;
    _metadata = {};
    _behaviors = new Map();
    eventManager;
    constructor(id, type, eventMgr) {
        this._id = id;
        this._type = type;
        this.eventManager = eventMgr || eventManager;
    }
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    /**
     * Get metadata value
     */
    getMeta(key) {
        return this._metadata[key];
    }
    /**
     * Set metadata value
     */
    setMeta(key, value) {
        this._metadata[key] = value;
    }
    /**
     * Get all metadata
     */
    getAllMeta() {
        return { ...this._metadata };
    }
    /**
     * Attach a behavior to this entity
     */
    addBehavior(name, behavior) {
        this._behaviors.set(name, behavior);
    }
    /**
     * Remove a behavior from this entity
     */
    removeBehavior(name) {
        return this._behaviors.delete(name);
    }
    /**
     * Check if entity has a behavior
     */
    hasBehavior(name) {
        return this._behaviors.has(name);
    }
    /**
     * Get a behavior
     */
    getBehavior(name) {
        return this._behaviors.get(name);
    }
    /**
     * Get all behaviors
     */
    getBehaviors() {
        return Array.from(this._behaviors.values());
    }
    /**
     * Execute a behavior
     */
    async executeBehavior(name, ...args) {
        const behavior = this._behaviors.get(name);
        if (!behavior) {
            throw new Error(`Behavior "${name}" not found on entity ${this._type}:${this._id}`);
        }
        return await behavior.execute(this, ...args);
    }
    /**
     * Execute all behaviors matching a pattern
     */
    async executeBehaviors(pattern, ...args) {
        const results = [];
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        for (const [name, behavior] of this._behaviors.entries()) {
            if (regex.test(name)) {
                try {
                    const result = await behavior.execute(this, ...args);
                    results.push(result);
                }
                catch (error) {
                    console.error(`Error executing behavior ${name} on entity ${this._type}:${this._id}:`, error);
                }
            }
        }
        return results;
    }
    /**
     * Emit an event related to this entity
     */
    async emit(event, ...args) {
        const fullEvent = `${this._type}:${event}`;
        await this.eventManager.emit(fullEvent, this, ...args);
    }
    /**
     * Listen to events related to this entity
     */
    on(event, listener, priority) {
        const fullEvent = `${this._type}:${event}`;
        this.eventManager.on(fullEvent, listener, priority);
    }
    /**
     * Remove event listener
     */
    off(event, listener) {
        const fullEvent = `${this._type}:${event}`;
        this.eventManager.off(fullEvent, listener);
    }
}
//# sourceMappingURL=Entity.js.map