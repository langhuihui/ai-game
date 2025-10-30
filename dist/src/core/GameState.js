/**
 * GameState - Global game state and configuration
 * Singleton that holds game-wide state and provides access to managers
 */
import { eventManager } from './EventManager.js';
import { entityManager } from './EntityManager.js';
import { behaviorManager } from './BehaviorManager.js';
import { bundleLoader } from './BundleLoader.js';
export class GameState {
    static instance;
    _config;
    _eventManager;
    _entityManager;
    _behaviorManager;
    _bundleLoader;
    _started = false;
    _startTime;
    constructor() {
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
    static getInstance() {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }
    /**
     * Initialize game state with configuration
     */
    async initialize(config = {}) {
        this._config = {
            ...this._config,
            ...config
        };
        // Load bundles if specified
        if (this._config.bundles && this._config.bundles.length > 0) {
            for (const bundlePath of this._config.bundles) {
                try {
                    await this._bundleLoader.load(bundlePath);
                }
                catch (error) {
                    console.error(`Failed to load bundle ${bundlePath}:`, error);
                }
            }
        }
        await this._eventManager.emit('game:initialized', this);
    }
    /**
     * Start the game
     */
    async start() {
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
    async stop() {
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
    getConfig() {
        return { ...this._config };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this._config = {
            ...this._config,
            ...config
        };
    }
    /**
     * Get event manager
     */
    getEventManager() {
        return this._eventManager;
    }
    /**
     * Get entity manager
     */
    getEntityManager() {
        return this._entityManager;
    }
    /**
     * Get behavior manager
     */
    getBehaviorManager() {
        return this._behaviorManager;
    }
    /**
     * Get bundle loader
     */
    getBundleLoader() {
        return this._bundleLoader;
    }
    /**
     * Check if game is started
     */
    isStarted() {
        return this._started;
    }
    /**
     * Get uptime in milliseconds
     */
    getUptime() {
        if (!this._startTime)
            return 0;
        return Date.now() - this._startTime.getTime();
    }
    /**
     * Get start time
     */
    getStartTime() {
        return this._startTime;
    }
    /**
     * Debug log (only if debug is enabled)
     */
    debug(...args) {
        if (this._config.debug) {
            console.log('[GameState]', ...args);
        }
    }
}
// Export singleton getter
export const getGameState = () => GameState.getInstance();
//# sourceMappingURL=GameState.js.map