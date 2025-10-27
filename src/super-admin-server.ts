#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ToolHandler } from './utils/ToolRouter.js';

import { SuperAdminTools } from './tools/super-admin-tools.js';
import { SuperAdminResourceTools } from './tools/super-admin-resource-tools.js';
import { CharacterService } from './services/CharacterService.js';
import { SceneService } from './services/SceneService.js';
import { ItemService } from './services/ItemService.js';
import { MemoryService } from './services/MemoryService.js';
import { LoggingService } from './services/LoggingService.js';
import { IdentityService } from './services/IdentityService.js';
import { CitizenshipApplicationService } from './services/CitizenshipApplicationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class SuperAdminServer implements ToolHandler {
  private mcpServer: Server;
  private webApp: express.Application;
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

  constructor() {
    // Initialize MCP Server
    this.mcpServer = new Server(
      {
        name: 'mcp-super-admin-server',
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
    this.superAdminTools = new SuperAdminTools();
    this.superAdminResourceTools = new SuperAdminResourceTools();
    this.characterService = new CharacterService();
    this.sceneService = new SceneService();
    this.itemService = new ItemService();
    this.memoryService = new MemoryService();
    this.loggingService = new LoggingService();
    this.identityService = new IdentityService();
    this.citizenshipService = new CitizenshipApplicationService();

    this.setupMCPHandlers();
  }

  private setupWebApp() {
    // 注意：这个服务器将作为主服务器的一个模块运行，不需要独立启动
    // Middleware
    this.webApp.use(cors());
    this.webApp.use(express.json());

    // API Routes
    this.setupWebRoutes();
  }

  private setupWebRoutes() {
    // Admin dashboard stats
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
  }

  private setupMCPHandlers() {
    // List tools handler
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools = [
        ...this.superAdminTools.getTools(),
        ...this.superAdminResourceTools.getTools()
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

        // Route to super admin tool handler
        if (this.superAdminTools.getTools().some(tool => tool.name === name)) {
          result = await this.superAdminTools.handleToolCall(name, args);
        } else if (this.superAdminResourceTools.getTools().some(tool => tool.name === name)) {
          result = await this.superAdminResourceTools.handleToolCall(name, args);
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

  // 获取超级管理员工具
  getTools(): Tool[] {
    const adminTools = this.superAdminTools.getTools();
    const resourceTools = this.superAdminResourceTools.getTools();
    console.log('SuperAdmin tools:', adminTools.length);
    console.log('SuperAdmin resource tools:', resourceTools.length);
    return [
      ...adminTools,
      ...resourceTools
    ];
  }

  // 获取超级管理员工具（保持向后兼容）
  getSuperAdminTools(): Tool[] {
    return this.superAdminTools.getTools();
  }

  // 处理工具调用（实现ToolHandler接口）
  async handleToolCall(name: string, args: any): Promise<any> {
    // Check if it's a super admin tool
    if (this.superAdminTools.getTools().some(tool => tool.name === name)) {
      return await this.superAdminTools.handleToolCall(name, args);
    }

    // Check if it's a resource tool
    if (this.superAdminResourceTools.getTools().some(tool => tool.name === name)) {
      return await this.superAdminResourceTools.handleToolCall(name, args);
    }

    return { success: false, error: `Unknown tool: ${name}` };
  }

  // 处理超级管理员工具调用（保持向后兼容）
  async handleSuperAdminToolCall(name: string, args: any): Promise<any> {
    return await this.superAdminTools.handleToolCall(name, args);
  }

  // 获取超级管理员Web应用（用于集成到主服务器）
  getWebApp() {
    this.setupWebApp();
    return this.webApp;
  }

  // 获取超级管理员SSE处理器（用于集成到主服务器）
  getSSEHandler() {
    return {
      setupSSEServer: this.setupSSEServer.bind(this),
      handleMCPRequest: this.handleMCPRequest.bind(this)
    };
  }

  private setupSSEServer() {
    // Setup SSE endpoint for MCP
    this.webApp.get('/mcp', (req, res) => {
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

    // Setup POST endpoint for MCP requests
    this.webApp.post('/mcp', express.json(), async (req, res) => {
      try {
        console.log('📥 Received Super Admin MCP request:', JSON.stringify(req.body, null, 2));

        const response = await this.handleMCPRequest(req.body, req.headers);
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
  }

  private async handleMCPRequest(request: any, headers?: any): Promise<any> {
    const { method, params, id } = request;
    console.log(`🔧 Handling Super Admin MCP request: method=${method}, id=${id}`);

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
              resources: {}
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
        const allTools = this.superAdminTools.getTools();

        console.log(`✅ Found ${allTools.length} super admin tools`);
        const response = {
          jsonrpc: '2.0',
          id,
          result: { tools: allTools }
        };
        console.log('📤 Tools list response:', JSON.stringify(response, null, 2));
        return response;
      } else if (method === 'tools/call') {
        const { name, arguments: args } = params;

        // Create request context from headers
        const secretKey = headers?.['x-secret-key'] as string;
        const context = {
          secretKey
        };

        let result;
        if (this.superAdminTools.getTools().some(tool => tool.name === name)) {
          result = await this.superAdminTools.handleToolCall(name, args, context);
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

// SuperAdminServer is now integrated into the main server
// No need for independent startup
