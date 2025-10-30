/**
 * MCPServer - Refactored MCP server using the new architecture
 * Integrates with GameState, BundleLoader, and ToolAdapter
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { getGameState } from '../core/GameState.js';
import { toolAdapter } from './ToolAdapter.js';
import { PromptTools } from '../tools/prompt-tools.js';
import { ResourceTools } from '../tools/resource-tools.js';
import { SuperAdminResourceTools } from '../tools/super-admin-resource-tools.js';
import { IdentityService } from '../services/IdentityService.js';
export class MCPServer {
    server;
    gameState;
    promptTools;
    resourceTools;
    superAdminResourceTools;
    identityService;
    constructor() {
        this.server = new Server({
            name: 'matrix-game',
            version: '2.0.0',
        }, {
            capabilities: {
                tools: {},
                prompts: {},
                resources: {},
            },
        });
        this.gameState = getGameState();
        this.promptTools = new PromptTools();
        this.resourceTools = new ResourceTools();
        this.superAdminResourceTools = new SuperAdminResourceTools();
        this.identityService = new IdentityService();
        this.setupHandlers();
    }
    /**
     * Setup MCP request handlers
     */
    setupHandlers() {
        // List tools handler
        this.server.setRequestHandler(ListToolsRequestSchema, async (request) => {
            // Get secret key from request context
            let secretKey = '';
            let permissionLevel = 'guest';
            const clientId = request.clientId;
            if (clientId) {
                // Extract permission info if available
                const permissionInfo = this.identityService.getIdentityInfo(secretKey);
                if (permissionInfo) {
                    permissionLevel = permissionInfo.identity_role;
                }
            }
            // Get tools filtered by permission
            const tools = toolAdapter.getToolsByPermission(permissionLevel);
            return { tools };
        });
        // Call tool handler
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                // Extract context from request
                const secretKey = request.headers?.['x-secret-key'];
                const characterId = request.headers?.['x-character-id'];
                const context = {
                    secretKey,
                    characterId
                };
                const result = await toolAdapter.executeTool(name, args, context);
                if (result.success) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    };
                }
                else {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error: ${result.error}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
        // List prompts handler
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
            const result = await this.promptTools.handleToolCall('mcp_list_prompts', {});
            if (result.success && 'prompts' in result) {
                const prompts = result.prompts.map((p) => ({
                    name: p.name,
                    description: p.description,
                    arguments: p.arguments || []
                }));
                return { prompts };
            }
            else {
                return { prompts: [] };
            }
        });
        // Get prompt handler
        this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                const result = await this.promptTools.handleToolCall('mcp_get_prompt', { name, arguments: args || {} });
                if (result.success && result.prompt && 'messages' in result.prompt) {
                    return {
                        messages: result.prompt.messages,
                    };
                }
                else {
                    throw new Error(result.error || 'Failed to get prompt');
                }
            }
            catch (error) {
                throw new Error(`Failed to get prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
        // List resources handler
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            const result = await this.resourceTools.handleToolCall('mcp_list_resources', {});
            if (result.success && 'resources' in result) {
                return {
                    resources: result.resources,
                };
            }
            else {
                return {
                    resources: [],
                };
            }
        });
        // Read resource handler
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            try {
                const result = await this.resourceTools.handleToolCall('mcp_read_resource', { uri });
                if (result.success && 'content' in result) {
                    return {
                        contents: [result.content],
                    };
                }
                else {
                    throw new Error(result.error || 'Failed to read resource');
                }
            }
            catch (error) {
                throw new Error(`Failed to read resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Get the underlying MCP Server instance
     */
    getServer() {
        return this.server;
    }
    /**
     * Initialize the MCP server
     */
    async initialize() {
        // Initialize game state if not already done
        if (!this.gameState.isStarted()) {
            await this.gameState.initialize({
                bundles: [
                    './dist/bundles/items-bundle',
                    './dist/bundles/core-bundle',
                    './dist/bundles/combat-bundle',
                    './dist/bundles/memory-bundle',
                    './dist/bundles/social-bundle',
                    './dist/bundles/admin-bundle'
                ],
                debug: true
            });
            // Load commands from bundles into tool adapter
            toolAdapter.reloadFromBundles();
            await this.gameState.start();
        }
    }
}
// Export singleton instance
export const mcpServer = new MCPServer();
//# sourceMappingURL=MCPServer.js.map