/**
 * Type declarations for bundle imports from core
 * These modules are compiled separately and available at runtime
 */

declare module '../../core/EventManager' {
  export const eventManager: any;
  export class EventManager {
    on(event: string, handler: Function, priority?: number): void;
    once(event: string, handler: Function): void;
    emit(event: string, ...args: any[]): Promise<void>;
    removeListener(event: string, handler: Function): void;
  }
}

declare module '../../core/EntityManager' {
  export const entityManager: any;
  export class EntityManager {
    getCharacter(id: number): any;
    getScene(id: number): any;
    getItem(id: number): any;
  }
}

declare module '../../core/BehaviorManager' {
  export interface EntityBehavior {
    listeners: Map<string, Function>;
  }
}

declare module '../../../core/Entity' {
  export class Entity {
    id: number | string;
    type: string;
    metadata: any;
    behaviors: Map<string, any>;
    emit(event: string, ...args: any[]): Promise<void>;
  }
}

declare module '../../../core/BehaviorManager' {
  export interface EntityBehavior {
    listeners: Map<string, Function>;
  }
}

declare module '../../../core/EventManager' {
  export const eventManager: any;
  export class EventManager {
    on(event: string, handler: Function, priority?: number): void;
    once(event: string, handler: Function): void;
    emit(event: string, ...args: any[]): Promise<void>;
    removeListener(event: string, handler: Function): void;
  }
}

declare module '../../../core/EntityManager' {
  export const entityManager: any;
  export class EntityManager {
    getCharacter(id: number): any;
    getScene(id: number): any;
    getItem(id: number): any;
  }
}

declare module '../../../models/Character' {
  export interface Character {
    id: number;
    name: string;
    health: number;
    mental_state: number;
    energy: number;
    stress: number;
    scene_id: number;
    inventory: string;
    last_action_time: string;
  }
}

