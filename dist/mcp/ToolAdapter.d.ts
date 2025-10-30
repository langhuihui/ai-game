/**
 * ToolAdapter - Maps MCP tools to bundle commands
 * Provides backwards compatibility with existing MCP tools
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class ToolAdapter {
    private legacyTools;
    private gameCoreTools;
    private gameInteractionTools;
    private gameManagementTools;
    private superAdminTools;
    constructor();
    /**
     * Initialize legacy tool handlers
     */
    private initializeLegacyTools;
    /**
     * Get all available tools (combines bundle commands and legacy tools)
     */
    getAllTools(): Tool[];
    /**
     * Execute a tool call
     * Routes to bundle commands if available, otherwise uses legacy implementation
     */
    executeTool(name: string, args: any, context?: any): Promise<any>;
    /**
     * Check if tool is a core tool
     */
    private isCoreTool;
    /**
     * Check if tool is an interaction tool
     */
    private isInteractionTool;
    /**
     * Check if tool is a management tool
     */
    private isManagementTool;
    /**
     * Check if tool is an admin tool
     */
    private isAdminTool;
    /**
     * Get tools filtered by permission level
     */
    getToolsByPermission(permissionLevel: string): Tool[];
    /**
     * Reload tools from bundles
     */
    reloadFromBundles(): void;
}
export declare const toolAdapter: ToolAdapter;
//# sourceMappingURL=ToolAdapter.d.ts.map