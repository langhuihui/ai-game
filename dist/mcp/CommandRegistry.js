/**
 * CommandRegistry - Registry of all available commands from bundles
 * Maps command names to their implementations
 */
import { bundleLoader } from '../core/BundleLoader.js';
export class CommandRegistry {
    commands = new Map();
    /**
     * Register a command
     */
    register(command) {
        this.commands.set(command.name, command);
    }
    /**
     * Unregister a command
     */
    unregister(name) {
        return this.commands.delete(name);
    }
    /**
     * Get a command by name
     */
    get(name) {
        return this.commands.get(name);
    }
    /**
     * Check if a command exists
     */
    has(name) {
        return this.commands.has(name);
    }
    /**
     * Get all registered commands
     */
    getAll() {
        return Array.from(this.commands.values());
    }
    /**
     * Execute a command
     */
    async execute(name, args) {
        const command = this.commands.get(name);
        if (!command) {
            throw new Error(`Command not found: ${name}`);
        }
        return await command.execute(args);
    }
    /**
     * Load commands from bundles
     */
    loadFromBundles() {
        const allCommands = bundleLoader.getAllCommands();
        for (const [name, commandModule] of allCommands.entries()) {
            // Get static properties from command class
            const commandClass = commandModule.default || commandModule;
            const staticName = commandClass.name || commandModule.name || name;
            const staticDescription = commandClass.description || commandModule.description || '';
            const staticInputSchema = commandClass.inputSchema || commandModule.inputSchema;
            const command = {
                name: staticName,
                description: staticDescription,
                execute: commandClass.execute.bind(commandClass)
            };
            // Attach inputSchema to command for ToolAdapter to use
            command.inputSchema = staticInputSchema;
            this.register(command);
        }
    }
    /**
     * Get command names
     */
    getCommandNames() {
        return Array.from(this.commands.keys());
    }
    /**
     * Clear all commands
     */
    clear() {
        this.commands.clear();
    }
}
// Export singleton instance
export const commandRegistry = new CommandRegistry();
//# sourceMappingURL=CommandRegistry.js.map