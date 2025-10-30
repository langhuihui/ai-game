/**
 * MCPServer - Refactored MCP server using the new architecture
 * Integrates with GameState, BundleLoader, and ToolAdapter
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
export declare class MCPServer {
    private server;
    private gameState;
    private promptTools;
    private resourceTools;
    private superAdminResourceTools;
    private identityService;
    constructor();
    /**
     * Setup MCP request handlers
     */
    private setupHandlers;
    /**
     * Get the underlying MCP Server instance
     */
    getServer(): Server;
    /**
     * Initialize the MCP server
     */
    initialize(): Promise<void>;
}
export declare const mcpServer: MCPServer;
//# sourceMappingURL=MCPServer.d.ts.map