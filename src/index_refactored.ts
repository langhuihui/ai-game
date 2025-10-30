#!/usr/bin/env node

/**
 * Matrix Game Server - Refactored with RanvierMUD Architecture
 * Now uses bundle system, event-driven architecture, and behavior system
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// New Architecture Imports
import { GameState, getGameState } from './core/GameState.js';
import { eventManager } from './core/EventManager.js';
import { entityManager } from './core/EntityManager.js';
import { mcpServer, MCPServer } from './mcp/MCPServer.js';
import { toolAdapter } from './mcp/ToolAdapter.js';

// Legacy Services (still used by web interface)
import { CharacterService } from './services/CharacterService.js';
import { SceneService } from './services/SceneService.js';
import { ItemService } from './services/ItemService.js';
import { MemoryService } from './services/MemoryService.js';
import { LoggingService } from './services/LoggingService.js';
import { IdentityService } from './services/IdentityService.js';
import { CitizenshipApplicationService } from './services/CitizenshipApplicationService.js';
import { ApiResponseHandler } from './utils/ApiResponseHandler.js';
import { i18n } from './services/I18nService.js';
import { PromptTools } from './tools/prompt-tools.js';
import { ResourceTools } from './tools/resource-tools.js';
import { SuperAdminResourceTools } from './tools/super-admin-resource-tools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GameServer {
  private webApp: express.Application;
  private gameState: GameState;
  private mcpServer: MCPServer;

  // Services for web interface
  private characterService: CharacterService;
  private sceneService: SceneService;
  private itemService: ItemService;
  private memoryService: MemoryService;
  private loggingService: LoggingService;
  private identityService: IdentityService;
  private citizenshipService: CitizenshipApplicationService;
  private promptTools: PromptTools;
  private resourceTools: ResourceTools;
  private superAdminResourceTools: SuperAdminResourceTools;

  // Connection tracking
  private connectedClients: Set<any> = new Set();
  private permissionConnections: Map<string, string> = new Map();
  private clientConnections: Map<any, string> = new Map();

  constructor() {
    this.webApp = express();
    this.gameState = getGameState();
    this.mcpServer = mcpServer;

    // Initialize services
    this.characterService = entityManager.getCharacterService();
    this.sceneService = entityManager.getSceneService();
    this.itemService = entityManager.getItemService();
    this.memoryService = entityManager.getMemoryService();
    this.loggingService = new LoggingService();
    this.identityService = new IdentityService();
    this.citizenshipService = new CitizenshipApplicationService();
    this.promptTools = new PromptTools();
    this.resourceTools = new ResourceTools();
    this.superAdminResourceTools = new SuperAdminResourceTools();
  }

  /**
   * Initialize the game server with bundles
   */
  async initialize(): Promise<void> {
    console.log('🎮 Initializing Matrix Game Server with RanvierMUD Architecture...');

    // Initialize MCP server which loads bundles
    await this.mcpServer.initialize();

    console.log('✅ Game server initialized successfully');
    console.log(`📦 Loaded bundles: ${this.gameState.getBundleLoader().getBundleOrder().join(', ')}`);
  }

  private setupWebApp() {
    // Configure Pug view engine
    this.webApp.set('view engine', 'pug');
    this.webApp.set('views', join(__dirname, '..', 'src', 'views'));

    // Middleware
    this.webApp.use(cors());
    this.webApp.use(express.json());
    this.webApp.use(express.static(join(__dirname, '..', 'src', 'public')));

    // API Routes
    this.setupWebRoutes();

    // Page Routes
    this.setupPageRoutes();

    // Start the server
    this.webApp.listen(3000, () => {
      console.log('🌐 Web server running on http://localhost:3000');
    });
  }

  private setupPageRoutes() {
    // Dashboard
    this.webApp.get('/', (req, res) => {
      try {
        const stats = this.loggingService.getStats();
        const recentLogs = this.loggingService.getLogsWithCharacterInfo(10);
        res.render('dashboard', {
          page: 'dashboard',
          stats,
          recentLogs
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).send('Error loading dashboard');
      }
    });

    // Characters
    this.webApp.get('/characters', (req, res) => {
      try {
        const characters = this.characterService.getAllCharacters();
        const enrichedCharacters = characters.map(char => {
          const memories = this.memoryService.getAllMemories(char.id);
          const items = this.itemService.getItemsByCharacter(char.id);
          return { ...char, ...memories, items };
        });

        res.render('characters', {
          page: 'characters',
          characters: enrichedCharacters
        });
      } catch (error) {
        console.error('Error loading characters:', error);
        res.status(500).send('Error loading characters');
      }
    });

    // Scenes
    this.webApp.get('/scenes', (req, res) => {
      try {
        const scenes = this.sceneService.getAllScenes();
        const enrichedScenes = scenes.map(scene => {
          const details = this.sceneService.getSceneDetails(scene.id);
          return details || scene;
        });

        res.render('scenes', {
          page: 'scenes',
          scenes: enrichedScenes
        });
      } catch (error) {
        console.error('Error loading scenes:', error);
        res.status(500).send('Error loading scenes');
      }
    });

    // Items
    this.webApp.get('/items', (req, res) => {
      try {
        const items = this.itemService.getAllItems();
        res.render('items', {
          page: 'items',
          items
        });
      } catch (error) {
        console.error('Error loading items:', error);
        res.status(500).send('Error loading items');
      }
    });

    // Logs
    this.webApp.get('/logs', (req, res) => {
      try {
        const { date, character } = req.query;
        let logs;

        if (date) {
          logs = this.loggingService.getLogsByDate(date as string);
        } else {
          logs = this.loggingService.getLogsWithCharacterInfo(1000);
        }

        if (character) {
          logs = logs.filter((log: any) => log.character_name === character);
        }

        const characters = [...new Set(logs.map((log: any) => log.character_name).filter(Boolean))];

        res.render('logs', {
          page: 'logs',
          logs,
          characters,
          selectedDate: date || '',
          selectedCharacter: character || ''
        });
      } catch (error) {
        console.error('Error loading logs:', error);
        res.status(500).send('Error loading logs');
      }
    });

    // MCP Config
    this.webApp.get('/mcp-config', (req, res) => {
      try {
        const allTools = toolAdapter.getAllTools();

        // Category mapping
        const categoryMap: Record<string, string> = {
          'create_character': '角色管理',
          'update_character': '角色管理',
          'create_scene': '场景管理',
          'connect_scenes': '场景管理',
          'move_character': '行动系统',
          'pick_item': '行动系统',
          'drop_item': '行动系统',
          'use_item': '行动系统',
          'create_item': '物品管理',
          'add_short_memory': '记忆管理',
          'add_long_memory': '记忆管理',
          'create_trade_offer': '交易系统',
          'send_direct_message': '消息系统',
          'apply_for_citizenship': '身份管理',
        };

        const toolsByCategory: Record<string, any[]> = {};
        allTools.forEach(tool => {
          const category = categoryMap[tool.name] || '其他';
          if (!toolsByCategory[category]) {
            toolsByCategory[category] = [];
          }
          toolsByCategory[category].push(tool);
        });

        const categories = Object.keys(toolsByCategory).map(name => ({
          name,
          tools: toolsByCategory[name]
        }));

        res.render('mcp-config', {
          page: 'mcp-config',
          categories,
          totalTools: allTools.length,
          serverStartTime: this.gameState.getStartTime()?.toLocaleString('zh-CN') || new Date().toLocaleString('zh-CN')
        });
      } catch (error) {
        console.error('Error loading MCP config:', error);
        res.status(500).send('Error loading MCP config');
      }
    });
  }

  private setupWebRoutes() {
    // Characters
    this.webApp.get('/api/characters', (req, res) => {
      ApiResponseHandler.handleRequestWithKey(
        res,
        () => Promise.resolve(this.characterService.getAllCharacters()),
        'characters'
      );
    });

    this.webApp.get('/api/characters/:id', (req, res) => {
      ApiResponseHandler.handleRequest(
        res,
        () => {
          const character = this.characterService.getCharacterById(parseInt(req.params.id));
          if (!character) {
            throw new Error('Character not found');
          }
          return Promise.resolve(character);
        }
      );
    });

    // Scenes
    this.webApp.get('/api/scenes', (req, res) => {
      ApiResponseHandler.handleRequestWithKey(
        res,
        () => Promise.resolve(this.sceneService.getAllScenes()),
        'scenes'
      );
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

    // Dashboard stats
    this.webApp.get('/api/stats', (req, res) => {
      try {
        const characters = this.characterService.getAllCharacters();
        const scenes = this.sceneService.getAllScenes();
        const items = this.itemService.getAllItems();
        const recentLogs = this.loggingService.getAllLogs(10);
        const identityStats = this.identityService.getIdentityStats();

        res.json({
          success: true,
          stats: {
            totalCharacters: characters.length,
            totalScenes: scenes.length,
            totalItems: items.length,
            recentActivity: recentLogs.length,
            identityStats: identityStats
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Tools list
    this.webApp.get('/api/tools', (req, res) => {
      try {
        const allTools = toolAdapter.getToolsByPermission('citizen');
        res.json({
          success: true,
          tools: allTools
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });
  }

  private setupSSEServer() {
    // MCP info endpoint
    this.webApp.get('/mcp-info', (req, res) => {
      const connectedPermissions = Array.from(this.permissionConnections.values());
      const uniquePermissions = [...new Set(connectedPermissions)];
      const identityStats = this.identityService.getIdentityStats();
      const applicationStats = this.citizenshipService.getApplicationStats();
      const bundles = this.gameState.getBundleLoader().getBundleOrder();

      res.json({
        name: 'matrix-game',
        version: '2.0.0',
        architecture: 'RanvierMUD-inspired',
        description: 'Multiplayer text-based game server with bundle system and event-driven architecture',
        bundles: bundles,
        tools: toolAdapter.getAllTools().length,
        status: 'running',
        connectedClients: this.connectedClients.size,
        connectedPermissions: uniquePermissions.length,
        identityStats: identityStats,
        applicationStats: applicationStats,
        uptime: this.gameState.getUptime(),
        sseUrl: 'http://localhost:3000/mcp',
        adminSseUrl: 'http://localhost:3000/admin/mcp',
      });
    });

    // Setup MCP SSE endpoint
    this.webApp.get('/mcp', (req, res) => {
      const secretKey = req.headers['x-secret-key'] as string;
      const characterId = req.headers['x-character-id'] as string;

      console.log('🔌 New MCP client connected via SSE');

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, X-Secret-Key, X-Character-ID');

      this.connectedClients.add(res);

      let permissionInfo = null;
      let connectionStatus = 'guest';
      let visitorId = characterId;

      if (secretKey) {
        permissionInfo = this.identityService.getIdentityInfo(secretKey);
        if (permissionInfo) {
          connectionStatus = 'authenticated';
        }
      } else if (!visitorId) {
        visitorId = this.citizenshipService.generateUniqueCharacterId();
      }

      const connectionId = `${req.ip}-${Date.now()}`;
      this.clientConnections.set(res, connectionId);
      if (secretKey && permissionInfo) {
        this.permissionConnections.set(connectionId, secretKey);
      }

      const connectionResponse = {
        type: 'connection',
        status: connectionStatus,
        permission_info: permissionInfo,
        visitor_id: visitorId,
        architecture: 'RanvierMUD-inspired bundle system',
        bundles: this.gameState.getBundleLoader().getBundleOrder(),
        message: permissionInfo ?
          `Connected with ${permissionInfo.identity_role} role` :
          `Connected as guest with ID: ${visitorId}`
      };
      res.write(`data: ${JSON.stringify(connectionResponse)}\n\n`);

      req.on('close', () => {
        this.connectedClients.delete(res);
        this.clientConnections.delete(res);
        this.permissionConnections.delete(connectionId);
      });

      req.on('error', (error) => {
        console.error('❌ SSE connection error:', error);
        this.connectedClients.delete(res);
      });
    });

    // Setup MCP POST endpoint
    this.webApp.post('/mcp', express.json(), async (req, res) => {
      try {
        const response = await this.handleMCPRequest(req.body, req.headers);
        res.json(response);
      } catch (error) {
        console.error('❌ Error handling MCP request:', error);
        res.json({
          jsonrpc: '2.0',
          id: req.body.id || null,
          error: {
            code: -32603,
            message: 'Internal error',
            data: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    });
  }

  private async handleMCPRequest(request: any, headers: any): Promise<any> {
    const { method, params, id } = request;

    try {
      if (method === 'initialize') {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2025-06-18',
            capabilities: {
              tools: { listChanged: false },
              prompts: {},
              resources: {}
            },
            serverInfo: {
              name: 'matrix-game',
              version: '2.0.0'
            }
          }
        };
      } else if (method === 'tools/list') {
        const secretKey = headers['x-secret-key'] || '';
        let permissionLevel = 'guest';

        if (secretKey) {
          const permissionInfo = this.identityService.getIdentityInfo(secretKey);
          if (permissionInfo) {
            permissionLevel = permissionInfo.identity_role;
          }
        }

        const tools = toolAdapter.getToolsByPermission(permissionLevel);

        return {
          jsonrpc: '2.0',
          id,
          result: { tools }
        };
      } else if (method === 'tools/call') {
        const { name, arguments: args } = params;
        const secretKey = headers['x-secret-key'] as string;
        const characterId = headers['x-character-id'] as string;
        const context = { secretKey, characterId };

        const result = await toolAdapter.executeTool(name, args, context);

        if (!result.success) {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: result.error
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
      } else if (method === 'resources/list') {
        const result = await this.resourceTools.handleToolCall('mcp_list_resources', {});
        if (result.success && 'resources' in result && result.resources) {
          return {
            jsonrpc: '2.0',
            id,
            result: { resources: result.resources }
          };
        }
      }

      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Unknown method: ${method}`
        }
      };
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

  async run() {
    const args = process.argv.slice(2);
    const isWebMode = args.includes('--web') || process.env.MODE === 'web';
    const isStdioMode = args.includes('--stdio') || process.env.MODE === 'stdio';

    // Initialize game state first
    await this.initialize();

    if (isWebMode) {
      console.log(i18n.t('server.webMode'));
      this.setupWebApp();
      console.log(i18n.t('server.started'));
    } else if (isStdioMode) {
      console.error(i18n.t('server.stdioMode'));
      const transport = new StdioServerTransport();
      await this.mcpServer.getServer().connect(transport);
      console.error(i18n.t('server.mcpStarted'));
    } else {
      console.log('🚀 Starting Matrix Game Server (Web + MCP)...');
      this.setupWebApp();
      this.setupSSEServer();
      console.log('✅ Server started successfully');
      console.log('   - Web interface: http://localhost:3000');
      console.log('   - MCP SSE: http://localhost:3000/mcp');
      console.log('   - MCP Info: http://localhost:3000/mcp-info');
    }
  }
}

// Start the server
const gameServer = new GameServer();
gameServer.run().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('🛑 Shutting down Game Server...');
  const gameState = getGameState();
  await gameState.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('🛑 Shutting down Game Server...');
  const gameState = getGameState();
  await gameState.stop();
  process.exit(0);
});

