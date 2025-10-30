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

export class EventManager {
  private listeners: Map<string, EventSubscription[]> = new Map();
  private wildcardListeners: EventListener[] = [];

  /**
   * Register an event listener
   * @param event Event name (e.g., 'character:move', 'item:use')
   * @param listener Function to execute when event is emitted
   * @param priority Higher priority listeners execute first (default: 0)
   */
  on(event: string, listener: EventListener, priority: number = 0): void {
    if (event === '*') {
      this.wildcardListeners.push(listener);
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const subscriptions = this.listeners.get(event)!;
    subscriptions.push({ event, listener, priority });

    // Sort by priority (higher first)
    subscriptions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Register a one-time event listener
   */
  once(event: string, listener: EventListener, priority: number = 0): void {
    const wrappedListener: EventListener = async (...args: any[]) => {
      await listener(...args);
      this.off(event, wrappedListener);
    };
    this.on(event, wrappedListener, priority);
  }

  /**
   * Remove an event listener
   */
  off(event: string, listener: EventListener): void {
    if (event === '*') {
      const index = this.wildcardListeners.indexOf(listener);
      if (index > -1) {
        this.wildcardListeners.splice(index, 1);
      }
      return;
    }

    const subscriptions = this.listeners.get(event);
    if (!subscriptions) return;

    const index = subscriptions.findIndex(sub => sub.listener === listener);
    if (index > -1) {
      subscriptions.splice(index, 1);
    }

    if (subscriptions.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
      this.wildcardListeners = [];
    }
  }

  /**
   * Emit an event synchronously
   */
  async emit(event: string, ...args: any[]): Promise<void> {
    // Execute wildcard listeners
    for (const listener of this.wildcardListeners) {
      try {
        await listener(event, ...args);
      } catch (error) {
        console.error(`Error in wildcard listener for event ${event}:`, error);
      }
    }

    // Execute specific event listeners
    const subscriptions = this.listeners.get(event);
    if (!subscriptions) return;

    for (const subscription of subscriptions) {
      try {
        await subscription.listener(...args);
      } catch (error) {
        console.error(`Error in listener for event ${event}:`, error);
      }
    }
  }

  /**
   * Emit an event and collect results from all listeners
   */
  async emitWithResults<T = any>(event: string, ...args: any[]): Promise<T[]> {
    const results: T[] = [];

    const subscriptions = this.listeners.get(event);
    if (!subscriptions) return results;

    for (const subscription of subscriptions) {
      try {
        const result = await subscription.listener(...args);
        if (result !== undefined) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Error in listener for event ${event}:`, error);
      }
    }

    return results;
  }

  /**
   * Check if an event has listeners
   */
  hasListeners(event: string): boolean {
    return (this.listeners.get(event)?.length || 0) > 0;
  }

  /**
   * Get all registered event names
   */
  getEventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.length || 0;
  }
}

// Export singleton instance
export const eventManager = new EventManager();

