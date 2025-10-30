/**
 * CommandRegistry - Registry of all available commands from bundles
 * Maps command names to their implementations
 */

import { bundleLoader } from '../core/BundleLoader.js';

export interface Command {
  name: string;
  description: string;
  execute: (args: any) => Promise<any>;
}

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  /**
   * Register a command
   */
  register(command: Command): void {
    this.commands.set(command.name, command);
  }

  /**
   * Unregister a command
   */
  unregister(name: string): boolean {
    return this.commands.delete(name);
  }

  /**
   * Get a command by name
   */
  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /**
   * Check if a command exists
   */
  has(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * Get all registered commands
   */
  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Execute a command
   */
  async execute(name: string, args: any): Promise<any> {
    const command = this.commands.get(name);
    if (!command) {
      throw new Error(`Command not found: ${name}`);
    }

    return await command.execute(args);
  }

  /**
   * Load commands from bundles
   */
  loadFromBundles(): void {
    const allCommands = bundleLoader.getAllCommands();

    for (const [name, commandModule] of allCommands.entries()) {
      // Get static properties from command class
      const commandClass = commandModule.default || commandModule;
      const staticName = commandClass.name || commandModule.name || name;
      const staticDescription = commandClass.description || commandModule.description || '';
      const staticInputSchema = commandClass.inputSchema || (commandModule as any).inputSchema;
      
      const command: Command = {
        name: staticName,
        description: staticDescription,
        execute: commandClass.execute.bind(commandClass)
      };

      // Attach inputSchema to command for ToolAdapter to use
      (command as any).inputSchema = staticInputSchema;

      this.register(command);
    }
  }

  /**
   * Get command names
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Clear all commands
   */
  clear(): void {
    this.commands.clear();
  }
}

// Export singleton instance
export const commandRegistry = new CommandRegistry();

