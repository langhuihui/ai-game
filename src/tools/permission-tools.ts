import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PermissionService } from '../services/PermissionService.js';
import { CharacterService } from '../services/CharacterService.js';
import { LoggingService } from '../services/LoggingService.js';
import { PermissionLevel } from '../models/Permission.js';

export class PermissionTools {
  private permissionService: PermissionService;
  private characterService: CharacterService;
  private loggingService: LoggingService;

  constructor() {
    this.permissionService = new PermissionService();
    this.characterService = new CharacterService();
    this.loggingService = new LoggingService();
  }

  getTools(): Tool[] {
    return [
      {
        name: 'validate_permission',
        description: 'Validate if a secret key has a specific permission',
        inputSchema: {
          type: 'object',
          properties: {
            secret_key: {
              type: 'string',
              description: 'Secret key to validate'
            },
            required_permission: {
              type: 'string',
              description: 'Required permission to check'
            }
          },
          required: ['secret_key', 'required_permission']
        }
      },
      {
        name: 'get_permission_info',
        description: 'Get permission information for a secret key',
        inputSchema: {
          type: 'object',
          properties: {
            secret_key: {
              type: 'string',
              description: 'Secret key to get info for'
            }
          },
          required: ['secret_key']
        }
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'validate_permission':
          return await this.validatePermission(args);
        case 'get_permission_info':
          return await this.getPermissionInfo(args);
        default:
          return { success: false, error: `Unknown tool: ${name}` };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async validatePermission(args: any): Promise<any> {
    const { secret_key, required_permission } = args;

    const hasPermission = this.permissionService.validatePermission(secret_key, required_permission);
    const permissionInfo = this.permissionService.getPermissionInfo(secret_key);

    return {
      success: true,
      has_permission: hasPermission,
      permission_info: permissionInfo,
      message: hasPermission ? 'Permission granted' : 'Permission denied'
    };
  }

  private async getPermissionInfo(args: any): Promise<any> {
    const { secret_key } = args;

    const permissionInfo = this.permissionService.getPermissionInfo(secret_key);
    if (!permissionInfo) {
      return { success: false, error: 'Invalid secret key or permission not found' };
    }

    return {
      success: true,
      permission_info: permissionInfo,
      message: 'Permission information retrieved successfully'
    };
  }

}
