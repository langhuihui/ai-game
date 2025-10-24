import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CharacterService } from '../services/CharacterService.js';
import { SceneService } from '../services/SceneService.js';
import { ItemService } from '../services/ItemService.js';
import { LoggingService } from '../services/LoggingService.js';
import { IdentityService } from '../services/IdentityService.js';
import { IdentityRole } from '../models/Identity.js';

export class SuperAdminTools {
  private characterService: CharacterService;
  private sceneService: SceneService;
  private itemService: ItemService;
  private loggingService: LoggingService;
  private identityService: IdentityService;

  constructor() {
    this.characterService = new CharacterService();
    this.sceneService = new SceneService();
    this.itemService = new ItemService();
    this.loggingService = new LoggingService();
    this.identityService = new IdentityService();
  }

  getTools(): Tool[] {
    return [
      {
        name: 'admin_update_character_identity',
        description: 'Update a character\'s identity/role (requires super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Super admin secret key for authorization'
            },
            character_id: {
              type: 'number',
              description: 'Character ID to update'
            },
            new_identity: {
              type: 'string',
              description: 'New identity/role for the character'
            },
            description: {
              type: 'string',
              description: 'Optional description of the identity change'
            }
          },
          required: ['admin_secret_key', 'character_id', 'new_identity']
        }
      },
      {
        name: 'admin_create_scene',
        description: 'Create a new scene in the game world (requires super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Super admin secret key for authorization'
            },
            name: {
              type: 'string',
              description: 'Scene name'
            },
            description: {
              type: 'string',
              description: 'Scene description'
            }
          },
          required: ['admin_secret_key', 'name', 'description']
        }
      },
      {
        name: 'admin_create_item',
        description: 'Create a new item and place it in a scene or give to a character (requires super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Super admin secret key for authorization'
            },
            name: {
              type: 'string',
              description: 'Item name'
            },
            description: {
              type: 'string',
              description: 'Item description'
            },
            scene_id: {
              type: 'number',
              description: 'Scene ID to place the item (optional)'
            },
            character_id: {
              type: 'number',
              description: 'Character ID to give the item to (optional)'
            }
          },
          required: ['admin_secret_key', 'name', 'description']
        }
      },
      {
        name: 'admin_send_announcement',
        description: 'Send a global announcement to all players (requires super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Super admin secret key for authorization'
            },
            title: {
              type: 'string',
              description: 'Announcement title'
            },
            message: {
              type: 'string',
              description: 'Announcement message'
            },
            priority: {
              type: 'string',
              enum: ['low', 'normal', 'high', 'urgent'],
              description: 'Announcement priority level'
            }
          },
          required: ['admin_secret_key', 'title', 'message']
        }
      },
      {
        name: 'admin_modify_character',
        description: 'Modify character attributes (requires super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Super admin secret key for authorization'
            },
            character_id: {
              type: 'number',
              description: 'Character ID to modify'
            },
            name: {
              type: 'string',
              description: 'New character name (optional)'
            },
            description: {
              type: 'string',
              description: 'New character description (optional)'
            },
            personality: {
              type: 'string',
              description: 'New character personality (optional)'
            },
            health: {
              type: 'number',
              description: 'New health value (optional)'
            },
            mental_state: {
              type: 'number',
              description: 'New mental state value (optional)'
            }
          },
          required: ['admin_secret_key', 'character_id']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'admin_update_character_identity':
          return await this.updateCharacterIdentity(args);
        case 'admin_create_scene':
          return await this.createScene(args);
        case 'admin_create_item':
          return await this.createItem(args);
        case 'admin_send_announcement':
          return await this.sendAnnouncement(args);
        case 'admin_modify_character':
          return await this.modifyCharacter(args);
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

  private async updateCharacterIdentity(args: any): Promise<any> {
    const { admin_secret_key, character_id, new_identity, description } = args;

    // Validate super admin identity
    if (!this.identityService.validateMinimumRole(admin_secret_key, IdentityRole.SUPER_ADMIN)) {
      return { success: false, error: 'Insufficient identity role. Super Admin required.' };
    }

    // Get character
    const character = this.characterService.getCharacterById(character_id);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    // Update character personality to reflect new identity
    const updatedCharacter = this.characterService.updateCharacter(character_id, {
      personality: `${character.personality}\n\n[Identity Update]: ${new_identity}${description ? ` - ${description}` : ''}`
    });

    this.loggingService.logAction({
      action_type: 'admin_update_character_identity',
      action_data: JSON.stringify({ character_id, new_identity, description }),
      result: `Character ${character.name} identity updated to: ${new_identity}`
    });

    return {
      success: true,
      character: updatedCharacter,
      message: `Character identity updated successfully`
    };
  }

  private async createScene(args: any): Promise<any> {
    const { admin_secret_key, name, description } = args;

    // Validate super admin identity
    if (!this.identityService.validateMinimumRole(admin_secret_key, IdentityRole.SUPER_ADMIN)) {
      return { success: false, error: 'Insufficient identity role. Super Admin required.' };
    }

    // Create scene
    const scene = this.sceneService.createScene({
      name,
      description
    });

    this.loggingService.logAction({
      action_type: 'admin_create_scene',
      action_data: JSON.stringify({ name, description }),
      result: `Scene created with ID ${scene.id}`
    });

    return {
      success: true,
      scene,
      message: `Scene "${name}" created successfully`
    };
  }

  private async createItem(args: any): Promise<any> {
    const { admin_secret_key, name, description, scene_id, character_id } = args;

    // Validate super admin identity
    if (!this.identityService.validateMinimumRole(admin_secret_key, IdentityRole.SUPER_ADMIN)) {
      return { success: false, error: 'Insufficient identity role. Super Admin required.' };
    }

    // Create item
    const item = this.itemService.createItem({
      name,
      description,
      scene_id: scene_id || null,
      character_id: character_id || null
    });

    const location = scene_id ? `scene ${scene_id}` : character_id ? `character ${character_id}` : 'no location';

    this.loggingService.logAction({
      action_type: 'admin_create_item',
      action_data: JSON.stringify({ name, description, scene_id, character_id }),
      result: `Item created with ID ${item.id} at ${location}`
    });

    return {
      success: true,
      item,
      message: `Item "${name}" created successfully`
    };
  }

  private async sendAnnouncement(args: any): Promise<any> {
    const { admin_secret_key, title, message, priority = 'normal' } = args;

    // Validate super admin identity
    if (!this.identityService.validateMinimumRole(admin_secret_key, IdentityRole.SUPER_ADMIN)) {
      return { success: false, error: 'Insufficient identity role. Super Admin required.' };
    }

    // Log announcement
    this.loggingService.logAction({
      action_type: 'admin_send_announcement',
      action_data: JSON.stringify({ title, message, priority }),
      result: `Announcement sent: ${title}`
    });

    // In a real implementation, this would broadcast to all connected clients
    // For now, we'll just log it
    const announcement = {
      id: Date.now(),
      title,
      message,
      priority,
      timestamp: new Date().toISOString(),
      type: 'global_announcement'
    };

    return {
      success: true,
      announcement,
      message: `Announcement "${title}" sent successfully`
    };
  }

  private async modifyCharacter(args: any): Promise<any> {
    const { admin_secret_key, character_id, name, description, personality, health, mental_state } = args;

    // Validate super admin identity
    if (!this.identityService.validateMinimumRole(admin_secret_key, IdentityRole.SUPER_ADMIN)) {
      return { success: false, error: 'Insufficient identity role. Super Admin required.' };
    }

    // Get character
    const character = this.characterService.getCharacterById(character_id);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    // Update character
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (personality !== undefined) updates.personality = personality;
    if (health !== undefined) updates.health = health;
    if (mental_state !== undefined) updates.mental_state = mental_state;

    const updatedCharacter = this.characterService.updateCharacter(character_id, updates);

    this.loggingService.logAction({
      action_type: 'admin_modify_character',
      action_data: JSON.stringify(updates),
      result: `Character ${character.name} modified`
    });

    return {
      success: true,
      character: updatedCharacter,
      message: `Character modified successfully`
    };
  }
}
