/**
 * EventManager - Central event emitter for all game events
 * Inspired by RanvierMUD's event system
 */
export type EventListener = (...args: any[]) => void | Promise<void>;
export interface EventSubscription {
    event: string;
    listener: EventListener;
    priority?: number;
}
export declare class EventManager {
    private listeners;
    private wildcardListeners;
    /**
     * Register an event listener
     * @param event Event name (e.g., 'character:move', 'item:use')
     * @param listener Function to execute when event is emitted
     * @param priority Higher priority listeners execute first (default: 0)
     */
    on(event: string, listener: EventListener, priority?: number): void;
    /**
     * Register a one-time event listener
     */
    once(event: string, listener: EventListener, priority?: number): void;
    /**
     * Remove an event listener
     */
    off(event: string, listener: EventListener): void;
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event?: string): void;
    /**
     * Emit an event synchronously
     */
    emit(event: string, ...args: any[]): Promise<void>;
    /**
     * Emit an event and collect results from all listeners
     */
    emitWithResults<T = any>(event: string, ...args: any[]): Promise<T[]>;
    /**
     * Check if an event has listeners
     */
    hasListeners(event: string): boolean;
    /**
     * Get all registered event names
     */
    getEventNames(): string[];
    /**
     * Get listener count for an event
     */
    listenerCount(event: string): number;
}
export declare const eventManager: EventManager;
//# sourceMappingURL=EventManager.d.ts.map