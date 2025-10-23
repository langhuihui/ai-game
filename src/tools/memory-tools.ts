import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MemoryService } from '../services/MemoryService.js';

export class MemoryTools {
  private memoryService = new MemoryService();

  getTools(): Tool[] {
    return [
      {
        name: 'add_short_memory',
        description: 'Add a short-term memory to a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'Character ID'
            },
            content: {
              type: 'string',
              description: 'Memory content'
            }
          },
          required: ['character_id', 'content']
        }
      },
      {
        name: 'add_long_memory',
        description: 'Add a long-term memory to a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'Character ID'
            },
            content: {
              type: 'string',
              description: 'Memory content'
            },
            importance: {
              type: 'number',
              description: 'Memory importance (1-10, default: 5)',
              minimum: 1,
              maximum: 10
            }
          },
          required: ['character_id', 'content']
        }
      },
      {
        name: 'get_short_memories',
        description: 'Get short-term memories for a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'Character ID'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of memories to return (default: 20)'
            }
          },
          required: ['character_id']
        }
      },
      {
        name: 'get_long_memories',
        description: 'Get long-term memories for a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'Character ID'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of memories to return (default: 50)'
            }
          },
          required: ['character_id']
        }
      },
      {
        name: 'get_all_memories',
        description: 'Get all memories (short and long-term) for a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'Character ID'
            }
          },
          required: ['character_id']
        }
      },
      {
        name: 'update_short_memory',
        description: 'Update a short-term memory',
        inputSchema: {
          type: 'object',
          properties: {
            memory_id: {
              type: 'number',
              description: 'Memory ID'
            },
            content: {
              type: 'string',
              description: 'New memory content'
            }
          },
          required: ['memory_id']
        }
      },
      {
        name: 'update_long_memory',
        description: 'Update a long-term memory',
        inputSchema: {
          type: 'object',
          properties: {
            memory_id: {
              type: 'number',
              description: 'Memory ID'
            },
            content: {
              type: 'string',
              description: 'New memory content'
            },
            importance: {
              type: 'number',
              description: 'New importance level (1-10)',
              minimum: 1,
              maximum: 10
            }
          },
          required: ['memory_id']
        }
      },
      {
        name: 'delete_short_memory',
        description: 'Delete a short-term memory',
        inputSchema: {
          type: 'object',
          properties: {
            memory_id: {
              type: 'number',
              description: 'Memory ID'
            }
          },
          required: ['memory_id']
        }
      },
      {
        name: 'delete_long_memory',
        description: 'Delete a long-term memory',
        inputSchema: {
          type: 'object',
          properties: {
            memory_id: {
              type: 'number',
              description: 'Memory ID'
            }
          },
          required: ['memory_id']
        }
      },
      {
        name: 'delete_all_memories',
        description: 'Delete all memories for a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'Character ID'
            }
          },
          required: ['character_id']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'add_short_memory':
        try {
          const memory = this.memoryService.addShortMemory(args);
          return {
            success: true,
            memory,
            message: 'Short-term memory added successfully'
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }

      case 'add_long_memory':
        try {
          const memory = this.memoryService.addLongMemory(args);
          return {
            success: true,
            memory,
            message: 'Long-term memory added successfully'
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }

      case 'get_short_memories':
        const shortMemories = this.memoryService.getShortMemories(args.character_id, args.limit);
        return {
          success: true,
          memories: shortMemories,
          count: shortMemories.length
        };

      case 'get_long_memories':
        const longMemories = this.memoryService.getLongMemories(args.character_id, args.limit);
        return {
          success: true,
          memories: longMemories,
          count: longMemories.length
        };

      case 'get_all_memories':
        const allMemories = this.memoryService.getAllMemories(args.character_id);
        return {
          success: true,
          memories: allMemories,
          short_count: allMemories.short_memories.length,
          long_count: allMemories.long_memories.length
        };

      case 'update_short_memory':
        try {
          const memory = this.memoryService.updateShortMemory(args.memory_id, args);
          if (!memory) {
            return {
              success: false,
              error: 'Memory not found'
            };
          }
          return {
            success: true,
            memory,
            message: 'Short-term memory updated successfully'
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }

      case 'update_long_memory':
        try {
          const memory = this.memoryService.updateLongMemory(args.memory_id, args);
          if (!memory) {
            return {
              success: false,
              error: 'Memory not found'
            };
          }
          return {
            success: true,
            memory,
            message: 'Long-term memory updated successfully'
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }

      case 'delete_short_memory':
        const shortDeleted = this.memoryService.deleteShortMemory(args.memory_id);
        return {
          success: shortDeleted,
          message: shortDeleted ? 'Short-term memory deleted successfully' : 'Memory not found'
        };

      case 'delete_long_memory':
        const longDeleted = this.memoryService.deleteLongMemory(args.memory_id);
        return {
          success: longDeleted,
          message: longDeleted ? 'Long-term memory deleted successfully' : 'Memory not found'
        };

      case 'delete_all_memories':
        const allDeleted = this.memoryService.deleteAllMemories(args.character_id);
        return {
          success: allDeleted,
          message: allDeleted ? 'All memories deleted successfully' : 'No memories found'
        };

      default:
        return {
          success: false,
          error: `Unknown tool: ${name}`
        };
    }
  }
}
