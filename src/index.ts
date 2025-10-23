#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from 'net';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { CharacterTools } from './tools/character-tools.js';
import { SceneTools } from './tools/scene-tools.js';
import { ActionTools } from './tools/action-tools.js';
import { MemoryTools } from './tools/memory-tools.js';
import { TradeTools } from './tools/trade-tools.js';
import { PermissionTools } from './tools/permission-tools.js';
import { CharacterService } from './services/CharacterService.js';
import { SceneService } from './services/SceneService.js';
import { ItemService } from './services/ItemService.js';
import { MemoryService } from './services/MemoryService.js';
import { LoggingService } from './services/LoggingService.js';
import { PermissionService } from './services/PermissionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GameServer {
  private mcpServer: Server;
  private webApp: express.Application;
  private characterTools: CharacterTools;
  private sceneTools: SceneTools;
  private actionTools: ActionTools;
  private memoryTools: MemoryTools;
  private tradeTools: TradeTools;
  private permissionTools: PermissionTools;
  private characterService: CharacterService;
  private sceneService: SceneService;
  private itemService: ItemService;
  private memoryService: MemoryService;
  private loggingService: LoggingService;
  private permissionService: PermissionService;
  private connectedClients: Set<any> = new Set();
  private permissionConnections: Map<string, string> = new Map(); // connectionId -> secretKey

  constructor() {
    // Initialize MCP Server
    this.mcpServer = new Server(
      {
        name: 'mcp-game-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Web App (only if needed)
    this.webApp = express();

    // Initialize Services
    this.characterTools = new CharacterTools();
    this.sceneTools = new SceneTools();
    this.actionTools = new ActionTools();
    this.memoryTools = new MemoryTools();
    this.tradeTools = new TradeTools();
    this.permissionTools = new PermissionTools();
    this.characterService = new CharacterService();
    this.sceneService = new SceneService();
    this.itemService = new ItemService();
    this.memoryService = new MemoryService();
    this.loggingService = new LoggingService();
    this.permissionService = new PermissionService();

    this.setupMCPHandlers();
  }

  private setupWebApp() {
    const PORT = process.env.PORT || 3000;

    // Middleware
    this.webApp.use(cors());
    this.webApp.use(express.json());
    this.webApp.use(express.static(join(__dirname, '..', 'src', 'public')));

    // API Routes
    this.setupWebRoutes();

    // Serve the main HTML file
    this.webApp.get('/', (req, res) => {
      res.sendFile(join(__dirname, '..', 'src', 'public', 'index.html'));
    });

    // Start the server
    this.webApp.listen(3000, () => {
      console.log('Web server running on http://localhost:3000');
    });
  }

  private setupWebRoutes() {
    // Characters
    this.webApp.get('/api/characters', (req, res) => {
      try {
        const characters = this.characterService.getAllCharacters();
        res.json({ success: true, characters });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/characters/:id', (req, res) => {
      try {
        const character = this.characterService.getCharacterById(parseInt(req.params.id));
        if (!character) {
          return res.status(404).json({ success: false, error: 'Character not found' });
        }
        res.json({ success: true, character });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/characters/:id/memories', (req, res) => {
      try {
        const memories = this.memoryService.getAllMemories(parseInt(req.params.id));
        res.json({ success: true, memories });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/characters/:id/items', (req, res) => {
      try {
        const items = this.itemService.getItemsByCharacter(parseInt(req.params.id));
        res.json({ success: true, items });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Scenes
    this.webApp.get('/api/scenes', (req, res) => {
      try {
        const scenes = this.sceneService.getAllScenes();
        res.json({ success: true, scenes });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/scenes/:id', (req, res) => {
      try {
        const scene = this.sceneService.getSceneDetails(parseInt(req.params.id));
        if (!scene) {
          return res.status(404).json({ success: false, error: 'Scene not found' });
        }
        res.json({ success: true, scene });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Items
    this.webApp.get('/api/items', (req, res) => {
      try {
        const items = this.itemService.getAllItems();
        res.json({ success: true, items });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Logs
    this.webApp.get('/api/logs', (req, res) => {
      try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 1000;
        const logs = this.loggingService.getLogsWithCharacterInfo(limit);
        res.json({ success: true, logs });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/logs/date/:date', (req, res) => {
      try {
        const logs = this.loggingService.getLogsByDate(req.params.date);
        res.json({ success: true, logs });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/logs/character/:id', (req, res) => {
      try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
        const logs = this.loggingService.getLogsByCharacter(parseInt(req.params.id), limit);
        res.json({ success: true, logs });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Trade offers
    this.webApp.get('/api/characters/:id/trade-offers', (req, res) => {
      try {
        const tradeOffers = this.characterService.getTradeOffersByCharacter(parseInt(req.params.id));
        res.json({ success: true, tradeOffers });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/characters/:id/pending-trade-offers', (req, res) => {
      try {
        const pendingOffers = this.characterService.getPendingTradeOffers(parseInt(req.params.id));
        res.json({ success: true, pendingOffers });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/trade-offers', (req, res) => {
      try {
        const tradeOffer = this.characterService.createTradeOffer(req.body);
        res.json({ success: true, tradeOffer });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/trade-offers/:id/respond', (req, res) => {
      try {
        const { response } = req.body;
        const tradeOffer = this.characterService.respondToTradeOffer(parseInt(req.params.id), response);
        if (!tradeOffer) {
          return res.status(404).json({ success: false, error: 'Trade offer not found or not pending' });
        }
        res.json({ success: true, tradeOffer });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/trade-offers/:id/cancel', (req, res) => {
      try {
        const tradeOffer = this.characterService.cancelTradeOffer(parseInt(req.params.id));
        if (!tradeOffer) {
          return res.status(404).json({ success: false, error: 'Trade offer not found or not pending' });
        }
        res.json({ success: true, tradeOffer });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Direct messages
    this.webApp.get('/api/characters/:id/messages', (req, res) => {
      try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const messages = this.characterService.getDirectMessages(parseInt(req.params.id), limit);
        res.json({ success: true, messages });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/characters/:id/unread-messages', (req, res) => {
      try {
        const unreadMessages = this.characterService.getUnreadMessages(parseInt(req.params.id));
        res.json({ success: true, unreadMessages });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/messages', (req, res) => {
      try {
        const { from_character_id, to_character_id, message, scene_id } = req.body;
        const directMessage = this.characterService.sendDirectMessage(from_character_id, to_character_id, message, scene_id);
        res.json({ success: true, directMessage });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/messages/:id/read', (req, res) => {
      try {
        const message = this.characterService.markMessageAsRead(parseInt(req.params.id));
        if (!message) {
          return res.status(404).json({ success: false, error: 'Message not found' });
        }
        res.json({ success: true, message });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/characters/:id/mark-all-messages-read', (req, res) => {
      try {
        this.characterService.markAllMessagesAsRead(parseInt(req.params.id));
        res.json({ success: true, message: 'All messages marked as read' });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Permission endpoints
    this.webApp.get('/api/permissions', (req, res) => {
      try {
        const permissions = this.permissionService.getAllPermissions();
        res.json({ success: true, permissions });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/permissions/stats', (req, res) => {
      try {
        const stats = this.permissionService.getPermissionStats();
        res.json({ success: true, stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/permissions/validate', (req, res) => {
      try {
        const { secret_key, required_permission } = req.body;
        const hasPermission = this.permissionService.validatePermission(secret_key, required_permission);
        const permissionInfo = this.permissionService.getPermissionInfo(secret_key);

        res.json({
          success: true,
          has_permission: hasPermission,
          permission_info: permissionInfo
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/permissions/create', (req, res) => {
      try {
        const { character_id, permission_level, expires_at } = req.body;
        const permission = this.permissionService.createDefaultPermission(character_id, permission_level);
        if (expires_at) {
          this.permissionService.updatePermission(permission.id, { expires_at });
        }
        res.json({ success: true, permission });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Dashboard stats
    this.webApp.get('/api/stats', (req, res) => {
      try {
        const characters = this.characterService.getAllCharacters();
        const scenes = this.sceneService.getAllScenes();
        const items = this.itemService.getAllItems();
        const recentLogs = this.loggingService.getAllLogs(10);
        const permissionStats = this.permissionService.getPermissionStats();

        res.json({
          success: true,
          stats: {
            totalCharacters: characters.length,
            totalScenes: scenes.length,
            totalItems: items.length,
            recentActivity: recentLogs.length,
            permissionStats: permissionStats
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });
  }

  private setupMCPHandlers() {
    // List tools handler
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools = [
        ...this.characterTools.getTools(),
        ...this.sceneTools.getTools(),
        ...this.actionTools.getTools(),
        ...this.memoryTools.getTools(),
        ...this.tradeTools.getTools(),
        ...this.permissionTools.getTools(),
      ];

      return {
        tools: allTools,
      };
    });

    // Call tool handler
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result;

        // Route to appropriate tool handler
        if (this.characterTools.getTools().some(tool => tool.name === name)) {
          result = await this.characterTools.handleToolCall(name, args);
        } else if (this.sceneTools.getTools().some(tool => tool.name === name)) {
          result = await this.sceneTools.handleToolCall(name, args);
        } else if (this.actionTools.getTools().some(tool => tool.name === name)) {
          result = await this.actionTools.handleToolCall(name, args);
        } else if (this.memoryTools.getTools().some(tool => tool.name === name)) {
          result = await this.memoryTools.handleToolCall(name, args);
        } else if (this.tradeTools.getTools().some(tool => tool.name === name)) {
          result = await this.tradeTools.handleToolCall(name, args);
        } else if (this.permissionTools.getTools().some(tool => tool.name === name)) {
          result = await this.permissionTools.handleToolCall(name, args);
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `Unknown tool: ${name}`,
              },
            ],
            isError: true,
          };
        }

        // Format the response
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } else {
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
      } catch (error) {
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
  }

  async run() {
    // Check if we're running in MCP mode (no arguments) or Web mode
    const args = process.argv.slice(2);
    const isWebMode = args.includes('--web') || process.env.MODE === 'web';
    const isStdioMode = args.includes('--stdio') || process.env.MODE === 'stdio';

    if (isWebMode) {
      // Web mode - show all logs
      console.log('🚀 Starting Game Server in Web mode...');
      this.setupWebApp();
      console.log('🌐 Web interface available at http://localhost:3000');
      console.log('✅ Server started successfully!');
    } else if (isStdioMode) {
      // Stdio mode - for direct MCP client connection
      console.error('🚀 Starting MCP Game Server in stdio mode...');
      const transport = new StdioServerTransport();
      await this.mcpServer.connect(transport);
      console.error('🔧 MCP Game Server running on stdio');
      console.error('✅ MCP Server started successfully!');
    } else {
      // Default mode - start both Web interface and MCP server with SSE
      console.log('🚀 Starting Game Server...');

      // Start Web interface
      this.setupWebApp();
      console.log('🌐 Web interface available at http://localhost:3000');

      // Setup SSE server for MCP connections
      this.setupSSEServer();
      console.log('🔧 MCP SSE server available at http://localhost:3000/mcp');

      // Add MCP info endpoint
      this.webApp.get('/mcp-info', (req, res) => {
        const connectedPermissions = Array.from(this.permissionConnections.values());
        const uniquePermissions = [...new Set(connectedPermissions)];
        const permissionStats = this.permissionService.getPermissionStats();

        res.json({
          name: 'mcp-game-server',
          version: '1.0.0',
          description: 'Multiplayer text-based game server with MCP interfaces and permission system',
          tools: 50,
          status: 'running',
          connectedClients: this.connectedClients.size,
          connectedPermissions: uniquePermissions.length,
          permissionStats: permissionStats,
          sseUrl: 'http://localhost:3000/mcp',
          instructions: 'Connect via SSE for real-time multiplayer. Use X-Secret-Key header to authenticate with your permission level.'
        });
      });

      console.log('✅ Server started successfully!');
      console.log('   - Web interface: http://localhost:3000');
      console.log('   - MCP SSE: http://localhost:3000/mcp');
      console.log('   - Connected clients: 0');
    }
  }

  private setupSSEServer() {
    // Setup SSE endpoint for MCP
    this.webApp.get('/mcp', (req, res) => {
      const secretKey = req.headers['x-secret-key'] as string;

      console.log('🔌 New MCP client connected via SSE');
      console.log('📍 Client IP:', req.ip);
      console.log('📍 User-Agent:', req.headers['user-agent']);
      console.log('🔑 Secret Key:', secretKey ? 'Provided' : 'Not provided');

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, X-Secret-Key');

      // Add client to connected set
      this.connectedClients.add(res);

      // Handle permission validation
      let permissionInfo = null;
      let connectionStatus = 'guest';

      if (secretKey) {
        permissionInfo = this.permissionService.getPermissionInfo(secretKey);
        if (permissionInfo) {
          connectionStatus = 'authenticated';
          console.log('✅ Valid secret key provided, permission level:', permissionInfo.permission_level);
        } else {
          console.log('❌ Invalid secret key provided');
        }
      } else {
        console.log('ℹ️ No secret key provided, connecting as guest');
      }

      // Store permission connection mapping
      const connectionId = `${req.ip}-${Date.now()}`;
      if (secretKey && permissionInfo) {
        this.permissionConnections.set(connectionId, secretKey);
      }

      console.log('📊 Total connected clients:', this.connectedClients.size);

      // Send initial connection message
      const connectionResponse = {
        type: 'connection',
        status: connectionStatus,
        permission_info: permissionInfo,
        needs_authentication: !secretKey || !permissionInfo,
        message: permissionInfo ?
          `Connected with ${permissionInfo.permission_level} permissions` :
          secretKey ? 'Invalid secret key. Please check your credentials.' : 'No secret key provided. Connect as guest or provide valid credentials.'
      };
      res.write(`data: ${JSON.stringify(connectionResponse)}\n\n`);

      // Handle client disconnect
      req.on('close', () => {
        console.log('🔌 MCP client disconnected');
        this.connectedClients.delete(res);
        this.permissionConnections.delete(connectionId);
      });

      req.on('error', (error) => {
        console.error('❌ SSE connection error:', error);
        this.connectedClients.delete(res);
        this.permissionConnections.delete(connectionId);
      });
    });

    // Setup POST endpoint for MCP requests
    this.webApp.post('/mcp', express.json(), async (req, res) => {
      try {
        console.log('📥 Received MCP request:', JSON.stringify(req.body, null, 2));

        const response = await this.handleMCPRequest(req.body);
        console.log('📤 Sending MCP response:', JSON.stringify(response, null, 2));

        res.json(response);
      } catch (error) {
        console.error('❌ Error handling MCP request:', error);
        const errorResponse = {
          jsonrpc: '2.0',
          id: req.body.id || null,
          error: {
            code: -32603,
            message: 'Internal error',
            data: error instanceof Error ? error.message : 'Unknown error'
          }
        };
        res.json(errorResponse);
      }
    });

    // Server will be started in setupWebApp
  }

  private async handleMCPRequest(request: any): Promise<any> {
    const { method, params, id } = request;
    console.log(`🔧 Handling MCP request: method=${method}, id=${id}`);

    try {
      if (method === 'initialize') {
        console.log('🚀 Initializing MCP connection...');
        const response = {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2025-06-18',
            capabilities: {
              tools: {
                listChanged: false
              },
              prompts: {},
              resources: {}
            },
            serverInfo: {
              name: 'mcp-game-server',
              version: '1.0.0'
            }
          }
        };
        console.log('📤 Initialize response:', JSON.stringify(response, null, 2));
        return response;
      } else if (method === 'tools/list') {
        console.log('📋 Listing tools...');
        const allTools = [
          ...this.characterTools.getTools(),
          ...this.sceneTools.getTools(),
          ...this.actionTools.getTools(),
          ...this.memoryTools.getTools(),
          ...this.tradeTools.getTools(),
          ...this.permissionTools.getTools(),
        ];

        console.log(`✅ Found ${allTools.length} tools`);
        const response = {
          jsonrpc: '2.0',
          id,
          result: { tools: allTools }
        };
        console.log('📤 Tools list response:', JSON.stringify(response, null, 2));
        return response;
      } else if (method === 'tools/call') {
        const { name, arguments: args } = params;

        let result;
        if (this.characterTools.getTools().some(tool => tool.name === name)) {
          result = await this.characterTools.handleToolCall(name, args);
        } else if (this.sceneTools.getTools().some(tool => tool.name === name)) {
          result = await this.sceneTools.handleToolCall(name, args);
        } else if (this.actionTools.getTools().some(tool => tool.name === name)) {
          result = await this.actionTools.handleToolCall(name, args);
        } else if (this.memoryTools.getTools().some(tool => tool.name === name)) {
          result = await this.memoryTools.handleToolCall(name, args);
        } else if (this.tradeTools.getTools().some(tool => tool.name === name)) {
          result = await this.tradeTools.handleToolCall(name, args);
        } else if (this.permissionTools.getTools().some(tool => tool.name === name)) {
          result = await this.permissionTools.handleToolCall(name, args);
        } else {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Unknown tool: ${name}`
            }
          };
        }

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          }
        };
      } else {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Unknown method: ${method}`
          }
        };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Start the server
const gameServer = new GameServer();
gameServer.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Shutting down Game Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Shutting down Game Server...');
  process.exit(0);
});
