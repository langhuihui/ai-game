/**
 * BundleLoader - Loads and manages bundles
 * Bundles are modular packages containing commands, behaviors, entities, and events
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { existsSync } from 'fs';
import { eventManager } from './EventManager.js';
import { behaviorManager } from './BehaviorManager.js';

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

export class BundleLoader {
  private bundles: Map<string, LoadedBundle> = new Map();
  private bundleOrder: string[] = [];

  /**
   * Load a bundle from a directory
   */
  async load(bundlePath: string): Promise<LoadedBundle> {
    const absolutePath = resolve(bundlePath);

    if (!existsSync(absolutePath)) {
      throw new Error(`Bundle path does not exist: ${bundlePath}`);
    }

    // Load manifest
    const manifestPath = join(absolutePath, 'manifest.json');
    if (!existsSync(manifestPath)) {
      throw new Error(`Bundle manifest not found: ${manifestPath}`);
    }

    const manifestContent = await readFile(manifestPath, 'utf-8');
    const manifest: BundleManifest = JSON.parse(manifestContent);

    // Check if already loaded
    if (this.bundles.has(manifest.name)) {
      console.warn(`Bundle ${manifest.name} already loaded, skipping...`);
      return this.bundles.get(manifest.name)!;
    }

    // Load dependencies first
    if (manifest.dependencies && manifest.dependencies.length > 0) {
      for (const dep of manifest.dependencies) {
        if (!this.bundles.has(dep)) {
          console.warn(`Dependency ${dep} not loaded for bundle ${manifest.name}`);
        }
      }
    }

    const bundle: LoadedBundle = {
      manifest,
      path: absolutePath,
      commands: new Map(),
      behaviors: new Map(),
      entities: new Map(),
      eventListeners: []
    };

    // Load commands
    await this.loadCommands(bundle);

    // Load behaviors
    await this.loadBehaviors(bundle);

    // Load entities
    await this.loadEntities(bundle);

    // Load event listeners
    await this.loadEvents(bundle);

    // Register bundle
    this.bundles.set(manifest.name, bundle);
    this.bundleOrder.push(manifest.name);

    await eventManager.emit('bundle:loaded', bundle);

    console.log(`Bundle loaded: ${manifest.name} v${manifest.version}`);

    return bundle;
  }

  /**
   * Unload a bundle
   */
  async unload(bundleName: string): Promise<boolean> {
    const bundle = this.bundles.get(bundleName);
    if (!bundle) {
      return false;
    }

    await eventManager.emit('bundle:unload', bundle);

    // Remove from registry
    this.bundles.delete(bundleName);
    const index = this.bundleOrder.indexOf(bundleName);
    if (index > -1) {
      this.bundleOrder.splice(index, 1);
    }

    console.log(`Bundle unloaded: ${bundleName}`);

    return true;
  }

  /**
   * Load commands from bundle
   */
  private async loadCommands(bundle: LoadedBundle): Promise<void> {
    const commandsPath = join(bundle.path, 'commands');
    if (!existsSync(commandsPath)) {
      return;
    }

    const files = await readdir(commandsPath);

    for (const file of files) {
      // Only load .js files (compiled from TypeScript)
      if (!file.endsWith('.js')) {
        continue;
      }

      const filePath = join(commandsPath, file);
      const fileUrl = pathToFileURL(filePath).href;

      try {
        const module = await import(fileUrl);
        const command = module.default || module;

        if (command.name) {
          bundle.commands.set(command.name, command);
        }
      } catch (error) {
        console.error(`Failed to load command from ${filePath}:`, error);
      }
    }
  }

  /**
   * Load behaviors from bundle
   */
  private async loadBehaviors(bundle: LoadedBundle): Promise<void> {
    const behaviorsPath = join(bundle.path, 'behaviors');
    if (!existsSync(behaviorsPath)) {
      return;
    }

    // Load behaviors organized by entity type
    const entityTypes = await readdir(behaviorsPath);

    for (const entityType of entityTypes) {
      const entityPath = join(behaviorsPath, entityType);
      const stats = await stat(entityPath);

      if (!stats.isDirectory()) {
        continue;
      }

      const files = await readdir(entityPath);

      for (const file of files) {
        // Only load .js files (compiled from TypeScript)
        if (!file.endsWith('.js')) {
          continue;
        }

        const filePath = join(entityPath, file);

        try {
          await behaviorManager.loadFromFile(entityType, filePath);
          bundle.behaviors.set(`${entityType}:${file}`, filePath);
        } catch (error) {
          console.error(`Failed to load behavior from ${filePath}:`, error);
        }
      }
    }
  }

  /**
   * Load entities from bundle
   */
  private async loadEntities(bundle: LoadedBundle): Promise<void> {
    const entitiesPath = join(bundle.path, 'entities');
    if (!existsSync(entitiesPath)) {
      return;
    }

    const files = await readdir(entitiesPath);

    for (const file of files) {
      // Only load .js files (compiled from TypeScript)
      if (!file.endsWith('.js')) {
        continue;
      }

      const filePath = join(entitiesPath, file);
      const fileUrl = pathToFileURL(filePath).href;

      try {
        const module = await import(fileUrl);
        const entity = module.default || module;

        if (entity.type) {
          bundle.entities.set(entity.type, entity);
        }
      } catch (error) {
        console.error(`Failed to load entity from ${filePath}:`, error);
      }
    }
  }

  /**
   * Load event listeners from bundle
   */
  private async loadEvents(bundle: LoadedBundle): Promise<void> {
    const eventsPath = join(bundle.path, 'events');
    if (!existsSync(eventsPath)) {
      return;
    }

    const files = await readdir(eventsPath);

    for (const file of files) {
      // Only load .js files (compiled from TypeScript)
      if (!file.endsWith('.js')) {
        continue;
      }

      const filePath = join(eventsPath, file);
      const fileUrl = pathToFileURL(filePath).href;

      try {
        const module = await import(fileUrl);
        const listener = module.default || module;

        // Event listeners should export an init function
        if (typeof listener.init === 'function') {
          await listener.init(eventManager);
          bundle.eventListeners.push(listener);
        }
      } catch (error) {
        console.error(`Failed to load event listener from ${filePath}:`, error);
      }
    }
  }

  /**
   * Get a loaded bundle
   */
  get(bundleName: string): LoadedBundle | undefined {
    return this.bundles.get(bundleName);
  }

  /**
   * Check if a bundle is loaded
   */
  has(bundleName: string): boolean {
    return this.bundles.has(bundleName);
  }

  /**
   * Get all loaded bundles
   */
  getAll(): LoadedBundle[] {
    return Array.from(this.bundles.values());
  }

  /**
   * Get bundle names in load order
   */
  getBundleOrder(): string[] {
    return [...this.bundleOrder];
  }

  /**
   * Get all commands from all bundles
   */
  getAllCommands(): Map<string, any> {
    const allCommands = new Map();

    for (const bundle of this.bundles.values()) {
      for (const [name, command] of bundle.commands.entries()) {
        allCommands.set(name, command);
      }
    }

    return allCommands;
  }

  /**
   * Get command from any bundle
   */
  getCommand(commandName: string): any {
    for (const bundle of this.bundles.values()) {
      if (bundle.commands.has(commandName)) {
        return bundle.commands.get(commandName);
      }
    }
    return undefined;
  }
}

// Export singleton instance
export const bundleLoader = new BundleLoader();

