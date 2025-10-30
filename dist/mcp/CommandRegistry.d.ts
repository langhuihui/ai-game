/**
 * CommandRegistry - Registry of all available commands from bundles
 * Maps command names to their implementations
 */
export interface Command {
    name: string;
    description: string;
    execute: (args: any) => Promise<any>;
}
export declare class CommandRegistry {
    private commands;
    /**
     * Register a command
     */
    register(command: Command): void;
    /**
     * Unregister a command
     */
    unregister(name: string): boolean;
    /**
     * Get a command by name
     */
    get(name: string): Command | undefined;
    /**
     * Check if a command exists
     */
    has(name: string): boolean;
    /**
     * Get all registered commands
     */
    getAll(): Command[];
    /**
     * Execute a command
     */
    execute(name: string, args: any): Promise<any>;
    /**
     * Load commands from bundles
     */
    loadFromBundles(): void;
    /**
     * Get command names
     */
    getCommandNames(): string[];
    /**
     * Clear all commands
     */
    clear(): void;
}
export declare const commandRegistry: CommandRegistry;
//# sourceMappingURL=CommandRegistry.d.ts.map