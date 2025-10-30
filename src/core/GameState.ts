/**
 * GameState - Global game state and configuration
 * Singleton that holds game-wide state and provides access to managers
 */

import { EventManager, eventManager } from './EventManager.js';
import { EntityManager, entityManager } from './EntityManager.js';
import { BehaviorManager, behaviorManager } from './BehaviorManager.js';
import { BundleLoader, bundleLoader } from './BundleLoader.js';

export interface GameConfig {
  bundles: string[];
  enabledBundles?: string[];
  debug?: boolean;
  [key: string]: any;
}

export class GameState {
  private static instance: GameState;

  private _config: GameConfig;
  private _eventManager: EventManager;
  private _entityManager: EntityManager;
  private _behaviorManager: BehaviorManager;
  private _bundleLoader: BundleLoader;
  private _started: boolean = false;
  private _startTime?: Date;

  private constructor() {
    this._config = {
      bundles: [],
      enabledBundles: [],
      debug: false
    };

    this._eventManager = eventManager;
    this._entityManager = entityManager;
    this._behaviorManager = behaviorManager;
    this._bundleLoader = bundleLoader;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  /**
   * Initialize game state with configuration
   */
  async initialize(config: Partial<GameConfig> = {}): Promise<void> {
    this._config = {
      ...this._config,
      ...config
    };

    // Load bundles if specified
    if (this._config.bundles && this._config.bundles.length > 0) {
      for (const bundlePath of this._config.bundles) {
        try {
          await this._bundleLoader.load(bundlePath);
        } catch (error) {
          console.error(`Failed to load bundle ${bundlePath}:`, error);
        }
      }
    }

    await this._eventManager.emit('game:initialized', this);
  }

  /**
   * Start the game
   */
  async start(): Promise<void> {
    if (this._started) {
      console.warn('Game already started');
      return;
    }

    this._started = true;
    this._startTime = new Date();

    await this._eventManager.emit('game:start', this);
  }

  /**
   * Stop the game
   */
  async stop(): Promise<void> {
    if (!this._started) {
      console.warn('Game not started');
      return;
    }

    await this._eventManager.emit('game:stop', this);

    this._started = false;
  }

  /**
   * Get configuration
   */
  getConfig(): GameConfig {
    return { ...this._config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GameConfig>): void {
    this._config = {
      ...this._config,
      ...config
    };
  }

  /**
   * Get event manager
   */
  getEventManager(): EventManager {
    return this._eventManager;
  }

  /**
   * Get entity manager
   */
  getEntityManager(): EntityManager {
    return this._entityManager;
  }

  /**
   * Get behavior manager
   */
  getBehaviorManager(): BehaviorManager {
    return this._behaviorManager;
  }

  /**
   * Get bundle loader
   */
  getBundleLoader(): BundleLoader {
    return this._bundleLoader;
  }

  /**
   * Check if game is started
   */
  isStarted(): boolean {
    return this._started;
  }

  /**
   * Get uptime in milliseconds
   */
  getUptime(): number {
    if (!this._startTime) return 0;
    return Date.now() - this._startTime.getTime();
  }

  /**
   * Get start time
   */
  getStartTime(): Date | undefined {
    return this._startTime;
  }

  /**
   * Debug log (only if debug is enabled)
   */
  debug(...args: any[]): void {
    if (this._config.debug) {
      console.log('[GameState]', ...args);
    }
  }
}

// Export singleton getter
export const getGameState = () => GameState.getInstance();

