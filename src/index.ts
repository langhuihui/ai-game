#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { CharacterTools } from './tools/character-tools.js';
import { SceneTools } from './tools/scene-tools.js';
import { ActionTools } from './tools/action-tools.js';
import { MemoryTools } from './tools/memory-tools.js';

class GameServer {
  private server: Server;
  private characterTools: CharacterTools;
  private sceneTools: SceneTools;
  private actionTools: ActionTools;
  private memoryTools: MemoryTools;

  constructor() {
    this.server = new Server(
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

    this.characterTools = new CharacterTools();
    this.sceneTools = new SceneTools();
    this.actionTools = new ActionTools();
    this.memoryTools = new MemoryTools();

    this.setupHandlers();
  }

  private setupHandlers() {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools = [
        ...this.characterTools.getTools(),
        ...this.sceneTools.getTools(),
        ...this.actionTools.getTools(),
        ...this.memoryTools.getTools(),
      ];

      return {
        tools: allTools,
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Game Server running on stdio');
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
  console.error('Shutting down MCP Game Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Shutting down MCP Game Server...');
  process.exit(0);
});
