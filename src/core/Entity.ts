/**
 * Entity - Base class for all game entities
 * Provides behavior support and common entity functionality
 */

import { EventManager, eventManager } from './EventManager.js';
import { BehaviorManager } from './BehaviorManager.js';

export interface EntityMetadata {
  [key: string]: any;
}

export interface EntityBehavior {
  name: string;
  execute: (entity: Entity, ...args: any[]) => Promise<any> | any;
}

export abstract class Entity {
  protected _id: number | string;
  protected _type: string;
  protected _metadata: EntityMetadata = {};
  protected _behaviors: Map<string, EntityBehavior> = new Map();
  protected eventManager: EventManager;

  constructor(id: number | string, type: string, eventMgr?: EventManager) {
    this._id = id;
    this._type = type;
    this.eventManager = eventMgr || eventManager;
  }

  get id(): number | string {
    return this._id;
  }

  get type(): string {
    return this._type;
  }

  /**
   * Get metadata value
   */
  getMeta(key: string): any {
    return this._metadata[key];
  }

  /**
   * Set metadata value
   */
  setMeta(key: string, value: any): void {
    this._metadata[key] = value;
  }

  /**
   * Get all metadata
   */
  getAllMeta(): EntityMetadata {
    return { ...this._metadata };
  }

  /**
   * Attach a behavior to this entity
   */
  addBehavior(name: string, behavior: EntityBehavior): void {
    this._behaviors.set(name, behavior);
  }

  /**
   * Remove a behavior from this entity
   */
  removeBehavior(name: string): boolean {
    return this._behaviors.delete(name);
  }

  /**
   * Check if entity has a behavior
   */
  hasBehavior(name: string): boolean {
    return this._behaviors.has(name);
  }

  /**
   * Get a behavior
   */
  getBehavior(name: string): EntityBehavior | undefined {
    return this._behaviors.get(name);
  }

  /**
   * Get all behaviors
   */
  getBehaviors(): EntityBehavior[] {
    return Array.from(this._behaviors.values());
  }

  /**
   * Execute a behavior
   */
  async executeBehavior(name: string, ...args: any[]): Promise<any> {
    const behavior = this._behaviors.get(name);
    if (!behavior) {
      throw new Error(`Behavior "${name}" not found on entity ${this._type}:${this._id}`);
    }

    return await behavior.execute(this, ...args);
  }

  /**
   * Execute all behaviors matching a pattern
   */
  async executeBehaviors(pattern: string | RegExp, ...args: any[]): Promise<any[]> {
    const results: any[] = [];
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const [name, behavior] of this._behaviors.entries()) {
      if (regex.test(name)) {
        try {
          const result = await behavior.execute(this, ...args);
          results.push(result);
        } catch (error) {
          console.error(`Error executing behavior ${name} on entity ${this._type}:${this._id}:`, error);
        }
      }
    }

    return results;
  }

  /**
   * Emit an event related to this entity
   */
  async emit(event: string, ...args: any[]): Promise<void> {
    const fullEvent = `${this._type}:${event}`;
    await this.eventManager.emit(fullEvent, this, ...args);
  }

  /**
   * Listen to events related to this entity
   */
  on(event: string, listener: (...args: any[]) => void | Promise<void>, priority?: number): void {
    const fullEvent = `${this._type}:${event}`;
    this.eventManager.on(fullEvent, listener, priority);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void | Promise<void>): void {
    const fullEvent = `${this._type}:${event}`;
    this.eventManager.off(fullEvent, listener);
  }

  /**
   * Serialize entity to plain object
   */
  abstract toJSON(): any;

  /**
   * Hydrate entity from plain object
   */
  abstract fromJSON(data: any): void;
}

