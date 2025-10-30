/**
 * GameState - Global game state and configuration
 * Singleton that holds game-wide state and provides access to managers
 */
import { EventManager } from './EventManager.js';
import { EntityManager } from './EntityManager.js';
import { BehaviorManager } from './BehaviorManager.js';
import { BundleLoader } from './BundleLoader.js';
export interface GameConfig {
    bundles: string[];
    enabledBundles?: string[];
    debug?: boolean;
    [key: string]: any;
}
export declare class GameState {
    private static instance;
    private _config;
    private _eventManager;
    private _entityManager;
    private _behaviorManager;
    private _bundleLoader;
    private _started;
    private _startTime?;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): GameState;
    /**
     * Initialize game state with configuration
     */
    initialize(config?: Partial<GameConfig>): Promise<void>;
    /**
     * Start the game
     */
    start(): Promise<void>;
    /**
     * Stop the game
     */
    stop(): Promise<void>;
    /**
     * Get configuration
     */
    getConfig(): GameConfig;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<GameConfig>): void;
    /**
     * Get event manager
     */
    getEventManager(): EventManager;
    /**
     * Get entity manager
     */
    getEntityManager(): EntityManager;
    /**
     * Get behavior manager
     */
    getBehaviorManager(): BehaviorManager;
    /**
     * Get bundle loader
     */
    getBundleLoader(): BundleLoader;
    /**
     * Check if game is started
     */
    isStarted(): boolean;
    /**
     * Get uptime in milliseconds
     */
    getUptime(): number;
    /**
     * Get start time
     */
    getStartTime(): Date | undefined;
    /**
     * Debug log (only if debug is enabled)
     */
    debug(...args: any[]): void;
}
export declare const getGameState: () => GameState;
//# sourceMappingURL=GameState.d.ts.map