#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from 'net';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { GameCoreTools } from './tools/game-core-tools.js';
import { GameInteractionTools } from './tools/game-interaction-tools.js';
import { GameManagementTools } from './tools/game-management-tools.js';
import { ResourceTools } from './tools/resource-tools.js';
import { PromptTools } from './tools/prompt-tools.js';
import { SuperAdminTools } from './tools/super-admin-tools.js';
import { SuperAdminResourceTools } from './tools/super-admin-resource-tools.js';
import { CharacterService } from './services/CharacterService.js';
import { SceneService } from './services/SceneService.js';
import { ItemService } from './services/ItemService.js';
import { MemoryService } from './services/MemoryService.js';
import { LoggingService } from './services/LoggingService.js';
import { IdentityService } from './services/IdentityService.js';
import { CitizenshipApplicationService } from './services/CitizenshipApplicationService.js';
import { ToolRouter } from './utils/ToolRouter.js';
import { ApiResponseHandler } from './utils/ApiResponseHandler.js';
import { i18n } from './services/I18nService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GameServer {
  private mcpServer: Server;
  private webApp: express.Application;
  private gameCoreTools: GameCoreTools;
  private gameInteractionTools: GameInteractionTools;
  private gameManagementTools: GameManagementTools;
  private resourceTools: ResourceTools;
  private promptTools: PromptTools;
  private superAdminTools: SuperAdminTools;
  private superAdminResourceTools: SuperAdminResourceTools;
  private characterService: CharacterService;
  private sceneService: SceneService;
  private itemService: ItemService;
  private memoryService: MemoryService;
  private loggingService: LoggingService;
  private identityService: IdentityService;
  private citizenshipService: CitizenshipApplicationService;
  private connectedClients: Set<any> = new Set();
  private permissionConnections: Map<string, string> = new Map(); // connectionId -> secretKey
  private clientConnections: Map<any, string> = new Map(); // response -> connectionId
  private toolRouter: ToolRouter;

  constructor() {
    // Initialize MCP Server
    this.mcpServer = new Server(
      {
        name: 'matrix-game',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {},
        },
      }
    );

    // Initialize Web App (only if needed)
    this.webApp = express();

    // Initialize Services
    this.gameCoreTools = new GameCoreTools();
    this.gameInteractionTools = new GameInteractionTools();
    this.gameManagementTools = new GameManagementTools();
    this.resourceTools = new ResourceTools();
    this.promptTools = new PromptTools();
    this.superAdminTools = new SuperAdminTools();
    this.superAdminResourceTools = new SuperAdminResourceTools();
    this.characterService = new CharacterService();
    this.sceneService = new SceneService();
    this.itemService = new ItemService();
    this.memoryService = new MemoryService();
    this.loggingService = new LoggingService();
    this.identityService = new IdentityService();
    this.citizenshipService = new CitizenshipApplicationService();

    // Initialize Tool Router
    this.toolRouter = new ToolRouter();
    this.setupToolRouter();

    this.setupMCPHandlers();
  }

  private setupToolRouter() {
    // Register all tool handlers
    this.toolRouter.registerHandler(this.gameCoreTools);
    this.toolRouter.registerHandler(this.gameInteractionTools);
    this.toolRouter.registerHandler(this.gameManagementTools);
    this.toolRouter.registerHandler(this.resourceTools);
    this.toolRouter.registerHandler(this.promptTools);
    this.toolRouter.registerHandler(this.superAdminTools);
    this.toolRouter.registerHandler(this.superAdminResourceTools);
  }

  private setupWebApp() {
    const PORT = process.env.PORT || 3000;

    // Configure Pug view engine
    this.webApp.set('view engine', 'pug');
    this.webApp.set('views', join(__dirname, '..', 'src', 'views'));

    // Middleware
    this.webApp.use(cors());
    this.webApp.use(express.json());
    this.webApp.use(express.static(join(__dirname, '..', 'src', 'public')));

    // API Routes (keep for AJAX calls)
    this.setupWebRoutes();

    // Page Routes (Server-Side Rendering)
    this.setupPageRoutes();

    // Start the server
    this.webApp.listen(3000, () => {
      console.log('Web server running on http://localhost:3000');
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

        // Enrich characters with memories and items
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

        // Enrich scenes with details
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

        // Filter by character if specified
        if (character) {
          logs = logs.filter((log: any) => log.character_name === character);
        }

        // Get unique character names for filter dropdown
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
        // Get all tools
        const gameCoreToolsList = this.gameCoreTools.getTools();
        const gameInteractionToolsList = this.gameInteractionTools.getTools();
        const gameManagementToolsList = this.gameManagementTools.getTools();

        const allTools = [
          ...gameCoreToolsList,
          ...gameInteractionToolsList,
          ...gameManagementToolsList
        ];

        // Category mapping
        const categoryMap: Record<string, string> = {
          'create_character': '角色管理',
          'get_character': '角色管理',
          'get_character_by_name': '角色管理',
          'list_characters': '角色管理',
          'update_character': '角色管理',
          'delete_character': '角色管理',
          'create_scene': '场景管理',
          'get_scene': '场景管理',
          'get_scene_by_name': '场景管理',
          'get_scene_details': '场景管理',
          'list_scenes': '场景管理',
          'connect_scenes': '场景管理',
          'get_scene_connections': '场景管理',
          'move_character': '行动系统',
          'speak_public': '行动系统',
          'speak_private': '行动系统',
          'pick_item': '行动系统',
          'drop_item': '行动系统',
          'use_item': '行动系统',
          'get_character_items': '行动系统',
          'create_item': '物品管理',
          'get_item': '物品管理',
          'list_items': '物品管理',
          'update_item': '物品管理',
          'delete_item': '物品管理',
          'add_short_memory': '记忆管理',
          'add_long_memory': '记忆管理',
          'get_short_memories': '记忆管理',
          'get_long_memories': '记忆管理',
          'get_all_memories': '记忆管理',
          'update_short_memory': '记忆管理',
          'update_long_memory': '记忆管理',
          'delete_short_memory': '记忆管理',
          'delete_long_memory': '记忆管理',
          'delete_all_memories': '记忆管理',
          'create_trade_offer': '交易系统',
          'respond_to_trade_offer': '交易系统',
          'cancel_trade_offer': '交易系统',
          'get_trade_offers': '交易系统',
          'get_pending_trade_offers': '交易系统',
          'send_direct_message': '消息系统',
          'get_direct_messages': '消息系统',
          'mark_message_as_read': '消息系统',
          'mark_all_messages_as_read': '消息系统',
          'validate_identity': '身份管理',
          'apply_for_citizenship': '身份管理',
          'review_citizenship_application': '身份管理',
          'generate_visitor_id': '身份管理',
          'list_citizenship_applications': '身份管理',
          'mcp_list_resources': 'MCP资源',
          'mcp_read_resource': 'MCP资源',
          'mcp_list_prompts': 'MCP资源',
          'mcp_get_prompt': 'MCP资源'
        };

        // Group tools by category
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
          serverStartTime: new Date().toLocaleString('zh-CN')
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

    this.webApp.get('/api/characters/:id/memories', (req, res) => {
      ApiResponseHandler.handleRequestWithKey(
        res,
        () => Promise.resolve(this.memoryService.getAllMemories(parseInt(req.params.id))),
        'memories'
      );
    });

    this.webApp.get('/api/characters/:id/items', (req, res) => {
      ApiResponseHandler.handleRequestWithKey(
        res,
        () => Promise.resolve(this.itemService.getItemsByCharacter(parseInt(req.params.id))),
        'items'
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

    this.webApp.get('/api/scenes/:id', (req, res) => {
      ApiResponseHandler.handleRequest(
        res,
        () => {
          const scene = this.sceneService.getSceneDetails(parseInt(req.params.id));
          if (!scene) {
            throw new Error('Scene not found');
          }
          return Promise.resolve(scene);
        }
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
        const identities = this.identityService.getAllIdentities();
        res.json({ success: true, identities });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/permissions/stats', (req, res) => {
      try {
        const stats = this.identityService.getIdentityStats();
        res.json({ success: true, stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/permissions/validate', (req, res) => {
      try {
        const { secret_key, required_permission } = req.body;
        const hasPermission = this.identityService.validateCapability(secret_key, required_permission);
        const identityInfo = this.identityService.getIdentityInfo(secret_key);

        res.json({
          success: true,
          has_permission: hasPermission,
          identity_info: identityInfo
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/permissions/create', (req, res) => {
      try {
        const { character_id, identity_role, expires_at } = req.body;
        const identity = this.identityService.createDefaultIdentity(character_id, identity_role);
        if (expires_at) {
          this.identityService.updateIdentity(identity.id, { expires_at });
        }
        res.json({ success: true, identity });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Citizenship application endpoints
    this.webApp.get('/api/citizenship-applications', (req, res) => {
      try {
        const applications = this.citizenshipService.getAllApplications();
        res.json({ success: true, applications });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/citizenship-applications/pending', (req, res) => {
      try {
        const applications = this.citizenshipService.getPendingApplications();
        res.json({ success: true, applications });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/citizenship-applications', (req, res) => {
      try {
        const application = this.citizenshipService.createApplication(req.body);
        res.json({ success: true, application });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/citizenship-applications/:character_id', (req, res) => {
      try {
        const application = this.citizenshipService.getApplicationByCharacterId(req.params.character_id);
        if (!application) {
          return res.status(404).json({ success: false, error: 'Application not found' });
        }
        res.json({ success: true, application });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.post('/api/citizenship-applications/:id/review', (req, res) => {
      try {
        const { status, review_message, reviewer_character_id } = req.body;
        const application = this.citizenshipService.reviewApplication({
          application_id: parseInt(req.params.id),
          status,
          review_message,
          reviewer_character_id
        });
        if (!application) {
          return res.status(404).json({ success: false, error: 'Application not found or already reviewed' });
        }
        res.json({ success: true, application });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/characters/:id/basic-info', (req, res) => {
      try {
        const characterInfo = this.citizenshipService.getCharacterBasicInfo(parseInt(req.params.id));
        if (!characterInfo) {
          return res.status(404).json({ success: false, error: 'Character not found' });
        }
        res.json({ success: true, character_info: characterInfo });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.webApp.get('/api/game-rules', (req, res) => {
      try {
        const gameRules = this.citizenshipService.getGameRules();
        res.json({ success: true, game_rules: gameRules });
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

    // Get tools list (for MCP Config page)
    this.webApp.get('/api/tools', (req, res) => {
      try {
        const allTools = this.toolRouter.getAllTools();

        // Filter out super admin tools for web display
        const superAdminToolNames = [
          ...this.superAdminTools.getTools().map(t => t.name),
          ...this.superAdminResourceTools.getTools().map(t => t.name)
        ];
        const regularTools = allTools.filter(tool => !superAdminToolNames.includes(tool.name));

        res.json({
          success: true,
          tools: regularTools
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Admin routes can be added here if needed
  }

  private setupMCPHandlers() {
    // List tools handler
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async (request) => {
      // Get all tools
      const allTools = this.toolRouter.getAllTools();

      // Get client secret key from the request context
      // The secret key should be passed via the request context
      // For SSE connections, we'll get it from the connection context
      let secretKey = '';
      let permissionLevel = 'guest';

      // Try to get secret key from request context
      const clientId = (request as any).clientId;
      if (clientId && this.permissionConnections.has(clientId)) {
        secretKey = this.permissionConnections.get(clientId)!;
        const permissionInfo = this.identityService.getIdentityInfo(secretKey);
        if (permissionInfo) {
          permissionLevel = permissionInfo.identity_role;
        }
      }

      // Determine which tools to return based on permission level
      let toolsToReturn = allTools;

      if (permissionLevel === 'super_admin') {
        // Super admin sees only super admin tools
        const superAdminToolNames = [
          ...this.superAdminTools.getTools().map(t => t.name),
          ...this.superAdminResourceTools.getTools().map(t => t.name)
        ];
        toolsToReturn = allTools.filter(tool => superAdminToolNames.includes(tool.name));
      } else {
        // Regular users see only regular tools (no super admin tools)
        const superAdminToolNames = [
          ...this.superAdminTools.getTools().map(t => t.name),
          ...this.superAdminResourceTools.getTools().map(t => t.name)
        ];
        toolsToReturn = allTools.filter(tool => !superAdminToolNames.includes(tool.name));
      }

      return {
        tools: toolsToReturn,
      };
    });

    // Call tool handler
    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Note: MCP SDK doesn't provide direct access to HTTP headers in stdio/SSE transport
        // The context will be populated when using the SSE/HTTP endpoint via handleMCPRequest
        const result = await this.toolRouter.routeToolCall(name, args);

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


    // List prompts handler
    this.mcpServer.setRequestHandler(ListPromptsRequestSchema, async () => {
      // Get actual prompts from PromptService
      const result = await this.promptTools.handleToolCall('mcp_list_prompts', {});
      if (result.success && 'prompts' in result) {
        const prompts = result.prompts.map((p: any) => ({
          name: p.name,
          description: p.description,
          arguments: p.arguments || []
        }));
        return {
          prompts,
        };
      } else {
        return {
          prompts: [],
        };
      }
    });

    // Get prompt handler
    this.mcpServer.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        const result = await this.promptTools.handleToolCall('mcp_get_prompt', { name, arguments: args || {} });
        if (result.success && result.prompt && 'messages' in result.prompt) {
          return {
            messages: result.prompt.messages,
          };
        } else {
          throw new Error(result.error || 'Failed to get prompt');
        }
      } catch (error) {
        throw new Error(`Failed to get prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // List resources handler
    this.mcpServer.setRequestHandler(ListResourcesRequestSchema, async () => {
      // Get actual resources from ResourceService
      const result = await this.resourceTools.handleToolCall('mcp_list_resources', {});
      if (result.success && 'resources' in result) {
        return {
          resources: result.resources,
        };
      } else {
        return {
          resources: [],
        };
      }
    });

    // Read resource handler
    this.mcpServer.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      try {
        const result = await this.resourceTools.handleToolCall('mcp_read_resource', { uri });
        if (result.success && 'content' in result) {
          return {
            contents: [result.content],
          };
        } else {
          throw new Error(result.error || 'Failed to read resource');
        }
      } catch (error) {
        throw new Error(`Failed to read resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      console.log(i18n.t('server.webMode'));
      this.setupWebApp();
      console.log(i18n.t('server.webInterface'));
      console.log(i18n.t('server.started'));
    } else if (isStdioMode) {
      // Stdio mode - for direct MCP client connection
      console.error(i18n.t('server.stdioMode'));
      const transport = new StdioServerTransport();
      await this.mcpServer.connect(transport);
      console.error(i18n.t('server.mcpStdio'));
      console.error(i18n.t('server.mcpStarted'));
    } else {
      // Default mode - start both Web interface and MCP server with SSE
      console.log(i18n.t('server.starting'));

      // Start Web interface
      this.setupWebApp();
      console.log(i18n.t('server.webInterface'));

      // Setup SSE server for MCP connections
      this.setupSSEServer();
      console.log(i18n.t('server.mcpSse'));

      // Add MCP info endpoint
      this.webApp.get('/mcp-info', (req, res) => {
        const connectedPermissions = Array.from(this.permissionConnections.values());
        const uniquePermissions = [...new Set(connectedPermissions)];
        const identityStats = this.identityService.getIdentityStats();
        const applicationStats = this.citizenshipService.getApplicationStats();

        res.json({
          name: 'matrix-game',
          version: '1.0.0',
          description: 'Multiplayer text-based game server with MCP interfaces, permission system, and citizenship applications',
          tools: this.toolRouter.getAllTools().length,
          prompts: this.promptTools.getTools().length,
          resources: this.resourceTools.getTools().filter(tool => tool.name.startsWith('mcp_list_resources') || tool.name.startsWith('mcp_read_resource')).length,
          status: 'running',
          connectedClients: this.connectedClients.size,
          connectedPermissions: uniquePermissions.length,
          identityStats: identityStats,
          applicationStats: applicationStats,
          sseUrl: 'http://localhost:3000/mcp',
          adminSseUrl: 'http://localhost:3000/admin/mcp',
          instructions: 'Connect via SSE for real-time multiplayer. Use X-Secret-Key header to authenticate with your permission level, or X-Character-ID for guest access. Super admin tools available at /admin/mcp endpoint.'
        });
      });

      // 添加超级管理员MCP路由
      this.webApp.get('/admin/mcp', (req, res) => {
        const secretKey = req.headers['x-secret-key'] as string;

        console.log('🔌 New Super Admin MCP client connected via SSE');
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
          permissionInfo = this.identityService.getIdentityInfo(secretKey);
          if (permissionInfo) {
            connectionStatus = 'authenticated';
            console.log('✅ Valid secret key provided, identity role:', permissionInfo.identity_role);
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
            `Connected with ${permissionInfo.identity_role} role` :
            secretKey ? 'Invalid secret key. Please check your credentials.' : 'Connected as guest. Super Admin secret key required for full access.'
        };
        res.write(`data: ${JSON.stringify(connectionResponse)}\n\n`);

        // Handle client disconnect
        req.on('close', () => {
          console.log('🔌 Super Admin MCP client disconnected');
          this.connectedClients.delete(res);
          this.permissionConnections.delete(connectionId);
        });

        req.on('error', (error) => {
          console.error('❌ SSE connection error:', error);
          this.connectedClients.delete(res);
          this.permissionConnections.delete(connectionId);
        });
      });

      // Super admin tools are handled through the main MCP handler with permission checks

      console.log(i18n.t('server.started'));
      console.log('   - Web interface: http://localhost:3000');
      console.log('   - MCP SSE: http://localhost:3000/mcp');
      console.log('   - Connected clients: 0');
    }
  }

  private setupSSEServer() {
    // Setup SSE endpoint for MCP
    this.webApp.get('/mcp', (req, res) => {
      const secretKey = req.headers['x-secret-key'] as string;
      const characterId = req.headers['x-character-id'] as string;

      console.log('🔌 New MCP client connected via SSE');
      console.log('📍 Client IP:', req.ip);
      console.log('📍 User-Agent:', req.headers['user-agent']);
      console.log('🔑 Secret Key:', secretKey ? 'Provided' : 'Not provided');
      console.log('🆔 Character ID:', characterId ? characterId : 'Not provided');

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, X-Secret-Key, X-Character-ID');

      // Add client to connected set
      this.connectedClients.add(res);

      // Handle permission validation
      let permissionInfo = null;
      let connectionStatus = 'guest';
      let visitorId = characterId;

      if (secretKey) {
        permissionInfo = this.identityService.getIdentityInfo(secretKey);
        if (permissionInfo) {
          connectionStatus = 'authenticated';
          console.log('✅ Valid secret key provided, identity role:', permissionInfo.identity_role);
        } else {
          console.log('❌ Invalid secret key provided');
        }
      } else {
        console.log('ℹ️ No secret key provided, connecting as guest');
        // 如果没有提供character_id，生成一个唯一的游客ID
        if (!visitorId) {
          visitorId = this.citizenshipService.generateUniqueCharacterId();
          console.log('🆔 Generated visitor ID:', visitorId);
        }
      }

      // Store permission connection mapping
      const connectionId = `${req.ip}-${Date.now()}`;
      this.clientConnections.set(res, connectionId);
      if (secretKey && permissionInfo) {
        this.permissionConnections.set(connectionId, secretKey);
      }

      console.log('📊 Total connected clients:', this.connectedClients.size);

      // Send initial connection message
      const connectionResponse = {
        type: 'connection',
        status: connectionStatus,
        permission_info: permissionInfo,
        visitor_id: visitorId,
        needs_authentication: !secretKey || !permissionInfo,
        message: permissionInfo ?
          `Connected with ${permissionInfo.identity_role} role` :
          secretKey ? 'Invalid secret key. Please check your credentials.' : `Connected as guest with ID: ${visitorId}. You can apply for citizenship to get more permissions.`
      };
      res.write(`data: ${JSON.stringify(connectionResponse)}\n\n`);

      // Handle client disconnect
      req.on('close', () => {
        console.log('🔌 MCP client disconnected');
        this.connectedClients.delete(res);
        this.clientConnections.delete(res);
        this.permissionConnections.delete(connectionId);
      });

      req.on('error', (error) => {
        console.error('❌ SSE connection error:', error);
        this.connectedClients.delete(res);
        this.clientConnections.delete(res);
        this.permissionConnections.delete(connectionId);
      });
    });

    // Setup POST endpoint for MCP requests
    this.webApp.post('/mcp', express.json(), async (req, res) => {
      try {
        console.log('📥 Received MCP request:', JSON.stringify(req.body, null, 2));

        const response = await this.handleMCPRequest(req.body, req.headers);
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

    // Setup POST endpoint for Super Admin MCP requests
    this.webApp.post('/admin/mcp', express.json(), async (req, res) => {
      try {
        console.log('📥 Received Super Admin MCP request:', JSON.stringify(req.body, null, 2));

        const response = await this.handleSuperAdminMCPRequest(req.body, req.headers);
        console.log('📤 Sending Super Admin MCP response:', JSON.stringify(response, null, 2));

        res.json(response);
      } catch (error) {
        console.error('❌ Error handling Super Admin MCP request:', error);
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

  private async handleMCPRequest(request: any, headers: any): Promise<any> {
    const { method, params, id } = request;
    console.log(`🔧 Handling MCP request: method=${method}, id=${id}`);

    // Store headers in request for later use
    (request as any).headers = headers;

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
              name: 'matrix-game',
              version: '1.0.0'
            }
          }
        };
        console.log('📤 Initialize response:', JSON.stringify(response, null, 2));
        return response;
      } else if (method === 'tools/list') {
        console.log('📋 Listing tools...');

        // Get secret key from request headers
        const secretKey = (request as any).headers?.['x-secret-key'] || '';
        let permissionLevel = 'guest';

        if (secretKey) {
          const permissionInfo = this.identityService.getIdentityInfo(secretKey);
          if (permissionInfo) {
            permissionLevel = permissionInfo.identity_role;
          }
        }

        // Get all tools
        const allTools = this.toolRouter.getAllTools();

        // Filter tools based on permission level
        let toolsToReturn = allTools;

        if (permissionLevel === 'super_admin') {
          // Super admin sees only super admin tools
          const superAdminToolNames = [
            ...this.superAdminTools.getTools().map(t => t.name),
            ...this.superAdminResourceTools.getTools().map(t => t.name)
          ];
          toolsToReturn = allTools.filter(tool => superAdminToolNames.includes(tool.name));
        } else {
          // Regular users see only regular tools (no super admin tools)
          const superAdminToolNames = [
            ...this.superAdminTools.getTools().map(t => t.name),
            ...this.superAdminResourceTools.getTools().map(t => t.name)
          ];
          toolsToReturn = allTools.filter(tool => !superAdminToolNames.includes(tool.name));
        }

        console.log(`✅ Found ${toolsToReturn.length} tools for ${permissionLevel}`);
        const response = {
          jsonrpc: '2.0',
          id,
          result: { tools: toolsToReturn }
        };
        console.log('📤 Tools list response:', JSON.stringify(response, null, 2));
        return response;
      } else if (method === 'tools/call') {
        const { name, arguments: args } = params;

        // Create request context from headers
        const secretKey = (request as any).headers?.['x-secret-key'] as string;
        const characterId = (request as any).headers?.['x-character-id'] as string;
        const context = {
          secretKey,
          characterId
        };

        const result = await this.toolRouter.routeToolCall(name, args, context);

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
        console.log('📋 Listing resources...');

        // Get actual resources from ResourceService
        const result = await this.resourceTools.handleToolCall('mcp_list_resources', {});
        if (result.success && 'resources' in result && result.resources) {
          const resources = result.resources;

          console.log(`✅ Found ${resources.length} resources`);
          const response = {
            jsonrpc: '2.0',
            id,
            result: { resources }
          };
          console.log('📤 Resources list response:', JSON.stringify(response, null, 2));
          return response;
        } else {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32603,
              message: result.error || 'Failed to list resources'
            }
          };
        }
      } else if (method === 'resources/read') {
        const { uri } = params;
        try {
          const result = await this.resourceTools.handleToolCall('mcp_read_resource', { uri });
          if (result.success && 'content' in result) {
            return {
              jsonrpc: '2.0',
              id,
              result: {
                contents: [result.content],
              }
            };
          } else {
            return {
              jsonrpc: '2.0',
              id,
              error: {
                code: -32601,
                message: result.error || 'Failed to read resource'
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

  private async handleSuperAdminMCPRequest(request: any, headers: any): Promise<any> {
    const { method, params, id } = request;
    console.log(`🔧 Handling Super Admin MCP request: method=${method}, id=${id}`);

    // Store headers in request for later use
    (request as any).headers = headers;

    // Force super admin permission level for this endpoint
    (request as any).forceSuperAdmin = true;

    try {
      if (method === 'initialize') {
        console.log('🚀 Initializing Super Admin MCP connection...');
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
              resources: {
                subscribe: false,
                listChanged: false
              }
            },
            serverInfo: {
              name: 'mcp-super-admin-server',
              version: '1.0.0'
            }
          }
        };
        console.log('📤 Initialize response:', JSON.stringify(response, null, 2));
        return response;
      } else if (method === 'tools/list') {
        console.log('📋 Listing Super Admin tools...');

        // Get all tools
        const allTools = this.toolRouter.getAllTools();

        // Super admin sees only operation tools (not resource tools)
        const superAdminToolNames = [
          ...this.superAdminTools.getTools().map(t => t.name)
        ];
        const toolsToReturn = allTools.filter(tool => superAdminToolNames.includes(tool.name));

        console.log(`✅ Found ${toolsToReturn.length} super admin operation tools`);
        const response = {
          jsonrpc: '2.0',
          id,
          result: { tools: toolsToReturn }
        };
        console.log('📤 Super Admin tools list response:', JSON.stringify(response, null, 2));
        return response;
      } else if (method === 'resources/list') {
        console.log('📋 Listing Super Admin resources...');

        // Get actual resources from ResourceService (super admin sees all resources)
        const result = await this.superAdminResourceTools.handleToolCall('mcp_admin_list_resources', {});
        if (result.success && 'resources' in result && result.resources) {
          const resources = result.resources;

          console.log(`✅ Found ${resources.length} super admin resources`);
          const response = {
            jsonrpc: '2.0',
            id,
            result: { resources }
          };
          console.log('📤 Super Admin resources list response:', JSON.stringify(response, null, 2));
          return response;
        } else {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32603,
              message: result.error || 'Failed to list super admin resources'
            }
          };
        }
      } else if (method === 'resources/read') {
        console.log('📖 Reading Super Admin resource...');
        const { uri } = params;

        // Call the mcp_admin_read_resource tool
        const result = await this.superAdminResourceTools.handleToolCall('mcp_admin_read_resource', { uri });

        if (!result.success || !('content' in result) || !result.content) {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32602,
              message: result.error || 'Failed to read resource'
            }
          };
        }

        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [(result as any).content]
          }
        };
      } else if (method === 'tools/call') {
        const { name, arguments: args } = params;

        // Create request context from headers
        const secretKey = (request as any).headers?.['x-secret-key'] as string;
        const characterId = (request as any).headers?.['x-character-id'] as string;
        const context = {
          secretKey,
          characterId
        };

        const result = await this.toolRouter.routeToolCall(name, args, context);

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
      console.error('❌ Error in handleSuperAdminMCPRequest:', error);
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
