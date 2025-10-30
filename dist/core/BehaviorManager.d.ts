/**
 * BehaviorManager - Manages and executes behaviors
 * Behaviors are reusable scripts that define entity functionality
 */
import { Entity } from './Entity.js';
export interface BehaviorDefinition {
    name: string;
    description?: string;
    execute: (entity: Entity, ...args: any[]) => Promise<any> | any;
}
export declare class BehaviorManager {
    private behaviors;
    private behaviorsByType;
    /**
     * Register a behavior
     */
    register(type: string, behavior: BehaviorDefinition): void;
    /**
     * Unregister a behavior
     */
    unregister(type: string, name: string): boolean;
    /**
     * Get a behavior definition
     */
    get(type: string, name: string): BehaviorDefinition | undefined;
    /**
     * Check if a behavior exists
     */
    has(type: string, name: string): boolean;
    /**
     * Get all behaviors for a type
     */
    getByType(type: string): BehaviorDefinition[];
    /**
     * Attach a behavior to an entity
     */
    attach(entity: Entity, behaviorName: string): boolean;
    /**
     * Detach a behavior from an entity
     */
    detach(entity: Entity, behaviorName: string): boolean;
    /**
     * Load behavior from file
     */
    loadFromFile(type: string, filePath: string): Promise<void>;
    /**
     * Get all registered behavior names by type
     */
    getAllBehaviorNames(): Map<string, string[]>;
    /**
     * Clear all behaviors
     */
    clear(): void;
}
export declare const behaviorManager: BehaviorManager;
//# sourceMappingURL=BehaviorManager.d.ts.map