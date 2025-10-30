/**
 * BehaviorManager - Manages and executes behaviors
 * Behaviors are reusable scripts that define entity functionality
 */

import { Entity, EntityBehavior } from './Entity.js';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

export interface BehaviorDefinition {
  name: string;
  description?: string;
  execute: (entity: Entity, ...args: any[]) => Promise<any> | any;
}

export class BehaviorManager {
  private behaviors: Map<string, BehaviorDefinition> = new Map();
  private behaviorsByType: Map<string, Set<string>> = new Map();

  /**
   * Register a behavior
   */
  register(type: string, behavior: BehaviorDefinition): void {
    const key = `${type}:${behavior.name}`;
    this.behaviors.set(key, behavior);

    if (!this.behaviorsByType.has(type)) {
      this.behaviorsByType.set(type, new Set());
    }
    this.behaviorsByType.get(type)!.add(behavior.name);
  }

  /**
   * Unregister a behavior
   */
  unregister(type: string, name: string): boolean {
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
  get(type: string, name: string): BehaviorDefinition | undefined {
    const key = `${type}:${name}`;
    return this.behaviors.get(key);
  }

  /**
   * Check if a behavior exists
   */
  has(type: string, name: string): boolean {
    const key = `${type}:${name}`;
    return this.behaviors.has(key);
  }

  /**
   * Get all behaviors for a type
   */
  getByType(type: string): BehaviorDefinition[] {
    const names = this.behaviorsByType.get(type);
    if (!names) return [];

    return Array.from(names)
      .map(name => this.get(type, name))
      .filter((b): b is BehaviorDefinition => b !== undefined);
  }

  /**
   * Attach a behavior to an entity
   */
  attach(entity: Entity, behaviorName: string): boolean {
    const behavior = this.get(entity.type, behaviorName);
    if (!behavior) {
      console.warn(`Behavior ${entity.type}:${behaviorName} not found`);
      return false;
    }

    const entityBehavior: EntityBehavior = {
      name: behavior.name,
      execute: async (...args: any[]) => {
        return await behavior.execute(entity, ...args);
      }
    };

    entity.addBehavior(behaviorName, entityBehavior);
    return true;
  }

  /**
   * Detach a behavior from an entity
   */
  detach(entity: Entity, behaviorName: string): boolean {
    return entity.removeBehavior(behaviorName);
  }

  /**
   * Load behavior from file
   */
  async loadFromFile(type: string, filePath: string): Promise<void> {
    try {
      const absolutePath = resolve(filePath);
      const fileUrl = pathToFileURL(absolutePath).href;

      const module = await import(fileUrl);
      const behavior: BehaviorDefinition = module.default || module;

      if (!behavior.name || !behavior.execute) {
        throw new Error(`Invalid behavior module: ${filePath}. Must export name and execute function.`);
      }

      this.register(type, behavior);
    } catch (error) {
      console.error(`Failed to load behavior from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Get all registered behavior names by type
   */
  getAllBehaviorNames(): Map<string, string[]> {
    const result = new Map<string, string[]>();

    for (const [type, names] of this.behaviorsByType.entries()) {
      result.set(type, Array.from(names));
    }

    return result;
  }

  /**
   * Clear all behaviors
   */
  clear(): void {
    this.behaviors.clear();
    this.behaviorsByType.clear();
  }
}

// Export singleton instance
export const behaviorManager = new BehaviorManager();

