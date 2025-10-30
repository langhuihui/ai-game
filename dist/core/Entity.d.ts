/**
 * Entity - Base class for all game entities
 * Provides behavior support and common entity functionality
 */
import { EventManager } from './EventManager.js';
export interface EntityMetadata {
    [key: string]: any;
}
export interface EntityBehavior {
    name: string;
    execute: (entity: Entity, ...args: any[]) => Promise<any> | any;
}
export declare abstract class Entity {
    protected _id: number | string;
    protected _type: string;
    protected _metadata: EntityMetadata;
    protected _behaviors: Map<string, EntityBehavior>;
    protected eventManager: EventManager;
    constructor(id: number | string, type: string, eventMgr?: EventManager);
    get id(): number | string;
    get type(): string;
    /**
     * Get metadata value
     */
    getMeta(key: string): any;
    /**
     * Set metadata value
     */
    setMeta(key: string, value: any): void;
    /**
     * Get all metadata
     */
    getAllMeta(): EntityMetadata;
    /**
     * Attach a behavior to this entity
     */
    addBehavior(name: string, behavior: EntityBehavior): void;
    /**
     * Remove a behavior from this entity
     */
    removeBehavior(name: string): boolean;
    /**
     * Check if entity has a behavior
     */
    hasBehavior(name: string): boolean;
    /**
     * Get a behavior
     */
    getBehavior(name: string): EntityBehavior | undefined;
    /**
     * Get all behaviors
     */
    getBehaviors(): EntityBehavior[];
    /**
     * Execute a behavior
     */
    executeBehavior(name: string, ...args: any[]): Promise<any>;
    /**
     * Execute all behaviors matching a pattern
     */
    executeBehaviors(pattern: string | RegExp, ...args: any[]): Promise<any[]>;
    /**
     * Emit an event related to this entity
     */
    emit(event: string, ...args: any[]): Promise<void>;
    /**
     * Listen to events related to this entity
     */
    on(event: string, listener: (...args: any[]) => void | Promise<void>, priority?: number): void;
    /**
     * Remove event listener
     */
    off(event: string, listener: (...args: any[]) => void | Promise<void>): void;
    /**
     * Serialize entity to plain object
     */
    abstract toJSON(): any;
    /**
     * Hydrate entity from plain object
     */
    abstract fromJSON(data: any): void;
}
//# sourceMappingURL=Entity.d.ts.map