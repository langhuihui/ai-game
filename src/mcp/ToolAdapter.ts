/**
 * ToolAdapter - Maps MCP tools to bundle commands
 * Provides backwards compatibility with existing MCP tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { commandRegistry } from './CommandRegistry.js';
import { GameCoreTools } from '../tools/game-core-tools.js';
import { GameInteractionTools } from '../tools/game-interaction-tools.js';
import { GameManagementTools } from '../tools/game-management-tools.js';
import { SuperAdminTools } from '../tools/super-admin-tools.js';

export class ToolAdapter {
  private legacyTools: Map<string, any> = new Map();
  private gameCoreTools: GameCoreTools;
  private gameInteractionTools: GameInteractionTools;
  private gameManagementTools: GameManagementTools;
  private superAdminTools: SuperAdminTools;

  constructor() {
    this.gameCoreTools = new GameCoreTools();
    this.gameInteractionTools = new GameInteractionTools();
    this.gameManagementTools = new GameManagementTools();
    this.superAdminTools = new SuperAdminTools();

    this.initializeLegacyTools();
  }

  /**
   * Initialize legacy tool handlers
   */
  private initializeLegacyTools(): void {
    // Map legacy tools to their handlers
    const coreTools = this.gameCoreTools.getTools();
    const interactionTools = this.gameInteractionTools.getTools();
    const managementTools = this.gameManagementTools.getTools();
    const adminTools = this.superAdminTools.getTools();

    [...coreTools, ...interactionTools, ...managementTools, ...adminTools].forEach(tool => {
      this.legacyTools.set(tool.name, tool);
    });
  }

  /**
   * Get all available tools (combines bundle commands and legacy tools)
   */
  getAllTools(): Tool[] {
    const tools: Tool[] = [];
    
    // Add legacy tools
    tools.push(...Array.from(this.legacyTools.values()));
    
    // Convert bundle commands to MCP Tools
    const bundleCommands = commandRegistry.getAll();
    for (const command of bundleCommands) {
      // Check if tool already exists (bundle command might override legacy tool)
      const existingIndex = tools.findIndex(t => t.name === command.name);
      
      // Get input schema from command (attached during registration)
      const inputSchema = (command as any).inputSchema;
      
      const tool: Tool = {
        name: command.name,
        description: command.description || `Execute ${command.name} command`,
        inputSchema: inputSchema || {
          type: 'object',
          properties: {} as any,
          required: []
        }
      };
      
      if (existingIndex >= 0) {
        // Replace existing tool with bundle command version
        tools[existingIndex] = tool;
      } else {
        // Add new tool
        tools.push(tool);
      }
    }
    
    return tools;
  }

  /**
   * Execute a tool call
   * Routes to bundle commands if available, otherwise uses legacy implementation
   */
  async executeTool(name: string, args: any, context?: any): Promise<any> {
    // Try bundle command first
    if (commandRegistry.has(name)) {
      try {
        return await commandRegistry.execute(name, args);
      } catch (error) {
        console.error(`Error executing bundle command ${name}:`, error);
        // Fall through to legacy implementation
      }
    }

    // Fall back to legacy tools
    if (this.isCoreTool(name)) {
      return await this.gameCoreTools.handleToolCall(name, args, context);
    } else if (this.isInteractionTool(name)) {
      return await this.gameInteractionTools.handleToolCall(name, args, context);
    } else if (this.isManagementTool(name)) {
      return await this.gameManagementTools.handleToolCall(name, args, context);
    } else if (this.isAdminTool(name)) {
      return await this.superAdminTools.handleToolCall(name, args, context);
    }

    throw new Error(`Unknown tool: ${name}`);
  }

  /**
   * Check if tool is a core tool
   */
  private isCoreTool(name: string): boolean {
    const coreToolNames = this.gameCoreTools.getTools().map(t => t.name);
    return coreToolNames.includes(name);
  }

  /**
   * Check if tool is an interaction tool
   */
  private isInteractionTool(name: string): boolean {
    const interactionToolNames = this.gameInteractionTools.getTools().map(t => t.name);
    return interactionToolNames.includes(name);
  }

  /**
   * Check if tool is a management tool
   */
  private isManagementTool(name: string): boolean {
    const managementToolNames = this.gameManagementTools.getTools().map(t => t.name);
    return managementToolNames.includes(name);
  }

  /**
   * Check if tool is an admin tool
   */
  private isAdminTool(name: string): boolean {
    const adminToolNames = this.superAdminTools.getTools().map(t => t.name);
    return adminToolNames.includes(name);
  }

  /**
   * Get tools filtered by permission level
   */
  getToolsByPermission(permissionLevel: string): Tool[] {
    const allTools = this.getAllTools();

    if (permissionLevel === 'super_admin') {
      // Super admin sees only super admin tools
      const adminToolNames = this.superAdminTools.getTools().map(t => t.name);
      return allTools.filter(tool => adminToolNames.includes(tool.name));
    } else {
      // Regular users see all tools except super admin tools
      const adminToolNames = this.superAdminTools.getTools().map(t => t.name);
      return allTools.filter(tool => !adminToolNames.includes(tool.name));
    }
  }

  /**
   * Reload tools from bundles
   */
  reloadFromBundles(): void {
    commandRegistry.loadFromBundles();
  }
}

// Export singleton instance
export const toolAdapter = new ToolAdapter();

