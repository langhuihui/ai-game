import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SceneService } from '../services/SceneService.js';

export class SceneTools {
  private sceneService = new SceneService();

  getTools(): Tool[] {
    return [
      {
        name: 'create_scene',
        description: 'Create a new scene in the game world',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Scene name (must be unique)'
            },
            description: {
              type: 'string',
              description: 'Detailed description of the scene'
            }
          },
          required: ['name', 'description']
        }
      },
      {
        name: 'get_scene',
        description: 'Get basic scene information',
        inputSchema: {
          type: 'object',
          properties: {
            scene_id: {
              type: 'number',
              description: 'Scene ID'
            }
          },
          required: ['scene_id']
        }
      },
      {
        name: 'get_scene_by_name',
        description: 'Get scene information by name',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Scene name'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'get_scene_details',
        description: 'Get detailed scene information including characters, items, and connections',
        inputSchema: {
          type: 'object',
          properties: {
            scene_id: {
              type: 'number',
              description: 'Scene ID'
            }
          },
          required: ['scene_id']
        }
      },
      {
        name: 'list_scenes',
        description: 'List all scenes in the game world',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'connect_scenes',
        description: 'Create a connection between two scenes',
        inputSchema: {
          type: 'object',
          properties: {
            from_scene_id: {
              type: 'number',
              description: 'Source scene ID'
            },
            to_scene_id: {
              type: 'number',
              description: 'Destination scene ID'
            },
            connection_type: {
              type: 'string',
              enum: ['door', 'road'],
              description: 'Type of connection'
            },
            description: {
              type: 'string',
              description: 'Description of the connection'
            }
          },
          required: ['from_scene_id', 'to_scene_id', 'connection_type', 'description']
        }
      },
      {
        name: 'get_scene_connections',
        description: 'Get all connections from a scene',
        inputSchema: {
          type: 'object',
          properties: {
            scene_id: {
              type: 'number',
              description: 'Scene ID'
            }
          },
          required: ['scene_id']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'create_scene':
        try {
          const scene = this.sceneService.createScene(args);
          return {
            success: true,
            scene,
            message: `Scene "${scene.name}" created successfully with ID ${scene.id}`
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }

      case 'get_scene':
        const scene = this.sceneService.getSceneById(args.scene_id);
        if (!scene) {
          return {
            success: false,
            error: 'Scene not found'
          };
        }
        return {
          success: true,
          scene
        };

      case 'get_scene_by_name':
        const sceneByName = this.sceneService.getSceneByName(args.name);
        if (!sceneByName) {
          return {
            success: false,
            error: 'Scene not found'
          };
        }
        return {
          success: true,
          scene: sceneByName
        };

      case 'get_scene_details':
        const sceneDetails = this.sceneService.getSceneDetails(args.scene_id);
        if (!sceneDetails) {
          return {
            success: false,
            error: 'Scene not found'
          };
        }
        return {
          success: true,
          scene: sceneDetails
        };

      case 'list_scenes':
        const scenes = this.sceneService.getAllScenes();
        return {
          success: true,
          scenes,
          count: scenes.length
        };

      case 'connect_scenes':
        try {
          const connection = this.sceneService.connectScenes(args);
          return {
            success: true,
            connection,
            message: `Connected scene ${args.from_scene_id} to scene ${args.to_scene_id} via ${args.connection_type}`
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }

      case 'get_scene_connections':
        const connections = this.sceneService.getConnectionsFromScene(args.scene_id);
        return {
          success: true,
          connections,
          count: connections.length
        };

      default:
        return {
          success: false,
          error: `Unknown tool: ${name}`
        };
    }
  }
}
