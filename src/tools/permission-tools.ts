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
      {
        name: 'create_character_permission',
        description: 'Create a permission for a character (requires manager or super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Admin secret key for authorization'
            },
            character_id: {
              type: 'number',
              description: 'Character ID to create permission for'
            },
            permission_level: {
              type: 'string',
              enum: ['prisoner', 'visitor', 'citizen', 'manager'],
              description: 'Permission level to assign'
            },
            expires_at: {
              type: 'string',
              description: 'Optional expiration date (ISO format)'
            }
          },
          required: ['admin_secret_key', 'character_id', 'permission_level']
        }
      },
      {
        name: 'update_character_permission',
        description: 'Update a character\'s permission level (requires manager or super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Admin secret key for authorization'
            },
            character_id: {
              type: 'number',
              description: 'Character ID to update permission for'
            },
            new_permission_level: {
              type: 'string',
              enum: ['prisoner', 'visitor', 'citizen', 'manager'],
              description: 'New permission level'
            }
          },
          required: ['admin_secret_key', 'character_id', 'new_permission_level']
        }
      },
      {
        name: 'revoke_character_permission',
        description: 'Revoke a character\'s permission (requires manager or super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Admin secret key for authorization'
            },
            character_id: {
              type: 'number',
              description: 'Character ID to revoke permission for'
            }
          },
          required: ['admin_secret_key', 'character_id']
        }
      },
      {
        name: 'list_all_permissions',
        description: 'List all permissions (requires manager or super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Admin secret key for authorization'
            }
          },
          required: ['admin_secret_key']
        }
      },
      {
        name: 'get_permission_stats',
        description: 'Get permission statistics (requires manager or super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Admin secret key for authorization'
            }
          },
          required: ['admin_secret_key']
        }
      },
      {
        name: 'create_super_admin',
        description: 'Create a super admin permission (requires super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            super_admin_secret_key: {
              type: 'string',
              description: 'Super admin secret key for authorization'
            }
          },
          required: ['super_admin_secret_key']
        }
      },
      {
        name: 'cleanup_expired_permissions',
        description: 'Clean up expired permissions (requires super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            super_admin_secret_key: {
              type: 'string',
              description: 'Super admin secret key for authorization'
            }
          },
          required: ['super_admin_secret_key']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'validate_permission':
          return await this.validatePermission(args);
        case 'get_permission_info':
          return await this.getPermissionInfo(args);
        case 'create_character_permission':
          return await this.createCharacterPermission(args);
        case 'update_character_permission':
          return await this.updateCharacterPermission(args);
        case 'revoke_character_permission':
          return await this.revokeCharacterPermission(args);
        case 'list_all_permissions':
          return await this.listAllPermissions(args);
        case 'get_permission_stats':
          return await this.getPermissionStats(args);
        case 'create_super_admin':
          return await this.createSuperAdmin(args);
        case 'cleanup_expired_permissions':
          return await this.cleanupExpiredPermissions(args);
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

  private async createCharacterPermission(args: any): Promise<any> {
    const { admin_secret_key, character_id, permission_level, expires_at } = args;

    // Validate admin permission
    if (!this.permissionService.validateMinimumPermission(admin_secret_key, PermissionLevel.MANAGER)) {
      return { success: false, error: 'Insufficient permissions. Manager or Super Admin required.' };
    }

    // Validate character exists
    const character = this.characterService.getCharacterById(character_id);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    // Check if character already has permission
    const existingPermission = this.permissionService.getPermissionByCharacterId(character_id);
    if (existingPermission) {
      return { success: false, error: 'Character already has a permission. Use update_character_permission instead.' };
    }

    const permission = this.permissionService.createDefaultPermission(character_id, permission_level as PermissionLevel);
    if (expires_at) {
      this.permissionService.updatePermission(permission.id, { expires_at });
    }

    const adminPermission = this.permissionService.getPermissionBySecretKey(admin_secret_key);
    this.loggingService.logAction({
      character_id: adminPermission?.character_id ?? undefined,
      action_type: 'create_character_permission',
      action_data: JSON.stringify({ character_id, permission_level, expires_at }),
      result: `Permission created for character ${character_id} with level ${permission_level}`
    });

    return {
      success: true,
      permission,
      message: `Permission created successfully for character ${character.name} (${permission_level})`
    };
  }

  private async updateCharacterPermission(args: any): Promise<any> {
    const { admin_secret_key, character_id, new_permission_level } = args;

    // Validate admin permission
    if (!this.permissionService.validateMinimumPermission(admin_secret_key, PermissionLevel.MANAGER)) {
      return { success: false, error: 'Insufficient permissions. Manager or Super Admin required.' };
    }

    // Validate character exists
    const character = this.characterService.getCharacterById(character_id);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    // Get existing permission
    const existingPermission = this.permissionService.getPermissionByCharacterId(character_id);
    if (!existingPermission) {
      return { success: false, error: 'Character does not have a permission. Use create_character_permission instead.' };
    }

    const updatedPermission = this.permissionService.updatePermission(existingPermission.id, {
      permission_level: new_permission_level as PermissionLevel
    });

    const adminPermission = this.permissionService.getPermissionBySecretKey(admin_secret_key);
    this.loggingService.logAction({
      character_id: adminPermission?.character_id ?? undefined,
      action_type: 'update_character_permission',
      action_data: JSON.stringify({ character_id, new_permission_level }),
      result: `Permission updated for character ${character_id} to level ${new_permission_level}`
    });

    return {
      success: true,
      permission: updatedPermission,
      message: `Permission updated successfully for character ${character.name} (${new_permission_level})`
    };
  }

  private async revokeCharacterPermission(args: any): Promise<any> {
    const { admin_secret_key, character_id } = args;

    // Validate admin permission
    if (!this.permissionService.validateMinimumPermission(admin_secret_key, PermissionLevel.MANAGER)) {
      return { success: false, error: 'Insufficient permissions. Manager or Super Admin required.' };
    }

    // Validate character exists
    const character = this.characterService.getCharacterById(character_id);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    // Get existing permission
    const existingPermission = this.permissionService.getPermissionByCharacterId(character_id);
    if (!existingPermission) {
      return { success: false, error: 'Character does not have a permission to revoke.' };
    }

    const revokedPermission = this.permissionService.deactivatePermission(existingPermission.id);

    const adminPermission = this.permissionService.getPermissionBySecretKey(admin_secret_key);
    this.loggingService.logAction({
      character_id: adminPermission?.character_id ?? undefined,
      action_type: 'revoke_character_permission',
      action_data: JSON.stringify({ character_id }),
      result: `Permission revoked for character ${character_id}`
    });

    return {
      success: true,
      permission: revokedPermission,
      message: `Permission revoked successfully for character ${character.name}`
    };
  }

  private async listAllPermissions(args: any): Promise<any> {
    const { admin_secret_key } = args;

    // Validate admin permission
    if (!this.permissionService.validateMinimumPermission(admin_secret_key, PermissionLevel.MANAGER)) {
      return { success: false, error: 'Insufficient permissions. Manager or Super Admin required.' };
    }

    const permissions = this.permissionService.getAllPermissions();

    return {
      success: true,
      permissions,
      count: permissions.length,
      message: 'All permissions retrieved successfully'
    };
  }

  private async getPermissionStats(args: any): Promise<any> {
    const { admin_secret_key } = args;

    // Validate admin permission
    if (!this.permissionService.validateMinimumPermission(admin_secret_key, PermissionLevel.MANAGER)) {
      return { success: false, error: 'Insufficient permissions. Manager or Super Admin required.' };
    }

    const stats = this.permissionService.getPermissionStats();

    return {
      success: true,
      stats,
      message: 'Permission statistics retrieved successfully'
    };
  }

  private async createSuperAdmin(args: any): Promise<any> {
    const { super_admin_secret_key } = args;

    // Validate super admin permission
    if (!this.permissionService.validateMinimumPermission(super_admin_secret_key, PermissionLevel.SUPER_ADMIN)) {
      return { success: false, error: 'Insufficient permissions. Super Admin required.' };
    }

    const superAdminPermission = this.permissionService.createSuperAdminPermission();

    this.loggingService.logAction({
      action_type: 'create_super_admin',
      action_data: JSON.stringify({}),
      result: `New super admin permission created with ID ${superAdminPermission.id}`
    });

    return {
      success: true,
      permission: superAdminPermission,
      message: 'Super admin permission created successfully'
    };
  }

  private async cleanupExpiredPermissions(args: any): Promise<any> {
    const { super_admin_secret_key } = args;

    // Validate super admin permission
    if (!this.permissionService.validateMinimumPermission(super_admin_secret_key, PermissionLevel.SUPER_ADMIN)) {
      return { success: false, error: 'Insufficient permissions. Super Admin required.' };
    }

    const cleanedCount = this.permissionService.cleanupExpiredPermissions();

    this.loggingService.logAction({
      action_type: 'cleanup_expired_permissions',
      action_data: JSON.stringify({}),
      result: `Cleaned up ${cleanedCount} expired permissions`
    });

    return {
      success: true,
      cleaned_count: cleanedCount,
      message: `Successfully cleaned up ${cleanedCount} expired permissions`
    };
  }
}
