/**
 * BundleLoader - Loads and manages bundles
 * Bundles are modular packages containing commands, behaviors, entities, and events
 */
export interface BundleManifest {
    name: string;
    version: string;
    description?: string;
    author?: string;
    dependencies?: string[];
    commands?: string[];
    behaviors?: {
        [entityType: string]: string[];
    };
    entities?: string[];
    events?: string[];
}
export interface LoadedBundle {
    manifest: BundleManifest;
    path: string;
    commands: Map<string, any>;
    behaviors: Map<string, any>;
    entities: Map<string, any>;
    eventListeners: any[];
}
export declare class BundleLoader {
    private bundles;
    private bundleOrder;
    /**
     * Load a bundle from a directory
     */
    load(bundlePath: string): Promise<LoadedBundle>;
    /**
     * Unload a bundle
     */
    unload(bundleName: string): Promise<boolean>;
    /**
     * Load commands from bundle
     */
    private loadCommands;
    /**
     * Load behaviors from bundle
     */
    private loadBehaviors;
    /**
     * Load entities from bundle
     */
    private loadEntities;
    /**
     * Load event listeners from bundle
     */
    private loadEvents;
    /**
     * Get a loaded bundle
     */
    get(bundleName: string): LoadedBundle | undefined;
    /**
     * Check if a bundle is loaded
     */
    has(bundleName: string): boolean;
    /**
     * Get all loaded bundles
     */
    getAll(): LoadedBundle[];
    /**
     * Get bundle names in load order
     */
    getBundleOrder(): string[];
    /**
     * Get all commands from all bundles
     */
    getAllCommands(): Map<string, any>;
    /**
     * Get command from any bundle
     */
    getCommand(commandName: string): any;
}
export declare const bundleLoader: BundleLoader;
//# sourceMappingURL=BundleLoader.d.ts.map